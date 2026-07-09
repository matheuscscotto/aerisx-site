"use client";

import { useMemo, useState } from "react";
import { useFinance } from "@/lib/financas/store";
import { txForMonth } from "@/lib/financas/selectors";
import { dayLabel, money } from "@/lib/financas/format";

export function Extrato({
  monthKey,
  onEdit,
}: {
  monthKey: string;
  onEdit: (id: string) => void;
}) {
  const { state } = useFinance();
  const [person, setPerson] = useState<string>("all");
  const [q, setQ] = useState("");

  const catById = useMemo(
    () => new Map(state.categories.map((c) => [c.id, c])),
    [state.categories],
  );
  const personById = useMemo(
    () => new Map(state.people.map((p) => [p.id, p])),
    [state.people],
  );

  const grouped = useMemo(() => {
    let txs = txForMonth(state, monthKey);
    if (person !== "all") txs = txs.filter((t) => t.personId === person);
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      txs = txs.filter((t) => {
        const cat = catById.get(t.categoryId);
        return (
          t.note.toLowerCase().includes(needle) ||
          (cat?.name.toLowerCase().includes(needle) ?? false)
        );
      });
    }
    txs.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt - a.createdAt));
    const map = new Map<string, typeof txs>();
    for (const t of txs) {
      const arr = map.get(t.date) ?? [];
      arr.push(t);
      map.set(t.date, arr);
    }
    return Array.from(map.entries());
  }, [state, monthKey, person, q, catById]);

  const total = grouped.reduce((sum, [, txs]) => sum + txs.reduce((a, t) => a + t.amount, 0), 0);

  return (
    <div>
      <input
        className="fin-input"
        placeholder="Buscar por nota ou categoria…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{ marginTop: 4 }}
      />

      <div className="fin-seg" style={{ marginTop: 10 }}>
        <button className={person === "all" ? "on" : ""} onClick={() => setPerson("all")}>
          Todos
        </button>
        {state.people.map((p) => (
          <button
            key={p.id}
            className={person === p.id ? "on" : ""}
            style={person === p.id ? { borderColor: p.color } : undefined}
            onClick={() => setPerson(p.id)}
          >
            <span className="fin-pdot" style={{ background: p.color }} />
            {p.name}
          </button>
        ))}
      </div>

      {grouped.length === 0 ? (
        <div className="fin-empty">
          <span className="ico">🔍</span>
          Nenhum lançamento por aqui.
        </div>
      ) : (
        <>
          <div className="fin-section-title">
            Total do filtro: <span style={{ color: "var(--fg)" }}>{money(total)}</span>
          </div>
          {grouped.map(([date, txs]) => (
            <div key={date} style={{ marginBottom: 6 }}>
              <div
                className="fin-tiny fin-muted"
                style={{ textTransform: "capitalize", margin: "12px 2px 2px", fontWeight: 700 }}
              >
                {dayLabel(date)}
              </div>
              <div className="fin-card" style={{ padding: "4px 16px" }}>
                {txs.map((t) => {
                  const cat = catById.get(t.categoryId);
                  const p = personById.get(t.personId);
                  return (
                    <div
                      className="fin-row"
                      key={t.id}
                      onClick={() => onEdit(t.id)}
                      role="button"
                      style={{ cursor: "pointer" }}
                    >
                      <div className="fin-ico">{cat?.emoji ?? "📦"}</div>
                      <div className="grow">
                        <div className="name">{cat?.name ?? "—"}</div>
                        <div className="meta">
                          {p && (
                            <span className="fin-pill">
                              <span className="fin-pdot" style={{ background: p.color }} />
                              {p.name}
                            </span>
                          )}
                          {t.note && <span>{t.note}</span>}
                        </div>
                      </div>
                      <div className="amt">{money(t.amount)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
