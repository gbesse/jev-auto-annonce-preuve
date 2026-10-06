import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { analyze, toHtml } from "./index.mjs";
import { createJevClient } from "./jev.mjs";
const ui = await readFile(new URL("../web/index.html", import.meta.url));
export function createApp({ samples, allowLive = false, provider } = {}) {
  if (!samples?.length) throw new TypeError("Exemples requis");
  let busy = false;
  return createServer(async (req, res) => {
    const port = req.socket.localPort,
      origin = "http://127.0.0.1:" + port;
    const headers = {
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
      "content-security-policy":
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; frame-src 'self' blob:; connect-src 'self'; frame-ancestors 'none'",
    };
    const reply = (code, data, type = "application/json") => {
      res.writeHead(code, {
        ...headers,
        "content-type": type + "; charset=utf-8",
      });
      res.end(
        typeof data === "string" || Buffer.isBuffer(data)
          ? data
          : JSON.stringify(data),
      );
    };
    try {
      if (req.headers.host !== "127.0.0.1:" + port) {
        req.resume();
        return reply(403, { error: "Hôte local requis" });
      }
      if (req.method === "GET" && req.url === "/")
        return reply(200, ui, "text/html");
      if (req.method === "GET" && req.url === "/app.js")
        return reply(
          200,
          await readFile(new URL("../web/app.js", import.meta.url)),
          "text/javascript",
        );
      if (req.method === "GET" && req.url === "/style.css")
        return reply(
          200,
          await readFile(new URL("../web/style.css", import.meta.url)),
          "text/css",
        );
      if (req.method === "GET" && req.url === "/samples")
        return reply(200, { samples, allowLive });
      if (req.method !== "POST" || req.url !== "/analyze") {
        req.resume();
        return reply(404, { error: "Route inconnue" });
      }
      if (
        req.headers.origin !== origin ||
        req.headers["content-type"]?.split(";")[0] !== "application/json"
      ) {
        req.resume();
        return reply(403, { error: "Origine ou format invalide" });
      }
      if (busy) {
        req.resume();
        return reply(429, { error: "Une analyse est déjà en cours" });
      }
      let size = 0;
      const chunks = [];
      for await (const b of req) {
        size += b.length;
        if (size > 1e6)
          return reply(413, { error: "Dossier supérieur à 1 Mo" });
        chunks.push(b);
      }
      const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      const mode = body.mode ?? "regles";
      if (mode === "jev" && !allowLive)
        return reply(403, {
          error: "Démarrer avec --live pour autoriser les appels Jev",
        });
      busy = true;
      const controller = new AbortController();
      res.once("close", () => controller.abort());
      try {
        const report = await analyze(body.input, {
          mode,
          provider:
            mode === "jev" ? (provider ?? createJevClient()) : undefined,
          signal: controller.signal,
        });
        return reply(200, { report, html: toHtml(report) });
      } finally {
        busy = false;
      }
    } catch {
      return reply(400, {
        error: "Dossier ou analyse invalide ; vérifier la CLI pour le détail",
      });
    }
  });
}
