(async () => {
  let latest = null;
  const el = (id) => document.getElementById(id);
  const res = await fetch("/samples");
  const { samples, allowLive } = await res.json();
  for (let i = 0; i < samples.length; i++) {
    const o = document.createElement("option");
    o.value = i;
    o.textContent = samples[i].label;
    el("sample").append(o);
  }
  if (allowLive) {
    const o = document.createElement("option");
    o.value = "jev";
    o.textContent = "Jev réel · envoi à TypeSafe AI";
    el("mode").append(o);
  }
  const choose = () => {
    el("input").value = JSON.stringify(
      samples[el("sample").value].input,
      null,
      2,
    );
    latest = null;
    el("download").disabled = true;
    el("report").removeAttribute("srcdoc");
    el("status").textContent = "";
  };
  el("sample").onchange = choose;
  choose();
  el("run").onclick = async () => {
    el("run").disabled = true;
    latest = null;
    el("download").disabled = true;
    el("report").removeAttribute("srcdoc");
    el("status").textContent = "Analyse en cours…";
    try {
      const r = await fetch("/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          input: JSON.parse(el("input").value),
          mode: el("mode").value,
        }),
      });
      const b = await r.json();
      if (!r.ok) throw new Error(b.error);
      latest = b.report;
      el("report").srcdoc = b.html;
      el("status").textContent =
        "Résultat : " +
        b.report.status +
        " · " +
        b.report.findings.length +
        " contrôles";
      el("download").disabled = false;
    } catch (e) {
      el("status").textContent = "Erreur : " + e.message;
    } finally {
      el("run").disabled = false;
    }
  };
  el("download").onclick = () => {
    if (!latest) return;
    const u = URL.createObjectURL(
      new Blob([JSON.stringify(latest, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = u;
    a.download = "rapport.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(u), 1000);
  };
})();
