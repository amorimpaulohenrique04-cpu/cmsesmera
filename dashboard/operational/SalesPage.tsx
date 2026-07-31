import {useMemo, useState} from 'react'
import {useClient} from 'sanity'
import styled from 'styled-components'
import {esmeraTokens as t} from '../../studio/esmeraTokens'
import {Card, CardHeader, CardSub, CardTitle, Chip, Chips, DetailPanel, Divider, Empty, Header, IconTile, InfoGrid, InfoLabel, InfoValue, MaterialIcon, Page, Pill, RowMeta, RowTitle, SearchBox, SearchInput, Shell, StatCard, StatGrid, StatLabel, StatTop, StatValue, Subtitle, Timeline, TimelineItem, Title, Toolbar, dateBR, money} from '../stitch/StitchUI'
import {API_VERSION, ErrorState, KpiMeta, LoadingState, PrimaryIntentAction, SecondaryIntentAction, formatUpdatedAt, useQueryState} from './shared'

const Layout = styled.div`display: grid; grid-template-columns: minmax(300px,.78fr) minmax(0,1.22fr); gap: 18px; align-items: start; @media(max-width:980px){grid-template-columns:1fr}`
const SaleList = styled.div`display: grid; gap: 10px;`
const SaleItem = styled.button<{$selected?: boolean}>`
  display: block; width: 100%; border: 1px solid ${t.color.line}; border-radius: 12px;
  background: ${({$selected}) => ($selected ? t.color.surfaceLow : t.color.surfaceLowest)};
  color: ${t.color.ink}; padding: 15px; text-align: left; cursor: pointer;
  &:hover { background: ${t.color.surfaceLow}; }
`
const Progress = styled.div`display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-top: 12px;`
const ProgressStep = styled.div<{$active?: boolean}>`height: 6px; border-radius: 999px; background: ${({$active}) => ($active ? t.color.primary : t.color.surfaceHighest)};`

type Sale = {
  _id: string
  number?: string
  status?: string
  channel?: string
  owner?: string
  nextAction?: string
  nextActionAt?: string
  totalCents?: number
  customer?: {_id?: string; name?: string; phone?: string}
  items?: {snapshotTitle?: string; snapshotSelection?: string; quantity?: number; unitPriceCents?: number; priceMode?: string}[]
  createdAt?: string
  updatedAt?: string
}

const QUERY = `*[_type == "sale"] | order(_updatedAt desc){
  _id,number,status,channel,owner,nextAction,nextActionAt,totalCents,
  "createdAt":_createdAt,"updatedAt":_updatedAt,
  "customer":customer->{_id,name,phone},
  items[]{snapshotTitle,snapshotSelection,quantity,unitPriceCents,priceMode}
}`

const statusLabel: Record<string, string> = {
  draft: 'Novo', proposal: 'Proposta enviada', negotiation: 'Negociação', confirmed: 'Confirmada',
  production: 'Em produção', ready: 'Pronta entrega', delivered: 'Concluída', cancelled: 'Cancelada',
}
const flow = ['draft', 'proposal', 'negotiation', 'confirmed', 'delivered']

