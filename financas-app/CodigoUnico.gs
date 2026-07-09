/**
 * NOSSAS FINANÇAS — ARQUIVO ÚNICO (servidor + app juntos)
 * Cole este arquivo inteiro no Código.gs — não precisa criar mais nada.
 * ------------------------------------------------
 * Os dados moram numa planilha Google no Drive: "Nossas Finanças — Dados".
 * Este script serve o app (Index.html) e faz a leitura/escrita na planilha.
 *
 * >>> ÚNICO AJUSTE NECESSÁRIO: coloque o e-mail da Nathália abaixo. <<<
 */
var COMPARTILHAR_COM = [
  // "email-da-nathalia@gmail.com",
];

var NOME_PLANILHA = "Nossas Finanças — Dados";

// Abas e colunas
var ABA_TX = "Lançamentos";
var TX_HEADERS = ["id", "data", "valor", "categoria", "pessoa", "cartao", "nota", "criado_em"];
var ABA_DEBT = "Dívidas";
var DEBT_HEADERS = ["id", "nome", "tipo", "total", "restante", "parcela", "juros_pct", "dia_venc", "nota", "arquivada"];
var ABA_META = "Config";

// ── Página ───────────────────────────────────────────────────────────────────
function doGet() {
  return HtmlService.createHtmlOutput(INDEX_HTML)
    .setTitle("Nossas Finanças")
    .addMetaTag("viewport", "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ── Planilha (cria na primeira vez) ──────────────────────────────────────────
function abrirPlanilha_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty("SHEET_ID");
  if (id) {
    try {
      return SpreadsheetApp.openById(id);
    } catch (e) {
      // id guardado mas planilha sumiu — cria de novo
    }
  }
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    id = props.getProperty("SHEET_ID");
    if (id) {
      try { return SpreadsheetApp.openById(id); } catch (e) {}
    }
    var ss = SpreadsheetApp.create(NOME_PLANILHA);
    props.setProperty("SHEET_ID", ss.getId());

    var tx = ss.getSheets()[0];
    tx.setName(ABA_TX);
    tx.appendRow(TX_HEADERS);
    tx.getRange("B:B").setNumberFormat("@"); // datas como texto YYYY-MM-DD
    tx.setFrozenRows(1);

    var debt = ss.insertSheet(ABA_DEBT);
    debt.appendRow(DEBT_HEADERS);
    debt.setFrozenRows(1);

    var meta = ss.insertSheet(ABA_META);
    meta.appendRow(["chave", "valor_json"]);
    meta.setFrozenRows(1);

    // Compartilha com a família
    for (var i = 0; i < COMPARTILHAR_COM.length; i++) {
      try { ss.addEditor(COMPARTILHAR_COM[i]); } catch (e) {}
    }
    return ss;
  } finally {
    lock.releaseLock();
  }
}

function aba_(nome, headers) {
  var ss = abrirPlanilha_();
  var sh = ss.getSheetByName(nome);
  if (!sh) {
    sh = ss.insertSheet(nome);
    sh.appendRow(headers);
    sh.setFrozenRows(1);
  }
  return sh;
}

// ── Normalização de valores lidos da planilha ────────────────────────────────
function dataParaTexto_(v) {
  if (v instanceof Date) {
    return Utilities.formatDate(v, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  return String(v || "");
}

function linhaParaTx_(r) {
  return {
    id: String(r[0]),
    date: dataParaTexto_(r[1]),
    amount: Number(r[2]) || 0,
    categoryId: String(r[3] || ""),
    personId: String(r[4] || ""),
    cardId: r[5] ? String(r[5]) : null,
    note: String(r[6] || ""),
    createdAt: Number(r[7]) || 0,
  };
}

function txParaLinha_(t) {
  return [t.id, t.date, t.amount, t.categoryId, t.personId, t.cardId || "", t.note || "", t.createdAt || Date.now()];
}

function linhaParaDivida_(r) {
  return {
    id: String(r[0]),
    name: String(r[1] || ""),
    kind: String(r[2] || "outro"),
    total: Number(r[3]) || 0,
    remaining: Number(r[4]) || 0,
    monthly: Number(r[5]) || 0,
    interestPct: Number(r[6]) || 0,
    dueDay: Number(r[7]) || 0,
    note: String(r[8] || ""),
    archived: r[9] === true || r[9] === "TRUE" || r[9] === "true",
  };
}

function dividaParaLinha_(d) {
  return [d.id, d.name, d.kind, d.total, d.remaining, d.monthly, d.interestPct, d.dueDay, d.note || "", !!d.archived];
}

// ── API chamada pelo app ─────────────────────────────────────────────────────
function getState() {
  var ss = abrirPlanilha_();
  var tx = aba_(ABA_TX, TX_HEADERS);
  var debt = aba_(ABA_DEBT, DEBT_HEADERS);
  var meta = aba_(ABA_META, ["chave", "valor_json"]);

  var txRows = tx.getLastRow() > 1 ? tx.getRange(2, 1, tx.getLastRow() - 1, TX_HEADERS.length).getValues() : [];
  var debtRows = debt.getLastRow() > 1 ? debt.getRange(2, 1, debt.getLastRow() - 1, DEBT_HEADERS.length).getValues() : [];
  var metaRows = meta.getLastRow() > 1 ? meta.getRange(2, 1, meta.getLastRow() - 1, 2).getValues() : [];

  var metaObj = {};
  for (var i = 0; i < metaRows.length; i++) {
    try { metaObj[String(metaRows[i][0])] = JSON.parse(String(metaRows[i][1])); } catch (e) {}
  }

  return {
    ok: true,
    sheetUrl: ss.getUrl(),
    transactions: txRows.map(linhaParaTx_).filter(function (t) { return t.id; }),
    debts: debtRows.map(linhaParaDivida_).filter(function (d) { return d.id; }),
    meta: metaObj,
  };
}

/** Insere ou atualiza um lançamento (idempotente por id — seguro pra retry). */
function upsertTx(t) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sh = aba_(ABA_TX, TX_HEADERS);
    var row = acharLinha_(sh, t.id);
    if (row > 0) {
      sh.getRange(row, 1, 1, TX_HEADERS.length).setValues([txParaLinha_(t)]);
    } else {
      sh.appendRow(txParaLinha_(t));
    }
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

function deleteTx(id) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sh = aba_(ABA_TX, TX_HEADERS);
    var row = acharLinha_(sh, id);
    if (row > 0) sh.deleteRow(row);
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

function upsertDebt(d) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sh = aba_(ABA_DEBT, DEBT_HEADERS);
    var row = acharLinha_(sh, d.id);
    if (row > 0) {
      sh.getRange(row, 1, 1, DEBT_HEADERS.length).setValues([dividaParaLinha_(d)]);
    } else {
      sh.appendRow(dividaParaLinha_(d));
    }
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

function deleteDebt(id) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sh = aba_(ABA_DEBT, DEBT_HEADERS);
    var row = acharLinha_(sh, id);
    if (row > 0) sh.deleteRow(row);
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

/** Salva as configurações (renda, fixas, cartões, categorias, pessoas, % investir). */
function saveMeta(metaObj) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sh = aba_(ABA_META, ["chave", "valor_json"]);
    var keys = Object.keys(metaObj);
    var existing = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().map(function (r) { return String(r[0]); }) : [];
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var json = JSON.stringify(metaObj[k]);
      var idx = existing.indexOf(k);
      if (idx >= 0) {
        sh.getRange(idx + 2, 2).setValue(json);
      } else {
        sh.appendRow([k, json]);
      }
    }
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

function acharLinha_(sh, id) {
  if (sh.getLastRow() < 2) return -1;
  var ids = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) return i + 2;
  }
  return -1;
}


// ─────────────────────────────────────────────────────────────────────────────
// O app inteiro (HTML/CSS/JS) embutido — servido pelo doGet acima.
// ─────────────────────────────────────────────────────────────────────────────
var INDEX_HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover">
<title>Nossas Finanças</title>
<style>
/* ── Nossas Finanças — design system ── */
:root{
  --bg:#0b0f14; --bg-elev:#10161e; --card:#141c26; --card-2:#1b2530;
  --line:rgba(255,255,255,.08); --line-2:rgba(255,255,255,.14);
  --fg:#eef2f6; --muted:#8b98a8; --muted-2:#63707f;
  --brand:#34d399; --brand-ink:#052e21; --accent:#38bdf8;
  --danger:#fb7185; --warn:#fbbf24; --ok:#34d399;
}
*,*::before,*::after{box-sizing:border-box}
html,body{margin:0;padding:0;height:100%}
body{
  background:radial-gradient(120% 60% at 50% -10%,rgba(52,211,153,.08),transparent 60%),var(--bg);
  color:var(--fg);
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  -webkit-font-smoothing:antialiased;
}
.fin-root{position:fixed;inset:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior-y:none}
.fin-app{max-width:560px;margin:0 auto;min-height:100%;padding:0 16px calc(96px + env(safe-area-inset-bottom))}
.fin-header{position:sticky;top:0;z-index:20;padding:calc(12px + env(safe-area-inset-top)) 0 12px;
  background:linear-gradient(var(--bg) 72%,transparent);backdrop-filter:blur(6px)}
