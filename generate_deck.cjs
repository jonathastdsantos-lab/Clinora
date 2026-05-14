const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title = "Clinora — Pitch Deck";

const C = {
  green:      "0D7A5F",
  greenLight: "0B9E7A",
  greenSoft:  "E4F5F0",
  night:      "0B1320",
  nightMid:   "1A2744",
  white:      "F7F9FC",
  pureWhite:  "FFFFFF",
  textMid:    "4A5568",
  textDim:    "94A3B8",
  border:     "E2E8F0",
  blue:       "3B7EF6",
  amber:      "F59E0B",
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function darkSlide(slide) { slide.background = { color: C.night }; }
function lightSlide(slide) { slide.background = { color: C.pureWhite }; }

function sectionTag(slide, text, y = 0.38) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y, w: 1.6, h: 0.28, fill: { color: C.green }, rectRadius: 0.06, line: { color: C.green }
  });
  slide.addText(text.toUpperCase(), {
    x: 0.5, y, w: 1.6, h: 0.28, fontSize: 8, bold: true, color: C.pureWhite,
    align: "center", valign: "middle", charSpacing: 2
  });
}

function slideTitle(slide, text, color = C.pureWhite, y = 0.78) {
  slide.addText(text, { x: 0.5, y, w: 9, h: 0.7, fontSize: 32, bold: true, color, fontFace: "Trebuchet MS" });
}

function statBox(slide, val, label, x, y, w = 2.0) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h: 1.1, fill: { color: C.nightMid }, rectRadius: 0.1, line: { color: "1E3A5F" }
  });
  slide.addText(val, { x, y: y + 0.08, w, h: 0.55, fontSize: 28, bold: true, color: C.greenLight, align: "center", fontFace: "Trebuchet MS" });
  slide.addText(label, { x, y: y + 0.62, w, h: 0.38, fontSize: 10, color: C.textDim, align: "center" });
}

function featureRow(slide, icon, title, desc, y) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y, w: 9, h: 0.68, fill: { color: C.pureWhite }, rectRadius: 0.08,
    line: { color: C.border, width: 0.5 }
  });
  slide.addText(icon, { x: 0.65, y: y + 0.06, w: 0.45, h: 0.45, fontSize: 20, align: "center", valign: "middle" });
  slide.addText(title, { x: 1.2, y: y + 0.1, w: 2.2, h: 0.3, fontSize: 11, bold: true, color: C.night });
  slide.addText(desc,  { x: 1.2, y: y + 0.36, w: 7.8, h: 0.25, fontSize: 9, color: C.textMid });
}

function planCard(slide, name, price, features, x, highlight = false) {
  const bg = highlight ? C.green : C.pureWhite;
  const textC = highlight ? C.pureWhite : C.night;
  const subC  = highlight ? "C8EDE4" : C.textMid;
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y: 1.2, w: 2.8, h: 3.8, fill: { color: bg }, rectRadius: 0.12,
    line: { color: highlight ? C.greenLight : C.border, width: highlight ? 1.5 : 0.5 }
  });
  if (highlight) {
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.55, y: 0.98, w: 1.7, h: 0.26, fill: { color: C.greenLight }, rectRadius: 0.1, line: { color: C.greenLight }
    });
    slide.addText("MAIS POPULAR", { x: x + 0.55, y: 0.98, w: 1.7, h: 0.26, fontSize: 7, bold: true, color: C.pureWhite, align: "center", valign: "middle", charSpacing: 1.5 });
  }
  slide.addText(name,  { x, y: 1.32, w: 2.8, h: 0.35, fontSize: 12, bold: true, color: textC, align: "center" });
  slide.addText(price, { x, y: 1.72, w: 2.8, h: 0.55, fontSize: 26, bold: true, color: highlight ? C.pureWhite : C.green, align: "center", fontFace: "Trebuchet MS" });
  slide.addText("/mês",{ x, y: 2.28, w: 2.8, h: 0.22, fontSize: 9, color: subC, align: "center" });
  features.forEach((f, i) => {
    slide.addText("✓  " + f, {
      x: x + 0.15, y: 2.62 + i * 0.34, w: 2.5, h: 0.3, fontSize: 9,
      color: highlight ? "C8EDE4" : C.textMid
    });
  });
}

