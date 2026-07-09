"use client";

import { useState } from "react";
import { useFinance } from "@/lib/financas/store";
import { Sheet } from "./Sheet";
import { money, parseAmount } from "@/lib/financas/format";
import { Debt, DEBT_KIND_EMOJI, DEBT_KIND_LABEL, DebtKind, uid } from "@/lib/financas/model";

const KINDS: DebtKind[] = ["cartao", "emprestimo", "parcelamento", "pessoa", "outro"];

function DebtForm({
  initial,
  onSave,
  onDelete,
  onPayOff,
  onClose,
}: {
  initial?: Debt;
  onSave: (d: Debt) => void;
  onDelete?: () => void;
  onPayOff?: () => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [kind, setKind] = useState<DebtKind>(initial?.kind ?? "cartao");
  const [remaining, setRemaining] = useState(initial ? String(initial.remaining) : "");
  const [monthly, setMonthly] = useState(initial?.monthly ? String(initial.monthly) : "");
  const [interestPct, setInterestPct] = useState(
    initial?.interestPct ? String(initial.interestPct) : "",
  );
  const [dueDay, setDueDay] = useState(initial?.dueDay ? String(initial.dueDay) : "");
  const [note, setNote] = useState(initial?.note ?? "");

  const canSave = name.trim() && parseAmount(remaining) > 0;

  return (
    <Sheet title={initial ? "Editar dívida" : "Nova dívida"} onClose={onClose}>
      <div className="fin-field">
        <label className="fin-label">O que é</label>
        <div className="fin-catgrid" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
          {KINDS.map((k) => (
            <button
              key={k}
              type="button"
              className={`fin-cat ${kind === k ? "sel" : ""}`}
              onClick={() => setKind(k)}
            >
              <span className="e">{DEBT_KIND_EMOJI[k]}</span>
              <span className="l">{DEBT_KIND_LABEL[k].split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="fin-field">
        <label className="fin-label">Nome</label>
        <input
          className="fin-input"
          placeholder={kind === "cartao" ? "Ex.: rotativo Santander" : "Ex.: empréstimo banco X"}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="fin-split fin-field">
        <div>
          <label className="fin-label">Quanto falta (R$)</label>
          <input
            className="fin-input"
            inputMode="decimal"
            placeholder="0,00"
            value={remaining}
            onChange={(e) => setRemaining(e.target.value)}
          />
        </div>
        <div>
          <label className="fin-label">Parcela mensal (R$)</label>
          <input
            className="fin-input"
            inputMode="decimal"
            placeholder="0,00"
            value={monthly}
            onChange={(e) => setMonthly(e.target.value)}
          />
        </div>
      </div>

      <div className="fin-split fin-field">
        <div>
          <label className="fin-label">Juros % ao mês</label>
          <input
            className="fin-input"
            inputMode="decimal"
            placeholder="ex.: 12"
            value={interestPct}
            onChange={(e) => setInterestPct(e.target.value)}
          />
        </div>
        <div>
          <label className="fin-label">Dia do vencimento</label>
          <input
            className="fin-input"
            inputMode="numeric"
            placeholder="ex.: 10"
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value.replace(/\D/g, "").slice(0, 2))}
          />
        </div>
      </div>

      <div className="fin-field">
        <label className="fin-label">Observação</label>
        <input
          className="fin-input"
          placeholder="opcional"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <button
        className="fin-btn primary block"
        style={{ marginTop: 14, opacity: canSave ? 1 : 0.5 }}
        disabled={!canSave}
        type="button"
        onClick={() => {
          const rem = parseAmount(remaining);
          onSave({
            id: initial?.id ?? uid("debt"),
            name: name.trim(),
            kind,
            total: initial?.total && initial.total > rem ? initial.total : rem,
            remaining: rem,
            monthly: parseAmount(monthly),
            interestPct: parseFloat(interestPct.replace(",", ".")) || 0,
            dueDay: parseInt(dueDay, 10) || 0,
            note: note.trim(),
            archived: false,
          });
          onClose();
        }}
      >
        Salvar
      </button>

      {initial && onPayOff && (
        <button
          className="fin-btn block"
          style={{ marginTop: 8, borderColor: "var(--ok)", color: "var(--ok)" }}
          type="button"
          onClick={() => {
            onPayOff();
            onClose();
          }}
        >
          🎉 Marcar como quitada
        </button>
      )}

      {initial && onDelete && (
        <button
          className="fin-btn danger block"
          style={{ marginTop: 8 }}
          type="button"
          onClick={() => {
            onDelete();
            onClose();
          }}
        >
          Apagar dívida
        </button>
      )}
    </Sheet>
  );
}

export function Dividas() {
  const { state, setDebts } = useFinance();
  const [editing, setEditing] = useState<Debt | null>(null);
  const [adding, setAdding] = useState(false);

  const active = state.debts.filter((d) => !d.archived);
  const paidOff = state.debts.filter((d) => d.archived);
  const totalRemaining = active.reduce((a, d) => a + d.remaining, 0);
  const totalMonthly = active.reduce((a, d) => a + d.monthly, 0);

  // Ordem de ataque: maior juro primeiro (método avalanche).
  // Sem juro informado, vai pro fim, ordenado pelo menor saldo (bola de neve).
  const attackOrder = [...active].sort((a, b) => {
    if (a.interestPct !== b.interestPct) return b.interestPct - a.interestPct;
    return a.remaining - b.remaining;
  });

  function saveDebt(d: Debt) {
    const exists = state.debts.some((x) => x.id === d.id);
    setDebts(exists ? state.debts.map((x) => (x.id === d.id ? d : x)) : [...state.debts, d]);
  }

  return (
    <div>
      <div
        className="fin-hero"
        style={{ marginTop: 4, borderColor: active.length ? "rgba(251,113,133,0.35)" : undefined }}
      >
        <div className="cap">Total de dívidas em aberto</div>
        <div className="big" style={{ color: active.length ? "var(--danger)" : "var(--brand)" }}>
          {money(totalRemaining)}
        </div>
        <div className="sub">
          {active.length === 0
            ? "Nenhuma dívida cadastrada. Se existir, cadastre — enxergar é o primeiro passo."
            : `${active.length} dívida${active.length > 1 ? "s" : ""} · ~${money(totalMonthly)}/mês em parcelas`}
        </div>
      </div>

      <button className="fin-btn primary block" style={{ marginTop: 12 }} onClick={() => setAdding(true)}>
        + Cadastrar dívida
      </button>

      {attackOrder.length > 0 && (
        <>
          <div className="fin-section-title">Ordem de ataque sugerida</div>
          <div className="fin-card">
            {attackOrder.map((d, i) => {
              const pctPaid = d.total > 0 ? 1 - d.remaining / d.total : 0;
              return (
                <div
                  className="fin-row"
                  key={d.id}
                  onClick={() => setEditing(d)}
                  role="button"
                  style={{ cursor: "pointer" }}
                >
                  <div
                    className="fin-ico"
                    style={
                      i === 0
                        ? { background: "rgba(251,113,133,0.14)", border: "1px solid rgba(251,113,133,0.4)" }
                        : undefined
                    }
                  >
                    {i === 0 ? "🎯" : DEBT_KIND_EMOJI[d.kind]}
                  </div>
                  <div className="grow">
                    <div className="name">
                      {i + 1}. {d.name}
                    </div>
                    <div className="meta">
                      {d.interestPct > 0 ? (
                        <span style={{ color: "var(--warn)" }}>{d.interestPct}% a.m.</span>
                      ) : (
                        <span>juros não informados</span>
                      )}
                      {d.monthly > 0 && <span>{money(d.monthly)}/mês</span>}
                      {d.dueDay > 0 && <span>dia {d.dueDay}</span>}
                    </div>
                    {pctPaid > 0 && (
                      <div className="fin-bar" style={{ marginTop: 6, height: 5 }}>
                        <span style={{ width: `${pctPaid * 100}%`, background: "var(--ok)" }} />
                      </div>
                    )}
                  </div>
                  <div className="amt" style={{ color: "var(--danger)" }}>
                    {money(d.remaining)}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="fin-tiny fin-muted" style={{ margin: "10px 4px", lineHeight: 1.5 }}>
            🎯 A regra: pague o mínimo de todas e jogue <strong>todo real extra</strong> na
            primeira da lista (a de maior juro). Quitou? Desce pra próxima. Cartão rolando é
            sempre prioridade — o rotativo é o juro mais caro do Brasil.
          </div>
        </>
      )}

      {paidOff.length > 0 && (
        <>
          <div className="fin-section-title">Quitadas 🎉</div>
          <div className="fin-card">
            {paidOff.map((d) => (
              <div className="fin-row" key={d.id}>
                <div className="fin-ico">✅</div>
                <div className="grow">
                  <div className="name" style={{ textDecoration: "line-through", color: "var(--muted)" }}>
                    {d.name}
                  </div>
                </div>
                <div className="amt fin-muted">{money(d.total)}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {(adding || editing) && (
        <DebtForm
          initial={editing ?? undefined}
          onClose={() => {
            setAdding(false);
            setEditing(null);
          }}
          onSave={saveDebt}
          onDelete={
            editing
              ? () => setDebts(state.debts.filter((x) => x.id !== editing.id))
              : undefined
          }
          onPayOff={
            editing
              ? () =>
                  setDebts(
                    state.debts.map((x) =>
                      x.id === editing.id ? { ...x, archived: true, remaining: 0 } : x,
                    ),
                  )
              : undefined
          }
        />
      )}
    </div>
  );
}
