# ESMÉRA / Sanity Studio

Studio editorial e comercial da Esméra. O Sanity é a única fonte de dados; o projeto oferece dois níveis de experiência sobre os mesmos documentos.

## Superfícies

### Portal operacional

- `/site/cms/*`: conteúdo, catálogo, produtos, categorias e configurações do site.
- `/business/cms/*`: clientes, vendas, pipeline, pós-venda e relatórios.

O portal operacional exibe apenas dados e ações implementados. Consultas possuem estados explícitos de carregamento, vazio e erro. Falhas do Business nunca são convertidas em zero.

### Admin técnico

- `/site/documents/*`
- `/business/documents/*`

O Structure Tool nativo aparece como **Admin técnico**. Ele continua sendo o destino de campos avançados, validações, histórico, publicação, drafts e capacidades que ainda não possuem equivalência completa no portal operacional.

## Datasets

- Site: `production` por padrão.
- Business: `business` por padrão e obrigatoriamente privado.

O frontend público deve consultar apenas o dataset do site. O dataset Business contém dados pessoais, histórico comercial e pós-venda e não deve ser exposto por loaders públicos.

Antes de criar um dataset Business novo, confirme se existe backup ou dataset anterior a ser restaurado. Criar um dataset vazio quando havia dados pode mascarar perda de informação.

Para uma instalação realmente nova:

```bash
npx sanity dataset create business --private
```

Depois, revise no painel do Sanity os papéis de leitura/escrita e as origens CORS. Essas duas propriedades são administrativas e não são presumidas pela interface do CMS.

## Variáveis de ambiente do Studio

```bash
SANITY_STUDIO_PROJECT_ID=u60dwmhb
SANITY_STUDIO_SITE_DATASET=production
SANITY_STUDIO_BUSINESS_DATASET=business
SANITY_STUDIO_PREVIEW_URL=https://seu-frontend.example
```

Os valores atuais continuam como fallback para desenvolvimento, mas ambientes implantados devem declarar explicitamente projeto, datasets e URL de preview.

## Desenvolvimento

```bash
npm run dev
npm run typecheck
npm run lint -- --max-warnings=0
npm run validate:source
npm run build
```

O workflow de CI executa typecheck, lint sem warnings, smoke de regressões operacionais e build.

## Contrato operacional

Todo KPI deve possuir uma consulta bem-sucedida antes de exibir um número. Sempre que aplicável, o próprio painel informa fonte, período/regra de inclusão e última atualização. Indicadores sem integração configurada aparecem como **Não configurado**, nunca como dado demonstrativo.

Vendas operacionais consideram apenas estados elegíveis (`confirmed`, `production`, `ready`, `delivered`) quando a métrica pretende representar venda válida/receita. Rascunhos e cancelamentos não entram silenciosamente nesses totais.

## Singletons do site

`homePage`, `aboutPage`, `contactPage`, `collectionPage`, `navigation` e `siteSettings` usam IDs fixos e são acessados pela estrutura personalizada do Studio.

Produtos e categorias usam IDs gerados pelo Sanity e se relacionam por referências. Home, Matter e Signature nunca duplicam título, preço, código ou disponibilidade do produto.