// ─── SLIDE 1 — CAPA ───────────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  darkSlide(s);
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.06, h: 5.625, fill: { color: C.green }, line: { color: C.green } });
  s.addShape(pres.shapes.RECTANGLE, { x: 6.2, y: 0, w: 3.8, h: 5.625, fill: { color: C.nightMid }, line: { color: C.nightMid } });

  s.addText("Clinora", { x: 0.5, y: 1.6, w: 5.5, h: 1.0, fontSize: 60, bold: true, color: C.pureWhite, fontFace: "Trebuchet MS" });
  s.addText("A plataforma que cuida da sua clínica", { x: 0.5, y: 2.7, w: 5.5, h: 0.5, fontSize: 18, color: C.textDim });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 3.3, w: 1.2, h: 0.04, fill: { color: C.green }, line: { color: C.green } });
  s.addText("Pitch Deck — Série Seed 2026", { x: 0.5, y: 3.5, w: 5.5, h: 0.35, fontSize: 12, color: C.textDim });

  ["R$120k MRR", "7 módulos", "4 especialidades"].forEach((t, i) => {
    s.addText(t, { x: 6.4, y: 1.5 + i * 0.85, w: 3.4, h: 0.6, fontSize: 22, bold: true, color: C.pureWhite, align: "center", fontFace: "Trebuchet MS" });
    if (i < 2) s.addShape(pres.shapes.LINE, { x: 7, y: 2.05 + i * 0.85, w: 2.2, h: 0, line: { color: "1E3A5F", width: 0.5 } });
  });
  s.addText("Meta — 12 meses", { x: 6.4, y: 4.2, w: 3.4, h: 0.3, fontSize: 9, color: C.textDim, align: "center" });
}

// ─── SLIDE 2 — PROBLEMA ───────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  lightSlide(s);
  sectionTag(s, "Problema");
  slideTitle(s, "Clínicas gerenciam tudo no improviso", C.night);

  const pains = [
    ["📋", "Papelada e sistemas separados", "Agenda em planilha, financeiro em outro app, WhatsApp no celular pessoal. Dados fragmentados, retrabalho diário."],
    ["📉", "Faltas e cancelamentos sem controle", "Sem lembretes automáticos, as faltas chegam a 30% da agenda — receita perdida sem recuperação."],
    ["💸", "Financeiro sem visibilidade", "Sem fluxo de caixa em tempo real, comissões calculadas manualmente, NFS-e emitida por fora."],
    ["😤", "Sistemas caros e incompletos", "Os sistemas existentes atendem parcialmente: bom no prontuário mas fraco no financeiro, ou vice-versa."],
  ];
  pains.forEach(([icon, title, desc], i) => featureRow(s, icon, title, desc, 1.65 + i * 0.82));
}

// ─── SLIDE 3 — SOLUÇÃO ────────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  darkSlide(s);
  sectionTag(s, "Solução");
  slideTitle(s, "Uma plataforma. Toda a operação.");

  const modules = [
    ["📅", "Agendamento"],
    ["📋", "Prontuário"],
    ["💰", "Financeiro"],
    ["👥", "Equipe"],
    ["💬", "WhatsApp"],
    ["📊", "BI & Relatórios"],
  ];
  modules.forEach(([icon, name], i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.5 + col * 3.1, y = 1.7 + row * 1.5;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w: 2.8, h: 1.2, fill: { color: C.nightMid }, rectRadius: 0.1, line: { color: "1E3A5F" }
    });
    s.addText(icon, { x, y: y + 0.12, w: 2.8, h: 0.45, fontSize: 24, align: "center" });
    s.addText(name, { x, y: y + 0.62, w: 2.8, h: 0.45, fontSize: 11, bold: true, color: C.pureWhite, align: "center" });
  });
  s.addText("+ CRM · App do paciente · Multi-unidade · IA assistente", {
    x: 0.5, y: 4.98, w: 9, h: 0.3, fontSize: 10, color: C.textDim, align: "center"
  });
}

