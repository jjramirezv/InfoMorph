import { handleAdapt } from "../server/adapt-service.js";

export const maxDuration = 60;

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Método no permitido" });
  }

  let body = request.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return response.status(400).json({ error: "JSON inválido" });
    }
  }

  const result = await handleAdapt(body, process.env);
  response.setHeader("Cache-Control", "no-store");
  return response.status(result.status).json(result.body);
}
