import {useMemo, useState} from 'react'
import {useClient} from 'sanity'
import styled from 'styled-components'
import {esmeraTokens as t} from '../../studio/esmeraTokens'
import {Card, CardHeader, CardSub, CardTitle, Chip, Chips, Grid, Header, HeaderActions, IconTile, MaterialIcon, Page, Pill, RowMeta, RowTitle, Shell, StatCard, StatGrid, StatLabel, StatTop, StatValue, Subtitle, Title, money} from '../stitch/StitchUI'
import {API_VERSION, ErrorState, KpiMeta, LoadingState, NativeButton, PrimaryNativeButton, formatUpdatedAt, useQueryState} from './shared'

const ReportGrid=styled.div`display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;@media(max-width:900px){grid-template-columns:1fr}`
const HorizontalBars=styled.div`display:grid;gap:13px;`
const HBarRow=styled.div`display:grid;grid-template-columns:120px 1fr 40px;gap:10px;align-items:center;color:${t.color.textSecondary};font-size:13px;`
const HTrack=styled.div`height:7px;border-radius:999px;background:${t.color.surfaceContainer};overflow:hidden;`
const HFill=styled.div<{$w:number}>`height:100%;width:${({$w})=>$w}%;border-radius:999px;background:${t.color.primary};`
const FilterSelect=styled.select`height:38px;border:1px solid ${t.color.line};border-radius:8px;background:${t.color.surfaceLowest};color:${t.color.ink};padding:0 12px;font-size:13px;font-weight:600;`
const Funnel=styled.div`display:grid;gap:7px;place-items:center;`
const FunnelStep=styled.div<{$w:number}>`width:${({$w})=>$w}%;min-width:130px;height:36px;border-radius:6px;background:${t.color.primary};color:${t.color.onPrimary};display:grid;place-items:center;font-size:12px;font-weight:700;opacity:${({$w})=>Math.max(.38,$w/100)};`

type Lead={_id:string;source?:string;stage?:string;lossReason?:string;owner?:string;createdAt?:string}
type Sale={_id:string;status?:string;channel?:string;owner?:string;totalCents?:number;createdAt?:string;leadCreatedAt?:string;items?:{snapshotTitle?:string;quantity?:number}[]}
type AfterSale={customerId?:string;pending:number}
type Customer={_id:string}
type ReportData={leads:Lead[];sales:Sale[];afterSales:AfterSale[];customers:Customer[]}
type SiteData={activeProducts:number;inquiryProducts:number}

const QUERY=`{
 "leads":*[_type=="lead"&&_createdAt>=$from]{_id,source,stage,lossReason,owner,"createdAt":_createdAt},
 "sales":*[_type=="sale"&&_createdAt>=$from&&status in ["confirmed","production","ready","delivered"]]{_id,status,channel,owner,totalCents,"createdAt":_createdAt,"leadCreatedAt":customer->sourceLead->_createdAt,items[]{snapshotTitle,quantity}},
 "afterSales":*[_type=="afterSale"]{"customerId":customer._ref,"pending":count(followUps[status=="pending"])},
 "customers":*[_type=="customer"]{_id}
}`
const SITE_QUERY=`{"activeProducts":count(*[_type=="product"&&status=="active"&&!(_id in path("drafts.**"))]),"inquiryProducts":count(*[_type=="product"&&status=="active"&&priceMode=="inquiry"&&!(_id in path("drafts.**"))])}`

function shareReport() {
  const text='Relatório operacional Esméra — consulte o Business Desk para os números atualizados.'
  if(navigator.share){navigator.share({title:'Relatórios Esméra',text}).catch(()=>undefined);return}
  navigator.clipboard?.writeText(`${text} ${window.location.href}`).catch(()=>undefined)
}

