import {useState} from 'react'
import {useClient} from 'sanity'
import styled from 'styled-components'
import {esmeraTokens as t} from '../../studio/esmeraTokens'
import {Card, CardHeader, CardSub, CardTitle, Chip, Chips, DetailPanel, Divider, Empty, Grid, Header, IconTile, InfoGrid, InfoLabel, InfoValue, MaterialIcon, Page, Pill, RowMeta, RowTitle, SearchBox, SearchInput, Shell, Subtitle, Timeline, TimelineItem, Title, Toolbar, dateBR, money} from '../stitch/StitchUI'
import {API_VERSION, ErrorState, LoadingState, PrimaryIntentAction, SecondaryIntentAction, useQueryState} from './shared'

const CustomerList = styled.div`display: grid; gap: 8px;`
const CustomerItem = styled.button<{$selected?: boolean}>`
  display: flex;
  width: 100%;
  min-height: 82px;
  align-items: center;
  gap: 12px;
  border: 1px solid ${t.color.line};
  border-radius: 12px;
  background: ${({$selected}) => ($selected ? t.color.surfaceLow : t.color.surfaceLowest)};
  color: ${t.color.ink};
  padding: 12px;
  text-align: left;
  cursor: pointer;
  &:hover { background: ${t.color.surfaceLow}; }
`
const Initial = styled.div`
  display: grid;
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  place-items: center;
  border-radius: 50%;
  background: ${t.color.primarySoft};
  color: ${t.color.primary};
  font-family: ${t.typography.headline};
  font-size: 14px;
  font-weight: 700;
`
const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(260px, .65fr) minmax(0, 1.35fr) minmax(290px, .62fr);
  gap: 18px;
  align-items: start;
  @media (max-width: 1200px) { grid-template-columns: 320px 1fr; > *:last-child { grid-column: 1 / -1; } }
  @media (max-width: 800px) { grid-template-columns: 1fr; }