// ─── SLIDE 4 — MERCADO ────────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  lightSlide(s);
  sectionTag(s, "Mercado");
  slideTitle(s, "Mercado grande e mal atendido", C.night);

  statBox(s, "450k+", "Clínicas no Brasil", 0.5, 1.7);
  statBox(s, "R$2,4B", "TAM — gestão de clínicas", 2.65, 1.7);
  statBox(s, "65%", "Sem sistema adequado", 4.8, 1.7);
  statBox(s, "R$120M", "SAM — segmento-alvo", 6.95, 1.7);

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 3.2, w: 9, h: 0.9, fill: { color: C.greenSoft }, rectRadius: 0.1, line: { color: C.greenLight }
  });
  s.addText("Especialidades-alvo: dentistas, clínicas médicas, estéticas e consultórios gerais. Ticket médio R$397/mês com LTV estimado em R$9.500 por clínica.", {
    x: 0.7, y: 3.3, w: 8.6, h: 0.7, fontSize: 11, color: C.night, valign: "middle"
  });

  s.addChart(pres.charts.BAR, [{
    name: "Clínicas (mil)",
    labels: ["Odontologia", "Clínica médica", "Estética", "Consultórios"],
    values: [180, 130, 80, 60]
  }], {
    x: 0.5, y: 4.22, w: 9, h: 1.0, barDir: "bar",
    chartColors: [C.green, C.greenLight, "5DCAA5", "9FE1CB"],
    chartArea: { fill: { color: C.pureWhite } },
    catAxisLabelColor: C.textMid,
    valAxisLabelColor: C.textMid,
    valGridLine: { color: C.border, size: 0.3 },
    catGridLine: { style: "none" },
    showLegend: false,
    showValue: true,
    dataLabelColor: C.night,
    dataLabelFontSize: 9,
  });
}

// ─── SLIDE 5 — MODELO DE NEGÓCIO ─────────────────────────────────────────────
{
  const s = pres.addSlide();
  lightSlide(s);
  sectionTag(s, "Modelo de negócio");
  slideTitle(s, "SaaS recorrente com add-ons", C.night);

  planCard(s, "Solo",   "R$197", ["1 profissional", "Agenda + prontuário", "Financeiro básico", "WhatsApp confirm."], 0.5);
  planCard(s, "Clínica","R$397", ["Até 5 profissionais", "Financeiro + NFS-e", "CRM + BI", "Gestão de equipe"], 3.45, true);
  planCard(s, "Pro",    "R$797", ["Ilimitados", "App mobile", "IA (voz + churn)", "Multi-unidade + API"], 6.4);

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 5.1, w: 9, h: 0.35, fill: { color: C.greenSoft }, rectRadius: 0.08, line: { color: "C8EDE4" }
  });
  s.addText("Add-ons: Disparo WhatsApp R$0,12/msg · Telemedicina R$97/mês · Unidade adicional R$297/mês · Onboarding R$497 único", {
    x: 0.6, y: 5.12, w: 8.8, h: 0.3, fontSize: 8.5, color: C.green, align: "center", valign: "middle"
  });
}

