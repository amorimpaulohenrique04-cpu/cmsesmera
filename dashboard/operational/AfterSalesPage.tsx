import {useMemo, useState} from 'react'
import {useClient} from 'sanity'
import styled from 'styled-components'
import {esmeraTokens as t} from '../../studio/esmeraTokens'
import {Card, CardHeader, CardSub, CardTitle, Chip, Chips, DetailPanel, Divider, Empty, Header, HeaderActions, InfoGrid, InfoLabel, InfoValue, MaterialIcon, Page, Pill, RowMeta, RowTitle, Shell, StatCard, StatGrid, StatLabel, StatTop, StatValue, Subtitle, Timeline, TimelineItem, Title, shortDate} from '../stitch/StitchUI'
import {API_VERSION, ErrorState, LoadingState, NativeButton, PrimaryIntentAction, SecondaryIntentAction, useQueryState} from './shared'

const Layout=styled.div`display:grid;grid-template-columns:minmax(0,1fr) minmax(340px,.72fr);gap:20px;align-items:start;@media(max-width:1000px){grid-template-columns:1fr}`
const QueueItem=styled.button<{$selected?:boolean}>`
  display:grid;grid-template-columns:92px minmax(0,1fr) auto;gap:14px;align-items:center;width:100%;min-height:78px;border:0;border-bottom:1px solid ${t.color.line};background:${({$selected})=>$selected?t.color.surfaceLow:'transparent'};color:${t.color.ink};padding:12px 8px;text-align:left;cursor:pointer;&:hover{background:${t.color.surfaceLow}}@media(max-width:600px){grid-template-columns:70px 1fr;> *:last-child{display:none}}
`

type FollowUp={moment?:string;dueAt?:string;purpose?:string;status?:string;notes?:string;completedAt?:string}
type AfterSale={_id:string;status?:string;priority?:string;owner?:string;expectedDeliveryAt?:string;deliveredAt?:string;deliveryNotes?:string;incidentType?:string;incidentDetails?:string;resolution?:string;customer?:{name?:string};sale?:{number?:string;totalCents?:number};followUps?:FollowUp[]}
const QUERY=`*[_type == "afterSale"] | order(_updatedAt desc){_id,status,priority,owner,expectedDeliveryAt,deliveredAt,deliveryNotes,incidentType,incidentDetails,resolution,"customer":customer->{name},"sale":sale->{number,totalCents},followUps[]{moment,dueAt,purpose,status,notes,completedAt}}`