export function ReportsPage(){
 const client=useClient({apiVersion:API_VERSION})
 const siteClient=useMemo(()=>client.withConfig({dataset:'production'}),[client])
 const[draftDays,setDraftDays]=useState(30)
 const[draftChannel,setDraftChannel]=useState('all')
 const[days,setDays]=useState(30)
 const[channel,setChannel]=useState('all')
 const from=useMemo(()=>{const date=new Date();date.setDate(date.getDate()-days);return date.toISOString()},[days])
 const report=useQueryState<ReportData>(client,QUERY,{from})
 const site=useQueryState<SiteData>(siteClient,SITE_QUERY)

 if(report.state.status==='loading'||site.state.status==='loading')return <Page><Shell><Header><div><Title>Relatórios</Title><Subtitle>Indicadores comerciais e desempenho do negócio.</Subtitle></div></Header><LoadingState/></Shell></Page>
 if(report.state.status==='error')return <Page><Shell><Header><div><Title>Relatórios</Title><Subtitle>Indicadores comerciais e desempenho do negócio.</Subtitle></div></Header><ErrorState code={report.state.code} detail={report.state.message} onRetry={report.retry}/></Shell></Page>
 if(site.state.status==='error')return <Page><Shell><Header><div><Title>Relatórios</Title><Subtitle>Indicadores comerciais e desempenho do negócio.</Subtitle></div></Header><ErrorState code={site.state.code} detail={site.state.message} onRetry={site.retry}/></Shell></Page>

 const data=report.state.data
 const sales=channel==='all'?data.sales:data.sales.filter((sale)=>sale.channel===channel)
 const leads=data.leads
 const won=leads.filter((lead)=>lead.stage==='won').length
 const lost=leads.filter((lead)=>lead.stage==='lost').length
 const finished=won+lost
 const conversion=finished?Math.round(won/finished*100):0
 const paid=sales.filter((sale)=>typeof sale.totalCents==='number')
 const ticket=paid.length?paid.reduce((sum,sale)=>sum+(sale.totalCents||0),0)/paid.length:0
 const total=paid.reduce((sum,sale)=>sum+(sale.totalCents||0),0)
 const leadTimes=sales.map((sale)=>sale.leadCreatedAt&&sale.createdAt?(new Date(sale.createdAt).getTime()-new Date(sale.leadCreatedAt).getTime())/86400000:null).filter((value):value is number=>typeof value==='number'&&value>=0)
 const avgDays=leadTimes.length?leadTimes.reduce((a,b)=>a+b,0)/leadTimes.length:null
 const sources=useMemo(()=>{const map=new Map<string,number>();sales.forEach((sale)=>map.set(sale.channel||'outro',(map.get(sale.channel||'outro')||0)+1));return [...map.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5)},[sales])
 const maxSource=Math.max(1,...sources.map(([,value])=>value))
 const losses=leads.filter((lead)=>lead.stage==='lost')
 const lossMap=useMemo(()=>{const map=new Map<string,number>();losses.forEach((lead)=>map.set(lead.lossReason||'Sem motivo registrado',(map.get(lead.lossReason||'Sem motivo registrado')||0)+1));return [...map.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5)},[losses])
 const productMap=useMemo(()=>{const map=new Map<string,number>();sales.forEach((sale)=>sale.items?.forEach((item)=>map.set(item.snapshotTitle||'Produto',(map.get(item.snapshotTitle||'Produto')||0)+(item.quantity||1))));return [...map.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5)},[sales])
 const stages=[['Leads',leads.length],['Curadoria',leads.filter((lead)=>['curation','proposal','negotiation','won'].includes(lead.stage||'')).length],['Proposta',leads.filter((lead)=>['proposal','negotiation','won'].includes(lead.stage||'')).length],['Negociação',leads.filter((lead)=>['negotiation','won'].includes(lead.stage||'')).length],['Ganho',won]] as const
 const maxStage=Math.max(1,...stages.map(([,value])=>value))
 const pendingCustomers=new Set(data.afterSales.filter((item)=>item.pending>0).map((item)=>item.customerId).filter(Boolean))
 const withoutFollowup=data.customers.filter((customer)=>!pendingCustomers.has(customer._id)).length
 const ownerMap=useMemo(()=>{const map=new Map<string,{leads:number;sales:number;value:number}>();leads.forEach((lead)=>{const key=lead.owner||'Sem responsável';const row=map.get(key)||{leads:0,sales:0,value:0};row.leads+=1;map.set(key,row)});sales.forEach((sale)=>{const key=sale.owner||'Sem responsável';const row=map.get(key)||{leads:0,sales:0,value:0};row.sales+=1;row.value+=sale.totalCents||0;map.set(key,row)});return [...map.entries()].sort((a,b)=>b[1].value-a[1].value).slice(0,5)},[leads,sales])
 const channels=[...new Set(data.sales.map((sale)=>sale.channel).filter(Boolean))] as string[]
 const updated=formatUpdatedAt(report.state.updatedAt)

 return <Page><Shell>
  <Header><div><Title>Relatórios</Title><Subtitle>Indicadores comerciais e desempenho do negócio.</Subtitle></div><HeaderActions><NativeButton type="button" onClick={()=>window.print()}><MaterialIcon>download</MaterialIcon>Exportar PDF</NativeButton><NativeButton type="button" onClick={shareReport}><MaterialIcon>share</MaterialIcon>Compartilhar</NativeButton></HeaderActions></Header>
  <Card style={{marginBottom:20,padding:16}}><div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}><div style={{display:'flex',gap:8,flexWrap:'wrap'}}><FilterSelect aria-label="Período" value={draftDays} onChange={(event)=>setDraftDays(Number(event.target.value))}><option value={30}>Últimos 30 dias</option><option value={90}>Últimos 90 dias</option><option value={365}>Últimos 12 meses</option></FilterSelect><FilterSelect aria-label="Canal" value={draftChannel} onChange={(event)=>setDraftChannel(event.target.value)}><option value="all">Todos os canais</option>{channels.map((item)=><option key={item} value={item}>{item}</option>)}</FilterSelect></div><PrimaryNativeButton type="button" onClick={()=>{setDays(draftDays);setChannel(draftChannel)}}>Aplicar Filtros</PrimaryNativeButton></div></Card>
  <StatGrid>
   <StatCard><StatTop><IconTile><MaterialIcon>group</MaterialIcon></IconTile><Pill $tone="green">{days} dias</Pill></StatTop><div><StatLabel>Leads no período</StatLabel><StatValue>{leads.length}</StatValue><KpiMeta>Fonte: lead._createdAt · {updated}</KpiMeta></div></StatCard>
   <StatCard><StatTop><IconTile><MaterialIcon>percent</MaterialIcon></IconTile><Pill $tone="green">Encerrados</Pill></StatTop><div><StatLabel>Conversão</StatLabel><StatValue>{conversion}%</StatValue><KpiMeta>ganhos ÷ (ganhos + perdidos) · {updated}</KpiMeta></div></StatCard>
   <StatCard><StatTop><IconTile $tone="blue"><MaterialIcon>payments</MaterialIcon></IconTile><Pill $tone="blue">Ticket</Pill></StatTop><div><StatLabel>Ticket médio</StatLabel><StatValue>{money(ticket)}</StatValue><KpiMeta>{paid.length} vendas com valor · total {money(total)}</KpiMeta></div></StatCard>
   <StatCard><StatTop><IconTile $tone="sand"><MaterialIcon>schedule</MaterialIcon></IconTile><Pill $tone="sand">Operação</Pill></StatTop><div><StatLabel>Tempo médio até venda</StatLabel><StatValue>{avgDays===null?'—':`${avgDays.toFixed(1)} dias`}</StatValue><KpiMeta>lead de origem → venda; somente registros vinculados</KpiMeta></div></StatCard>
  </StatGrid>
  <ReportGrid>
   <Card><CardHeader><div><CardTitle>Funnel Comercial</CardTitle><CardSub>Contagem real por progressão de etapa.</CardSub></div><Pill $tone="green">{conversion}% final</Pill></CardHeader><Funnel>{stages.map(([label,value])=><FunnelStep key={label} $w={Math.max(22,Math.round(value/maxStage*100))}>{label} · {value}</FunnelStep>)}</Funnel></Card>
   <Card><CardHeader><div><CardTitle>Vendas por Origem</CardTitle><CardSub>Canal registrado nas vendas elegíveis.</CardSub></div></CardHeader><HorizontalBars>{sources.length?sources.map(([label,value])=><HBarRow key={label}><span>{label}</span><HTrack><HFill $w={Math.round(value/maxSource*100)}/></HTrack><strong>{value}</strong></HBarRow>):<CardSub>Nenhuma venda no filtro atual.</CardSub>}</HorizontalBars></Card>
   <Card><CardHeader><div><CardTitle>Produtos mais solicitados</CardTitle><CardSub>Quantidade registrada nos itens de venda.</CardSub></div></CardHeader>{productMap.length?productMap.map(([title,count],index)=><div key={title} style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,padding:'10px 0',borderBottom:`1px solid ${t.color.line}`}}><div><RowTitle>{String(index+1).padStart(2,'0')} · {title}</RowTitle><RowMeta>Itens vendidos no período</RowMeta></div><Pill $tone="green">{count}</Pill></div>):<CardSub>Sem itens no período.</CardSub>}</Card>
   <Card><CardHeader><div><CardTitle>Categorias com maior conversão</CardTitle><CardSub>Depende de snapshot de categoria na venda.</CardSub></div><Pill>Não configurado</Pill></CardHeader><CardSub>O schema atual preserva título/seleção do produto, mas não a categoria histórica. Exibir uma taxa agora seria inferência não verificável.</CardSub></Card>
   <Card><CardHeader><div><CardTitle>Motivos de Perda</CardTitle><CardSub>Leads encerrados como perdidos.</CardSub></div></CardHeader><HorizontalBars>{lossMap.length?lossMap.map(([label,value])=><HBarRow key={label}><span>{label}</span><HTrack><HFill $w={Math.round(value/Math.max(1,losses.length)*100)}/></HTrack><strong>{value}</strong></HBarRow>):<CardSub>Nenhuma perda registrada.</CardSub>}</HorizontalBars></Card>
   <Card><CardHeader><div><CardTitle>Performance de Estoque</CardTitle><CardSub>Leitura operacional do catálogo production.</CardSub></div></CardHeader><Grid $cols={2}><div><StatLabel>Produtos ativos</StatLabel><StatValue style={{fontSize:24}}>{site.state.data.activeProducts}</StatValue></div><div><StatLabel>Sob consulta</StatLabel><StatValue style={{fontSize:24}}>{site.state.data.inquiryProducts}</StatValue></div></Grid></Card>
   <Card><CardHeader><div><CardTitle>Clientes sem follow-up</CardTitle><CardSub>Clientes sem caso com follow-up pendente.</CardSub></div><Pill $tone={withoutFollowup?'red':'green'}>{withoutFollowup}</Pill></CardHeader><CardSub>{withoutFollowup?`${withoutFollowup} cliente(s) sem follow-up pendente registrado.`:'Todos os clientes possuem acompanhamento pendente ou não há clientes cadastrados.'}</CardSub></Card>
   <Card><CardHeader><div><CardTitle>Desempenho por Responsável</CardTitle><CardSub>Leads, vendas e valor registrados no período.</CardSub></div></CardHeader>{ownerMap.length?ownerMap.map(([owner,row])=><div key={owner} style={{display:'grid',gridTemplateColumns:'1fr auto auto',gap:12,alignItems:'center',padding:'10px 0',borderBottom:`1px solid ${t.color.line}`}}><RowTitle>{owner}</RowTitle><RowMeta>{row.leads} leads · {row.sales} vendas</RowMeta><strong>{money(row.value)}</strong></div>):<CardSub>Sem responsáveis registrados.</CardSub>}</Card>
  </ReportGrid>
 </Shell></Page>
}
