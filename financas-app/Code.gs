/**
 * NOSSAS FINANÇAS — servidor (Google Apps Script)
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
  return HtmlService.createHtmlOutputFromFile("Index")
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