export function SalesPage() {
  const client = useClient({apiVersion: API_VERSION})
  const query = useQueryState<Sale[]>(client, QUERY, {}, (items) => items.length === 0)
  const [selected, setSelected] = useState('')
  const [q, setQ] = useState(() => new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search).get('search') || '')

  if (query.state.status === 'loading') return <Page><Shell><Header><div><Title>Vendas</Title><Subtitle>Negociações, pedidos e acompanhamento comercial.</Subtitle></div></Header><LoadingState /></Shell></Page>
  if (query.state.status === 'error') return <Page><Shell><Header><div><Title>Vendas</Title><Subtitle>Negociações, pedidos e acompanhamento comercial.</Subtitle></div></Header><ErrorState code={query.state.code} detail={query.state.message} onRetry={query.retry} /></Shell></Page>

  const sales = query.state.data
  const filtered = useMemo(() => sales.filter((sale) => `${sale.number || ''} ${sale.customer?.name || ''} ${sale.items?.[0]?.snapshotTitle || ''}`.toLowerCase().includes(q.toLowerCase())), [sales, q])
  const sale = sales.find((item) => item._id === selected) || filtered[0]
  const open = sales.filter((item) => !['delivered', 'cancelled'].includes(item.status || '')).length
  const proposals = sales.filter((item) => item.status === 'proposal').length
  const waiting = sales.filter((item) => ['proposal', 'negotiation'].includes(item.status || '')).length
  const closed = sales.filter((item) => item.status === 'delivered').length
  const openValue = sales.filter((item) => !['delivered', 'cancelled'].includes(item.status || '')).reduce((sum, item) => sum + (item.totalCents || 0), 0)
  const updated = formatUpdatedAt(query.state.updatedAt)

  return (
    <Page><Shell>
      <Header><div><Title>Vendas</Title><Subtitle>Negociações, pedidos e acompanhamento comercial.</Subtitle></div><div style={{display:'flex',gap:8,flexWrap:'wrap'}}><a href="/business/cms/pipeline" style={{display:'inline-flex',minHeight:40,alignItems:'center',gap:8,border:`1px solid ${t.color.line}`,borderRadius:8,color:t.color.ink,padding:'0 16px',fontSize:13,fontWeight:600,textDecoration:'none'}}><MaterialIcon>view_kanban</MaterialIcon>Visão Pipeline</a><PrimaryIntentAction type="sale"><MaterialIcon>add</MaterialIcon>Nova venda</PrimaryIntentAction></div></Header>
      <StatGrid>
        <StatCard><StatTop><IconTile><MaterialIcon>handshake</MaterialIcon></IconTile><Pill $tone="green">Abertas</Pill></StatTop><div><StatLabel>Em negociação</StatLabel><StatValue>{open}</StatValue><KpiMeta>Fonte: business · exclui concluídas/canceladas · {updated}</KpiMeta></div></StatCard>
        <StatCard><StatTop><IconTile $tone="blue"><MaterialIcon>description</MaterialIcon></IconTile><Pill $tone="blue">Proposta</Pill></StatTop><div><StatLabel>Propostas enviadas</StatLabel><StatValue>{proposals}</StatValue><KpiMeta>status = proposal · {updated}</KpiMeta></div></StatCard>
        <StatCard><StatTop><IconTile $tone="red"><MaterialIcon>schedule</MaterialIcon></IconTile><Pill $tone="red">Atenção</Pill></StatTop><div><StatLabel>Aguardando cliente</StatLabel><StatValue>{waiting}</StatValue><KpiMeta>proposal + negotiation · {updated}</KpiMeta></div></StatCard>
        <StatCard><StatTop><IconTile><MaterialIcon>check_circle</MaterialIcon></IconTile><Pill $tone="green">Concluídas</Pill></StatTop><div><StatLabel>Vendas concluídas</StatLabel><StatValue>{closed}</StatValue><KpiMeta>status = delivered · {updated}</KpiMeta></div></StatCard>
      </StatGrid>
      <Card style={{marginBottom:20,padding:'16px 20px'}}><div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,flexWrap:'wrap'}}><div><StatLabel>Valor em negociação</StatLabel><StatValue style={{fontSize:22}}>{money(openValue)}</StatValue></div><CardSub>Somatório dos registros abertos com valor informado.</CardSub></div></Card>
      <Toolbar><SearchBox><MaterialIcon>search</MaterialIcon><SearchInput value={q} onChange={(event)=>setQ(event.target.value)} placeholder="Buscar venda, cliente ou produto..." /></SearchBox><Chips><Chip>{sales.length} vendas</Chip><Chip>{open} abertas</Chip></Chips></Toolbar>
      <Layout>
        <Card><CardHeader><CardTitle style={{fontSize:17}}>Listagem</CardTitle><Pill>{filtered.length}</Pill></CardHeader><SaleList>{filtered.map((item)=><SaleItem key={item._id} type="button" $selected={item._id===sale?._id} aria-pressed={item._id===sale?._id} onClick={()=>setSelected(item._id)}><div style={{display:'flex',justifyContent:'space-between',gap:8}}><Pill $tone="blue">#{item.number||'—'}</Pill><Pill $tone={item.status==='delivered'?'green':item.status==='cancelled'?'red':'sand'}>{statusLabel[item.status||'']||item.status||'—'}</Pill></div><RowTitle style={{marginTop:10}}>{item.customer?.name||'Sem cliente'}</RowTitle><RowMeta>{item.items?.[0]?.snapshotTitle||'Venda Esméra'} · {item.channel||'canal não definido'}</RowMeta><div style={{marginTop:10,fontWeight:700}}>{money(item.totalCents)}</div></SaleItem>)}</SaleList>{!filtered.length?<Empty>Nenhuma venda encontrada.</Empty>:null}</Card>
        {sale?<DetailPanel><div style={{display:'flex',justifyContent:'space-between',gap:12}}><div><Pill $tone="blue">#{sale.number||'—'}</Pill><CardTitle style={{fontSize:24,marginTop:10}}>{sale.customer?.name||'Venda Esméra'}</CardTitle><CardSub>{sale.customer?.phone||sale.channel||'Relacionamento comercial'}</CardSub></div><SecondaryIntentAction type="sale" id={sale._id}><MaterialIcon>edit</MaterialIcon>Editar</SecondaryIntentAction></div>
          <Divider/><CardTitle style={{fontSize:16}}>Produtos Selecionados</CardTitle><div style={{display:'grid',gap:10,marginTop:12}}>{sale.items?.length?sale.items.map((item,index)=><div key={`${item.snapshotTitle}-${index}`} style={{display:'flex',justifyContent:'space-between',gap:12,borderBottom:`1px solid ${t.color.line}`,paddingBottom:10}}><div><RowTitle>{item.snapshotTitle||'Produto'}</RowTitle><RowMeta>{item.snapshotSelection||`${item.quantity||1} unidade(s)`}</RowMeta></div><strong>{item.priceMode==='fixed'?money((item.unitPriceCents||0)*(item.quantity||1)):'Sob consulta'}</strong></div>):<CardSub>Nenhum item cadastrado.</CardSub>}</div>
          <Divider/><CardTitle style={{fontSize:16}}>Status da Venda</CardTitle><Pill $tone={sale.status==='delivered'?'green':sale.status==='cancelled'?'red':'sand'} style={{marginTop:10}}>{statusLabel[sale.status||'']||sale.status||'—'}</Pill><Progress>{flow.map((step)=><ProgressStep key={step} $active={flow.indexOf(step)<=Math.max(0,flow.indexOf(sale.status||''))}/>)}</Progress>
          <Divider/><CardTitle style={{fontSize:16}}>Próxima Ação</CardTitle><InfoGrid style={{marginTop:12}}><div><InfoLabel>Ação</InfoLabel><InfoValue>{sale.nextAction||'Não definida'}</InfoValue></div><div><InfoLabel>Prazo</InfoLabel><InfoValue>{dateBR(sale.nextActionAt)}</InfoValue></div><div><InfoLabel>Responsável</InfoLabel><InfoValue>{sale.owner||'Não definido'}</InfoValue></div><div><InfoLabel>Canal</InfoLabel><InfoValue>{sale.channel||'—'}</InfoValue></div></InfoGrid>
          <Divider/><CardTitle style={{fontSize:16}}>Histórico</CardTitle><Timeline style={{marginTop:14}}><TimelineItem><RowTitle>Venda criada</RowTitle><RowMeta>{dateBR(sale.createdAt)}</RowMeta></TimelineItem><TimelineItem><RowTitle>Última atualização</RowTitle><RowMeta>{dateBR(sale.updatedAt)}</RowMeta></TimelineItem></Timeline>
        </DetailPanel>:<Empty>Selecione uma venda.</Empty>}
      </Layout>
    </Shell></Page>
  )
}
