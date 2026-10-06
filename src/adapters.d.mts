import type { Dossier } from "./index.mjs";
export function extractText(path: string): Promise<string>;
export function importManifest(path: string): Promise<Dossier>;
