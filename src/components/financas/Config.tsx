"use client";

import { useRef, useState } from "react";
import { useFinance } from "@/lib/financas/store";
import { money, parseAmount } from "@/lib/financas/format";
import { FixedExpense, IncomeSource, uid } from "@/lib/financas/model";

export function Config({ onToast }: { onToast: (msg: string) => void }) {
  const { state, setIncomes, setFixed, setCards, replaceAll, resetAll } = useFinance();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const totalIncome = state.incomes.filter((i) => i.active).reduce((a, i) => a + i.amount, 0);
  const totalFixed = state.fixed.filter((f) => f.active).reduce((a, f) => a + f.amount, 0);
  const fixedCats = state.categories.filter((c) => c.kind === "fixo");

  function patchIncome(id: string, patch: Partial<IncomeSource>) {
    setIncomes(state.incomes.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }
  function patchFixed(id: string, patch: Partial<FixedExpense>) {
    setFixed(state.fixed.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  function exportBackup() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financas-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onToast("Backup exportado");
  }

  function importBackup(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        replaceAll(JSON.parse(String(reader.result)));
        onToast("Backup restaurado ✓");
      } catch {
        onToast("Arquivo inválido");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div>
      {/* Renda */}
      <div className="fin-section-title">
        Renda mensal
        <span style={{ float: "right", color: "var(--brand)" }}>{money(totalIncome)}</span>
      </div>
      <div className="fin-card">
        {state.incomes.map((inc) => (
          <div className="fin-row" key={inc.id}>
            <div className="grow">
              <input
                className="fin-input"
                value={inc.name}
                onChange={(e) => patchIncome(inc.id, { name: e.target.value })}
                style={{ padding: "8px 10px", fontSize: 13.5 }}
              />
            </div>
            <div style={{ width: 110, flex: "none" }}>
              <input
                className="fin-input"
                inputMode="decimal"
                placeholder="R$ 0"
                defaultValue={inc.amount || ""}
                onBlur={(e) => patchIncome(inc.id, { amount: parseAmount(e.target.value) })}
                style={{ padding: "8px 10px", fontSize: 13.5, textAlign: "right" }}
              />
            </div>
            <button
              className={`fin-toggle ${inc.active ? "on" : ""}`}
              onClick={() => patchIncome(inc.id, { active: !inc.active })}
              aria-label="Ativa"
            />
          </div>
        ))}
        <button
          className="fin-btn sm block ghost"
          style={{ marginTop: 10 }}
          onClick={() =>
            setIncomes([
              ...state.incomes,
              { id: uid("inc"), name: "Nova renda", amount: 0, personId: null, active: true },
            ])
          }
        >
          + Adicionar renda
        </button>
      </div>

      {/* Contas fixas */}
      <div className="fin-section-title">
        Contas fixas
        <span style={{ float: "right" }}>{money(totalFixed)}</span>
      </div>
      <div className="fin-card">
        {state.fixed.length === 0 && (
          <div className="fin-tiny fin-muted" style={{ padding: "4px 0 10px", lineHeight: 1.5 }}>
            Aluguel, energia, água, internet, plano de saúde, streaming, academia… Cadastre uma
            vez e o app desconta todo mês automaticamente do que sobra.
          </div>
        )}
        {state.fixed.map((f) => (
          <div className="fin-row" key={f.id}>
            <div className="grow">
              <input
                className="fin-input"
                value={f.name}
                onChange={(e) => patchFixed(f.id, { name: e.target.value })}
                style={{ padding: "8px 10px", fontSize: 13.5 }}
              />
            </div>
            <div style={{ width: 110, flex: "none" }}>
              <input
                className="fin-input"
                inputMode="decimal"
                placeholder="R$ 0"
                defaultValue={f.amount || ""}
                onBlur={(e) => patchFixed(f.id, { amount: parseAmount(e.target.value) })}
                style={{ padding: "8px 10px", fontSize: 13.5, textAlign: "right" }}
              />
            </div>
            <button
              className={`fin-toggle ${f.active ? "on" : ""}`}
              onClick={() => patchFixed(f.id, { active: !f.active })}
              aria-label="Ativa"
            />
          </div>
        ))}
        <button
          className="fin-btn sm block ghost"
          style={{ marginTop: 10 }}
          onClick={() =>
            setFixed([
              ...state.fixed,
              {
                id: uid("fix"),
                name: "Nova conta",
                amount: 0,
                categoryId: fixedCats[0]?.id ?? "c_aluguel",
                active: true,
              },
            ])
          }
        >
          + Adicionar conta fixa
        </button>
      </div>

      {/* Cartões */}
      <div className="fin-section-title">Cartões (pra acompanhar a fatura)</div>
      <div className="fin-card">
        {state.cards.map((c) => (
          <div className="fin-row" key={c.id}>
            <span className="fin-pdot" style={{ background: c.color, width: 10, height: 10 }} />
            <div className="grow">
              <input
                className="fin-input"
                value={c.name}
                onChange={(e) =>
                  setCards(state.cards.map((x) => (x.id === c.id ? { ...x, name: e.target.value } : x)))
                }
                style={{ padding: "8px 10px", fontSize: 13.5 }}
              />
            </div>
            <div style={{ width: 86, flex: "none" }}>
              <input
                className="fin-input"
                inputMode="numeric"
                placeholder="vence dia"
                defaultValue={c.dueDay || ""}
                onBlur={(e) =>
                  setCards(
                    state.cards.map((x) =>
                      x.id === c.id
                        ? { ...x, dueDay: Math.min(31, parseInt(e.target.value, 10) || 0) }
                        : x,
                    ),
                  )
                }
                style={{ padding: "8px 8px", fontSize: 12.5, textAlign: "center" }}
              />
            </div>
            <button
              className={`fin-toggle ${c.active ? "on" : ""}`}
              onClick={() =>
                setCards(state.cards.map((x) => (x.id === c.id ? { ...x, active: !x.active } : x)))
              }
              aria-label="Ativo"
            />
          </div>
        ))}
        <button
          className="fin-btn sm block ghost"
          style={{ marginTop: 10 }}
          onClick={() =>
            setCards([
              ...state.cards,
              {
                id: uid("card"),
                name: "Novo cartão",
                color: "#a78bfa",
                closingDay: 0,
                dueDay: 0,
                active: true,
              },
            ])
          }
        >
          + Adicionar cartão
        </button>
        <div className="fin-tiny fin-muted" style={{ marginTop: 8 }}>
          O campo numérico é o dia de vencimento da fatura.
        </div>
      </div>

      {/* Backup */}
      <div className="fin-section-title">Seus dados</div>
      <div className="fin-card">
        <div className="fin-tiny fin-muted" style={{ lineHeight: 1.5, marginBottom: 12 }}>
          Tudo fica salvo <strong>neste aparelho</strong>. Exporte um backup de vez em quando (e
          pra passar os dados pro celular da Nathália, por enquanto).
        </div>
        <div className="fin-split">
          <button className="fin-btn sm" onClick={exportBackup}>
            ⬇️ Exportar backup
          </button>
          <button className="fin-btn sm" onClick={() => fileRef.current?.click()}>
            ⬆️ Restaurar backup
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importBackup(f);
            e.target.value = "";
          }}
        />
        {!confirmReset ? (
          <button
            className="fin-btn sm ghost block"
            style={{ marginTop: 10, color: "var(--muted-2)" }}
            onClick={() => setConfirmReset(true)}
          >
            Zerar todos os dados…
          </button>
        ) : (
          <div className="fin-split" style={{ marginTop: 10 }}>
            <button className="fin-btn sm" onClick={() => setConfirmReset(false)}>
              Cancelar
            </button>
            <button
              className="fin-btn sm danger"
              onClick={() => {
                resetAll();
                setConfirmReset(false);
                onToast("Dados zerados");
              }}
            >
              Confirmar: apagar tudo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
