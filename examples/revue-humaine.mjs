import { readFile } from "node:fs/promises";
import { analyze } from "../src/index.mjs";
const cases = JSON.parse(
  await readFile(new URL("../corpus/cases.json", import.meta.url), "utf8"),
);
const report = await analyze(cases[4].input);
console.log(
  JSON.stringify(
    {
      statut: report.status,
      controles: report.findings.map((f) => ({
        id: f.id,
        statut: f.status,
        action: f.action,
      })),
    },
    null,
    2,
  ),
);
