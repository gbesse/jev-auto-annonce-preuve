import { readFile } from "node:fs/promises";
import { createApp } from "../src/server.mjs";
const cases = JSON.parse(
  await readFile(new URL("../corpus/cases.json", import.meta.url), "utf8"),
);
const port = Number(process.env.PORT ?? 8802);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error("Port invalide");
const server = createApp({
  samples: cases.map((c) => ({ label: c.input.id, input: c.input })),
  allowLive: process.argv.includes("--live"),
});
server.listen(port, "127.0.0.1", () =>
  console.log("Démo locale : http://127.0.0.1:" + port),
);
