import test from "node:test";
import assert from "node:assert/strict";
import { importManifest, extractText } from "../src/adapters.mjs";
import { plan, analyze } from "../src/index.mjs";
import { createApp } from "../src/server.mjs";
import { readFile } from "node:fs/promises";
const input = JSON.parse(
  await readFile(new URL("../examples/dossier.json", import.meta.url), "utf8"),
);
test("Importer les vraies pièces TXT du manifest", async () => {
  const x = await importManifest("examples/manifest.json");
  assert.equal(x.id, input.id);
  assert.equal(plan(x).pairs.length, plan(input).pairs.length);
  assert.ok(x.documents.every((d) => d.source.kind === "synthetique"));
});
test("Un format non pris en charge est rejeté", async () => {
  await assert.rejects(extractText("examples/dossier.json"), /Formats/);
});
test("Un passage inventé ne devient pas une citation", () => {
  const x = structuredClone(input);
  for (const d of x.documents) d.text = "Pièce sans les passages renseignés.";
  assert.throws(() => plan(x), /passage/i);
});
test("Références et empreintes restent stables", async () => {
  const a = await analyze(input),
    b = await analyze(input);
  assert.deepEqual(
    a.findings.map((f) => f.evidence),
    b.findings.map((f) => f.evidence),
  );
  assert.ok(
    a.findings.every((f) =>
      f.evidence.every((e) => /^[a-f0-9]{64}$/.test(e.sha256)),
    ),
  );
});
test("Le serveur analyse, rejette les origines étrangères et refuse Jev sans opt-in", async () => {
  const server = createApp({ samples: [{ label: "Cas", input }] });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const url = "http://127.0.0.1:" + server.address().port;
  try {
    assert.equal((await fetch(url)).status, 200);
    assert.equal((await fetch(url + "/samples")).status, 200);
    const post = (origin, mode) =>
      fetch(url + "/analyze", {
        method: "POST",
        headers: { "content-type": "application/json", origin },
        body: JSON.stringify({ input, mode }),
      });
    assert.equal((await post("https://exemple.fr", "regles")).status, 403);
    assert.equal((await post(url, "jev")).status, 403);
    const r = await post(url, "regles");
    assert.equal(r.status, 200);
    assert.equal((await r.json()).report.id, input.id);
    const big = await fetch(url + "/analyze", {
      method: "POST",
      headers: { "content-type": "application/json", origin: url },
      body: " ".repeat(1000001),
    });
    assert.equal(big.status, 413);
  } finally {
    await new Promise((r) => server.close(r));
  }
});

test("Extraire réellement le texte d’un PDF", async () => {
  const s = await extractText("examples/pieces/demonstration.pdf");
  assert.ok(s.includes("Facture de demonstration"));
});
