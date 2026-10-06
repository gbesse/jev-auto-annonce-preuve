import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { plan, date, text } from "./index.mjs";
export async function extractText(path) {
  const buffer = await readFile(path);
  if (buffer.length > 8e6) throw new RangeError("Pièce supérieure à 8 Mo");
  const suffix = extname(path).toLowerCase();
  if (suffix === ".txt" || suffix === ".md")
    return text(buffer.toString("utf8"));
  if (suffix !== ".pdf")
    throw new TypeError("Formats acceptés : TXT, MD, PDF avec texte");
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const task = getDocument({
    data: new Uint8Array(buffer),
    isEvalSupported: false,
    useSystemFonts: false,
    standardFontDataUrl: fileURLToPath(
      new URL(
        "./standard_fonts/",
        import.meta.resolve("pdfjs-dist/package.json"),
      ),
    ),
  });
  const pdf = await task.promise;
  try {
    if (pdf.numPages > 100) throw new RangeError("PDF supérieur à 100 pages");
    const pages = [];
    for (let n = 1; n <= pdf.numPages; n++) {
      const p = await pdf.getPage(n);
      const t = await p.getTextContent();
      pages.push(t.items.map((i) => i.str ?? "").join(" "));
    }
    return text(pages.join("\n"));
  } finally {
    await task.destroy();
  }
}
export async function importManifest(path) {
  const manifestUrl = pathToFileURL(resolve(path));
  const manifest = JSON.parse(await readFile(manifestUrl, "utf8"));
  if (!manifest.input || !Array.isArray(manifest.documents))
    throw new TypeError("Manifest input et documents requis");
  const documents = [];
  for (const d of manifest.documents) {
    text(d.file);
    if (!d.source) throw new TypeError("Provenance requise");
    date(d.source.date);
    const file = fileURLToPath(new URL(d.file, manifestUrl));
    documents.push({
      id: text(d.id),
      text: await extractText(file),
      source: d.source,
    });
  }
  const input = { ...manifest.input, documents };
  plan(input);
  return input;
}
