import { readFile, mkdir, writeFile } from "node:fs/promises";
import { analyze, toHtml } from "../src/index.mjs";
import { createJevClient } from "../src/jev.mjs";
const input = JSON.parse(
  await readFile(new URL("./dossier.json", import.meta.url), "utf8"),
);
const live = process.argv.includes("--live");
const report = await analyze(input, {
  mode: live ? "jev" : "regles",
  provider: live ? createJevClient() : undefined,
});
await mkdir(new URL("../reports/private/", import.meta.url), {
  recursive: true,
});
await writeFile(
  new URL("../reports/private/demo.html", import.meta.url),
  toHtml(report),
  { mode: 0o600 },
);
console.log(
  JSON.stringify(
    {
      statut: report.status,
      sorties: report.outputs,
      rapport: "reports/private/demo.html",
    },
    null,
    2,
  ),
);
