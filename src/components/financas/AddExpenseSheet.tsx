"use client";

import { useMemo, useState } from "react";
import { Sheet } from "./Sheet";
import { useFinance } from "@/lib/financas/store";
import { money, todayISO } from "@/lib/financas/format";
import { Kind } from "@/lib/financas/model";

const KIND_ORDER: Kind[] = ["variavel", "fixo", "investimento"];
const KIND_LABEL: Record<Kind, string> = {
  variavel: "Variável",
  fixo: "Fixo",
  investimento: "Investimento",
};

export function AddExpenseSheet({
  onClose,
  onSaved,
  editId,
}: {
  onClose: () => void;
  onSaved: (msg: string) => void;
  editId?: string;
}) {
  const { state, addTransaction, updateTransaction, deleteTransaction } = useFinance();
  const editing = editId ? state.transactions.find((t) => t.id === editId) : undefined;

  const [cents, setCents] = useState<number>(editing ? Math.round(editing.amount * 100) : 0);
  const [categoryId, setCategoryId] = useState<string>(editing?.categoryId ?? "");
  const [personId, setPersonId] = useState<string>(
    editing?.personId ?? state.people[state.people.length - 1]?.id ?? "",
  );
  const [cardId, setCardId] = useState<string | null>(editing?.cardId ?? null);
  const [note, setNote] = useState(editing?.note ?? "");
  const [date, setDate] = useState(editing?.date ?? todayISO());
  const [kindTab, setKindTab] = useState<Kind>(
    editing ? state.categories.find((c) => c.id === editing.categoryId)?.kind ?? "variavel" : "variavel",
  );

  const cats = useMemo(
    () => state.categories.filter((c) => c.kind === kindTab),
    [state.categories, kindTab],
  );

  const amount = cents / 100;

  function press(d: string) {
    setCents((c) => {
      const next = c * 10 + parseInt(d, 10);
      return next > 99_999_999 ? c : next; // teto de segurança
    });
  }
  function backspace() {
    setCents((c) => Math.floor(c / 10));
  }

  function save() {
    if (amount <= 0 || !categoryId || !personId) return;
    if (editing) {
      updateTransaction(editing.id, { amount, categoryId, personId, cardId, note: note.trim(), date });
      onSaved("Lançamento atualizado");
    } else {
      addTransaction({ amount, categoryId, personId, cardId, note: note.trim(), date });
      onSaved("Gasto registrado ✓");
    }
    onClose();
  }

  const canSave = amount > 0 && !!categoryId && !!personId;

  return (
    <Sheet title={editing ? "Editar lançamento" : "Novo gasto"} onClose={onClose}>
      {/* Valor */}
      <div className="fin-amount-display">
        <span className="cur">R$</span>
        {money(amount).replace("R$", "").trim()}
      </div>

      {/* Tipo (variável/fixo/investimento) */}
      <div className="fin-seg" style={{ marginTop: 4 }}>
        {KIND_ORDER.map((k) => (
          <button
            key={k}
            className={kindTab === k ? "on" : ""}
            style={kindTab === k ? { borderColor: "var(--brand)" } : undefined}
            onClick={() => setKindTab(k)}
          >
            {KIND_LABEL[k]}
          </button>
        ))}
      </div>

      {/* Categorias */}
      <div className="fin-catgrid" style={{ marginTop: 12 }}>
        {cats.map((c) => (
          <button
            key={c.id}
            className={`fin-cat ${categoryId === c.id ? "sel" : ""}`}
            onClick={() => setCategoryId(c.id)}
            type="button"
          >
            <span className="e">{c.emoji}</span>
            <span className="l">{c.name}</span>
          </button>
        ))}
      </div>

      {/* Quem gastou */}
      <div className="fin-label" style={{ marginTop: 16 }}>
        Quem gastou
      </div>
      <div className="fin-seg">
        {state.people.map((p) => (
          <button
            key={p.id}
            className={personId === p.id ? "on" : ""}
            style={personId === p.id ? { borderColor: p.color } : undefined}
            onClick={() => setPersonId(p.id)}
            type="button"
          >
            <span className="fin-pdot" style={{ background: p.color }} />
            {p.name}
          </button>
        ))}
      </div>

      {/* Como pagou (cartão pontua!) */}
      {state.cards.filter((c) => c.active).length > 0 && (
        <>
          <div className="fin-label" style={{ marginTop: 16 }}>
            Como pagou
          </div>
          <div className="fin-seg">
            <button
              className={cardId === null ? "on" : ""}
              style={cardId === null ? { borderColor: "var(--accent)" } : undefined}
              onClick={() => setCardId(null)}
              type="button"
            >
              Pix / Débito
            </button>
            {state.cards
              .filter((c) => c.active)
              .map((c) => (
                <button
                  key={c.id}
                  className={cardId === c.id ? "on" : ""}
                  style={cardId === c.id ? { borderColor: c.color } : undefined}
                  onClick={() => setCardId(c.id)}
                  type="button"
                >
                  <span className="fin-pdot" style={{ background: c.color }} />
                  {c.name}
                </button>
              ))}
          </div>
        </>
      )}

      {/* Nota + data */}
      <div className="fin-split" style={{ marginTop: 12 }}>
        <input
          className="fin-input"
          placeholder="Nota (opcional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{ flex: 2 }}
        />
        <input
          className="fin-input"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ flex: 1 }}
        />
      </div>

      {/* Teclado numérico */}
      <div className="fin-keys">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button key={d} onClick={() => press(d)} type="button">
            {d}
          </button>
        ))}
        <button onClick={() => press("0")} type="button">
          0
        </button>
        <button onClick={() => setCents((c) => c * 100)} type="button">
          00
        </button>
        <button onClick={backspace} type="button" aria-label="Apagar">
          ⌫
        </button>
      </div>

      <button
        className="fin-btn primary block"
        style={{ marginTop: 14, opacity: canSave ? 1 : 0.5 }}
        disabled={!canSave}
        onClick={save}
        type="button"
      >
        {editing ? "Salvar alterações" : "Registrar gasto"}
      </button>

      {editing && (
        <button
          className="fin-btn danger block"
          style={{ marginTop: 8 }}
          onClick={() => {
            deleteTransaction(editing.id);
            onSaved("Lançamento apagado");
            onClose();
          }}
          type="button"
        >
          Apagar lançamento
        </button>
      )}
    </Sheet>
  );
}
