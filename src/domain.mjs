import {
  str,
  obj,
  arrays,
  rows,
  integer,
  finite,
  safe,
  money,
  sum,
  boolean,
  one,
  refs,
  semantic,
  check,
  date,
  addYears,
} from "./helpers.mjs";
export const LIMIT =
  "HistoVec est partagé par le propriétaire. Aucun accès par plaque arbitraire. L’absence d’accident enregistré ne prouve pas l’absence de tout accident.";
export function validateInput(x) {}
export function prepare(x) {
  const checks = [],
    pairs = [];
  obj(x.ad);
  obj(x.history);
  str(x.ad.vehicleId);
  str(x.history.vehicleId);
  date(x.ad.date);
  integer(x.history.ownerCount, 1);
  rows(x.readings);
  rows(x.claims);
  checks.push(
    check(
      "vehicule",
      "Même véhicule dans les pièces",
      x.ad.vehicleId === x.history.vehicleId,
      refs(x.ad, x.history),
    ),
  );
  const rs = x.readings
    .map((o) => {
      obj(o);
      date(o.date);
      integer(o.km);
      return o;
    })
    .sort((a, b) => a.date.localeCompare(b.date));
  for (let i = 1; i < rs.length; i++)
    checks.push(
      check(
        "km-" + i,
        "Kilométrage chronologique",
        rs[i].date === rs[i - 1].date
          ? rs[i].km === rs[i - 1].km
            ? true
            : null
          : rs[i].km >= rs[i - 1].km,
        refs(rs[i - 1], rs[i]),
      ),
    );
  const latest = rs.filter((r) => r.date <= x.ad.date).at(-1);
  integer(x.ad.km);
  checks.push(
    check(
      "km-annonce",
      "Kilométrage de l’annonce",
      latest ? x.ad.km >= latest.km : null,
      refs(x.ad, ...(latest ? [latest] : [])),
    ),
  );
  for (const c of x.claims) {
    obj(c);
    str(c.description);
    one(c.kind, ["premiere-main", "entretien", "jamais-accidente"]);
    const r = refs(c, x.history, ...(c.proof ? [obj(c.proof)] : []));
    if (c.kind === "premiere-main")
      checks.push(
        check(c.id, "Première main documentée", x.history.ownerCount === 1, r),
      );
    else if (c.kind === "jamais-accidente") {
      boolean(x.history.recordedAccident);
      checks.push(
        check(
          c.id,
          "Portée de l’historique accident",
          x.history.recordedAccident ? false : null,
          r,
          "Un historique limité ne démontre pas une absence universelle d’accident.",
        ),
      );
    } else
      pairs.push(
        semantic(
          c.id,
          "Entretien documenté",
          c.description,
          c.proof?.description,
          r,
          "La pièce fournie étaye-t-elle toute la portée de la promesse d’entretien, sans supposer des opérations absentes ?",
          true,
        ),
      );
  }
  return {
    checks,
    pairs,
    outputs: {
      vehicule: x.ad.vehicleId,
      chronologieKilometrique: rs.map((r) => ({
        date: r.date,
        km: r.km,
        docId: r.docId,
      })),
    },
  };
}
