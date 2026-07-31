import {useMemo, useState} from 'react'
import {useClient} from 'sanity'
import styled from 'styled-components'
import {esmeraTokens as t} from '../../studio/esmeraTokens'
import {
  CardSub,
  CardTitle,
  Chip,
  Chips,
  DetailPanel,
  Divider,
  Empty,
  Grid,
  Header,
  HeaderActions,
  InfoGrid,
  InfoLabel,
  InfoValue,
  MaterialIcon,
  Page,
  Pill,
  RowMain,
  RowMeta,
  RowTitle,
  SearchBox,
  SearchInput,
  Shell,
  Subtitle,
  Thumb,
  Title,
  Toolbar,
  money,
} from '../stitch/StitchUI'
import {
  API_VERSION,
  ErrorState,
  LoadingState,
  PrimaryIntentAction,
  SecondaryIntentAction,
  useQueryState,
} from './shared'

const ProductTable = styled.div`
  overflow: hidden;
  border: 1px solid ${t.color.line};
  border-radius: ${t.radius.card}px;
  background: ${t.color.surfaceLowest};
`

const ProductRow = styled.button<{$selected?: boolean}>`
  display: grid;
  width: 100%;
  grid-template-columns: minmax(0, 1.5fr) minmax(120px, .7fr) minmax(110px, .55fr) minmax(90px, .45fr);
  gap: 16px;
  align-items: center;
  min-height: 72px;
  border: 0;
  border-bottom: 1px solid ${t.color.line};
  background: ${({$selected}) => ($selected ? t.color.surfaceLow : t.color.surfaceLowest)};
  color: ${t.color.ink};
  padding: 12px 16px;
  text-align: left;
  cursor: pointer;

  &:last-child { border-bottom: 0; }
  &:hover { background: ${t.color.surfaceLow}; }
  &:focus-visible { position: relative; z-index: 1; }

  @media (max-width: 760px) {
    grid-template-columns: 1fr auto;
    > *:nth-child(2), > *:nth-child(3) { display: none; }
  }
`

const CatalogLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, .7fr);
  gap: 24px;
  align-items: start;
  @media (max-width: 980px) { grid-template-columns: 1fr; }
`

const FilterButton = styled.button<{$active?: boolean}>`
  display: inline-flex;
  min-height: 38px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border: 1px solid ${t.color.line};
  border-radius: ${t.radius.control}px;
  background: ${({$active}) => ($active ? t.color.surfaceContainer : t.color.surfaceLowest)};
  color: ${t.color.ink};
  padding: 0 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
`

const Select = styled.select`
  height: 38px;
  border: 1px solid ${t.color.line};
  border-radius: ${t.radius.control}px;
  background: ${t.color.surfaceLowest};
  color: ${t.color.ink};
  padding: 0 34px 0 12px;
  font-size: 13px;
  font-weight: 600;
