"use client";

import { useEffect, useState } from "react";
import { FinanceProvider, useFinance } from "@/lib/financas/store";
import { monthKey, monthLabelShort, shiftMonth } from "@/lib/financas/format";
import { Dashboard } from "@/components/financas/Dashboard";
import { Extrato } from "@/components/financas/Extrato";
import { Metas } from "@/components/financas/Metas";
import { Dividas } from "@/components/financas/Dividas";
import { Config } from "@/components/financas/Config";
import { AddExpenseSheet } from "@/components/financas/AddExpenseSheet";
import { Tab } from "@/components/financas/types";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "inicio", label: "Início", icon: "🏠" },
  { id: "extrato", label: "Extrato", icon: "🧾" },
  { id: "metas", label: "Metas", icon: "🎯" },
  { id: "dividas", label: "Dívidas", icon: "💳" },
  { id: "config", label: "Ajustes", icon: "⚙️" },
];

function App() {
  const { ready } = useFinance();
  const [tab, setTab] = useState<Tab>("inicio");
  const [mk, setMk] = useState(() => monthKey(new Date()));
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editId, setEditId] = useState<string | undefined>();
  const [toast, setToast] = useState("");

  // Registra o service worker pra funcionar offline / instalado.
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/financas/sw.js", { scope: "/financas/" }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  if (!ready) return null;

  const showMonth = tab === "inicio" || tab === "extrato" || tab === "metas";

  return (
    <div className="fin-app">
      <header className="fin-header">
        <div className="fin-header-row">
          <div className="fin-title">
            <span className="dot" />
            Nossas Finanças
          </div>
          {showMonth && (
            <div className="fin-month">
              <button onClick={() => setMk((m) => shiftMonth(m, -1))} aria-label="Mês anterior">
                ‹
              </button>
              <span className="label">{monthLabelShort(mk)}</span>
              <button onClick={() => setMk((m) => shiftMonth(m, 1))} aria-label="Próximo mês">
                ›
              </button>
            </div>
          )}
        </div>
      </header>

      {tab === "inicio" && <Dashboard monthKey={mk} onGoTo={setTab} />}
      {tab === "extrato" && (
        <Extrato
          monthKey={mk}
          onEdit={(id) => {
            setEditId(id);
            setSheetOpen(true);
          }}
        />
      )}
      {tab === "metas" && <Metas monthKey={mk} />}
      {tab === "dividas" && <Dividas />}
      {tab === "config" && <Config onToast={setToast} />}

      {/* FAB — lançar gasto */}
      {tab !== "config" && (
        <button
          className="fin-fab"
          onClick={() => {
            setEditId(undefined);
            setSheetOpen(true);
          }}
          aria-label="Registrar gasto"
        >
          +
        </button>
      )}

      {/* Navegação */}
      <nav className="fin-nav">
        <div className="fin-nav-inner">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={tab === t.id ? "active" : ""}
              onClick={() => setTab(t.id)}
            >
              <span className="ni">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {sheetOpen && (
        <AddExpenseSheet
          editId={editId}
          onClose={() => setSheetOpen(false)}
          onSaved={setToast}
        />
      )}

      {toast && <div className="fin-toast">{toast}</div>}
    </div>
  );
}

export default function FinancasPage() {
  return (
    <FinanceProvider>
      <App />
    </FinanceProvider>
  );
}
