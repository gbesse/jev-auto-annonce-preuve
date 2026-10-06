import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { analyze, toHtml } from "../src/index.mjs";
const cases = JSON.parse(
  await readFile(new URL("../corpus/cases.json", import.meta.url), "utf8"),
);
const pkg = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8"),
);
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const directory = new URL("../docs/demo/", import.meta.url);
await mkdir(directory, { recursive: true });
const cards = [];
let liveReports = new Map();
try {
  const rawCorpus = await readFile(
    new URL("../corpus/cases.json", import.meta.url),
  );
  const run = JSON.parse(
    await readFile(
      new URL("../reports/live-test.json", import.meta.url),
      "utf8",
    ),
  );
  if (run.corpusSha256 === createHash("sha256").update(rawCorpus).digest("hex"))
    liveReports = new Map(
      run.rows.find((r) => r.mode === "jev").reports.map((r) => [r.id, r]),
    );
} catch {}

for (let i = 0; i < cases.length; i++) {
  const c = cases[i];
  const report = await analyze(c.input);
  await writeFile(new URL(i + ".html", directory), toHtml(report));
  await writeFile(
    new URL(i + ".json", directory),
    JSON.stringify(c.input, null, 2),
  );
  const recorded = liveReports.get(c.input.id);
  let recordedLink = "";
  if (recorded) {
    await writeFile(
      new URL("jev-" + i + ".html", directory),
      toHtml(recorded.report),
    );
    recordedLink = ` · <a href="jev-${i}.html">Appel Jev enregistré : ${esc(recorded.actual)}${recorded.report.providerError ? " (erreur fournisseur)" : ""}</a>`;
  }
  cards.push(
    `<article><h2>${esc(c.family ?? "Dossier de départ")}</h2><p>Analyse avec règles : <strong>${esc(report.status)}</strong>. Annotation auteur pour le dossier complet : ${esc(c.expected)}.</p><p><a href="${i}.html">Lire le rapport sourcé</a> · <a href="${i}.json">Télécharger l’entrée JSON</a>${recordedLink}</p></article>`,
  );
}
await writeFile(
  new URL("index.html", directory),
  `<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(pkg.description)} — cas rejouables</title><style>body{font:17px/1.6 system-ui;color:#182433;background:#f3f5f8;max-width:960px;margin:48px auto;padding:24px}h1{line-height:1.15}article{padding:20px;background:white;border:1px solid #ccd5df;border-radius:10px;margin:18px 0}a{color:#345bea}code{background:#e7ebf2;padding:3px}</style><p>JEV · EXEMPLES FRANÇAIS · VERSION EXPÉRIMENTALE</p><h1>${esc(pkg.description)}</h1><p>Ces dossiers sont synthétiques. Les rapports sont calculés par le moteur du dépôt ; les rapprochements sémantiques restent à revoir en mode règles. Pour modifier un dossier et l’analyser : <code>npm run serve</code>. Aucun document personnel collecté sur cette page.</p>${cards.join("")}<p><a href="https://github.com/gbesse/${pkg.name.split("/")[1]}">Code, installation et exemples exécutables</a></p></html>`,
);
console.log(cases.length + " cas publiables générés");