function exportCsv(rows: AfterSale[]) {
  const header=['Cliente','Venda','Status','Prioridade','Responsável','Follow-ups pendentes','Entrega prevista']
  const data=rows.map((item)=>[
    item.customer?.name||'', item.sale?.number||'', item.status||'', item.priority||'', item.owner||'',
    String((item.followUps||[]).filter((follow)=>follow.status==='pending').length), item.expectedDeliveryAt||'',
  ])
  const csv=[header,...data].map((row)=>row.map((cell)=>`"${String(cell).replace(/"/g,'""')}"`).join(',')).join('\n')
  const blob=new Blob([`\uFEFF${csv}`],{type:'text/csv;charset=utf-8'})
  const url=URL.createObjectURL(blob)
  const link=document.createElement('a')
  link.href=url
  link.download=`esmera-pos-venda-${new Date().toISOString().slice(0,10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function AfterSalesPage(){
 const client=useClient({apiVersion:API_VERSION})
 const query=useQueryState<AfterSale[]>(client,QUERY,{},(items)=>items.length===0)
 const[selected,setSelected]=useState('')
 const[filter,setFilter]=useState<'all'|'overdue'|'incident'>('all')

 if(query.state.status==='loading')return <Page><Shell><Header><div><Title>Pós-venda</Title><Subtitle>Acompanhe entregas, follow-ups e ocorrências.</Subtitle></div></Header><LoadingState/></Shell></Page>
 if(query.state.status==='error')return <Page><Shell><Header><div><Title>Pós-venda</Title><Subtitle>Acompanhe entregas, follow-ups e ocorrências.</Subtitle></div></Header><ErrorState code={query.state.code} detail={query.state.message} onRetry={query.retry}/></Shell></Page>

 const data=query.state.data
 const today=new Date()
 const followups=data.flatMap((item)=>item.followUps||[])
 const todayCount=followups.filter((follow)=>follow.status==='pending'&&follow.dueAt&&new Date(follow.dueAt).toDateString()===today.toDateString()).length
 const overdue=followups.filter((follow)=>follow.status==='pending'&&follow.dueAt&&new Date(follow.dueAt)<today).length
 const incidents=data.filter((item)=>item.incidentType&&item.incidentType!=='none'&&!['resolved','closed'].includes(item.status||'')).length
 const deliveries=data.filter((item)=>!item.deliveredAt&&!['resolved','closed'].includes(item.status||'')).length
 const filtered=useMemo(()=>data.filter((item)=>{
   if(filter==='incident')return Boolean(item.incidentType&&item.incidentType!=='none'&&!['resolved','closed'].includes(item.status||''))
   if(filter==='overdue')return (item.followUps||[]).some((follow)=>follow.status==='pending'&&follow.dueAt&&new Date(follow.dueAt)<today)
   return true
 }),[data,filter])
 const item=data.find((row)=>row._id===selected)||filtered[0]
 const pending=(item?.followUps||[]).filter((follow)=>follow.status==='pending').sort((a,b)=>String(a.dueAt).localeCompare(String(b.dueAt)))

 return <Page><Shell>
  <Header><div><Title>Pós-venda</Title><Subtitle>Acompanhe entregas, follow-ups e ocorrências.</Subtitle></div><HeaderActions><PrimaryIntentAction type="afterSale"><MaterialIcon>add_task</MaterialIcon>Novo acompanhamento</PrimaryIntentAction><NativeButton type="button" onClick={()=>exportCsv(data)}><MaterialIcon>file_download</MaterialIcon>Exportar Relatório</NativeButton></HeaderActions></Header>
  <StatGrid>
   <StatCard><StatTop><span><MaterialIcon>event_repeat</MaterialIcon></span><Pill $tone="green">Hoje</Pill></StatTop><div><StatLabel>Follow-ups hoje</StatLabel><StatValue>{todayCount}</StatValue></div></StatCard>
   <StatCard><StatTop><span><MaterialIcon>warning</MaterialIcon></span><Pill $tone="red">Ação requerida</Pill></StatTop><div><StatLabel>Atrasados</StatLabel><StatValue>{overdue}</StatValue></div></StatCard>
   <StatCard><StatTop><span><MaterialIcon>assignment_late</MaterialIcon></span><Pill $tone="red">Ocorrências</Pill></StatTop><div><StatLabel>Ocorrências abertas</StatLabel><StatValue>{incidents}</StatValue></div></StatCard>
   <StatCard><StatTop><span><MaterialIcon>local_shipping</MaterialIcon></span><Pill $tone="blue">Operacional</Pill></StatTop><div><StatLabel>Entregas em acompanhamento</StatLabel><StatValue>{deliveries}</StatValue></div></StatCard>
  </StatGrid>
  <div style={{marginBottom:16}}><Chips><button type="button" onClick={()=>setFilter('all')} style={{border:0,background:'transparent',padding:0}}><Chip>Todos {data.length}</Chip></button><button type="button" onClick={()=>setFilter('overdue')} style={{border:0,background:'transparent',padding:0}}><Chip>Atrasados {overdue}</Chip></button><button type="button" onClick={()=>setFilter('incident')} style={{border:0,background:'transparent',padding:0}}><Chip>Ocorrências {incidents}</Chip></button></Chips></div>
  <Layout>
   <Card><CardHeader><CardTitle>Fila Operacional</CardTitle><Chips><Chip><MaterialIcon>calendar_today</MaterialIcon>Prazo</Chip><Chip><MaterialIcon>priority_high</MaterialIcon>Prioridade</Chip></Chips></CardHeader>{filtered.length?filtered.map((row)=>{const next=(row.followUps||[]).filter((follow)=>follow.status==='pending').sort((a,b)=>String(a.dueAt).localeCompare(String(b.dueAt)))[0];return <QueueItem key={row._id} type="button" $selected={row._id===item?._id} aria-pressed={row._id===item?._id} onClick={()=>setSelected(row._id)}><div><div style={{fontSize:11,fontWeight:600,color:t.color.textSecondary,marginBottom:4}}>{next?.dueAt?shortDate(next.dueAt):'Sem prazo'}</div><Pill $tone="blue">{next?.moment?.toUpperCase()||'Acomp.'}</Pill></div><div><RowTitle>{row.customer?.name||'Cliente'}</RowTitle><RowMeta>{next?.purpose||'Acompanhamento pós-venda'} · Venda #{row.sale?.number||'—'}</RowMeta></div><Pill $tone={['high','urgent'].includes(row.priority||'')?'red':'neutral'}>{row.priority==='urgent'?'Urgente':row.priority==='high'?'Alta':'Normal'}</Pill></QueueItem>}):<Empty>Nenhum acompanhamento para este filtro.</Empty>}</Card>
   {item?<DetailPanel><div style={{display:'flex',justifyContent:'space-between',gap:12}}><div><Pill $tone="green">Acompanhamento</Pill><CardTitle style={{fontSize:24,marginTop:10}}>{item.customer?.name||'Cliente'}</CardTitle><CardSub>Venda #{item.sale?.number||'—'} · {item.owner||'Sem responsável'}</CardSub></div><SecondaryIntentAction type="afterSale" id={item._id}><MaterialIcon>edit</MaterialIcon>Editar</SecondaryIntentAction></div><Divider/><InfoGrid><div><InfoLabel>Status</InfoLabel><InfoValue>{item.status||'—'}</InfoValue></div><div><InfoLabel>Prioridade</InfoLabel><InfoValue>{item.priority||'normal'}</InfoValue></div><div><InfoLabel>Entrega prevista</InfoLabel><InfoValue>{shortDate(item.expectedDeliveryAt)}</InfoValue></div><div><InfoLabel>Valor da venda</InfoLabel><InfoValue>{typeof item.sale?.totalCents==='number'?(item.sale.totalCents/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}):'—'}</InfoValue></div></InfoGrid><Divider/><CardTitle style={{fontSize:16}}>Próximos follow-ups</CardTitle><Timeline style={{marginTop:14}}>{pending.length?pending.map((follow,index)=><TimelineItem key={`${follow.dueAt}-${index}`}><RowTitle>{follow.purpose||'Follow-up'} · {follow.moment?.toUpperCase()||'Personalizado'}</RowTitle><RowMeta>{shortDate(follow.dueAt)} · {follow.notes||'Sem observação'}</RowMeta></TimelineItem>):<TimelineItem><RowTitle>Nenhum follow-up pendente</RowTitle><RowMeta>O acompanhamento está em dia.</RowMeta></TimelineItem>}</Timeline>{item.incidentType&&item.incidentType!=='none'?<><Divider/><CardTitle style={{fontSize:16}}>Ocorrência</CardTitle><CardSub style={{marginTop:8}}>{item.incidentType}: {item.incidentDetails||'Sem detalhes registrados.'}</CardSub></>:null}</DetailPanel>:<Empty>Selecione um acompanhamento.</Empty>}
  </Layout>
 </Shell></Page>
}
