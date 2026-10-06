import { check, pair, date, text, cents } from "./index.mjs";
export { check, date };
export function str(v) {
  return text(v);
}
export function obj(v) {
  if (!v || typeof v !== "object" || Array.isArray(v))
    throw new TypeError("Pièce métier requise");
  str(v.docId);
  return v;
}
export function arrays(v) {
  if (!Array.isArray(v) || v.length > 200)
    throw new TypeError("Liste de 0 à 200 éléments requise");
  return v;
}
export function rows(v) {
  arrays(v);
  if (!v.length) throw new TypeError("Liste non vide requise");
  const ids = new Set();
  for (const r of v) {
    if (!r || typeof r !== "object" || Array.isArray(r))
      throw new TypeError("Ligne métier requise");
    if (r.id !== undefined) {
      str(r.id);
      if (ids.has(r.id)) throw new TypeError("Identifiant métier dupliqué");
      ids.add(r.id);
    }
  }
  return v;
}
export function integer(v, min = 0, max = 1e12) {
  if (!Number.isSafeInteger(v) || v < min || v > max)
    throw new TypeError("Entier hors limites");
  return v;
}
export function finite(v, min = -1e12, max = 1e12) {
  if (typeof v !== "number" || !Number.isFinite(v) || v < min || v > max)
    throw new TypeError("Nombre hors limites");
  return v;
}
export function safe(v) {
  return integer(v, -Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
}
export function money(v) {
  return cents(v);
}
export function sum(v) {
  return v.reduce((s, n) => safe(s + n), 0);
}
export function boolean(v) {
  if (typeof v !== "boolean") throw new TypeError("Booléen requis");
  return v;
}
export function one(v, allowed) {
  if (!allowed.includes(v)) throw new TypeError("Valeur non autorisée");
  return v;
}
export function refs(...os) {
  return [
    ...new Set(
      os.map((o) => {
        obj(o);
        return o.docId;
      }),
    ),
  ];
}
export function semantic(
  id,
  title,
  left,
  right,
  r,
  question,
  forceSemantic = true,
) {
  if (left != null) str(left);
  if (right != null) str(right);
  return { ...pair(id, title, left, right, r, question), forceSemantic };
}
export function addYears(d, n) {
  date(d);
  const year = Number(d.slice(0, 4)) + n;
  let value = String(year) + d.slice(4);
  try {
    return date(value);
  } catch {
    value = String(year) + "-02-28";
    return date(value);
  }
}
