"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Card,
  Category,
  Debt,
  DEFAULT_CARDS,
  DEFAULT_CATEGORIES,
  FinanceState,
  FixedExpense,
  IncomeSource,
  Person,
  SCHEMA_VERSION,
  Transaction,
  makeInitialState,
  uid,
} from "./model";

const STORAGE_KEY = "financas_casal_v1";

// ─────────────────────────────────────────────────────────────────────────────
// Persistência.
// Hoje: localStorage (offline, roda no celular sem servidor).
// Amanhã (sync em nuvem): basta trocar load/save por chamadas ao Supabase —
// a interface de estado abaixo não muda. Ver README-FINANCAS.md.
// ─────────────────────────────────────────────────────────────────────────────

function load(): FinanceState {
  if (typeof window === "undefined") return makeInitialState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return makeInitialState();
    const parsed = JSON.parse(raw) as FinanceState;
    return migrate(parsed);
  } catch {
    return makeInitialState();
  }
}

/** Garante que estados antigos ganhem novos campos/categorias base sem perder dados. */
function migrate(state: FinanceState): FinanceState {
  const base = makeInitialState();
  const categories = [...(state.categories ?? [])];
  // Adiciona categorias base que ainda não existam (ex.: após atualização do app).
  for (const c of DEFAULT_CATEGORIES) {
    if (!categories.some((x) => x.id === c.id)) categories.push(c);
  }
  return {
    version: SCHEMA_VERSION,
    people: state.people?.length ? state.people : base.people,
    categories,
    cards: state.cards ?? DEFAULT_CARDS,
    incomes: state.incomes ?? base.incomes,
    fixed: state.fixed ?? base.fixed,
    // cardId chegou depois: lançamentos antigos viram "sem cartão".
    transactions: (state.transactions ?? []).map((t) => ({ ...t, cardId: t.cardId ?? null })),
    debts: state.debts ?? [],
    investTargetPct: state.investTargetPct ?? base.investTargetPct,
  };
}

function save(state: FinanceState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage cheio ou indisponível — ignora silenciosamente */
  }
}

// ── Tipo do contexto ─────────────────────────────────────────────────────────
type Store = {
  state: FinanceState;
  ready: boolean;
  addTransaction: (t: Omit<Transaction, "id" | "createdAt">) => void;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (c: Omit<Category, "id">) => void;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  setIncomes: (incomes: IncomeSource[]) => void;
  setFixed: (fixed: FixedExpense[]) => void;
  setPeople: (people: Person[]) => void;
  setCards: (cards: Card[]) => void;
  setDebts: (debts: Debt[]) => void;
  setInvestTargetPct: (pct: number) => void;
  replaceAll: (state: FinanceState) => void;
  resetAll: () => void;
};

const FinanceContext = createContext<Store | null>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<FinanceState>(makeInitialState);
  const [ready, setReady] = useState(false);
  const firstLoad = useRef(true);

  // Carrega do storage só no cliente (evita mismatch de hidratação).
  useEffect(() => {
    setState(load());
    setReady(true);
  }, []);

  // Salva a cada mudança (menos na primeira carga).
  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    save(state);
  }, [state]);

  // Sincroniza entre abas do mesmo aparelho.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setState(migrate(JSON.parse(e.newValue)));
        } catch {
          /* ignora */
        }
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addTransaction = useCallback((t: Omit<Transaction, "id" | "createdAt">) => {
    setState((s) => ({
      ...s,
      transactions: [
        { ...t, id: uid("tx"), createdAt: Date.now() },
        ...s.transactions,
      ],
    }));
  }, []);

  const updateTransaction = useCallback((id: string, patch: Partial<Transaction>) => {
    setState((s) => ({
      ...s,
      transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setState((s) => ({ ...s, transactions: s.transactions.filter((t) => t.id !== id) }));
  }, []);

  const addCategory = useCallback((c: Omit<Category, "id">) => {
    setState((s) => ({ ...s, categories: [...s.categories, { ...c, id: uid("c") }] }));
  }, []);

  const updateCategory = useCallback((id: string, patch: Partial<Category>) => {
    setState((s) => ({
      ...s,
      categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setState((s) => {
      const cat = s.categories.find((c) => c.id === id);
      if (cat?.builtin) return s; // categorias base não somem
      return {
        ...s,
        categories: s.categories.filter((c) => c.id !== id),
        // lançamentos órfãos vão para "Outros"
        transactions: s.transactions.map((t) =>
          t.categoryId === id ? { ...t, categoryId: "c_outros" } : t,
        ),
        fixed: s.fixed.filter((f) => f.categoryId !== id),
      };
    });
  }, []);

  const setIncomes = useCallback((incomes: IncomeSource[]) => {
    setState((s) => ({ ...s, incomes }));
  }, []);
  const setFixed = useCallback((fixed: FixedExpense[]) => {
    setState((s) => ({ ...s, fixed }));
  }, []);
  const setPeople = useCallback((people: Person[]) => {
    setState((s) => ({ ...s, people }));
  }, []);
  const setCards = useCallback((cards: Card[]) => {
    setState((s) => ({ ...s, cards }));
  }, []);
  const setDebts = useCallback((debts: Debt[]) => {
    setState((s) => ({ ...s, debts }));
  }, []);
  const setInvestTargetPct = useCallback((pct: number) => {
    setState((s) => ({ ...s, investTargetPct: pct }));
  }, []);
  const replaceAll = useCallback((next: FinanceState) => setState(migrate(next)), []);
  const resetAll = useCallback(() => setState(makeInitialState()), []);

  const value = useMemo<Store>(
    () => ({
      state,
      ready,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addCategory,
      updateCategory,
      deleteCategory,
      setIncomes,
      setFixed,
      setPeople,
      setCards,
      setDebts,
      setInvestTargetPct,
      replaceAll,
      resetAll,
    }),
    [
      state,
      ready,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addCategory,
      updateCategory,
      deleteCategory,
      setIncomes,
      setFixed,
      setPeople,
      setCards,
      setDebts,
      setInvestTargetPct,
      replaceAll,
      resetAll,
    ],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance(): Store {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance precisa estar dentro de <FinanceProvider>");
  return ctx;
}
