"use client";

import { useMemo } from "react";
import { useFinance } from "@/lib/financas/store";
import { summarize } from "@/lib/financas/selectors";
import { money, parseAmount } from "@/lib/financas/format";

export function Metas({ monthKey }: { monthKey: string }) {
  const { state, updateCategory, setInvestTargetPct } = useFinance();
  const s = useMemo(() => summarize(state, monthKey), [state, monthKey]);

  const variableCats = state.categories.filter((c) => c.kind === "variavel");
  const spentByCat = new Map(s.byCategory.map((c) => [c.category.id, c.spent]));
  const totalBudget = variableCats.reduce((a, c) => a + (c.budget || 0), 0);

  return (
    <div>
      <div className="fin-hero" style={{ marginTop: 4 }}>
        <div className="cap">Método 50 / 30 / 20</div>
        <div className="fin-tiny fin-muted" style={{ marginTop: 6, lineHeight: 1.5 }}>
          Ideia-guia: até <strong>50%</strong> da renda em contas fixas,{" "}
          <strong>30%</strong> no variável do dia a dia e <strong>20%</strong> pra guardar/quitar
          dívida. Não precisa ser exato — é uma bússola.
        </div>
        <div className="fin-stats" style={{ marginTop: 12 }}>
          <div className="fin-stat">
            <div className="k">Fixo (meta 50%)</div>
            <div className="v">{money(s.income * 0.5)}</div>
          </div>
          <div className="fin-stat">
            <div className="k">Variável (30%)</div>
            <div className="v">{money(s.income * 0.3)}</div>
          </div>
          <div className="fin-stat">
            <div className="k">Guardar (20%)</div>
            <div className="v">{money(s.income * 0.2)}</div>
          </div>
        </div>
      </div>

      <div className="fin-section-title">Meta de guardar/quitar por mês</div>
      <div className="fin-card">
        <div className="fin-inline">
          <div className="grow">
            <div style={{ fontWeight: 700, fontSize: 14 }}>
              {state.investTargetPct}% da renda
            </div>
            <div className="fin-tiny fin-muted">
              = {money((s.income * state.investTargetPct) / 100)} por mês
            </div>
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={40}
          step={5}
          value={state.investTargetPct}
          onChange={(e) => setInvestTargetPct(Number(e.target.value))}
          style={{ width: "100%", marginTop: 12, accentColor: "var(--brand)" }}
        />
      </div>

      <div className="fin-section-title">
        Orçamento por categoria
        {totalBudget > 0 && (
          <span style={{ color: "var(--fg)", float: "right" }}>{money(totalBudget)}/mês</span>
        )}
      </div>
      <div className="fin-card">
        {variableCats.map((c) => {
          const spent = spentByCat.get(c.id) || 0;
          const pct = c.budget > 0 ? spent / c.budget : 0;
          return (
            <div className="fin-row" key={c.id}>
              <div className="fin-ico">{c.emoji}</div>
              <div className="grow">
                <div className="name">{c.name}</div>
                {c.budget > 0 && (
                  <>
                    <div className="fin-bar" style={{ marginTop: 6, height: 6 }}>
                      <span
                        style={{
                          width: `${Math.min(100, pct * 100)}%`,
                          background: pct > 1 ? "var(--danger)" : pct > 0.85 ? "var(--warn)" : "var(--brand)",
                        }}
                      />
                    </div>
                    <div
                      className="fin-tiny"
                      style={{ marginTop: 3, color: pct > 1 ? "var(--danger)" : "var(--muted)" }}
                    >
                      {money(spent)} de {money(c.budget)}
                      {pct > 1 && " · estourou"}
                      {pct <= 1 && pct > 0.85 && " · quase lá"}
                    </div>
                  </>
                )}
              </div>
              <div style={{ width: 96, flex: "none" }}>
                <input
                  className="fin-input"
                  inputMode="decimal"
                  placeholder="0"
                  defaultValue={c.budget || ""}
                  onBlur={(e) => updateCategory(c.id, { budget: parseAmount(e.target.value) })}
                  style={{ padding: "8px 10px", fontSize: 14, textAlign: "right" }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="fin-tiny fin-muted" style={{ margin: "10px 4px" }}>
        Dica: comece definindo meta só pra 2 ou 3 categorias que mais pesam (mercado, restaurante,
        combustível). O resto você ajusta com o tempo.
      </div>
    </div>
  );
}
