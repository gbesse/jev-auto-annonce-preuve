import { importManifest } from "../src/adapters.mjs";
import { analyze } from "../src/index.mjs";
const input = await importManifest("examples/manifest.json");
const report = await analyze(input);
console.log(
  JSON.stringify(
    {
      statut: report.status,
      pieces: input.documents.length,
      sorties: report.outputs,
    },
    null,
    2,
  ),
);