`

type Customer = {_id: string; name?: string; phone?: string; email?: string; city?: string; state?: string; preferences?: string[]; tags?: string[]; relationshipNotes?: string; salesCount?: number; sourceLead?: {source?: string}}
type Sale = {_id: string; number?: string; status?: string; totalCents?: number; _createdAt?: string}

const CUSTOMERS_QUERY = `*[_type == "customer"] | order(_updatedAt desc){
  _id,name,phone,email,city,state,preferences,tags,relationshipNotes,
  "sourceLead":sourceLead->{source},
  "salesCount":count(*[_type == "sale" && customer._ref == ^._id && status in ["confirmed","production","ready","delivered"]])
}`
const SALES_QUERY = `*[_type == "sale" && customer._ref == $id] | order(_createdAt desc)[0...5]{_id,number,status,totalCents,_createdAt}`

function initials(name?: string) {
  return (name || 'ES').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

export function CustomersPage() {
  const client = useClient({apiVersion: API_VERSION})
  const customersQuery = useQueryState<Customer[]>(client, CUSTOMERS_QUERY, {}, (items) => items.length === 0)
  const [selected, setSelected] = useState('')
  const [q, setQ] = useState(() => new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search).get('search') || '')

  const customers = customersQuery.state.status === 'ready' || customersQuery.state.status === 'empty'
    ? customersQuery.state.data
    : []
  const filtered = customers.filter((customer) => `${customer.name || ''} ${customer.phone || ''} ${customer.email || ''} ${(customer.tags || []).join(' ')}`.toLowerCase().includes(q.toLowerCase()))
  const customer = customers.find((item) => item._id === selected) || filtered[0]
  const selectedId = customer?._id || '__none__'
  const salesQuery = useQueryState<Sale[]>(client, SALES_QUERY, {id: selectedId})
  const sales = salesQuery.state.status === 'ready' || salesQuery.state.status === 'empty' ? salesQuery.state.data : []

  if (customersQuery.state.status === 'loading') return <Page><Shell><Header><div><Title>Clientes</Title><Subtitle>Relacionamento, histórico e oportunidades em uma única tela.</Subtitle></div></Header><LoadingState /></Shell></Page>
  if (customersQuery.state.status === 'error') return <Page><Shell><Header><div><Title>Clientes</Title><Subtitle>Relacionamento, histórico e oportunidades em uma única tela.</Subtitle></div></Header><ErrorState code={customersQuery.state.code} detail={customersQuery.state.message} onRetry={customersQuery.retry} /></Shell></Page>

  return (
    <Page><Shell>
      <Header><div><Title>Clientes</Title><Subtitle>Relacionamento, histórico e oportunidades em uma única tela.</Subtitle></div><PrimaryIntentAction type="customer"><MaterialIcon>person_add</MaterialIcon>Novo cliente</PrimaryIntentAction></Header>
      <Toolbar><SearchBox><MaterialIcon>search</MaterialIcon><SearchInput value={q} onChange={(event) => setQ(event.target.value)} placeholder="Buscar por nome, telefone, e-mail ou tag..." /></SearchBox><Chips><Chip>{customers.length} contatos</Chip><Chip>{customers.reduce((sum, item) => sum + (item.salesCount || 0), 0)} compras registradas</Chip></Chips></Toolbar>
      <Layout>
        <Card><CardHeader><div><CardTitle>Clientes</CardTitle><CardSub>Cadastro e relacionamento</CardSub></div></CardHeader><CustomerList>{filtered.map((item) => <CustomerItem key={item._id} type="button" $selected={item._id === customer?._id} aria-pressed={item._id === customer?._id} onClick={() => setSelected(item._id)}><Initial>{initials(item.name)}</Initial><div style={{minWidth: 0, flex: 1}}><RowTitle>{item.name || 'Cliente sem nome'}</RowTitle><RowMeta>{item.phone || item.email || 'Sem contato'} · {item.salesCount || 0} compras</RowMeta></div><Pill $tone={(item.salesCount || 0) > 0 ? 'green' : 'blue'}>{(item.salesCount || 0) > 0 ? 'Cliente' : 'Novo'}</Pill></CustomerItem>)}</CustomerList>{!filtered.length ? <Empty>Nenhum cliente encontrado.</Empty> : null}</Card>

        {customer ? <Card><CardHeader><div style={{display: 'flex', alignItems: 'center', gap: 12}}><Initial style={{width: 54, height: 54, flexBasis: 54}}>{initials(customer.name)}</Initial><div><CardTitle>{customer.name || 'Cliente'}</CardTitle><CardSub>{[customer.city, customer.state].filter(Boolean).join(' · ') || 'Relacionamento Esméra'}</CardSub></div></div><SecondaryIntentAction type="customer" id={customer._id}><MaterialIcon>edit</MaterialIcon>Editar</SecondaryIntentAction></CardHeader>
          <InfoGrid><div><InfoLabel>Telefone</InfoLabel><InfoValue>{customer.phone || '—'}</InfoValue></div><div><InfoLabel>E-mail</InfoLabel><InfoValue>{customer.email || '—'}</InfoValue></div><div><InfoLabel>Compras</InfoLabel><InfoValue>{customer.salesCount || 0}</InfoValue></div><div><InfoLabel>Origem</InfoLabel><InfoValue>{customer.sourceLead?.source || '—'}</InfoValue></div></InfoGrid>
          <Divider /><InfoLabel>Interesse atual</InfoLabel><Chips style={{marginTop: 10}}>{customer.preferences?.length ? customer.preferences.map((preference) => <Chip key={preference}>{preference}</Chip>) : <Chip>Sem preferências registradas</Chip>}</Chips><CardSub style={{marginTop: 14}}>{customer.relationshipNotes || 'Adicione notas de relacionamento para manter o contexto comercial.'}</CardSub>
          <Divider /><CardTitle style={{fontSize: 16}}>Histórico de vendas</CardTitle>{salesQuery.state.status === 'loading' ? <CardSub style={{marginTop: 12}}>Carregando histórico...</CardSub> : salesQuery.state.status === 'error' ? <CardSub style={{marginTop: 12}}>Histórico indisponível.</CardSub> : <Timeline style={{marginTop: 16}}>{sales.length ? sales.map((sale) => <TimelineItem key={sale._id}><RowTitle>Venda #{sale.number || '—'} · {money(sale.totalCents)}</RowTitle><RowMeta>{dateBR(sale._createdAt)} · {sale.status || 'status não definido'}</RowMeta></TimelineItem>) : <TimelineItem><RowTitle>Nenhuma venda registrada</RowTitle><RowMeta>O histórico comercial aparecerá aqui.</RowMeta></TimelineItem>}</Timeline>}
        </Card> : <Empty>Selecione um cliente.</Empty>}

        <DetailPanel><CardTitle style={{fontSize: 17}}>Próxima Ação</CardTitle><Divider /><div style={{display: 'flex', alignItems: 'center', gap: 12}}><IconTile><MaterialIcon>event</MaterialIcon></IconTile><div><InfoLabel>Relacionamento</InfoLabel><InfoValue>{customer ? 'Registrar próximo contato' : 'Selecione um cliente'}</InfoValue></div></div><CardSub style={{marginTop: 14}}>Use tarefas e leads para agendar o próximo contato e manter o histórico rastreável.</CardSub><div style={{marginTop: 18}}><PrimaryIntentAction type="task"><MaterialIcon>add_task</MaterialIcon>Criar tarefa</PrimaryIntentAction></div><Divider /><CardTitle style={{fontSize: 16}}>Atalhos Rápidos</CardTitle><Grid $cols={2} style={{gap: 8, marginTop: 12}}><SecondaryIntentAction type="sale"><MaterialIcon>attach_money</MaterialIcon>Venda</SecondaryIntentAction><SecondaryIntentAction type="task"><MaterialIcon>add_task</MaterialIcon>Tarefa</SecondaryIntentAction><SecondaryIntentAction type="lead"><MaterialIcon>person_add</MaterialIcon>Lead</SecondaryIntentAction>{customer ? <SecondaryIntentAction type="customer" id={customer._id}><MaterialIcon>sticky_note</MaterialIcon>Notas</SecondaryIntentAction> : null}</Grid></DetailPanel>
      </Layout>
    </Shell></Page>
  )
}
