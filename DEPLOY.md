# Deploy — AERISX (aerisx.com.br)

Site em **Next.js 16 + TypeScript + Tailwind v4 + Framer Motion**, exportado como
site estático (`output: "export"`) para **GitHub Pages** com domínio próprio.

## 1. Enviar para o GitHub

O repositório local já está com o primeiro commit feito. Conecte ao seu repo e suba:

```bash
cd aerisx-site
git remote add origin https://github.com/SEU-USUARIO/aerisx-site.git
git push -u origin main
```

> Se o repositório no GitHub já tiver um commit (ex.: README criado na hora),
> rode antes: `git pull origin main --allow-unrelated-histories` e resolva, ou
> recrie o repo vazio (sem README).

## 2. Ativar o GitHub Pages

No GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
O workflow `.github/workflows/deploy.yml` builda e publica a cada `push` na `main`.

## 3. Domínio próprio (DNS na Hostinger)

Em **Gerenciar registros DNS** (não precisa trocar nameservers):

- **Remover** o registro `A @ → 2.57.91.91`.
- **Adicionar** os 4 registros A do GitHub Pages:
  ```
  A  @  185.199.108.153
  A  @  185.199.109.153
  A  @  185.199.110.153
  A  @  185.199.111.153
  ```
- **Alterar** o `CNAME www` para: `SEU-USUARIO.github.io`

Depois, no GitHub: **Settings → Pages → Custom domain → `aerisx.com.br` → Save**
e marque **Enforce HTTPS** (após o certificado ser emitido, pode levar alguns minutos).

O arquivo `public/CNAME` já contém `aerisx.com.br`, então o domínio é mantido a cada deploy.

## Comandos úteis

```bash
npm run dev      # desenvolvimento local (http://localhost:3000)
npm run build    # gera o site estático em ./out
```

> Observação: usamos `next build --webpack` (em vez do Turbopack) porque o binário
> nativo do SWC não roda nesta máquina Windows/OneDrive. No CI (Linux) funciona normal.

## Alternativa: hospedar na própria Hostinger

Em vez do GitHub Pages, dá para subir o conteúdo da pasta `out/` direto no
`public_html` da Hostinger — sem mexer no DNS.