// ─── SLIDE 6 — TRAÇÃO ─────────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  darkSlide(s);
  sectionTag(s, "Tração");
  slideTitle(s, "Crescimento consistente desde o beta");

  s.addChart(pres.charts.LINE, [{
    name: "MRR (R$)",
    labels: ["M1","M2","M3","M4","M5","M6","M7","M8","M9","M10","M11","M12"],
    values: [0, 0, 800, 2400, 5200, 8000, 16000, 28000, 40000, 60000, 90000, 120000]
  }], {
    x: 0.5, y: 1.6, w: 5.8, h: 3.2,
    lineSize: 2.5, lineSmooth: true,
    chartColors: [C.green],
    chartArea: { fill: { color: C.nightMid } },
    catAxisLabelColor: C.textDim, valAxisLabelColor: C.textDim,
    valGridLine: { color: "1E3A5F", size: 0.3 },
    catGridLine: { style: "none" },
    showLegend: false,
  });

  const kpis = [["200+", "Clínicas pagantes"], ["R$397", "Ticket médio"], ["< 3%", "Churn mensal"], ["38x", "LTV / CAC"]];
  kpis.forEach(([v, l], i) => statBox(s, v, l, 6.55, 1.55 + i * 1.0, 2.9));
}

// ─── SLIDE 7 — ROADMAP ────────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  lightSlide(s);
  sectionTag(s, "Roadmap");
  slideTitle(s, "12 meses para liderança de mercado", C.night);

  const phases = [
    { label: "Fase 1", period: "M1–3", title: "Fundação & MVP", color: C.green, items: ["Infraestrutura multi-tenant", "Agendamento + prontuário", "2 clínicas-piloto"] },
    { label: "Fase 2", period: "M4–6", title: "Financeiro & WhatsApp", color: "0891B2", items: ["Módulo financeiro completo", "WhatsApp Business API", "Lançamento beta público"] },
    { label: "Fase 3", period: "M7–9", title: "CRM & BI", color: C.amber, items: ["CRM + fidelização", "Dashboards & KPIs", "Especialidades (odonto/estética)"] },
    { label: "Fase 4", period: "M10–12", title: "IA & Escala", color: "8B5CF6", items: ["Prontuário por voz (IA)", "App mobile paciente", "Multi-unidade & API"] },
  ];

  phases.forEach((p, i) => {
    const x = 0.5 + i * 2.35;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.55, w: 2.1, h: 3.6, fill: { color: C.pureWhite }, rectRadius: 0.1,
      line: { color: p.color, width: 1.5 }
    });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.55, w: 2.1, h: 0.6, fill: { color: p.color }, rectRadius: 0.1,
      line: { color: p.color }
    });
    s.addText(p.label, { x, y: 1.58, w: 2.1, h: 0.28, fontSize: 10, bold: true, color: C.pureWhite, align: "center" });
    s.addText(p.period, { x, y: 1.86, w: 2.1, h: 0.25, fontSize: 8.5, color: "C8EDE4", align: "center" });
    s.addText(p.title,  { x: x + 0.1, y: 2.25, w: 1.9, h: 0.35, fontSize: 10, bold: true, color: p.color });
    p.items.forEach((item, j) => {
      s.addText("→ " + item, { x: x + 0.1, y: 2.72 + j * 0.48, w: 1.9, h: 0.42, fontSize: 8.5, color: C.textMid });
    });

    if (i < 3) {
      s.addShape(pres.shapes.LINE, { x: x + 2.12, y: 2.35, w: 0.22, h: 0, line: { color: C.border, width: 1 } });
    }
  });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 5.18, w: 9, h: 0.3, fill: { color: C.greenSoft }, rectRadius: 0.08, line: { color: "C8EDE4" }
  });
  s.addText("Meta M12: R$120k MRR · 200+ clínicas pagantes · App mobile lançado · IA integrada", {
    x: 0.6, y: 5.2, w: 8.8, h: 0.26, fontSize: 9, color: C.green, align: "center", valign: "middle"
  });
}

