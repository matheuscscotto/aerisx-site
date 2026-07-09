# Nossas Finanças 💰

App de controle financeiro do casal (Matheus & Nathália), hospedado junto com o site em **`/financas`**.

Foco: **o gasto variável do dia a dia** — lançar em 2 toques, ver quanto sobra, e enxergar a fatura de cada cartão crescendo em tempo real (antes de ela fechar).

## Como usar no celular

1. Abra `https://aerisx.com.br/financas/` no navegador do celular.
2. **Android (Chrome):** menu ⋮ → *Adicionar à tela inicial* → vira app com ícone.
   **iPhone (Safari):** compartilhar → *Adicionar à Tela de Início*.
3. Depois da primeira visita funciona offline (service worker).

## O que tem

- **Início** — quanto sobra pro variável no mês (renda − fixas − meta de guardar), faturas em construção por cartão (Santander Elite / Sicredi Black), 50/30/20, gastos por categoria e por pessoa.
- **Extrato** — lançamentos por dia, filtro por pessoa, busca; tocar edita/apaga.
- **Metas** — orçamento por categoria com alerta de "quase lá" (85%) e "estourou".
- **Dívidas** — cadastro de cartão rolado/empréstimo/parcelamento com **ordem de ataque** (maior juro primeiro — método avalanche).
- **Ajustes** — renda, contas fixas, cartões, backup (exportar/restaurar JSON).

## Onde ficam os dados

Hoje: **no aparelho** (`localStorage`, chave `financas_casal_v1`). Nada sai do celular.

Para usar nos dois celulares por enquanto: exportar backup num aparelho e restaurar no outro (Ajustes → Seus dados).

## Próximo passo: sincronização em nuvem (Supabase)

O estado inteiro passa por `src/lib/financas/store.tsx` (funções `load`/`save` + ações). Para ligar o sync:

1. Criar projeto grátis em [supabase.com](https://supabase.com).
2. Uma tabela `finance_state` (ou tabelas normalizadas `transactions`, `debts`, etc.) com Row Level Security por casal.
3. Trocar `load`/`save` por leitura/escrita no Supabase (o client roda direto do navegador — compatível com o site estático) e assinar `postgres_changes` pra tempo real.
4. Login simples: um "código do casal" ou magic link por e-mail.

A modelagem (`src/lib/financas/model.ts`) já está pronta pra isso — os tipos têm `id`s estáveis e o estado é serializável.

## Desenvolvimento

```bash
npm run dev        # http://localhost:3000/financas
npm run build      # export estático em ./out
npm run preview    # serve ./out em http://localhost:4321
```

Código do app: `src/app/financas/` (páginas) + `src/components/financas/` (telas) + `src/lib/financas/` (modelo, store, cálculos).
