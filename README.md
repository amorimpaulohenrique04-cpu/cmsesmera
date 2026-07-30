# ESMÉRA / Sanity Studio

Studio editorial e comercial modelado a partir do blueprint oficial da ESMÉRA.

## Workspaces

- `/site`: conteúdo público no dataset `production`.
- `/business`: CRM leve e privado no dataset `business`.

O frontend deve consultar apenas `production`. O dataset `business` contém dados pessoais,
histórico comercial e pós-venda e não deve ser exposto por loaders públicos.

## Desenvolvimento

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
```

Antes de abrir o workspace comercial, crie o dataset privado:

```bash
npx sanity dataset create business --private
```

## Singletons do site

`homePage`, `aboutPage`, `contactPage`, `collectionPage`, `navigation` e `siteSettings`
usam IDs fixos e são acessados pela estrutura personalizada do Studio.

Produtos e categorias usam IDs gerados pelo Sanity e se relacionam por referências. Home,
Matter e Signature nunca duplicam título, preço, código ou disponibilidade do produto.