// ─── SLIDE 8 — CONCORRÊNCIA ───────────────────────────────────────────────────
{
  const s = pres.addSlide();
  lightSlide(s);
  sectionTag(s, "Concorrência");
  slideTitle(s, "Clinora vs. mercado", C.night);

  const headers = ["", "iClinic", "Feegow", "Clinicorp", "Clinora ✓"];
  const rows = [
    ["Prontuário completo",  "✓","✓","✓","✓"],
    ["Financeiro + NFS-e",   "✓","✓","Parcial","✓"],
    ["WhatsApp API nativo",  "Parcial","✗","✓","✓"],
    ["BI preditivo c/ IA",   "✗","✗","✗","✓"],
    ["Score de churn",       "✗","✗","✗","✓"],
    ["App do paciente",      "✗","Parcial","✗","✓"],
    ["Multi-especialidade",  "✓","✓","Parcial","✓"],
    ["Preço/mês",            "R$249+","R$299+","R$349+","R$197+"],
  ];

  const colW = [2.5, 1.5, 1.5, 1.5, 1.5];
  const colX = [0.5, 3.05, 4.6, 6.15, 7.7];

  headers.forEach((h, i) => {
    const isClinora = i === 4;
    s.addShape(pres.shapes.RECTANGLE, {
      x: colX[i], y: 1.55, w: colW[i], h: 0.38,
      fill: { color: isClinora ? C.green : C.night }, line: { color: isClinora ? C.green : C.night }
    });
    s.addText(h, { x: colX[i], y: 1.55, w: colW[i], h: 0.38, fontSize: 10, bold: true, color: C.pureWhite, align: "center", valign: "middle" });
  });

  rows.forEach((row, ri) => {
    const y = 1.95 + ri * 0.42;
    const bg = ri % 2 === 0 ? C.pureWhite : "F8FAFC";
    row.forEach((cell, ci) => {
      s.addShape(pres.shapes.RECTANGLE, {
        x: colX[ci], y, w: colW[ci], h: 0.4,
        fill: { color: ci === 4 ? C.greenSoft : bg },
        line: { color: C.border, width: 0.3 }
      });
      const textColor = cell === "✓" ? C.green : cell === "✗" ? "E24B4A" : C.textMid;
      s.addText(cell, { x: colX[ci], y, w: colW[ci], h: 0.4, fontSize: ci === 0 ? 9 : 11, color: ci === 4 && cell === "✓" ? C.green : textColor, align: ci === 0 ? "left" : "center", valign: "middle", margin: ci === 0 ? [0,0,0,6] : 0, bold: cell === "✓" || cell === "✗" });
    });
  });
}

// ─── SLIDE 9 — TIME ───────────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  darkSlide(s);
  sectionTag(s, "Time");
  slideTitle(s, "Fundadores experientes em saúde e tech");

  const members = [
    { initials:"CEO", name:"Fundador CEO", role:"Negócios & Produto", exp:"10 anos em gestão de saúde digital. Ex-gestor de rede de clínicas." },
    { initials:"CTO", name:"Co-fundador CTO", role:"Tecnologia & Arquitetura", exp:"8 anos em SaaS B2B. Liderou times técnicos em healthtech." },
    { initials:"CS",  name:"Head Customer Success", role:"Clientes & Operações", exp:"5 anos em implementação de sistemas de saúde." },
  ];

  members.forEach((m, i) => {
    const x = 0.5 + i * 3.2;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.6, w: 2.9, h: 3.2, fill: { color: C.nightMid }, rectRadius: 0.12, line: { color: "1E3A5F" }
    });
    s.addShape(pres.shapes.OVAL, {
      x: x + 0.95, y: 1.82, w: 1.0, h: 1.0, fill: { color: C.green }, line: { color: C.greenLight }
    });
    s.addText(m.initials, { x: x + 0.95, y: 1.82, w: 1.0, h: 1.0, fontSize: 18, bold: true, color: C.pureWhite, align: "center", valign: "middle" });
    s.addText(m.name,   { x, y: 3.0, w: 2.9, h: 0.35, fontSize: 12, bold: true, color: C.pureWhite, align: "center" });
    s.addText(m.role,   { x, y: 3.35, w: 2.9, h: 0.3, fontSize: 9.5, color: C.greenLight, align: "center" });
    s.addText(m.exp,    { x: x + 0.15, y: 3.72, w: 2.6, h: 0.9, fontSize: 9, color: C.textDim, align: "center" });
  });

  s.addText("+ Advisors: especialistas em saúde digital, direito médico e growth B2B", {
    x: 0.5, y: 5.05, w: 9, h: 0.3, fontSize: 10, color: C.textDim, align: "center"
  });
}

