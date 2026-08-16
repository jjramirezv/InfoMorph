import { findVerifiedTopic } from "./verified-sources.js";
import { searchAcademicSources } from "./academic-sources.js";
import { searchCurrentNews } from "./news-search.js";

export const MODEL = "gemini-3.6-flash";
const AGE_RANGES = ["6–9", "10–13", "14–17", "18–30", "31+"];
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
          sourceIds: {
            type: "ARRAY",
            minItems: 1,
            items: { type: "STRING" },
          },
        },
      },
    },
  },
};

// Filtro para elegir el mejor documento (el de referencia principal)
function selectBestDocument(sources) {
  const withEvidence = sources.filter(s => s.evidence && s.evidence.length > 50);
  const peerReviewed = withEvidence.filter(s => s.peerReviewed || s.provider === "Fuente institucional");
  
  if (peerReviewed.length > 0) return peerReviewed[0];
  if (withEvidence.length > 0) return withEvidence[0];
  
  return sources[0];
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
  for (const block of plan.blocks) {
    if (
      !block.sourceIds?.length ||
      block.sourceIds.some((id) => !allowed.has(id))
    )
      throw new Error("invalid_sources");
  }
  return plan;
}

// --- NUEVA FUNCIÓN: Reglas estrictas de lenguaje según la edad ---
function getAgeInstructions(age) {
  if (age === "6–9") {
    return "Tono MUY infantil y amigable (niños de primaria). Usa metáforas simples, ejemplos de la vida cotidiana, palabras básicas y oraciones muy cortas. Evita por completo la jerga técnica. Explícalo como si fuera un cuento o una curiosidad divertida.";
  }
  if (age === "10–13") {
    return "Tono para preadolescentes. Lenguaje claro, dinámico y curioso. Explica la información de forma sencilla sin tratar al usuario como un niño pequeño, manteniendo oraciones fáciles de digerir pero informativas.";
  }
  if (age === "14–17") {
    return "Tono juvenil/pre-universitario. Analítico, objetivo y estructurado. Introduce términos técnicos reales del documento base, pero dales contexto para que sean comprensibles.";
  }
  // Para 18-30 y 31+
  return "Tono adulto, puramente académico y altamente formal. Usa lenguaje técnico, rigor científico y sintaxis compleja. El resumen debe leerse como el abstract de un artículo de investigación o un reporte ejecutivo.";
}

async function adaptWithGemini({ query, ageRange, topic, runtimeEnv }) {
  const apiKey = runtimeEnv.GEMINI_API_KEY;
  if (!apiKey) throw new Error("missing_api_key");
  
  const bestDoc = topic.bestDocument;
  const ageInstructions = getAgeInstructions(ageRange);

  const packet = {
    title: topic.title,
    evidencePolicy:
      "Cada afirmación debe proceder de los extractos siguientes. Los metadatos sin extracto no están incluidos.",
    bestDocumentRef: {
      id: bestDoc.id,
      title: bestDoc.title
    },
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

  // --- PROMPT MODIFICADO PARA FORZAR LA EDAD EN EL RESUMEN ---
  const prompt = `Actúa como un diseñador educativo experto. Transforma EXCLUSIVAMENTE el contenido verificado en un plan educativo. No inventes datos.

IMPORTANTE - DOCUMENTO BASE PARA EL RESUMEN:
Utiliza principalmente la evidencia de este documento para redactar el campo 'summary':
- Título: "${bestDoc.title}" (ID: ${bestDoc.id})

REGLAS ESTRICTAS DE REDACCIÓN PARA LA EDAD (${ageRange}):
Para el campo 'summary' y los 'blocks', DEBES aplicar OBLIGATORIAMENTE este estilo:
>>> ${ageInstructions} <<<

Tu tarea:
1. En el campo 'summary', redacta el resumen del documento principal aplicando AL MÁXIMO las reglas de redacción de edad. El tono debe ser inconfundible para ese grupo demográfico.
2. En los 'blocks', completa con las demás fuentes enriqueciendo el contenido, respetando el mismo nivel de complejidad del usuario.
3. Elige el formato pedagógico adecuado según la edad. Cada bloque cita únicamente IDs recibidos.

Consulta: ${query}
Edad: ${ageRange}
Paquete verificado: ${JSON.stringify(packet)}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.15, // Mantenemos baja la temperatura para evitar alucinaciones
          responseMimeType: "application/json",
          responseSchema,
        },
      }),
    },
  );
  
  if (!response.ok) {
    console.error("Gemini API error", response.status);
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

async function buildResearchPacket(query, runtimeEnv) {
  const curated = findVerifiedTopic(query);
  const [academic, news] = await Promise.all([
    searchAcademicSources(query, {
      elsevierApiKey: runtimeEnv.ELSEVIER_API_KEY || "",
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

  const bestDocument = selectBestDocument(evidence);

  return {
    topic: {
      id: curated?.id || `research-${Date.now()}`,
      title: curated?.title || query,
      sources: evidence,
      bestDocument 
    },
    sources: uniqueSources([...evidence, ...academic.readings]).slice(0, 12),
    news,
    providerStatus: academic.providerStatus,
  };
}

export async function handleAdapt(body, runtimeEnv = process.env) {
  try {
    const { query, ageRange } = body || {};
    if (
      typeof query !== "string" ||
      !query.trim() ||
      query.length > 300 ||
      !AGE_RANGES.includes(ageRange)
    ) {
      return { status: 400, body: { error: "Solicitud inválida" } };
    }

    const cleanQuery = query.trim();
    const research = await buildResearchPacket(cleanQuery, runtimeEnv);
    if (!research) {
      return {
        status: 404,
        body: {
          error:
            "No encontramos al menos dos fuentes académicas con evidencia suficiente para responder sin improvisar.",
        },
      };
    }

    let plan = null;
    let warning = null;
    try {
      plan = await adaptWithGemini({
        query: cleanQuery,
        ageRange,
        topic: research.topic,
        runtimeEnv,
      });
    } catch (modelError) {
      console.error("Adaptation model unavailable", modelError.message);
      warning =
        "Las fuentes académicas están disponibles, pero el adaptador educativo alcanzó temporalmente su límite de uso.";
    }

    return {
      status: 200,
      body: {
        plan,
        bestDocumentId: research.topic.bestDocument.id,
        sources: research.sources.map(({ evidence, ...source }) => source),
        news: research.news,
        providerStatus: research.providerStatus,
        warning,
        model: MODEL,
      },
    };
  } catch (error) {
    console.error("Adaptation error", error.message);
    return {
      status: 502,
      body: {
        error: "No se pudo crear la adaptación educativa en este momento.",
      },
    };
  }
}