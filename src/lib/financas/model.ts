// ─────────────────────────────────────────────────────────────────────────────
// Modelo de dados do app de finanças do casal (Matheus & Nathália)
// Estrutura inspirada na planilha real: método 50/30/20 (fixo / variável /
// investimento) com as categorias que aparecem de verdade no dia a dia.
// ─────────────────────────────────────────────────────────────────────────────

export const SCHEMA_VERSION = 1;

/** Tipo de gasto dentro do método 50/30/20. */
export type Kind = "fixo" | "variavel" | "investimento";

export type Person = {
  id: string;
  name: string;
  /** Cor usada nos gráficos e etiquetas. */
  color: string;
};

export type Category = {
  id: string;
  name: string;
  emoji: string;
  kind: Kind;
  /** Meta/orçamento mensal em R$ (0 = sem meta definida). */
  budget: number;
  /** Categorias base não podem ser apagadas, só editadas. */
  builtin?: boolean;
};

/** Renda mensal recorrente (salário, renda da Nathália, auxílio...). */
export type IncomeSource = {
  id: string;
  name: string;
  amount: number;
  personId: string | null;
  active: boolean;
};

/** Conta fixa mensal (aluguel, energia, streaming...). */
export type FixedExpense = {
  id: string;
  name: string;
  amount: number;
  categoryId: string;
  active: boolean;
};

/** Meio de pagamento — cartões pontuam, então quase tudo passa por eles. */
export type Card = {
  id: string;
  name: string;
  color: string;
  /** Dia em que a fatura fecha (1..31), 0 = não informado. */
  closingDay: number;
  /** Dia do vencimento da fatura (1..31), 0 = não informado. */
  dueDay: number;
  active: boolean;
};

/** Um lançamento avulso — o gasto variável do dia a dia. É o que mais importa. */
export type Transaction = {
  id: string;
  /** Valor sempre positivo, em reais. */
  amount: number;
  categoryId: string;
  personId: string;
  /** Cartão usado; null = Pix / débito / dinheiro. */
  cardId: string | null;
  note: string;
  /** Data do gasto no formato YYYY-MM-DD. */
  date: string;
  createdAt: number;
};

export type DebtKind = "cartao" | "emprestimo" | "parcelamento" | "pessoa" | "outro";

/** Uma dívida a quitar (cartão, empréstimo, parcelamento, alguém...). */
export type Debt = {
  id: string;
  name: string;
  kind: DebtKind;
  /** Cartão: limite total. Empréstimo/parcelamento: valor total contratado. */
  total: number;
  /** Quanto ainda falta pagar (cartão: fatura atual em aberto). */
  remaining: number;
  /** Parcela/pagamento mensal, se houver. */
  monthly: number;
  /** Juros ao mês em % (0 se não souber). Ajuda a priorizar. */
  interestPct: number;
  /** Dia do vencimento (1..31), 0 se não se aplica. */
  dueDay: number;
  note: string;
  archived: boolean;
};

export const DEBT_KIND_LABEL: Record<DebtKind, string> = {
  cartao: "Cartão de crédito",
  emprestimo: "Empréstimo",
  parcelamento: "Parcelamento",
  pessoa: "Pessoa / Informal",
  outro: "Outro",
};

export const DEBT_KIND_EMOJI: Record<DebtKind, string> = {
  cartao: "💳",
  emprestimo: "🏦",
  parcelamento: "🧾",
  pessoa: "🤝",
  outro: "📌",
};

export type FinanceState = {
  version: number;
  people: Person[];
  categories: Category[];
  cards: Card[];
  incomes: IncomeSource[];
  fixed: FixedExpense[];
  transactions: Transaction[];
  debts: Debt[];
  /** Percentual-meta de investimento sobre a renda (padrão do 50/30/20). */
  investTargetPct: number;
};

