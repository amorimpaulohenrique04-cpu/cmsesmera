import {useMemo, useState} from 'react'
import {useClient} from 'sanity'
import styled from 'styled-components'
import {esmeraTokens as t} from '../../studio/esmeraTokens'
import {Card, CardSub, CardTitle, Chip, Chips, DetailPanel, Divider, Empty, Header, InfoGrid, InfoLabel, InfoValue, MaterialIcon, Page, Pill, RowMeta, RowTitle, SearchBox, SearchInput, Shell, Split, Subtitle, Thumb, Title, Toolbar} from '../stitch/StitchUI'
import {API_VERSION, ErrorState, LoadingState, PrimaryIntentAction, SecondaryIntentAction, useQueryState} from './shared'

const CategoryButton = styled.button<{$selected?: boolean}>`
  display: block;
  width: 100%;
  border: 1px solid ${t.color.line};
  border-radius: ${t.radius.card}px;
  background: ${({$selected}) => ($selected ? t.color.surfaceLow : t.color.surfaceLowest)};
  color: ${t.color.ink};
  padding: 16px;
  text-align: left;
  cursor: pointer;
  &:hover { background: ${t.color.surfaceLow}; }
`

type Category = {_id: string; title?: string; slug?: string; status?: string; description?: string; order?: number; image?: string; alt?: string; productCount: number}
const QUERY = `*[_type == "category"] | order(order asc, title asc){
  _id,title,"slug":slug.current,status,description,order,
  "image":image.asset->url,"alt":coalesce(image.alt,title),
  "productCount":count(*[_type == "product" && references(^._id) && !(_id in path("drafts.**"))])
}`

export function SiteCategoriesPage() {
  const client = useClient({apiVersion: API_VERSION})
  const query = useQueryState<Category[]>(client, QUERY, {}, (items) => items.length === 0)
  const [selected, setSelected] = useState('')
  const [q, setQ] = useState('')

  if (query.state.status === 'loading') return <Page><Shell><Header><div><Title>Categorias</Title><Subtitle>Organize o catálogo e a navegação do site.</Subtitle></div></Header><LoadingState /></Shell></Page>
  if (query.state.status === 'error') return <Page><Shell><Header><div><Title>Categorias</Title><Subtitle>Organize o catálogo e a navegação do site.</Subtitle></div></Header><ErrorState code={query.state.code} detail={query.state.message} onRetry={query.retry} /></Shell></Page>

  const categories = query.state.data
  const filtered = useMemo(() => categories.filter((item) => (item.title || '').toLowerCase().includes(q.toLowerCase())), [categories, q])
  const category = categories.find((item) => item._id === selected) || filtered[0]

  return (
    <Page><Shell>
      <Header><div><Title>Categorias</Title><Subtitle>Organize o catálogo e a navegação do site.</Subtitle></div><PrimaryIntentAction type="category"><MaterialIcon>add_circle</MaterialIcon>Nova categoria</PrimaryIntentAction></Header>
      <Toolbar><SearchBox><MaterialIcon>search</MaterialIcon><SearchInput value={q} onChange={(event) => setQ(event.target.value)} placeholder="Buscar categoria..." /></SearchBox><Chips><Chip>Ativos {categories.filter((item) => item.status === 'active').length}</Chip><Chip>Inativos {categories.filter((item) => item.status === 'archive').length}</Chip><Chip><MaterialIcon>swap_vert</MaterialIcon>Ordem Editorial</Chip></Chips></Toolbar>
      <Split>
        <div style={{display: 'grid', gap: 10}}>{filtered.map((item) => <CategoryButton key={item._id} type="button" $selected={item._id === category?._id} aria-pressed={item._id === category?._id} onClick={() => setSelected(item._id)}><div style={{display: 'flex', alignItems: 'center', gap: 12}}><Thumb>{item.image ? <img src={item.image} alt={item.alt || item.title || 'Categoria Esméra'} /> : <MaterialIcon>category</MaterialIcon>}</Thumb><div style={{flex: 1}}><RowTitle>{item.title || 'Categoria sem título'}</RowTitle><RowMeta>{item.productCount} produtos · /{item.slug || 'sem-slug'}</RowMeta></div><Pill $tone={item.status === 'active' ? 'green' : 'neutral'}>{item.status === 'active' ? 'Ativa' : 'Arquivada'}</Pill><span style={{fontFamily: t.typography.headline, fontWeight: 700, color: t.color.lineStrong}}>{String(item.order ?? 0).padStart(2, '0')}</span></div></CategoryButton>)}</div>
        {category ? <DetailPanel><div style={{display: 'flex', justifyContent: 'space-between', gap: 12}}><div><Pill $tone={category.status === 'active' ? 'green' : 'neutral'}>{category.status === 'active' ? 'Categoria ativa' : 'Arquivada'}</Pill><CardTitle style={{fontSize: 24, marginTop: 10}}>{category.title}</CardTitle><CardSub>/{category.slug}</CardSub></div><SecondaryIntentAction type="category" id={category._id}><MaterialIcon>edit</MaterialIcon>Editar</SecondaryIntentAction></div>{category.image ? <div style={{height: 200, marginTop: 18, borderRadius: 12, overflow: 'hidden'}}><img src={category.image} alt={category.alt || category.title || 'Categoria Esméra'} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></div> : null}<Divider /><InfoGrid><div><InfoLabel>Produtos</InfoLabel><InfoValue>{category.productCount}</InfoValue></div><div><InfoLabel>Ordem editorial</InfoLabel><InfoValue>{category.order ?? '—'}</InfoValue></div></InfoGrid><Divider /><InfoLabel>Descrição</InfoLabel><InfoValue>{category.description || 'Sem descrição cadastrada.'}</InfoValue></DetailPanel> : <Empty>Selecione uma categoria.</Empty>}
      </Split>
    </Shell></Page>
  )
}
