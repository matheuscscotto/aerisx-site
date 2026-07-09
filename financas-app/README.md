# Nossas Finanças 💰

App de controle financeiro do casal (Matheus & Nathália), hospedado **de graça no Google Apps Script**, com os dados numa **planilha Google no Drive** ("Nossas Finanças — Dados").

> Nada a ver com o site da AerisX — este diretório só guarda o código versionado.
> O app roda no Google, não neste repositório.

## Por que assim?

- O Google Drive não hospeda sites (foi desligado em 2016), mas o **Apps Script** hospeda apps ligados à sua conta Google — de graça.
- Os dados ficam numa **planilha no seu Drive**: é literalmente a planilha que se preenche sozinha pelo celular.
- **Sincroniza entre os dois celulares automaticamente** — a planilha é o banco de dados compartilhado.
- Só você e a Nathália acessam (login Google + compartilhamento da planilha).

## Instalação (±5 minutos, uma vez só)

1. Logado como `matheuscscotto@gmail.com`, abra **[script.new](https://script.new)** (cria um projeto novo no Apps Script).
2. Renomeie o projeto (topo da página) para **Nossas Finanças**.
3. No arquivo `Código.gs` que aparece aberto: apague o conteúdo e **cole o conteúdo de `Code.gs`** daqui.
4. No topo do código, preencha o e-mail da Nathália:
   ```js
   var COMPARTILHAR_COM = [
     "email-da-nathalia@gmail.com",
   ];
   ```
5. No painel esquerdo: **+ (Adicionar arquivo) → HTML** → nomeie **`Index`** → apague o conteúdo e **cole o conteúdo de `Index.html`** daqui.
6. **Implantar → Nova implantação → ⚙️ Tipo: App da Web**:
   - Descrição: `v1`
   - **Executar como: Usuário que acessa o app**
   - **Quem pode acessar: Qualquer pessoa com Conta do Google**
   - → **Implantar** → autorize as permissões (planilhas).
7. Copie a **URL do app** (termina em `/exec`) e abra no celular.
8. No navegador do celular: **Adicionar à tela inicial** → vira um app com ícone.
9. Mande a mesma URL pra Nathália — no primeiro acesso ela autoriza e pronto.

Na primeira abertura, o app cria sozinho a planilha **"Nossas Finanças — Dados"** no Drive e compartilha com os e-mails configurados.

## Atualizações do app

Editou o código? **Implantar → Gerenciar implantações → ✏️ → Versão: Nova versão → Implantar.**
A URL continua a mesma.

## Estrutura da planilha (criada automaticamente)

| Aba | O que guarda |
|---|---|
| **Lançamentos** | um gasto por linha: data, valor, categoria, quem, cartão, nota |
| **Dívidas** | cada dívida: quanto falta, parcela, juros, vencimento |
| **Config** | renda, contas fixas, cartões, orçamentos (em JSON) |

Você pode abrir a planilha e auditar tudo — mas edite pelo app pra não bagunçar os ids.

## Desenvolvimento / teste local

`Index.html` roda sozinho no navegador em **modo local** (salva no `localStorage`, mostra aviso em Ajustes):

```bash
cd financas-app && python3 -m http.server 4322
# http://localhost:4322/Index.html
```
