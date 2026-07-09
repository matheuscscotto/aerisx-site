import { Category, FinanceState, Kind, Transaction } from "./model";
import { monthOf } from "./format";

export type CategorySpend = {
  category: Category;
  spent: number;
  budget: number;
  pct: number; // 0..1+ (spent/budget)
};

export type MonthSummary = {
  monthKey: string;
  income: number; // renda recorrente ativa
  fixedTotal: number; // contas fixas ativas
  variableSpent: number; // lançamentos variáveis do mês
  investTarget: number; // meta de investimento (pct sobre renda)
  /** Quanto sobra para o variável depois de fixos e meta de investimento. */
  variableBudget: number;
  /** variableBudget - variableSpent (pode ser negativo). */
  variableLeft: number;
  /** Sobra final do mês = renda - fixo - variável - investimento alvo. */
  netLeft: number;
  byCategory: CategorySpend[];
  byKind: Record<Kind, number>;
  byPerson: { personId: string; name: string; color: string; spent: number }[];
  /** Fatura em construção de cada cartão neste mês (soma dos lançamentos). */
  byCard: { cardId: string; name: string; color: string; spent: number; dueDay: number }[];
  /** Gastos fora de cartão (pix/débito/dinheiro). */
  offCard: number;
  txCount: number;
};

export function txForMonth(state: FinanceState, mk: string): Transaction[] {
  return state.transactions.filter((t) => monthOf(t.date) === mk);
}

export function summarize(state: FinanceState, mk: string): MonthSummary {
  const income = state.incomes
    .filter((i) => i.active)
    .reduce((s, i) => s + (i.amount || 0), 0);

  const fixedTotal = state.fixed
    .filter((f) => f.active)
    .reduce((s, f) => s + (f.amount || 0), 0);

  const txs = txForMonth(state, mk);
  const catById = new Map(state.categories.map((c) => [c.id, c]));

  const spentByCat = new Map<string, number>();
  const byKind: Record<Kind, number> = { fixo: 0, variavel: 0, investimento: 0 };
  const spentByPerson = new Map<string, number>();
  const spentByCard = new Map<string, number>();
  let offCard = 0;
  let variableSpent = 0;

  for (const t of txs) {
    const cat = catById.get(t.categoryId);
    const kind: Kind = cat?.kind ?? "variavel";
    spentByCat.set(t.categoryId, (spentByCat.get(t.categoryId) || 0) + t.amount);
    byKind[kind] += t.amount;
    spentByPerson.set(t.personId, (spentByPerson.get(t.personId) || 0) + t.amount);
    if (t.cardId) {
      spentByCard.set(t.cardId, (spentByCard.get(t.cardId) || 0) + t.amount);
    } else {
      offCard += t.amount;
    }
    if (kind === "variavel") variableSpent += t.amount;
  }

  const byCategory: CategorySpend[] = state.categories
    .map((category) => {
      const spent = spentByCat.get(category.id) || 0;
      const budget = category.budget || 0;
      return {
        category,
        spent,
        budget,
        pct: budget > 0 ? spent / budget : 0,
      };
    })
    .filter((c) => c.spent > 0 || c.budget > 0)
    .sort((a, b) => b.spent - a.spent);

  const byPerson = state.people
    .map((p) => ({
      personId: p.id,
      name: p.name,
      color: p.color,
      spent: spentByPerson.get(p.id) || 0,
    }))
    .filter((p) => p.spent > 0)
    .sort((a, b) => b.spent - a.spent);

  const byCard = state.cards
    .filter((c) => c.active)
    .map((c) => ({
      cardId: c.id,
      name: c.name,
      color: c.color,
      spent: spentByCard.get(c.id) || 0,
      dueDay: c.dueDay,
    }))
    .sort((a, b) => b.spent - a.spent);

  const investTarget = Math.round((income * state.investTargetPct) / 100);
  const variableBudget = Math.max(0, income - fixedTotal - investTarget);
  const variableLeft = variableBudget - variableSpent;
  const netLeft = income - fixedTotal - variableSpent - investTarget;

  return {
    monthKey: mk,
    income,
    fixedTotal,
    variableSpent,
    investTarget,
    variableBudget,
    variableLeft,
    netLeft,
    byCategory,
    byKind,
    byPerson,
    byCard,
    offCard,
    txCount: txs.length,
  };
}