// ── Helpers de id ────────────────────────────────────────────────────────────
export function uid(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ── Dados iniciais (seed) ────────────────────────────────────────────────────
// Baseados na planilha "Gestão Financeira - Matheus/Nathália".

const P_MATHEUS = "p_matheus";
const P_NATHALIA = "p_nathalia";
const P_CASAL = "p_casal";

export const DEFAULT_PEOPLE: Person[] = [
  { id: P_MATHEUS, name: "Matheus", color: "#38bdf8" },
  { id: P_NATHALIA, name: "Nathália", color: "#f472b6" },
  { id: P_CASAL, name: "Casal", color: "#a78bfa" },
];

export const DEFAULT_CATEGORIES: Category[] = [
  // ── Variáveis (30%) — o foco do app ──
  { id: "c_mercado", name: "Supermercado", emoji: "🛒", kind: "variavel", budget: 0, builtin: true },
  { id: "c_feira", name: "Feira", emoji: "🥬", kind: "variavel", budget: 0, builtin: true },
  { id: "c_restaurante", name: "Restaurante / iFood", emoji: "🍔", kind: "variavel", budget: 0, builtin: true },
  { id: "c_combustivel", name: "Combustível", emoji: "⛽", kind: "variavel", budget: 0, builtin: true },
  { id: "c_transporte", name: "Uber / Transporte", emoji: "🚗", kind: "variavel", budget: 0, builtin: true },
  { id: "c_farmacia", name: "Farmácia", emoji: "💊", kind: "variavel", budget: 0, builtin: true },
  { id: "c_roupa", name: "Roupa", emoji: "👕", kind: "variavel", budget: 0, builtin: true },
  { id: "c_shopping", name: "Compras / Shopping", emoji: "🛍️", kind: "variavel", budget: 0, builtin: true },
  { id: "c_lazer", name: "Lazer", emoji: "🎬", kind: "variavel", budget: 0, builtin: true },
  { id: "c_casa", name: "Casa", emoji: "🏠", kind: "variavel", budget: 0, builtin: true },
  { id: "c_pet", name: "Pet", emoji: "🐾", kind: "variavel", budget: 0, builtin: true },
  { id: "c_outros", name: "Outros", emoji: "📦", kind: "variavel", budget: 0, builtin: true },

  // ── Fixos (50%) ──
  { id: "c_aluguel", name: "Aluguel", emoji: "🏡", kind: "fixo", budget: 0, builtin: true },
  { id: "c_energia", name: "Energia", emoji: "💡", kind: "fixo", budget: 0, builtin: true },
  { id: "c_agua", name: "Água", emoji: "🚰", kind: "fixo", budget: 0, builtin: true },
  { id: "c_internet", name: "Internet", emoji: "🌐", kind: "fixo", budget: 0, builtin: true },
  { id: "c_celular", name: "Celular", emoji: "📱", kind: "fixo", budget: 0, builtin: true },
  { id: "c_saude", name: "Plano de Saúde", emoji: "⚕️", kind: "fixo", budget: 0, builtin: true },
  { id: "c_streaming", name: "Streaming", emoji: "📺", kind: "fixo", budget: 0, builtin: true },
  { id: "c_academia", name: "Academia", emoji: "🏋️", kind: "fixo", budget: 0, builtin: true },

  // ── Investimento (20%) ──
  { id: "c_reserva", name: "Reserva de Emergência", emoji: "🛟", kind: "investimento", budget: 0, builtin: true },
  { id: "c_invest", name: "Investimento", emoji: "📈", kind: "investimento", budget: 0, builtin: true },
];

// Os cartões que o Matheus realmente usa pra pontuar.
export const DEFAULT_CARDS: Card[] = [
  { id: "card_santander", name: "Santander Elite", color: "#ec1c24", closingDay: 0, dueDay: 0, active: true },
  { id: "card_sicredi", name: "Sicredi Black", color: "#2e7d32", closingDay: 0, dueDay: 0, active: true },
];

export const DEFAULT_INCOMES: IncomeSource[] = [
  { id: uid("inc"), name: "Salário Matheus", amount: 0, personId: P_MATHEUS, active: true },
  { id: uid("inc"), name: "Renda Nathália", amount: 0, personId: P_NATHALIA, active: true },
];

export const DEFAULT_FIXED: FixedExpense[] = [];

export function makeInitialState(): FinanceState {
  return {
    version: SCHEMA_VERSION,
    people: DEFAULT_PEOPLE,
    categories: DEFAULT_CATEGORIES,
    cards: DEFAULT_CARDS,
    incomes: DEFAULT_INCOMES,
    fixed: DEFAULT_FIXED,
    transactions: [],
    debts: [],
    investTargetPct: 20,
  };
}

export const KIND_LABEL: Record<Kind, string> = {
  fixo: "Fixo",
  variavel: "Variável",
  investimento: "Investimento",
};

export const KIND_COLOR: Record<Kind, string> = {
  fixo: "#f59e0b",
  variavel: "#38bdf8",
  investimento: "#34d399",
};
