"use client";

import { useMemo } from "react";
import { useFinance } from "@/lib/financas/store";
import { summarize } from "@/lib/financas/selectors";
import { money } from "@/lib/financas/format";
import { KIND_COLOR, KIND_LABEL, Kind } from "@/lib/financas/model";
import { Tab } from "./types";

export function Dashboard({
  monthKey,
  onGoTo,
}: {
  monthKey: string;
  onGoTo: (tab: Tab) => void;
}) {
  const { state } = useFinance();
  const s = useMemo(() => summarize(state, monthKey), [state, monthKey]);

  const debtRemaining = state.debts
    .filter((d) => !d.archived)
    .reduce((sum, d) => sum + (d.remaining || 0), 0);
  const debtMonthly = state.debts
    .filter((d) => !d.archived)
    .reduce((sum, d) => sum + (d.monthly || 0), 0);

  const notSetUp = s.income === 0 && s.fixedTotal === 0;
  const usedPct = s.variableBudget > 0 ? Math.min(1, s.variableSpent / s.variableBudget) : 0;
  const over = s.variableLeft < 0;

  const kinds: Kind[] = ["fixo", "variavel", "investimento"];
  const kindMax = Math.max(1, ...kinds.map((k) => s.byKind[k]));

  return (
    <div>
      {/* Cartão principal */}
      <div className="fin-hero">
        <div className="cap">Sobra pro dia a dia este mês</div>
        <div className={`big ${over ? "neg" : "pos"}`}>{money(s.variableLeft)}</div>
        {s.variableBudget > 0 ? (
          <>
            <div className="fin-bar">
              <span
                style={{
                  width: `${usedPct * 100}%`,
                  background: over ? "var(--danger)" : "var(--brand)",
                }}
              />
            </div>
            <div className="sub">
              Gastou {money(s.variableSpent)} de {money(s.variableBudget)} disponíveis
              {over && " — passou do limite"}
            </div>
          </>
        ) : (
          <div className="sub">
            Configure sua renda e contas fixas pra ver quanto sobra.{" "}
            <button
              className="fin-btn sm"
              style={{ marginTop: 8 }}
              onClick={() => onGoTo("config")}
            >
              Configurar renda
            </button>
          </div>
        )}
      </div>

      {/* Mini stats */}
      <div className="fin-stats">
        <div className="fin-stat">
          <div className="k">Renda</div>
          <div className="v" style={{ color: "var(--brand)" }}>
            {money(s.income)}
          </div>
        </div>
        <div className="fin-stat">
          <div className="k">Contas fixas</div>
          <div className="v">{money(s.fixedTotal)}</div>
        </div>
        <div className="fin-stat">
          <div className="k">Variável gasto</div>
          <div className="v">{money(s.variableSpent)}</div>
        </div>
      </div>

      {notSetUp && (
        <div className="fin-card" style={{ marginTop: 12 }}>
          <div className="fin-inline">
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>👋 Bora começar?</div>
              <div className="fin-tiny fin-muted" style={{ marginTop: 3 }}>
                Cadastre sua renda e contas fixas pra ativar o 50/30/20.
              </div>
            </div>
            <button className="fin-btn sm primary" onClick={() => onGoTo("config")}>
              Configurar
            </button>
          </div>
        </div>
      )}

      {/* Faturas em construção — o alerta antes da fatura fechar */}
      {s.byCard.some((c) => c.spent > 0) && (
        <>
          <div className="fin-section-title">Faturas em construção (este mês)</div>
          <div className="fin-card">
            {s.byCard
              .filter((c) => c.spent > 0)
              .map((c) => {
                const pctOfIncome = s.income > 0 ? c.spent / s.income : 0;
                const heavy = s.income > 0 && pctOfIncome > 0.4;
                return (
                  <div className="fin-row" key={c.cardId}>
                    <div
                      className="fin-ico"
                      style={{ background: `${c.color}22`, color: c.color }}
                    >
                      💳
                    </div>
                    <div className="grow">
                      <div className="name">{c.name}</div>
                      <div className="meta">
                        {c.dueDay > 0 && <span>vence dia {c.dueDay}</span>}
                        {s.income > 0 && (
                          <span style={heavy ? { color: "var(--danger)", fontWeight: 700 } : undefined}>
                            {Math.round(pctOfIncome * 100)}% da renda
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="amt" style={heavy ? { color: "var(--danger)" } : undefined}>
                      {money(c.spent)}
                    </div>
                  </div>
                );
              })}
            {s.offCard > 0 && (
              <div className="fin-row">
                <div className="fin-ico">⚡</div>
                <div className="grow">
                  <div className="name">Pix / Débito</div>
                </div>
                <div className="amt">{money(s.offCard)}</div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Dívidas — destaque */}
      {debtRemaining > 0 && (
        <div
          className="fin-card"
          style={{ marginTop: 12, borderColor: "rgba(251,113,133,0.3)" }}
          onClick={() => onGoTo("dividas")}
          role="button"
        >
          <div className="fin-inline">
            <div>
              <div className="fin-tiny fin-muted">💳 Dívidas em aberto</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--danger)" }}>
                {money(debtRemaining)}
              </div>
              {debtMonthly > 0 && (
                <div className="fin-tiny fin-muted" style={{ marginTop: 2 }}>
                  ~{money(debtMonthly)}/mês em parcelas
                </div>
              )}
            </div>
            <span className="fin-muted" style={{ fontSize: 22 }}>
              ›
            </span>
          </div>
        </div>
      )}

      {/* 50/30/20 */}
      {(s.byKind.fixo > 0 || s.byKind.variavel > 0 || s.byKind.investimento > 0) && (
        <>
          <div className="fin-section-title">Para onde foi o dinheiro</div>
          <div className="fin-card">
            {kinds.map((k) => (
              <div key={k} style={{ marginBottom: 12 }}>
                <div className="fin-inline" style={{ marginBottom: 4 }}>
                  <span className="fin-tiny" style={{ fontWeight: 700 }}>
                    <span
                      className="fin-pdot"
                      style={{ background: KIND_COLOR[k], display: "inline-block", marginRight: 6 }}
                    />
                    {KIND_LABEL[k]}
                  </span>
                  <span className="fin-tiny fin-muted">{money(s.byKind[k])}</span>
                </div>
                <div className="fin-bar" style={{ marginTop: 0 }}>
                  <span
                    style={{
                      width: `${(s.byKind[k] / kindMax) * 100}%`,
                      background: KIND_COLOR[k],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Gastos por categoria */}
      {s.byCategory.length > 0 && (
        <>
          <div className="fin-section-title">Gastos por categoria</div>
          <div className="fin-card">
            {s.byCategory.map(({ category, spent, budget, pct }) => (
              <div className="fin-row" key={category.id}>
                <div className="fin-ico">{category.emoji}</div>
                <div className="grow">
                  <div className="name">{category.name}</div>
                  {budget > 0 && (
                    <div className="fin-bar" style={{ marginTop: 6, height: 6 }}>
                      <span
                        style={{
                          width: `${Math.min(100, pct * 100)}%`,
                          background: pct > 1 ? "var(--danger)" : "var(--brand)",
                        }}
                      />
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="amt">{money(spent)}</div>
                  {budget > 0 && (
                    <div
                      className="fin-tiny"
                      style={{ color: pct > 1 ? "var(--danger)" : "var(--muted)" }}
                    >
                      de {money(budget)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Quem gastou */}
      {s.byPerson.length > 0 && (
        <>
          <div className="fin-section-title">Quem gastou</div>
          <div className="fin-card">
            {s.byPerson.map((p) => {
              const total = s.byPerson.reduce((a, b) => a + b.spent, 0);
              const pct = total > 0 ? p.spent / total : 0;
              return (
                <div key={p.personId} style={{ marginBottom: 10 }}>
                  <div className="fin-inline" style={{ marginBottom: 4 }}>
                    <span className="fin-tiny" style={{ fontWeight: 700 }}>
                      <span
                        className="fin-pdot"
                        style={{ background: p.color, display: "inline-block", marginRight: 6 }}
                      />
                      {p.name}
                    </span>
                    <span className="fin-tiny fin-muted">
                      {money(p.spent)} · {Math.round(pct * 100)}%
                    </span>
                  </div>
                  <div className="fin-bar" style={{ marginTop: 0 }}>
                    <span style={{ width: `${pct * 100}%`, background: p.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {s.txCount === 0 && !notSetUp && (
        <div className="fin-empty">
          <span className="ico">🧾</span>
          Nenhum gasto lançado neste mês ainda.
          <br />
          Toque no <strong>+</strong> pra registrar o primeiro.
        </div>
      )}
    </div>
  );
}