// ─── SLIDE 10 — CAPTAÇÃO ──────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  darkSlide(s);
  sectionTag(s, "Captação");
  slideTitle(s, "Rodada Seed — R$1,2M");

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.night }, line: { color: C.night } });

  const allocs = [
    { label: "Produto & Engenharia", pct: "40%", val: "R$480k", color: C.green },
    { label: "Vendas & Marketing", pct: "30%", val: "R$360k", color: C.greenLight },
    { label: "Operações & CS", pct: "20%", val: "R$240k", color: "5DCAA5" },
    { label: "Jurídico & Compliance", pct: "10%", val: "R$120k", color: "9FE1CB" },
  ];
  allocs.forEach((a, i) => {
    const x = 0.5 + (i % 2) * 4.6;
    const y = 1.65 + Math.floor(i / 2) * 1.3;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w: 4.2, h: 1.1, fill: { color: C.nightMid }, rectRadius: 0.1, line: { color: "1E3A5F" }
    });
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.06, h: 1.1, fill: { color: a.color }, line: { color: a.color } });
    s.addText(a.pct,   { x: x + 0.25, y: y + 0.1,  w: 0.8, h: 0.45, fontSize: 22, bold: true, color: a.color, fontFace: "Trebuchet MS" });
    s.addText(a.label, { x: x + 0.25, y: y + 0.58, w: 3.8, h: 0.3, fontSize: 10, color: C.textDim });
    s.addText(a.val,   { x: x + 2.8,  y: y + 0.1,  w: 1.3, h: 0.45, fontSize: 14, bold: true, color: C.pureWhite, align: "right" });
  });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 4.42, w: 9, h: 0.9, fill: { color: C.green }, rectRadius: 0.12, line: { color: C.greenLight }
  });
  s.addText("Meta pós-captação: R$120k MRR em 12 meses · 200+ clínicas pagantes · Plataforma completa com IA", {
    x: 0.6, y: 4.48, w: 8.8, h: 0.38, fontSize: 11, bold: true, color: C.pureWhite, align: "center", valign: "middle"
  });
  s.addText("Break-even operacional no mês 14 · LTV/CAC = 38x", {
    x: 0.6, y: 4.86, w: 8.8, h: 0.28, fontSize: 9, color: "C8EDE4", align: "center"
  });
}

// ─── SLIDE 11 — ENCERRAMENTO ─────────────────────────────────────────────────
{
  const s = pres.addSlide();
  darkSlide(s);
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.night }, line: { color: C.night } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.06, h: 5.625, fill: { color: C.green }, line: { color: C.green } });

  s.addText("Clinora", { x: 0.5, y: 1.2, w: 9, h: 0.9, fontSize: 56, bold: true, color: C.pureWhite, align: "center", fontFace: "Trebuchet MS" });
  s.addText("A plataforma que cuida da sua clínica", { x: 0.5, y: 2.2, w: 9, h: 0.4, fontSize: 16, color: C.textDim, align: "center" });

  s.addShape(pres.shapes.LINE, { x: 3.5, y: 2.8, w: 3, h: 0, line: { color: C.green, width: 1 } });

  s.addText("contato@clinora.com.br", { x: 0.5, y: 3.1, w: 9, h: 0.35, fontSize: 14, color: C.greenLight, align: "center" });
  s.addText("www.clinora.com.br", { x: 0.5, y: 3.5, w: 9, h: 0.3, fontSize: 12, color: C.textDim, align: "center" });
  s.addText("Obrigado!", { x: 0.5, y: 4.2, w: 9, h: 0.5, fontSize: 22, bold: true, color: C.pureWhite, align: "center" });
}

pres.writeFile({ fileName: "Clinora_PitchDeck.pptx" })
  .then(() => console.log("PPTX OK"))
  .catch(e => console.error("ERRO:", e));