`

type Product = {
  _id: string
  title?: string
  code?: string
  status?: string
  availability?: string
  material?: string
  subtitle?: string
  priceMode?: string
  basePriceCents?: number
  category?: string
  image?: string
  alt?: string
  updated?: string
  draft?: boolean
}

const PRODUCTS_QUERY = `*[_type == "product"] | order(_updatedAt desc){
  _id,
  title,
  code,
  status,
  availability,
  material,
  subtitle,
  priceMode,
  basePriceCents,
  "category": categories[0]->title,
  "image": coalesce(gallery[role == "cover"][0].asset->url, gallery[0].asset->url),
  "alt": coalesce(gallery[role == "cover"][0].alt, gallery[0].alt, title),
  "updated": _updatedAt,
  "draft": _id in path("drafts.**")
}`

function canonicalId(id: string) {
  return id.replace(/^drafts\./, '')
}

export function SiteProductsPage() {
  const client = useClient({apiVersion: API_VERSION})
  const productsQuery = useQueryState<Product[]>(client, PRODUCTS_QUERY, {}, (items) => items.length === 0)
  const [selected, setSelected] = useState('')
  const [q, setQ] = useState(() => new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search).get('search') || '')
  const [status, setStatus] = useState<'all' | 'active' | 'draft' | 'archive'>('all')
  const [sort, setSort] = useState<'updated' | 'title' | 'price'>('updated')

  const products = useMemo(() => {
    if (productsQuery.state.status === 'loading' || productsQuery.state.status === 'error') return []
    const map = new Map<string, Product>()
    for (const product of productsQuery.state.data) {
      const id = canonicalId(product._id)
      const current = map.get(id)
      if (!current || product.draft) map.set(id, product)
    }
    return [...map.values()]
  }, [productsQuery.state])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const result = products.filter((product) => {
      const matchesText = !needle || `${product.title || ''} ${product.code || ''} ${product.category || ''}`.toLowerCase().includes(needle)
      const matchesStatus =
        status === 'all' ||
        (status === 'draft' ? Boolean(product.draft) || product.status === 'draft' : product.status === status)
      return matchesText && matchesStatus
    })

    return [...result].sort((a, b) => {
      if (sort === 'title') return (a.title || '').localeCompare(b.title || '', 'pt-BR')
      if (sort === 'price') return (b.basePriceCents || 0) - (a.basePriceCents || 0)
      return String(b.updated || '').localeCompare(String(a.updated || ''))
    })
  }, [products, q, sort, status])

  const selectedProduct = products.find((product) => canonicalId(product._id) === selected) || filtered[0]
  const selectedId = selectedProduct ? canonicalId(selectedProduct._id) : ''
  const counts = {
    active: products.filter((item) => item.status === 'active' && !item.draft).length,
    inquiry: products.filter((item) => item.priceMode === 'inquiry').length,
    draft: products.filter((item) => item.draft || item.status === 'draft').length,
    archive: products.filter((item) => item.status === 'archive').length,
  }

  if (productsQuery.state.status === 'loading') {
    return <Page><Shell><Header><div><Title>Produtos</Title><Subtitle>Gerencie o catálogo central da Esméra.</Subtitle></div></Header><LoadingState /></Shell></Page>
  }
  if (productsQuery.state.status === 'error') {
    return <Page><Shell><Header><div><Title>Produtos</Title><Subtitle>Gerencie o catálogo central da Esméra.</Subtitle></div></Header><ErrorState code={productsQuery.state.code} detail={productsQuery.state.message} onRetry={productsQuery.retry} /></Shell></Page>
  }

  return (
    <Page>
      <Shell>
        <Header>
          <div><Title>Produtos</Title><Subtitle>Gerencie o catálogo central da Esméra.</Subtitle></div>
          <HeaderActions><PrimaryIntentAction type="product"><MaterialIcon>add</MaterialIcon>+ Novo produto</PrimaryIntentAction></HeaderActions>
        </Header>

        <Toolbar>
          <SearchBox><MaterialIcon>search</MaterialIcon><SearchInput value={q} onChange={(event) => setQ(event.target.value)} placeholder="Buscar produtos..." /></SearchBox>
          <div style={{display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap'}}>
            <FilterButton $active={status !== 'all'} onClick={() => setStatus((current) => current === 'all' ? 'active' : 'all')} type="button"><MaterialIcon>filter_list</MaterialIcon>{status === 'all' ? 'Filtros' : 'Ativos'}</FilterButton>
            <Select aria-label="Ordenar produtos" value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}>
              <option value="updated">Mais recentes</option>
              <option value="title">Nome A–Z</option>
              <option value="price">Maior preço</option>
            </Select>
          </div>
        </Toolbar>

        <Chips style={{marginBottom: 20}}>
          <Chip>Catálogo Total <strong>{products.length}</strong></Chip>
          <Chip>Ativos <strong>{counts.active}</strong></Chip>
          <Chip>Sob consulta <strong>{counts.inquiry}</strong></Chip>
          <Chip>Rascunhos <strong>{counts.draft}</strong></Chip>
          <Chip>Arquivados <strong>{counts.archive}</strong></Chip>
        </Chips>

        <CatalogLayout>
          <div>
            <ProductTable role="listbox" aria-label="Produtos">
              {filtered.map((item) => {
                const id = canonicalId(item._id)
                return (
                  <ProductRow key={item._id} type="button" role="option" aria-selected={id === selectedId} $selected={id === selectedId} onClick={() => setSelected(id)}>
                    <RowMain>
                      <Thumb>{item.image ? <img src={item.image} alt={item.alt || item.title || 'Produto Esméra'} /> : <MaterialIcon>inventory_2</MaterialIcon>}</Thumb>
                      <div><RowTitle>{item.title || 'Produto sem título'}</RowTitle><RowMeta>{item.code || 'Sem código'} · {item.category || 'Sem categoria'}</RowMeta></div>
                    </RowMain>
                    <div>{item.category || '—'}</div>
                    <div>{item.priceMode === 'fixed' ? money(item.basePriceCents) : 'Sob consulta'}</div>
                    <Pill $tone={item.draft ? 'sand' : item.status === 'active' ? 'green' : item.status === 'archive' ? 'neutral' : 'sand'}>{item.draft ? 'Rascunho' : item.status === 'active' ? 'Ativo' : item.status === 'archive' ? 'Arquivado' : 'Rascunho'}</Pill>
                  </ProductRow>
                )
              })}
            </ProductTable>
            {!filtered.length ? <Empty style={{marginTop: 16}}>Nenhum produto encontrado com os filtros atuais.</Empty> : null}
          </div>

          {selectedProduct ? (
            <DetailPanel>
              <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14}}>
                <div><Pill $tone="green">Produto Selecionado</Pill><CardTitle style={{fontSize: 24, lineHeight: '32px', marginTop: 10}}>{selectedProduct.title || 'Produto sem título'}</CardTitle><CardSub>{selectedProduct.code || 'Sem código'}</CardSub></div>
                <a href={`/site/cms/product/${encodeURIComponent(selectedId)}`} aria-label="Editar produto" style={{display: 'grid', width: 40, height: 40, placeItems: 'center', border: `1px solid ${t.color.line}`, borderRadius: 8, color: t.color.ink, textDecoration: 'none'}}><MaterialIcon>edit</MaterialIcon></a>
              </div>
              {selectedProduct.image ? <div style={{height: 220, overflow: 'hidden', borderRadius: 12, marginTop: 18, background: t.color.surfaceLow}}><img src={selectedProduct.image} alt={selectedProduct.alt || selectedProduct.title || 'Produto Esméra'} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></div> : null}
              <Divider />
              <CardTitle style={{fontSize: 16}}>Informações Básicas</CardTitle>
              <InfoGrid style={{marginTop: 16}}>
                <div><InfoLabel>Disponibilidade</InfoLabel><InfoValue>{selectedProduct.availability || '—'}</InfoValue></div>
                <div><InfoLabel>Material</InfoLabel><InfoValue>{selectedProduct.material || '—'}</InfoValue></div>
                <div><InfoLabel>Preço</InfoLabel><InfoValue>{selectedProduct.priceMode === 'fixed' ? money(selectedProduct.basePriceCents) : 'Sob consulta'}</InfoValue></div>
                <div><InfoLabel>Categoria</InfoLabel><InfoValue>{selectedProduct.category || '—'}</InfoValue></div>
              </InfoGrid>
              <Divider />
              <CardTitle style={{fontSize: 16}}>Gestão de Seções</CardTitle>
              <Grid $cols={2} style={{gap: 8, marginTop: 12}}>
                {[
                  ['collections', 'Galeria'],
                  ['layers', 'Variantes'],
                  ['sell', 'Preço'],
                  ['travel_explore', 'SEO'],
                ].map(([icon, label]) => (
                  <a key={label} href={`/site/cms/product/${encodeURIComponent(selectedId)}`} style={{display: 'inline-flex', minHeight: 38, alignItems: 'center', justifyContent: 'center', gap: 7, border: `1px solid ${t.color.line}`, borderRadius: 8, background: t.color.surfaceLowest, color: t.color.ink, padding: '0 14px', fontSize: 13, fontWeight: 600, textDecoration: 'none'}}><MaterialIcon>{icon}</MaterialIcon>{label}</a>
                ))}
              </Grid>
              <Divider />
              <SecondaryIntentAction type="product" id={selectedId}><MaterialIcon>settings</MaterialIcon>Editar campos avançados</SecondaryIntentAction>
            </DetailPanel>
          ) : <Empty>Selecione um produto.</Empty>}
        </CatalogLayout>
      </Shell>
    </Page>
  )
}