.fin-header-row{display:flex;align-items:center;justify-content:space-between;gap:10px}
.fin-title{font-size:15px;font-weight:700;letter-spacing:-.01em;display:flex;align-items:center;gap:8px}
.fin-title .dot{width:9px;height:9px;border-radius:50%;background:var(--brand);box-shadow:0 0 10px var(--brand)}
.fin-title .dot.pend{background:var(--warn);box-shadow:0 0 10px var(--warn)}
.fin-title .dot.local{background:var(--muted-2);box-shadow:none}
.fin-month{display:flex;align-items:center;gap:4px;background:var(--card);border:1px solid var(--line);border-radius:999px;padding:4px}
.fin-month button{width:30px;height:30px;border-radius:50%;border:0;background:transparent;color:var(--muted);font-size:18px;line-height:1;cursor:pointer;display:grid;place-items:center}
.fin-month button:active{background:var(--card-2)}
.fin-month .label{font-size:12.5px;font-weight:600;min-width:92px;text-align:center;text-transform:capitalize}
.fin-card{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:16px}
.fin-card + .fin-card{margin-top:12px}
.fin-section-title{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin:22px 2px 10px}
.fin-hero{background:radial-gradient(140% 120% at 100% 0%,rgba(56,189,248,.12),transparent 55%),linear-gradient(160deg,#14212b,#101820);
  border:1px solid var(--line-2);border-radius:22px;padding:18px;margin-top:4px}
.fin-hero .cap{font-size:12.5px;color:var(--muted);font-weight:600}
.fin-hero .big{font-size:34px;font-weight:800;letter-spacing:-.02em;margin-top:2px;line-height:1.05}
.fin-hero .big.neg{color:var(--danger)}
.fin-hero .big.pos{color:var(--brand)}
.fin-hero .sub{font-size:12.5px;color:var(--muted);margin-top:6px}
.fin-bar{height:9px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden;margin-top:10px}
.fin-bar>span{display:block;height:100%;border-radius:999px;transition:width .35s ease}
.fin-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:12px}
.fin-stat{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px 10px}
.fin-stat .k{font-size:11px;color:var(--muted);font-weight:600}
.fin-stat .v{font-size:15px;font-weight:800;margin-top:4px;letter-spacing:-.01em}
.fin-row{display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid var(--line)}
.fin-row:last-child{border-bottom:0}
.fin-ico{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;font-size:19px;background:var(--card-2);flex:none}
.fin-row .grow{flex:1;min-width:0}
.fin-row .name{font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fin-row .meta{font-size:12px;color:var(--muted);margin-top:1px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.fin-row .amt{font-size:14.5px;font-weight:700;white-space:nowrap}
.fin-pill{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;padding:2px 8px;border-radius:999px;background:var(--card-2);color:var(--muted)}
.fin-pdot{width:7px;height:7px;border-radius:50%;flex:none;display:inline-block}
.fin-btn{appearance:none;border:1px solid var(--line-2);background:var(--card);color:var(--fg);font-size:14px;font-weight:600;border-radius:12px;padding:11px 14px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;font-family:inherit}
.fin-btn:active{transform:translateY(1px)}
.fin-btn.primary{background:var(--brand);color:var(--brand-ink);border-color:transparent}
.fin-btn.ghost{background:transparent}
.fin-btn.danger{color:var(--danger);border-color:rgba(251,113,133,.35);background:rgba(251,113,133,.08)}
.fin-btn.block{width:100%}
.fin-btn.sm{padding:7px 10px;font-size:12.5px;border-radius:10px}
.fin-btn:disabled{opacity:.5}
.fin-input,.fin-select{width:100%;background:var(--bg-elev);border:1px solid var(--line-2);color:var(--fg);border-radius:12px;padding:12px 14px;font-size:15px;outline:none;font-family:inherit}
.fin-input:focus,.fin-select:focus{border-color:var(--brand)}
.fin-label{font-size:12px;font-weight:600;color:var(--muted);margin:0 0 6px 2px;display:block}
.fin-field + .fin-field{margin-top:12px}
.fin-fab{position:fixed;right:max(16px,calc(50% - 280px + 16px));bottom:calc(78px + env(safe-area-inset-bottom));z-index:40;width:58px;height:58px;border-radius:20px;border:0;background:var(--brand);color:var(--brand-ink);font-size:30px;font-weight:300;line-height:1;display:grid;place-items:center;box-shadow:0 12px 30px rgba(52,211,153,.35);cursor:pointer}
.fin-fab:active{transform:scale(.94)}
.fin-nav{position:fixed;left:0;right:0;bottom:0;z-index:30;display:flex;justify-content:center;gap:2px;padding:8px 10px calc(8px + env(safe-area-inset-bottom));background:rgba(11,15,20,.86);backdrop-filter:blur(14px);border-top:1px solid var(--line)}
.fin-nav-inner{display:flex;gap:2px;width:100%;max-width:560px}
.fin-nav button{flex:1;border:0;background:transparent;color:var(--muted-2);font-size:10.5px;font-weight:600;padding:4px 0;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;font-family:inherit}
.fin-nav button .ni{font-size:20px;line-height:1;filter:grayscale(1) opacity(.6)}
.fin-nav button.active{color:var(--fg)}
.fin-nav button.active .ni{filter:none}
.fin-overlay{position:fixed;inset:0;z-index:50;background:rgba(3,6,9,.6);backdrop-filter:blur(3px);display:flex;align-items:flex-end;justify-content:center;animation:fin-fade .18s ease}
.fin-sheet{width:100%;max-width:560px;background:var(--bg-elev);border:1px solid var(--line-2);border-bottom:0;border-radius:24px 24px 0 0;padding:8px 16px calc(20px + env(safe-area-inset-bottom));max-height:92vh;overflow-y:auto;animation:fin-up .24s cubic-bezier(.2,.9,.3,1)}
.fin-grab{width:40px;height:4px;border-radius:999px;background:var(--line-2);margin:6px auto 12px}
.fin-sheet-title{font-size:17px;font-weight:800;letter-spacing:-.01em;margin:0 2px 14px}
@keyframes fin-up{from{transform:translateY(100%)}}
@keyframes fin-fade{from{opacity:0}}
.fin-catgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.fin-cat{border:1px solid var(--line);background:var(--card);border-radius:14px;padding:10px 4px;display:flex;flex-direction:column;align-items:center;gap:5px;cursor:pointer;color:var(--fg);font-family:inherit}
.fin-cat .e{font-size:22px}
.fin-cat .l{font-size:10.5px;font-weight:600;color:var(--muted);text-align:center;line-height:1.15}
.fin-cat.sel{border-color:var(--brand);background:rgba(52,211,153,.1)}
.fin-cat.sel .l{color:var(--fg)}
.fin-seg{display:flex;gap:6px}
.fin-seg button{flex:1;border:1px solid var(--line-2);background:var(--card);color:var(--muted);border-radius:12px;padding:10px 6px;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;font-family:inherit}
.fin-seg button.on{color:var(--fg)}
.fin-amount-display{text-align:center;font-size:44px;font-weight:800;letter-spacing:-.02em;padding:8px 0 4px}
.fin-amount-display .cur{font-size:22px;color:var(--muted);vertical-align:middle;margin-right:4px}
.fin-keys{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}
.fin-keys button{border:1px solid var(--line);background:var(--card);color:var(--fg);border-radius:14px;padding:15px 0;font-size:21px;font-weight:700;cursor:pointer;font-family:inherit}
.fin-keys button:active{background:var(--card-2)}
.fin-muted{color:var(--muted)}
.fin-tiny{font-size:11.5px}
.fin-empty{text-align:center;color:var(--muted);padding:34px 16px;font-size:13.5px;line-height:1.5}
.fin-empty .ico{font-size:34px;display:block;margin-bottom:8px}
.fin-split{display:flex;gap:10px}
.fin-split>*{flex:1}
.fin-inline{display:flex;align-items:center;justify-content:space-between;gap:10px}
.fin-toggle{width:44px;height:26px;border-radius:999px;border:0;background:var(--card-2);position:relative;cursor:pointer;flex:none;transition:background .2s}
.fin-toggle::after{content:"";position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:transform .2s}
.fin-toggle.on{background:var(--brand)}
.fin-toggle.on::after{transform:translateX(18px)}
.fin-toast{position:fixed;left:50%;bottom:calc(150px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:60;background:var(--brand);color:var(--brand-ink);font-weight:700;font-size:13px;padding:10px 16px;border-radius:999px;box-shadow:0 8px 24px rgba(0,0,0,.4);animation:fin-fade .16s ease;white-space:nowrap}
.fin-toast.err{background:var(--danger);color:#3d0710}
input[type=range]{width:100%;accent-color:var(--brand)}
a{color:var(--accent)}
</style>
</head>
<body>
<div class="fin-root" id="root">
  <div class="fin-app">
    <header class="fin-header">
      <div class="fin-header-row">
        <div class="fin-title"><span class="dot local" id="syncdot"></span>Nossas Finanças</div>
        <div class="fin-month" id="monthsel" style="display:none">
          <button id="mprev" aria-label="Mês anterior">‹</button>
          <span class="label" id="mlabel"></span>
          <button id="mnext" aria-label="Próximo mês">›</button>
        </div>
      </div>
    </header>
    <div id="view"></div>
  </div>
  <button class="fin-fab" id="fab" aria-label="Registrar gasto">+</button>
  <nav class="fin-nav"><div class="fin-nav-inner" id="navtabs"></div></nav>
</div>
<div id="sheet-holder"></div>
<div id="toast-holder"></div>

<script>
"use strict";
/* ═══════════════ Helpers ═══════════════ */
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
var BRL=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"});
function money(v){return BRL.format(v||0);}
function uid(p){return (p||"id")+"_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,8);}
function pad2(n){return String(n).padStart(2,"0");}
function todayISO(){var d=new Date();return d.getFullYear()+"-"+pad2(d.getMonth()+1)+"-"+pad2(d.getDate());}
function monthKeyOf(d){return d.getFullYear()+"-"+pad2(d.getMonth()+1);}
function shiftMonth(key,delta){var p=key.split("-");var d=new Date(+p[0],+p[1]-1+delta,1);return monthKeyOf(d);}
var MESES=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
function monthLabelShort(key){var p=key.split("-");return MESES[+p[1]-1].slice(0,3)+"/"+String(p[0]).slice(2);}
function dayLabel(iso){var p=iso.split("-");return (+p[2])+" "+MESES[+p[1]-1].slice(0,3).toLowerCase();}
function parseAmount(input){
  if(!input)return 0;
  var s=String(input).trim().replace(/[^\\d.,-]/g,"");
  var hc=s.indexOf(",")>=0, hd=s.indexOf(".")>=0;
  if(hc&&hd){s=s.replace(/\\./g,"").replace(",",".");}else if(hc){s=s.replace(",",".");}
  var n=parseFloat(s);return isNaN(n)?0:Math.abs(n);
}

/* ═══════════════ Modelo / padrões ═══════════════ */
var KIND_LABEL={fixo:"Fixo",variavel:"Variável",investimento:"Investimento"};
var KIND_COLOR={fixo:"#f59e0b",variavel:"#38bdf8",investimento:"#34d399"};
var DEBT_KIND_LABEL={cartao:"Cartão",emprestimo:"Empréstimo",parcelamento:"Parcelamento",pessoa:"Pessoa",outro:"Outro"};
var DEBT_KIND_EMOJI={cartao:"💳",emprestimo:"🏦",parcelamento:"🧾",pessoa:"🤝",outro:"📌"};

function defaults(){
  return {
    people:[
      {id:"p_matheus",name:"Matheus",color:"#38bdf8"},
      {id:"p_nathalia",name:"Nathália",color:"#f472b6"},
      {id:"p_casal",name:"Casal",color:"#a78bfa"}
    ],
    categories:[
      {id:"c_mercado",name:"Supermercado",emoji:"🛒",kind:"variavel",budget:0},
      {id:"c_feira",name:"Feira",emoji:"🥬",kind:"variavel",budget:0},
      {id:"c_restaurante",name:"Restaurante / iFood",emoji:"🍔",kind:"variavel",budget:0},
      {id:"c_combustivel",name:"Combustível",emoji:"⛽",kind:"variavel",budget:0},
      {id:"c_transporte",name:"Uber / Transporte",emoji:"🚗",kind:"variavel",budget:0},
      {id:"c_farmacia",name:"Farmácia",emoji:"💊",kind:"variavel",budget:0},
      {id:"c_roupa",name:"Roupa",emoji:"👕",kind:"variavel",budget:0},
      {id:"c_shopping",name:"Compras / Shopping",emoji:"🛍️",kind:"variavel",budget:0},
      {id:"c_lazer",name:"Lazer",emoji:"🎬",kind:"variavel",budget:0},
      {id:"c_casa",name:"Casa",emoji:"🏠",kind:"variavel",budget:0},
      {id:"c_pet",name:"Pet",emoji:"🐾",kind:"variavel",budget:0},
      {id:"c_outros",name:"Outros",emoji:"📦",kind:"variavel",budget:0},
      {id:"c_aluguel",name:"Aluguel",emoji:"🏡",kind:"fixo",budget:0},
      {id:"c_energia",name:"Energia",emoji:"💡",kind:"fixo",budget:0},
      {id:"c_agua",name:"Água",emoji:"🚰",kind:"fixo",budget:0},
      {id:"c_internet",name:"Internet",emoji:"🌐",kind:"fixo",budget:0},
      {id:"c_celular",name:"Celular",emoji:"📱",kind:"fixo",budget:0},
      {id:"c_saude",name:"Plano de Saúde",emoji:"⚕️",kind:"fixo",budget:0},
      {id:"c_streaming",name:"Streaming",emoji:"📺",kind:"fixo",budget:0},
      {id:"c_academia",name:"Academia",emoji:"🏋️",kind:"fixo",budget:0},
      {id:"c_reserva",name:"Reserva de Emergência",emoji:"🛟",kind:"investimento",budget:0},
      {id:"c_invest",name:"Investimento",emoji:"📈",kind:"investimento",budget:0}
    ],
    cards:[
      {id:"card_santander",name:"Santander Elite",color:"#ec1c24",dueDay:0,active:true},
      {id:"card_sicredi",name:"Sicredi Black",color:"#2e7d32",dueDay:0,active:true}
    ],
    incomes:[
      {id:"inc_m",name:"Salário Matheus",amount:0,active:true},
      {id:"inc_n",name:"Renda Nathália",amount:0,active:true}
    ],
    fixed:[],
    transactions:[],
    debts:[],
    investTargetPct:20
  };
}

/* ═══════════════ Estado + cache local ═══════════════ */
var CACHE_KEY="financas_casal_v1", OPS_KEY="financas_ops_v1";
var S=loadCache();
var sheetUrl="";

function loadCache(){
  try{
    var raw=localStorage.getItem(CACHE_KEY);
    if(raw){var s=JSON.parse(raw);return migrate(s);}
  }catch(e){}
  return defaults();
}
function migrate(s){
  var d=defaults();
  s.people=s.people&&s.people.length?s.people:d.people;
  s.categories=s.categories&&s.categories.length?s.categories:d.categories;
  d.categories.forEach(function(c){if(!s.categories.some(function(x){return x.id===c.id;}))s.categories.push(c);});
  s.cards=s.cards||d.cards;
  s.incomes=s.incomes||d.incomes;
  s.fixed=s.fixed||[];
  s.transactions=(s.transactions||[]).map(function(t){t.cardId=t.cardId||null;return t;});
  s.debts=s.debts||[];
  if(typeof s.investTargetPct!=="number")s.investTargetPct=d.investTargetPct;
  return s;
}
function saveCache(){try{localStorage.setItem(CACHE_KEY,JSON.stringify(S));}catch(e){}}

/* ═══════════════ Sincronização com a planilha ═══════════════ */
function isRemote(){return !!(window.google&&google.script&&google.script.run);}
function gsCall(fn,arg){
  return new Promise(function(res,rej){
    google.script.run.withSuccessHandler(res).withFailureHandler(rej)[fn](arg);
  });
}
function loadOps(){try{return JSON.parse(localStorage.getItem(OPS_KEY)||"[]");}catch(e){return[];}}
function saveOps(ops){try{localStorage.setItem(OPS_KEY,JSON.stringify(ops));}catch(e){}}
var flushing=false;
function pushOp(fn,arg){
  var ops=loadOps();
  if(fn==="saveMeta")ops=ops.filter(function(o){return o.fn!=="saveMeta";}); // colapsa metas
  ops.push({fn:fn,arg:arg});
  saveOps(ops);
  updateSyncDot();
  flushOps();
}
function flushOps(){
  if(!isRemote()||flushing)return Promise.resolve();
  flushing=true;
  return (function next(){
    var ops=loadOps();
    if(!ops.length){flushing=false;updateSyncDot();return Promise.resolve();}
    return gsCall(ops[0].fn,ops[0].arg).then(function(){
      var cur=loadOps();cur.shift();saveOps(cur);
      return next();
    }).catch(function(){
      flushing=false;updateSyncDot();
      showToast("Sem conexão — sincronizo depois",true);
    });
  })();
}
function metaSubset(){
  return {people:S.people,categories:S.categories,cards:S.cards,incomes:S.incomes,fixed:S.fixed,investTargetPct:S.investTargetPct};
}
var metaTimer=null;
function pushMetaDebounced(){
  clearTimeout(metaTimer);
  metaTimer=setTimeout(function(){pushOp("saveMeta",metaSubset());},900);
}
function updateSyncDot(){
  var el=document.getElementById("syncdot");
  if(!el)return;
  if(!isRemote()){el.className="dot local";el.title="modo local";return;}
  el.className=loadOps().length?"dot pend":"dot";
  el.title=loadOps().length?"sincronizando…":"sincronizado";
}
function initSync(){
  updateSyncDot();
  if(!isRemote())return;
  flushOps().then(function(){return gsCall("getState",null);}).then(function(res){
    if(!res||!res.ok)return;
    sheetUrl=res.sheetUrl||"";
    var m=res.meta||{};
    var serverHasMeta=!!(m.categories&&m.categories.length);
    if(serverHasMeta){
      S.people=m.people||S.people;
      S.categories=m.categories;
      S.cards=m.cards||S.cards;
      S.incomes=m.incomes||S.incomes;
      S.fixed=m.fixed||S.fixed;
      if(typeof m.investTargetPct==="number")S.investTargetPct=m.investTargetPct;
      S.transactions=res.transactions;
      S.debts=res.debts;
    }else{
      // Primeira vez: semeia a nuvem com os dados iniciais deste aparelho
      pushOp("saveMeta",metaSubset());
      S.debts.forEach(function(d){pushOp("upsertDebt",d);});
      S.transactions.forEach(function(t){pushOp("upsertTx",t);});
    }
    S=migrate(S);
    saveCache();
    render();
    updateSyncDot();
  }).catch(function(){ showToast("Não consegui ler a nuvem",true); });
}

/* ═══════════════ Cálculos do mês ═══════════════ */
function txForMonth(mk){return S.transactions.filter(function(t){return (t.date||"").slice(0,7)===mk;});}
function summarize(mk){
  var income=S.incomes.filter(function(i){return i.active;}).reduce(function(a,i){return a+(+i.amount||0);},0);
  var fixedTotal=S.fixed.filter(function(f){return f.active;}).reduce(function(a,f){return a+(+f.amount||0);},0);
  var txs=txForMonth(mk);
  var catById={};S.categories.forEach(function(c){catById[c.id]=c;});
  var spentByCat={},byKind={fixo:0,variavel:0,investimento:0},spentByPerson={},spentByCard={},offCard=0,variableSpent=0;
  txs.forEach(function(t){
    var cat=catById[t.categoryId],kind=cat?cat.kind:"variavel";
    spentByCat[t.categoryId]=(spentByCat[t.categoryId]||0)+t.amount;
    byKind[kind]+=t.amount;
    spentByPerson[t.personId]=(spentByPerson[t.personId]||0)+t.amount;
    if(t.cardId){spentByCard[t.cardId]=(spentByCard[t.cardId]||0)+t.amount;}else{offCard+=t.amount;}
    if(kind==="variavel")variableSpent+=t.amount;
  });
  var byCategory=S.categories.map(function(c){
    var spent=spentByCat[c.id]||0,budget=+c.budget||0;
    return {category:c,spent:spent,budget:budget,pct:budget>0?spent/budget:0};
  }).filter(function(c){return c.spent>0||c.budget>0;}).sort(function(a,b){return b.spent-a.spent;});
  var byPerson=S.people.map(function(p){
    return {personId:p.id,name:p.name,color:p.color,spent:spentByPerson[p.id]||0};
  }).filter(function(p){return p.spent>0;}).sort(function(a,b){return b.spent-a.spent;});
  var byCard=S.cards.filter(function(c){return c.active;}).map(function(c){
    return {cardId:c.id,name:c.name,color:c.color,spent:spentByCard[c.id]||0,dueDay:c.dueDay||0};
  }).sort(function(a,b){return b.spent-a.spent;});
  var investTarget=Math.round(income*S.investTargetPct/100);
  var variableBudget=Math.max(0,income-fixedTotal-investTarget);
  return {
    income:income,fixedTotal:fixedTotal,variableSpent:variableSpent,investTarget:investTarget,
    variableBudget:variableBudget,variableLeft:variableBudget-variableSpent,
    byCategory:byCategory,byKind:byKind,byPerson:byPerson,byCard:byCard,offCard:offCard,txCount:txs.length
  };
}

/* ═══════════════ Navegação / render ═══════════════ */
var TABS=[
  {id:"inicio",label:"Início",icon:"🏠"},
  {id:"extrato",label:"Extrato",icon:"🧾"},
  {id:"metas",label:"Metas",icon:"🎯"},
  {id:"dividas",label:"Dívidas",icon:"💳"},
  {id:"config",label:"Ajustes",icon:"⚙️"}
];
var tab="inicio", mk=monthKeyOf(new Date());
var extState={q:"",person:"all"};

function $(sel,el){return (el||document).querySelector(sel);}
function $all(sel,el){return Array.prototype.slice.call((el||document).querySelectorAll(sel));}

function render(){
  var showMonth=(tab==="inicio"||tab==="extrato"||tab==="metas");
  $("#monthsel").style.display=showMonth?"flex":"none";
  $("#mlabel").textContent=monthLabelShort(mk);
  $("#fab").style.display=tab==="config"?"none":"grid";
  $("#navtabs").innerHTML=TABS.map(function(t){
    return '<button data-tab="'+t.id+'" class="'+(tab===t.id?"active":"")+'"><span class="ni">'+t.icon+'</span>'+t.label+'</button>';
  }).join("");
  $all("#navtabs button").forEach(function(b){b.onclick=function(){tab=b.getAttribute("data-tab");render();};});
  var v=$("#view");
  if(tab==="inicio")renderInicio(v);
  else if(tab==="extrato")renderExtrato(v);
  else if(tab==="metas")renderMetas(v);
  else if(tab==="dividas")renderDividas(v);
  else renderConfig(v);
  updateSyncDot();
}

/* ── Início ── */
function renderInicio(v){
  var s=summarize(mk);
  var debtsAtivas=S.debts.filter(function(d){return !d.archived;});
  var debtRemaining=debtsAtivas.reduce(function(a,d){return a+(+d.remaining||0);},0);
  var debtMonthly=debtsAtivas.reduce(function(a,d){return a+(+d.monthly||0);},0);
  var notSetUp=(s.income===0&&s.fixedTotal===0);
  var usedPct=s.variableBudget>0?Math.min(1,s.variableSpent/s.variableBudget):0;
  var over=s.variableLeft<0;
  var h='';

  h+='<div class="fin-hero"><div class="cap">Sobra pro dia a dia este mês</div>'
    +'<div class="big '+(over?"neg":"pos")+'">'+money(s.variableLeft)+'</div>';
  if(s.variableBudget>0){
    h+='<div class="fin-bar"><span style="width:'+(usedPct*100)+'%;background:'+(over?"var(--danger)":"var(--brand)")+'"></span></div>'
      +'<div class="sub">Gastou '+money(s.variableSpent)+' de '+money(s.variableBudget)+' disponíveis'+(over?" — passou do limite":"")+'</div>';
  }else{
    h+='<div class="sub">Configure sua renda e contas fixas pra ver quanto sobra.<br><button class="fin-btn sm" style="margin-top:8px" data-goto="config">Configurar renda</button></div>';
  }
  h+='</div>';

  h+='<div class="fin-stats">'
    +'<div class="fin-stat"><div class="k">Renda</div><div class="v" style="color:var(--brand)">'+money(s.income)+'</div></div>'
    +'<div class="fin-stat"><div class="k">Contas fixas</div><div class="v">'+money(s.fixedTotal)+'</div></div>'
    +'<div class="fin-stat"><div class="k">Variável gasto</div><div class="v">'+money(s.variableSpent)+'</div></div>'
    +'</div>';

  if(notSetUp){
    h+='<div class="fin-card" style="margin-top:12px"><div class="fin-inline"><div>'
      +'<div style="font-weight:700;font-size:14px">👋 Bora começar?</div>'
      +'<div class="fin-tiny fin-muted" style="margin-top:3px">Cadastre sua renda e contas fixas pra ativar o 50/30/20.</div>'
      +'</div><button class="fin-btn sm primary" data-goto="config">Configurar</button></div></div>';
  }

  var cardsWithSpend=s.byCard.filter(function(c){return c.spent>0;});
  if(cardsWithSpend.length||s.offCard>0){
    h+='<div class="fin-section-title">Faturas em construção (este mês)</div><div class="fin-card">';
    cardsWithSpend.forEach(function(c){
      var pctInc=s.income>0?c.spent/s.income:0, heavy=s.income>0&&pctInc>0.4;
      h+='<div class="fin-row"><div class="fin-ico" style="background:'+c.color+'22">💳</div>'
        +'<div class="grow"><div class="name">'+esc(c.name)+'</div><div class="meta">'
        +(c.dueDay>0?'<span>vence dia '+c.dueDay+'</span>':'')
        +(s.income>0?'<span'+(heavy?' style="color:var(--danger);font-weight:700"':'')+'>'+Math.round(pctInc*100)+'% da renda</span>':'')
        +'</div></div><div class="amt"'+(heavy?' style="color:var(--danger)"':'')+'>'+money(c.spent)+'</div></div>';
    });
    if(s.offCard>0){
      h+='<div class="fin-row"><div class="fin-ico">⚡</div><div class="grow"><div class="name">Pix / Débito</div></div><div class="amt">'+money(s.offCard)+'</div></div>';
    }
    h+='</div>';
  }

  if(debtRemaining>0){
    h+='<div class="fin-card" style="margin-top:12px;border-color:rgba(251,113,133,.3);cursor:pointer" data-goto="dividas">'
      +'<div class="fin-inline"><div><div class="fin-tiny fin-muted">💳 Dívidas em aberto</div>'
      +'<div style="font-size:22px;font-weight:800;color:var(--danger)">'+money(debtRemaining)+'</div>'
      +(debtMonthly>0?'<div class="fin-tiny fin-muted" style="margin-top:2px">~'+money(debtMonthly)+'/mês em parcelas</div>':'')
      +'</div><span class="fin-muted" style="font-size:22px">›</span></div></div>';
  }

  var kinds=["fixo","variavel","investimento"];
  var kindMax=Math.max(1,s.byKind.fixo,s.byKind.variavel,s.byKind.investimento);
  if(s.byKind.fixo>0||s.byKind.variavel>0||s.byKind.investimento>0){
    h+='<div class="fin-section-title">Para onde foi o dinheiro</div><div class="fin-card">';
    kinds.forEach(function(k){
      h+='<div style="margin-bottom:12px"><div class="fin-inline" style="margin-bottom:4px">'
        +'<span class="fin-tiny" style="font-weight:700"><span class="fin-pdot" style="background:'+KIND_COLOR[k]+';margin-right:6px"></span>'+KIND_LABEL[k]+'</span>'
        +'<span class="fin-tiny fin-muted">'+money(s.byKind[k])+'</span></div>'
        +'<div class="fin-bar" style="margin-top:0"><span style="width:'+(s.byKind[k]/kindMax*100)+'%;background:'+KIND_COLOR[k]+'"></span></div></div>';
    });
    h+='</div>';
  }

  if(s.byCategory.length){
    h+='<div class="fin-section-title">Gastos por categoria</div><div class="fin-card">';
    s.byCategory.forEach(function(c){
      h+='<div class="fin-row"><div class="fin-ico">'+c.category.emoji+'</div><div class="grow">'
        +'<div class="name">'+esc(c.category.name)+'</div>'
        +(c.budget>0?'<div class="fin-bar" style="margin-top:6px;height:6px"><span style="width:'+Math.min(100,c.pct*100)+'%;background:'+(c.pct>1?"var(--danger)":"var(--brand)")+'"></span></div>':'')
        +'</div><div style="text-align:right"><div class="amt">'+money(c.spent)+'</div>'
        +(c.budget>0?'<div class="fin-tiny" style="color:'+(c.pct>1?"var(--danger)":"var(--muted)")+'">de '+money(c.budget)+'</div>':'')
        +'</div></div>';
    });
    h+='</div>';
  }

  if(s.byPerson.length){
    var totalP=s.byPerson.reduce(function(a,b){return a+b.spent;},0);
    h+='<div class="fin-section-title">Quem gastou</div><div class="fin-card">';
    s.byPerson.forEach(function(p){
      var pct=totalP>0?p.spent/totalP:0;
      h+='<div style="margin-bottom:10px"><div class="fin-inline" style="margin-bottom:4px">'
        +'<span class="fin-tiny" style="font-weight:700"><span class="fin-pdot" style="background:'+p.color+';margin-right:6px"></span>'+esc(p.name)+'</span>'
        +'<span class="fin-tiny fin-muted">'+money(p.spent)+' · '+Math.round(pct*100)+'%</span></div>'
        +'<div class="fin-bar" style="margin-top:0"><span style="width:'+(pct*100)+'%;background:'+p.color+'"></span></div></div>';
    });
    h+='</div>';
  }

  if(s.txCount===0&&!notSetUp){
    h+='<div class="fin-empty"><span class="ico">🧾</span>Nenhum gasto lançado neste mês ainda.<br>Toque no <strong>+</strong> pra registrar o primeiro.</div>';
  }

  v.innerHTML=h;
  $all("[data-goto]",v).forEach(function(el){el.onclick=function(){tab=el.getAttribute("data-goto");render();};});
}

/* ── Extrato ── */
function renderExtrato(v){
  var catById={},personById={};
  S.categories.forEach(function(c){catById[c.id]=c;});
  S.people.forEach(function(p){personById[p.id]=p;});
  var txs=txForMonth(mk);
  if(extState.person!=="all")txs=txs.filter(function(t){return t.personId===extState.person;});
  if(extState.q.trim()){
    var needle=extState.q.trim().toLowerCase();
    txs=txs.filter(function(t){
      var cat=catById[t.categoryId];
      return (t.note||"").toLowerCase().indexOf(needle)>=0||(cat&&cat.name.toLowerCase().indexOf(needle)>=0);
    });
  }
  txs.sort(function(a,b){return a.date<b.date?1:a.date>b.date?-1:(b.createdAt-a.createdAt);});
  var groups=[],map={};
  txs.forEach(function(t){if(!map[t.date]){map[t.date]=[];groups.push(t.date);}map[t.date].push(t);});
  var total=txs.reduce(function(a,t){return a+t.amount;},0);

  var h='<input class="fin-input" id="ext-q" placeholder="Buscar por nota ou categoria…" value="'+esc(extState.q)+'" style="margin-top:4px">';
  h+='<div class="fin-seg" style="margin-top:10px">'
    +'<button data-p="all" class="'+(extState.person==="all"?"on":"")+'">Todos</button>'
    +S.people.map(function(p){
      return '<button data-p="'+p.id+'" class="'+(extState.person===p.id?"on":"")+'"'+(extState.person===p.id?' style="border-color:'+p.color+'"':'')+'><span class="fin-pdot" style="background:'+p.color+'"></span>'+esc(p.name)+'</button>';
    }).join("")+'</div>';

  if(!groups.length){
    h+='<div class="fin-empty"><span class="ico">🔍</span>Nenhum lançamento por aqui.</div>';
  }else{
    h+='<div class="fin-section-title">Total do filtro: <span style="color:var(--fg)">'+money(total)+'</span></div>';
    groups.forEach(function(date){
      h+='<div class="fin-tiny fin-muted" style="text-transform:capitalize;margin:12px 2px 2px;font-weight:700">'+dayLabel(date)+'</div>'
        +'<div class="fin-card" style="padding:4px 16px">';
      map[date].forEach(function(t){
        var cat=catById[t.categoryId],p=personById[t.personId];
        h+='<div class="fin-row" data-edit="'+t.id+'" style="cursor:pointer">'
          +'<div class="fin-ico">'+(cat?cat.emoji:"📦")+'</div><div class="grow">'
          +'<div class="name">'+esc(cat?cat.name:"—")+'</div><div class="meta">'
          +(p?'<span class="fin-pill"><span class="fin-pdot" style="background:'+p.color+'"></span>'+esc(p.name)+'</span>':'')
          +(t.note?'<span>'+esc(t.note)+'</span>':'')
          +'</div></div><div class="amt">'+money(t.amount)+'</div></div>';
      });
      h+='</div>';
    });
  }
  v.innerHTML=h;
  $("#ext-q",v).oninput=function(){extState.q=this.value;renderExtrato(v);
    var q=$("#ext-q",v);q.focus();q.setSelectionRange(q.value.length,q.value.length);};
  $all("[data-p]",v).forEach(function(b){b.onclick=function(){extState.person=b.getAttribute("data-p");renderExtrato(v);};});
  $all("[data-edit]",v).forEach(function(r){r.onclick=function(){openExpenseSheet(r.getAttribute("data-edit"));};});
}

/* ── Metas ── */
function renderMetas(v){
  var s=summarize(mk);
  var varCats=S.categories.filter(function(c){return c.kind==="variavel";});
  var spentByCat={};s.byCategory.forEach(function(c){spentByCat[c.category.id]=c.spent;});
  var totalBudget=varCats.reduce(function(a,c){return a+(+c.budget||0);},0);

  var h='<div class="fin-hero"><div class="cap">Método 50 / 30 / 20</div>'
    +'<div class="fin-tiny fin-muted" style="margin-top:6px;line-height:1.5">Ideia-guia: até <strong>50%</strong> da renda em contas fixas, <strong>30%</strong> no variável do dia a dia e <strong>20%</strong> pra guardar/quitar dívida. Não precisa ser exato — é uma bússola.</div>'
    +'<div class="fin-stats" style="margin-top:12px">'
    +'<div class="fin-stat"><div class="k">Fixo (meta 50%)</div><div class="v">'+money(s.income*0.5)+'</div></div>'
    +'<div class="fin-stat"><div class="k">Variável (30%)</div><div class="v">'+money(s.income*0.3)+'</div></div>'
    +'<div class="fin-stat"><div class="k">Guardar (20%)</div><div class="v">'+money(s.income*0.2)+'</div></div>'
    +'</div></div>';

  h+='<div class="fin-section-title">Meta de guardar/quitar por mês</div><div class="fin-card">'
    +'<div style="font-weight:700;font-size:14px"><span id="pct-label">'+S.investTargetPct+'</span>% da renda</div>'
    +'<div class="fin-tiny fin-muted" id="pct-val">= '+money(s.income*S.investTargetPct/100)+' por mês</div>'
    +'<input type="range" min="0" max="40" step="5" value="'+S.investTargetPct+'" id="pct-range" style="margin-top:12px">'
    +'</div>';

  h+='<div class="fin-section-title">Orçamento por categoria'
    +(totalBudget>0?'<span style="color:var(--fg);float:right">'+money(totalBudget)+'/mês</span>':'')+'</div><div class="fin-card">';
  varCats.forEach(function(c){
    var spent=spentByCat[c.id]||0,pct=c.budget>0?spent/c.budget:0;
    h+='<div class="fin-row"><div class="fin-ico">'+c.emoji+'</div><div class="grow">'
      +'<div class="name">'+esc(c.name)+'</div>';
    if(c.budget>0){
      h+='<div class="fin-bar" style="margin-top:6px;height:6px"><span style="width:'+Math.min(100,pct*100)+'%;background:'+(pct>1?"var(--danger)":pct>0.85?"var(--warn)":"var(--brand)")+'"></span></div>'
        +'<div class="fin-tiny" style="margin-top:3px;color:'+(pct>1?"var(--danger)":"var(--muted)")+'">'+money(spent)+' de '+money(c.budget)
        +(pct>1?" · estourou":(pct>0.85?" · quase lá":""))+'</div>';
    }
    h+='</div><div style="width:96px;flex:none"><input class="fin-input" inputmode="decimal" placeholder="0" data-budget="'+c.id+'" value="'+(c.budget||"")+'" style="padding:8px 10px;font-size:14px;text-align:right"></div></div>';
  });
  h+='</div><div class="fin-tiny fin-muted" style="margin:10px 4px">Dica: comece definindo meta só pra 2 ou 3 categorias que mais pesam (mercado, restaurante, combustível). O resto você ajusta com o tempo.</div>';

  v.innerHTML=h;
  var range=$("#pct-range",v);
  range.oninput=function(){
    $("#pct-label",v).textContent=this.value;
    $("#pct-val",v).textContent="= "+money(s.income*this.value/100)+" por mês";
  };
  range.onchange=function(){
    S.investTargetPct=+this.value;saveCache();pushMetaDebounced();render();
  };
  $all("[data-budget]",v).forEach(function(inp){
    inp.onblur=function(){
      var cat=S.categories.find(function(c){return c.id===inp.getAttribute("data-budget");});
      if(cat){cat.budget=parseAmount(inp.value);saveCache();pushMetaDebounced();render();}
    };
  });
}

/* ── Dívidas ── */
function renderDividas(v){
  var active=S.debts.filter(function(d){return !d.archived;});
  var paidOff=S.debts.filter(function(d){return d.archived;});
  var totalRemaining=active.reduce(function(a,d){return a+(+d.remaining||0);},0);
  var totalMonthly=active.reduce(function(a,d){return a+(+d.monthly||0);},0);
  var attack=active.slice().sort(function(a,b){
    if(a.interestPct!==b.interestPct)return b.interestPct-a.interestPct;
    return a.remaining-b.remaining;
  });

  var h='<div class="fin-hero" style="'+(active.length?'border-color:rgba(251,113,133,.35)':'')+'">'
    +'<div class="cap">Total de dívidas em aberto</div>'
    +'<div class="big" style="color:'+(active.length?"var(--danger)":"var(--brand)")+'">'+money(totalRemaining)+'</div>'
    +'<div class="sub">'+(active.length===0
      ?"Nenhuma dívida cadastrada. Se existir, cadastre — enxergar é o primeiro passo."
      :active.length+" dívida"+(active.length>1?"s":"")+" · ~"+money(totalMonthly)+"/mês em parcelas")+'</div></div>';

  h+='<button class="fin-btn primary block" style="margin-top:12px" id="add-debt">+ Cadastrar dívida</button>';

  if(attack.length){
    h+='<div class="fin-section-title">Ordem de ataque sugerida</div><div class="fin-card">';
    attack.forEach(function(d,i){
      var pctPaid=d.total>0?1-d.remaining/d.total:0;
      h+='<div class="fin-row" data-debt="'+d.id+'" style="cursor:pointer">'
        +'<div class="fin-ico"'+(i===0?' style="background:rgba(251,113,133,.14);border:1px solid rgba(251,113,133,.4)"':'')+'>'+(i===0?"🎯":DEBT_KIND_EMOJI[d.kind]||"📌")+'</div>'
        +'<div class="grow"><div class="name">'+(i+1)+'. '+esc(d.name)+'</div><div class="meta">'
        +(d.interestPct>0?'<span style="color:var(--warn)">'+d.interestPct+'% a.m.</span>':'<span>juros não informados</span>')
        +(d.monthly>0?'<span>'+money(d.monthly)+'/mês</span>':'')
        +(d.dueDay>0?'<span>dia '+d.dueDay+'</span>':'')+'</div>'
        +(pctPaid>0?'<div class="fin-bar" style="margin-top:6px;height:5px"><span style="width:'+(pctPaid*100)+'%;background:var(--ok)"></span></div>':'')
        +'</div><div class="amt" style="color:var(--danger)">'+money(d.remaining)+'</div></div>';
    });
    h+='</div><div class="fin-tiny fin-muted" style="margin:10px 4px;line-height:1.5">🎯 A regra: pague o mínimo de todas e jogue <strong>todo real extra</strong> na primeira da lista (a de maior juro). Quitou? Desce pra próxima. Cartão rolando é sempre prioridade — o rotativo é o juro mais caro do Brasil.</div>';
  }

  if(paidOff.length){
    h+='<div class="fin-section-title">Quitadas 🎉</div><div class="fin-card">';
    paidOff.forEach(function(d){
      h+='<div class="fin-row"><div class="fin-ico">✅</div><div class="grow">'
        +'<div class="name" style="text-decoration:line-through;color:var(--muted)">'+esc(d.name)+'</div></div>'
        +'<div class="amt fin-muted">'+money(d.total)+'</div></div>';
    });
    h+='</div>';
  }

  v.innerHTML=h;
  $("#add-debt",v).onclick=function(){openDebtSheet(null);};
  $all("[data-debt]",v).forEach(function(r){r.onclick=function(){openDebtSheet(r.getAttribute("data-debt"));};});
}

/* ── Ajustes ── */
function renderConfig(v){
  var totalIncome=S.incomes.filter(function(i){return i.active;}).reduce(function(a,i){return a+(+i.amount||0);},0);
  var totalFixed=S.fixed.filter(function(f){return f.active;}).reduce(function(a,f){return a+(+f.amount||0);},0);

  var h='<div class="fin-section-title">Renda mensal<span style="float:right;color:var(--brand)">'+money(totalIncome)+'</span></div><div class="fin-card" id="card-incomes">';
  S.incomes.forEach(function(inc,i){
    h+='<div class="fin-row">'
      +'<div class="grow"><input class="fin-input" data-inc-name="'+i+'" value="'+esc(inc.name)+'" style="padding:8px 10px;font-size:13.5px"></div>'
      +'<div style="width:110px;flex:none"><input class="fin-input" inputmode="decimal" placeholder="R$ 0" data-inc-amt="'+i+'" value="'+(inc.amount||"")+'" style="padding:8px 10px;font-size:13.5px;text-align:right"></div>'
      +'<button class="fin-toggle '+(inc.active?"on":"")+'" data-inc-tog="'+i+'" aria-label="Ativa"></button></div>';
  });
  h+='<button class="fin-btn sm block ghost" style="margin-top:10px" id="add-income">+ Adicionar renda</button></div>';

  h+='<div class="fin-section-title">Contas fixas<span style="float:right">'+money(totalFixed)+'</span></div><div class="fin-card">';
  if(!S.fixed.length){
    h+='<div class="fin-tiny fin-muted" style="padding:4px 0 10px;line-height:1.5">Aluguel, energia, água, internet, plano de saúde, streaming, academia… Cadastre uma vez e o app desconta todo mês automaticamente do que sobra.</div>';
  }
  S.fixed.forEach(function(f,i){
    h+='<div class="fin-row">'
      +'<div class="grow"><input class="fin-input" data-fix-name="'+i+'" value="'+esc(f.name)+'" style="padding:8px 10px;font-size:13.5px"></div>'
      +'<div style="width:110px;flex:none"><input class="fin-input" inputmode="decimal" placeholder="R$ 0" data-fix-amt="'+i+'" value="'+(f.amount||"")+'" style="padding:8px 10px;font-size:13.5px;text-align:right"></div>'
      +'<button class="fin-toggle '+(f.active?"on":"")+'" data-fix-tog="'+i+'" aria-label="Ativa"></button></div>';
  });
  h+='<button class="fin-btn sm block ghost" style="margin-top:10px" id="add-fixed">+ Adicionar conta fixa</button></div>';

  h+='<div class="fin-section-title">Cartões (pra acompanhar a fatura)</div><div class="fin-card">';
  S.cards.forEach(function(c,i){
    h+='<div class="fin-row"><span class="fin-pdot" style="background:'+c.color+';width:10px;height:10px"></span>'
      +'<div class="grow"><input class="fin-input" data-card-name="'+i+'" value="'+esc(c.name)+'" style="padding:8px 10px;font-size:13.5px"></div>'
      +'<div style="width:86px;flex:none"><input class="fin-input" inputmode="numeric" placeholder="vence dia" data-card-due="'+i+'" value="'+(c.dueDay||"")+'" style="padding:8px;font-size:12.5px;text-align:center"></div>'
      +'<button class="fin-toggle '+(c.active?"on":"")+'" data-card-tog="'+i+'" aria-label="Ativo"></button></div>';
  });
  h+='<button class="fin-btn sm block ghost" style="margin-top:10px" id="add-card">+ Adicionar cartão</button>'
    +'<div class="fin-tiny fin-muted" style="margin-top:8px">O campo numérico é o dia de vencimento da fatura.</div></div>';

  h+='<div class="fin-section-title">Seus dados</div><div class="fin-card">';
  if(isRemote()){
    h+='<div class="fin-tiny fin-muted" style="line-height:1.5;margin-bottom:12px">Tudo é salvo automaticamente na planilha <strong>"'+esc("Nossas Finanças — Dados")+'"</strong> no Google Drive'
      +(sheetUrl?' — <a href="'+esc(sheetUrl)+'" target="_blank" rel="noopener">abrir planilha</a>':'')+'.</div>'
      +'<button class="fin-btn sm block" id="force-sync">🔄 Sincronizar agora</button>';
  }else{
    h+='<div class="fin-tiny fin-muted" style="line-height:1.5;margin-bottom:12px">⚠️ Modo local (teste): salvando só neste navegador. Publicado no Google Apps Script, salva na planilha do Drive.</div>';
  }
  h+='<div class="fin-split" style="margin-top:10px">'
    +'<button class="fin-btn sm" id="exp-backup">⬇️ Exportar backup</button>'
    +'<button class="fin-btn sm" id="imp-backup">⬆️ Restaurar backup</button></div>'
    +'<input type="file" id="imp-file" accept="application/json" style="display:none">'
    +'</div>';

  v.innerHTML=h;

  function bindList(attr,list,field,isAmt){
    $all("["+attr+"]",v).forEach(function(inp){
      var i=+inp.getAttribute(attr);
      if(isAmt){
        inp.onblur=function(){list[i][field]=parseAmount(inp.value);saveCache();pushMetaDebounced();renderConfig(v);};
      }else{
        inp.oninput=function(){list[i][field]=inp.value;saveCache();pushMetaDebounced();};
      }
    });
  }
  bindList("data-inc-name",S.incomes,"name",false);
  bindList("data-inc-amt",S.incomes,"amount",true);
  bindList("data-fix-name",S.fixed,"name",false);
  bindList("data-fix-amt",S.fixed,"amount",true);
  bindList("data-card-name",S.cards,"name",false);
  $all("[data-card-due]",v).forEach(function(inp){
    var i=+inp.getAttribute("data-card-due");
    inp.onblur=function(){S.cards[i].dueDay=Math.min(31,parseInt(inp.value,10)||0);saveCache();pushMetaDebounced();};
  });
  $all("[data-inc-tog]",v).forEach(function(b){b.onclick=function(){var i=+b.getAttribute("data-inc-tog");S.incomes[i].active=!S.incomes[i].active;saveCache();pushMetaDebounced();renderConfig(v);};});
  $all("[data-fix-tog]",v).forEach(function(b){b.onclick=function(){var i=+b.getAttribute("data-fix-tog");S.fixed[i].active=!S.fixed[i].active;saveCache();pushMetaDebounced();renderConfig(v);};});
  $all("[data-card-tog]",v).forEach(function(b){b.onclick=function(){var i=+b.getAttribute("data-card-tog");S.cards[i].active=!S.cards[i].active;saveCache();pushMetaDebounced();renderConfig(v);};});
  $("#add-income",v).onclick=function(){S.incomes.push({id:uid("inc"),name:"Nova renda",amount:0,active:true});saveCache();pushMetaDebounced();renderConfig(v);};
  $("#add-fixed",v).onclick=function(){S.fixed.push({id:uid("fix"),name:"Nova conta",amount:0,active:true});saveCache();pushMetaDebounced();renderConfig(v);};
  $("#add-card",v).onclick=function(){S.cards.push({id:uid("card"),name:"Novo cartão",color:"#a78bfa",dueDay:0,active:true});saveCache();pushMetaDebounced();renderConfig(v);};
  var fs=$("#force-sync",v);
  if(fs)fs.onclick=function(){showToast("Sincronizando…");initSync();};
  $("#exp-backup",v).onclick=function(){
    var blob=new Blob([JSON.stringify(S,null,2)],{type:"application/json"});
    var a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download="financas-backup-"+todayISO()+".json";
    a.click();URL.revokeObjectURL(a.href);
    showToast("Backup exportado");
  };
  $("#imp-backup",v).onclick=function(){$("#imp-file",v).click();};
  $("#imp-file",v).onchange=function(){
    var f=this.files[0];if(!f)return;
    var r=new FileReader();
    r.onload=function(){
      try{
        S=migrate(JSON.parse(String(r.result)));
        saveCache();
        pushOp("saveMeta",metaSubset());
        S.transactions.forEach(function(t){pushOp("upsertTx",t);});
        S.debts.forEach(function(d){pushOp("upsertDebt",d);});
        render();showToast("Backup restaurado ✓");
      }catch(e){showToast("Arquivo inválido",true);}
    };
    r.readAsText(f);
  };
}

/* ═══════════════ Sheet: novo gasto / editar ═══════════════ */
var expState=null;
function openExpenseSheet(editId){
  var editing=editId?S.transactions.find(function(t){return t.id===editId;}):null;
  var kindTab="variavel";
  if(editing){
    var cat=S.categories.find(function(c){return c.id===editing.categoryId;});
    if(cat)kindTab=cat.kind;
  }
  expState={
    editing:editing||null,
    cents:editing?Math.round(editing.amount*100):0,
    categoryId:editing?editing.categoryId:"",
    personId:editing?editing.personId:(S.people[S.people.length-1]||{}).id||"",
    cardId:editing?(editing.cardId||null):null,
    note:editing?editing.note:"",
    date:editing?editing.date:todayISO(),
    kindTab:kindTab
  };
  renderExpenseSheet();
}
function renderExpenseSheet(){
  var st=expState;if(!st)return;
  var cats=S.categories.filter(function(c){return c.kind===st.kindTab;});
  var amount=st.cents/100;
  var canSave=amount>0&&st.categoryId&&st.personId;
  var activeCards=S.cards.filter(function(c){return c.active;});
  var h='<div class="fin-overlay" id="ovl"><div class="fin-sheet" id="sheet"><div class="fin-grab"></div>'
    +'<h2 class="fin-sheet-title">'+(st.editing?"Editar lançamento":"Novo gasto")+'</h2>'
    +'<div class="fin-amount-display"><span class="cur">R$</span>'+money(amount).replace("R$","").trim()+'</div>'
    +'<div class="fin-seg" style="margin-top:4px">'
    +["variavel","fixo","investimento"].map(function(k){
      return '<button data-kind="'+k+'" class="'+(st.kindTab===k?"on":"")+'"'+(st.kindTab===k?' style="border-color:var(--brand)"':'')+'>'+KIND_LABEL[k]+'</button>';
    }).join("")+'</div>'
    +'<div class="fin-catgrid" style="margin-top:12px">'
    +cats.map(function(c){
      return '<button class="fin-cat '+(st.categoryId===c.id?"sel":"")+'" data-cat="'+c.id+'"><span class="e">'+c.emoji+'</span><span class="l">'+esc(c.name)+'</span></button>';
    }).join("")+'</div>'
    +'<div class="fin-label" style="margin-top:16px">Quem gastou</div><div class="fin-seg">'
    +S.people.map(function(p){
      return '<button data-person="'+p.id+'" class="'+(st.personId===p.id?"on":"")+'"'+(st.personId===p.id?' style="border-color:'+p.color+'"':'')+'><span class="fin-pdot" style="background:'+p.color+'"></span>'+esc(p.name)+'</button>';
    }).join("")+'</div>';
  if(activeCards.length){
    h+='<div class="fin-label" style="margin-top:16px">Como pagou</div><div class="fin-seg">'
      +'<button data-card="" class="'+(st.cardId===null?"on":"")+'"'+(st.cardId===null?' style="border-color:var(--accent)"':'')+'>Pix / Débito</button>'
      +activeCards.map(function(c){
        return '<button data-card="'+c.id+'" class="'+(st.cardId===c.id?"on":"")+'"'+(st.cardId===c.id?' style="border-color:'+c.color+'"':'')+'><span class="fin-pdot" style="background:'+c.color+'"></span>'+esc(c.name)+'</button>';
      }).join("")+'</div>';
  }
  h+='<div class="fin-split" style="margin-top:12px">'
    +'<input class="fin-input" id="exp-note" placeholder="Nota (opcional)" value="'+esc(st.note)+'" style="flex:2">'
    +'<input class="fin-input" id="exp-date" type="date" value="'+esc(st.date)+'" style="flex:1"></div>'
    +'<div class="fin-keys">'
    +["1","2","3","4","5","6","7","8","9"].map(function(d){return '<button data-key="'+d+'">'+d+'</button>';}).join("")
    +'<button data-key="0">0</button><button data-key="00">00</button><button data-key="back">⌫</button></div>'
    +'<button class="fin-btn primary block" id="exp-save" style="margin-top:14px"'+(canSave?"":" disabled")+'>'+(st.editing?"Salvar alterações":"Registrar gasto")+'</button>';
  if(st.editing){
    h+='<button class="fin-btn danger block" id="exp-del" style="margin-top:8px">Apagar lançamento</button>';
  }
  h+='</div></div>';

  var holder=$("#sheet-holder");
  holder.innerHTML=h;
  var ovl=$("#ovl");
  ovl.onclick=function(e){if(e.target===ovl)closeSheet();};
  $all("[data-kind]",ovl).forEach(function(b){b.onclick=function(){st.kindTab=b.getAttribute("data-kind");st.categoryId="";renderExpenseSheet();};});
  $all("[data-cat]",ovl).forEach(function(b){b.onclick=function(){st.categoryId=b.getAttribute("data-cat");renderExpenseSheet();};});
  $all("[data-person]",ovl).forEach(function(b){b.onclick=function(){st.personId=b.getAttribute("data-person");renderExpenseSheet();};});
  $all("[data-card]",ovl).forEach(function(b){b.onclick=function(){var cid=b.getAttribute("data-card");st.cardId=cid===""?null:cid;renderExpenseSheet();};});
  $all("[data-key]",ovl).forEach(function(b){b.onclick=function(){
    var k=b.getAttribute("data-key");
    if(k==="back")st.cents=Math.floor(st.cents/10);
    else if(k==="00")st.cents=st.cents*100;
    else{var next=st.cents*10+(+k);if(next<=99999999)st.cents=next;}
    if(st.cents>99999999)st.cents=Math.floor(st.cents/100);
    renderExpenseSheet();
  };});
  $("#exp-note",ovl).oninput=function(){st.note=this.value;};
  $("#exp-date",ovl).onchange=function(){st.date=this.value;};
  $("#exp-save",ovl).onclick=function(){
    if(!(st.cents>0&&st.categoryId&&st.personId))return;
    var t;
    if(st.editing){
      t=st.editing;
      t.amount=st.cents/100;t.categoryId=st.categoryId;t.personId=st.personId;
      t.cardId=st.cardId;t.note=st.note.trim();t.date=st.date;
      showToast("Lançamento atualizado");
    }else{
      t={id:uid("tx"),amount:st.cents/100,categoryId:st.categoryId,personId:st.personId,
         cardId:st.cardId,note:st.note.trim(),date:st.date,createdAt:Date.now()};
      S.transactions.unshift(t);
      showToast("Gasto registrado ✓");
    }
    saveCache();pushOp("upsertTx",t);
    closeSheet();render();
  };
  var del=$("#exp-del",ovl);
  if(del)del.onclick=function(){
    S.transactions=S.transactions.filter(function(x){return x.id!==st.editing.id;});
    saveCache();pushOp("deleteTx",st.editing.id);
    showToast("Lançamento apagado");
    closeSheet();render();
  };
}

/* ═══════════════ Sheet: dívida ═══════════════ */
var debtState=null;
function openDebtSheet(id){
  var editing=id?S.debts.find(function(d){return d.id===id;}):null;
  debtState={
    editing:editing||null,
    name:editing?editing.name:"",
    kind:editing?editing.kind:"cartao",
    remaining:editing?String(editing.remaining):"",
    monthly:editing&&editing.monthly?String(editing.monthly):"",
    interestPct:editing&&editing.interestPct?String(editing.interestPct):"",
    dueDay:editing&&editing.dueDay?String(editing.dueDay):"",
    note:editing?editing.note:""
  };
  renderDebtSheet();
}
function renderDebtSheet(){
  var st=debtState;if(!st)return;
  var kinds=["cartao","emprestimo","parcelamento","pessoa","outro"];
  var canSave=st.name.trim()&&parseAmount(st.remaining)>0;
  var h='<div class="fin-overlay" id="ovl"><div class="fin-sheet"><div class="fin-grab"></div>'
    +'<h2 class="fin-sheet-title">'+(st.editing?"Editar dívida":"Nova dívida")+'</h2>'
    +'<div class="fin-field"><label class="fin-label">O que é</label>'
    +'<div class="fin-catgrid" style="grid-template-columns:repeat(5,1fr)">'
    +kinds.map(function(k){
      return '<button class="fin-cat '+(st.kind===k?"sel":"")+'" data-dkind="'+k+'"><span class="e">'+DEBT_KIND_EMOJI[k]+'</span><span class="l">'+DEBT_KIND_LABEL[k]+'</span></button>';
    }).join("")+'</div></div>'
    +'<div class="fin-field"><label class="fin-label">Nome</label>'
    +'<input class="fin-input" id="d-name" placeholder="'+(st.kind==="cartao"?"Ex.: rotativo Santander":"Ex.: empréstimo banco X")+'" value="'+esc(st.name)+'"></div>'
    +'<div class="fin-split fin-field"><div><label class="fin-label">Quanto falta (R$)</label>'
    +'<input class="fin-input" inputmode="decimal" id="d-rem" placeholder="0,00" value="'+esc(st.remaining)+'"></div>'
    +'<div><label class="fin-label">Parcela mensal (R$)</label>'
    +'<input class="fin-input" inputmode="decimal" id="d-mon" placeholder="0,00" value="'+esc(st.monthly)+'"></div></div>'
    +'<div class="fin-split fin-field"><div><label class="fin-label">Juros % ao mês</label>'
    +'<input class="fin-input" inputmode="decimal" id="d-int" placeholder="ex.: 12" value="'+esc(st.interestPct)+'"></div>'
    +'<div><label class="fin-label">Dia do vencimento</label>'
    +'<input class="fin-input" inputmode="numeric" id="d-due" placeholder="ex.: 10" value="'+esc(st.dueDay)+'"></div></div>'
    +'<div class="fin-field"><label class="fin-label">Observação</label>'
    +'<input class="fin-input" id="d-note" placeholder="opcional" value="'+esc(st.note)+'"></div>'
    +'<button class="fin-btn primary block" id="d-save" style="margin-top:14px"'+(canSave?"":" disabled")+'>Salvar</button>';
  if(st.editing){
    h+='<button class="fin-btn block" id="d-payoff" style="margin-top:8px;border-color:var(--ok);color:var(--ok)">🎉 Marcar como quitada</button>'
      +'<button class="fin-btn danger block" id="d-del" style="margin-top:8px">Apagar dívida</button>';
  }
  h+='</div></div>';

  $("#sheet-holder").innerHTML=h;
  var ovl=$("#ovl");
  ovl.onclick=function(e){if(e.target===ovl)closeSheet();};
  $all("[data-dkind]",ovl).forEach(function(b){b.onclick=function(){st.kind=b.getAttribute("data-dkind");syncInputs();renderDebtSheet();};});
  function syncInputs(){
    st.name=$("#d-name",ovl).value;st.remaining=$("#d-rem",ovl).value;st.monthly=$("#d-mon",ovl).value;
    st.interestPct=$("#d-int",ovl).value;st.dueDay=$("#d-due",ovl).value;st.note=$("#d-note",ovl).value;
  }
  ["d-name","d-rem"].forEach(function(idn){
    $("#"+idn,ovl).oninput=function(){
      syncInputs();
      $("#d-save",ovl).disabled=!(st.name.trim()&&parseAmount(st.remaining)>0);
    };
  });
  $("#d-save",ovl).onclick=function(){
    syncInputs();
    if(!(st.name.trim()&&parseAmount(st.remaining)>0))return;
    var rem=parseAmount(st.remaining);
    var d;
    if(st.editing){
      d=st.editing;
      d.name=st.name.trim();d.kind=st.kind;
      d.total=(d.total&&d.total>rem)?d.total:rem;
      d.remaining=rem;d.monthly=parseAmount(st.monthly);
      d.interestPct=parseFloat(String(st.interestPct).replace(",","."))||0;
      d.dueDay=parseInt(st.dueDay,10)||0;d.note=st.note.trim();
    }else{
      d={id:uid("debt"),name:st.name.trim(),kind:st.kind,total:rem,remaining:rem,
         monthly:parseAmount(st.monthly),interestPct:parseFloat(String(st.interestPct).replace(",","."))||0,
         dueDay:parseInt(st.dueDay,10)||0,note:st.note.trim(),archived:false};
      S.debts.push(d);
    }
    saveCache();pushOp("upsertDebt",d);
    closeSheet();render();showToast("Dívida salva");
  };
  var payoff=$("#d-payoff",ovl);
  if(payoff)payoff.onclick=function(){
    var d=st.editing;d.archived=true;d.remaining=0;
    saveCache();pushOp("upsertDebt",d);
    closeSheet();render();showToast("Quitada! 🎉");
  };
  var del=$("#d-del",ovl);
  if(del)del.onclick=function(){
    S.debts=S.debts.filter(function(x){return x.id!==st.editing.id;});
    saveCache();pushOp("deleteDebt",st.editing.id);
    closeSheet();render();showToast("Dívida apagada");
  };
}

function closeSheet(){$("#sheet-holder").innerHTML="";expState=null;debtState=null;}

/* ═══════════════ Toast ═══════════════ */
var toastTimer=null;
function showToast(msg,isErr){
  var holder=$("#toast-holder");
  holder.innerHTML='<div class="fin-toast'+(isErr?" err":"")+'">'+esc(msg)+'</div>';
  clearTimeout(toastTimer);
  toastTimer=setTimeout(function(){holder.innerHTML="";},2200);
}

/* ═══════════════ Boot ═══════════════ */
$("#mprev").onclick=function(){mk=shiftMonth(mk,-1);render();};
$("#mnext").onclick=function(){mk=shiftMonth(mk,1);render();};
$("#fab").onclick=function(){openExpenseSheet(null);};
document.addEventListener("keydown",function(e){if(e.key==="Escape")closeSheet();});
render();
initSync();
</script>
</body>
</html>
`;
