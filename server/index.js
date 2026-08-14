import http from "node:http";
import { createServer as createViteServer, loadEnv } from "vite";
import { handleAdapt } from "./adapt-service.js";

const localEnv = {
  ...process.env,
  ...loadEnv("development", process.cwd(), ""),
};
const PORT = Number(localEnv.PORT || 5173);

function writeJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

async function readBody(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 100_000) throw new Error("payload_too_large");
  }
  return JSON.parse(body || "{}");
}

const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: "spa",
});

const server = http.createServer(async (request, response) => {
  const url = new URL(
    request.url,
    `http://${request.headers.host || "localhost"}`,
  );

  if (url.pathname === "/api/adapt") {
    if (request.method !== "POST") {
      response.setHeader("Allow", "POST");
      return writeJson(response, 405, { error: "Método no permitido" });
    }
    try {
      const result = await handleAdapt(await readBody(request), localEnv);
      return writeJson(response, result.status, result.body);
    } catch (error) {
      console.error("Local request error", error.message);
      return writeJson(response, 400, { error: "Solicitud inválida" });
    }
  }

  vite.middlewares(request, response, () =>
    writeJson(response, 404, { error: "No encontrado" }),
  );
});

server.listen(PORT, "0.0.0.0", () =>
  console.log(`Infomorph listo en http://localhost:${PORT}`),
);
