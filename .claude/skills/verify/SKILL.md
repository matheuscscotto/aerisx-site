---
name: verify
description: Como buildar, servir e verificar este projeto (site estático Next.js + app de finanças em /financas)
---

# Verificação deste repo

Site estático Next.js (`output: "export"`). Sem testes automatizados — verificação é dirigir o app no navegador.

## Build e servir

```bash
npm run build          # gera ./out
node serve-static.js   # serve ./out em http://localhost:4321 (roda em background)
```

## Dirigir com Playwright

`playwright-core` não está nas deps — instalar com `npm install --no-save playwright-core` e rodar scripts com `NODE_PATH=<repo>/node_modules`. Chromium headless em `/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell` (usar `executablePath`).

Viewport móvel recomendado: 390×844, `isMobile: true`.

## Fluxos que valem dirigir

- **Site AerisX** (`/` e `/agendar/`): título correto, hero renderiza.
- **App de finanças** (`/financas/`): tudo client-side, estado em `localStorage` (chave `financas_casal_v1`).
  1. Ajustes → preencher renda (inputs `inputmode=decimal` disparam salvamento no blur).
  2. FAB `+` → teclado numérico (dígitos empilham centavos), escolher categoria/pessoa/cartão → Registrar.
  3. Recarregar página → dados persistem (probe de persistência).
  4. Seletor de mês → mês anterior deve mostrar vazio.
  5. Extrato → tocar numa linha abre edição; dá pra apagar.
  6. Dívidas → cadastrar; ordem de ataque ordena por juros desc.

## Pegadinhas

- Selectors: dentro do sheet de novo gasto, escopar com `.fin-sheet` (textos de categoria repetem na página atrás).
- O scroll da página é no `.fin-root` (position: fixed), não no `window` — usar `document.querySelector(".fin-root").scrollTo(...)` pra screenshots abaixo da dobra.
- Aviso "quase lá" nas metas só aparece acima de 85% da meta.
