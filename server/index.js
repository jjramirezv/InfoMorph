import http from "node:http";
import { createServer as createViteServer, loadEnv } from "vite";
import { findVerifiedTopic } from "./verified-sources.js";
import { searchAcademicSources } from "./academic-sources.js";
import { searchCurrentNews } from "./news-search.js";

const env = loadEnv("development", process.cwd(), "");
const PORT = Number(process.env.PORT || 5173);
const MODEL = "gemini-3.6-flash";
const FORMATS = [
  "visual_story",
  "step_by_step",
  "cause_effect",
  "comparison",
  "timeline",
  "concept_map",
];
const responseSchema = {
  type: "OBJECT",
  required: [
    "format",
    "ageLevel",
    "title",
    "summary",
    "blocks",
    "voiceText",
    "verificationTip",
  ],
  properties: {
    format: { type: "STRING", enum: FORMATS },
    ageLevel: { type: "STRING", enum: ["6-9", "10-13", "14-17", "18+"] },
    title: { type: "STRING" },
    summary: { type: "STRING" },
    voiceText: { type: "STRING" },
    verificationTip: { type: "STRING" },
    blocks: {
      type: "ARRAY",
      minItems: 2,
      maxItems: 5,
      items: {
        type: "OBJECT",
        required: ["title", "text", "visualKeywords", "sourceIds"],
        properties: {
          title: { type: "STRING" },
          text: { type: "STRING" },
          visualKeywords: {
            type: "ARRAY",
            minItems: 1,
            maxItems: 3,
            items: { type: "STRING" },
          },
          sourceIds: { type: "ARRAY", minItems: 1, items: { type: "STRING" } },
        },
      },
    },
  },
};

function writeJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}
async function readBody(req) {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 100_000) throw new Error("payload_too_large");
  }
  return JSON.parse(body || "{}");
}
function validatePlan(plan, topic, ageRange) {
  const allowed = new Set(topic.sources.map((source) => source.id));
  const expectedAge =
    ageRange === "31+" || ageRange === "18–30"
      ? "18+"
      : ageRange.replace("–", "-");
  if (!FORMATS.includes(plan.format) || plan.ageLevel !== expectedAge)
    throw new Error("invalid_plan");
  const maxBlocks = expectedAge === "6-9" ? 3 : expectedAge === "10-13" ? 4 : 5;
  if (
    !Array.isArray(plan.blocks) ||
    plan.blocks.length < 2 ||
    plan.blocks.length > maxBlocks
  )
    throw new Error("invalid_blocks");
  for (const block of plan.blocks)
    if (
      !block.sourceIds?.length ||
      block.sourceIds.some((id) => !allowed.has(id))
    )
      throw new Error("invalid_sources");
  return plan;
}
async function adaptWithGemini({ query, ageRange, topic }) {
  const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("missing_api_key");
  const packet = {
    title: topic.title,
    evidencePolicy:
      "Cada afirmación debe proceder de los extractos siguientes. Los metadatos sin extracto no están incluidos.",
    sources: topic.sources.map((source) => ({
      id: source.id,
      institution: source.institution,
      title: source.title,
      date: source.date,
      authors: source.authors || [],
      doi: source.doi || null,
      evidenceExcerpt: source.evidence,
    })),
  };
  const prompt = `Actúa como un único diseñador educativo. Transforma EXCLUSIVAMENTE el contenido verificado en un plan visual. No agregues hechos, cifras, fechas ni recomendaciones ausentes. Elige el formato pedagógico más adecuado. Para 6-9 usa máximo 3 bloques, frases muy cortas y palabras concretas para buscar pictogramas ARASAAC. Para 10-13 usa tarjetas y relaciones simples. Para 14-17 usa diagramas, comparaciones o miniinfografías. Para 18+ usa texto estructurado y gráficos solo como organización, nunca como datos inventados. Cada bloque cita únicamente IDs recibidos.\nConsulta: ${query}\nEdad: ${ageRange}\nPaquete verificado: ${JSON.stringify(packet)}`;
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.15,
          responseMimeType: "application/json",
          responseSchema,
        },
      }),
    },
  );
  if (!response.ok) {
    console.error(
      "Gemini API error",
      response.status,
      (await response.text()).slice(0, 400),
    );
    throw new Error(`gemini_${response.status}`);
  }
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("empty_model_response");
  return validatePlan(JSON.parse(text), topic, ageRange);
}

function uniqueSources(sources) {
  const seen = new Set();
  return sources.filter((source) => {
    const key = source.doi || source.url || source.id;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function buildResearchPacket(query) {
  const curated = findVerifiedTopic(query);
  const [academic, news] = await Promise.all([
    searchAcademicSources(query, {
      elsevierApiKey:
        process.env.ELSEVIER_API_KEY || env.ELSEVIER_API_KEY || "",
    }),
    searchCurrentNews(query),
  ]);
  const curatedEvidence = curated
    ? curated.sources.map((source) => ({
        ...source,
        provider: "Fuente institucional",
        evidence: curated.content,
        evidenceUsed: true,
        peerReviewed: true,
      }))
    : [];
  const evidence = uniqueSources([
    ...curatedEvidence,
    ...academic.evidence,
  ]).slice(0, 7);
  if (evidence.length < 2) return null;

  return {
    topic: {
      id: curated?.id || `research-${Date.now()}`,
      title: curated?.title || query.trim(),
      sources: evidence,
    },
    sources: uniqueSources([...evidence, ...academic.readings]).slice(0, 12),
    news,
    providerStatus: academic.providerStatus,
  };
}

const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: "spa",
});
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  if (req.method === "POST" && url.pathname === "/api/adapt") {
    try {
      const { query, ageRange } = await readBody(req);
      if (
        typeof query !== "string" ||
        !query.trim() ||
        !["6–9", "10–13", "14–17", "18–30", "31+"].includes(ageRange)
      )
        return writeJson(res, 400, { error: "Solicitud inválida" });
      const research = await buildResearchPacket(query);
      if (!research)
        return writeJson(res, 404, {
          error:
            "No encontramos al menos dos fuentes académicas con evidencia suficiente para responder sin improvisar.",
        });
      let plan = null;
      let warning = null;
      try {
        plan = await adaptWithGemini({
          query,
          ageRange,
          topic: research.topic,
        });
      } catch (modelError) {
        console.error("Adaptation model unavailable", modelError.message);
        warning =
          "Las fuentes académicas están disponibles, pero el adaptador educativo alcanzó temporalmente su límite de uso.";
      }
      return writeJson(res, 200, {
        plan,
        sources: research.sources,
        news: research.news,
        providerStatus: research.providerStatus,
        warning,
        model: MODEL,
      });
    } catch (error) {
      console.error("Adaptation error", error.message);
      return writeJson(res, 502, {
        error: "No se pudo crear la adaptación educativa en este momento.",
      });
    }
  }
  vite.middlewares(req, res, () =>
    writeJson(res, 404, { error: "No encontrado" }),
  );
});
server.listen(PORT, "0.0.0.0", () =>
  console.log(`Infomorph listo en http://localhost:${PORT}`),
);
