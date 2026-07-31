import {useClient} from 'sanity'
import styled from 'styled-components'
import {esmeraTokens as t} from '../../studio/esmeraTokens'
import {CardSub, Header, MaterialIcon, Page, Pill, RowMeta, RowTitle, Shell, Subtitle, Title} from '../stitch/StitchUI'
import {API_VERSION, ErrorState, LoadingState, PrimaryIntentAction, SecondaryIntentAction, useQueryState} from './shared'

const Board = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(230px, 1fr));
  gap: 14px;
  overflow-x: auto;
  padding-bottom: 10px;
`
const Column = styled.section`
  min-height: 520px;
  border-radius: 12px;
  background: ${t.color.surfaceLow};
  padding: 14px;
`
const ColumnHeader = styled.div`display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px;`
const ColumnTitle = styled.h2`margin:0;font-family:${t.typography.headline};font-size:16px;font-weight:600;line-height:24px;`
const LeadCard = styled.article`
  margin-bottom: 10px;
  border: 1px solid ${t.color.line};
  border-radius: 10px;
  background: ${t.color.surfaceLowest};
  box-shadow: ${t.shadow.card};
  padding: 14px;
`
const ActionRow = styled.div`display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:12px;`

type Lead = {_id:string;name?:string;stage?:string;source?:string;owner?:string;nextAction?:string;nextActionAt?:string;interestCategories?:string[];notes?:string}
const QUERY = `*[_type == "lead"] | order(_updatedAt desc){_id,name,stage,source,owner,nextAction,nextActionAt,interestCategories,notes}`
const columns = [
  {key:'new',label:'Novo'},
  {key:'curation',label:'Curadoria'},
  {key:'proposal',label:'Proposta'},
  {key:'negotiation',label:'Negociação'},
  {key:'finished',label:'Ganho / Perdido'},
] as const

function inColumn(lead: Lead, key: string) {
  if (key === 'finished') return lead.stage === 'won' || lead.stage === 'lost'
  return lead.stage === key
}

export function PipelinePage() {
  const client = useClient({apiVersion: API_VERSION})
  const query = useQueryState<Lead[]>(client, QUERY, {}, (items)=>items.length===0)

  if(query.state.status==='loading') return <Page><Shell><Header><div><Title>Pipeline Comercial</Title><Subtitle>Visão por etapa dos leads e negociações.</Subtitle></div></Header><LoadingState /></Shell></Page>
  if(query.state.status==='error') return <Page><Shell><Header><div><Title>Pipeline Comercial</Title><Subtitle>Visão por etapa dos leads e negociações.</Subtitle></div></Header><ErrorState code={query.state.code} detail={query.state.message} onRetry={query.retry} /></Shell></Page>

  const leads=query.state.data
  return <Page><Shell>
    <Header><div><Title>Pipeline Comercial</Title><Subtitle>Visão por etapa dos leads e negociações.</Subtitle></div><div style={{display:'flex',gap:8,flexWrap:'wrap'}}><a href="/business/cms/sales" style={{display:'inline-flex',minHeight:40,alignItems:'center',gap:8,border:`1px solid ${t.color.line}`,borderRadius:8,color:t.color.ink,padding:'0 16px',fontSize:13,fontWeight:600,textDecoration:'none'}}><MaterialIcon>list</MaterialIcon>Visão Lista</a><PrimaryIntentAction type="lead"><MaterialIcon>add</MaterialIcon>Novo lead</PrimaryIntentAction></div></Header>
    <Board aria-label="Pipeline comercial">
      {columns.map((column)=>{
        const items=leads.filter((lead)=>inColumn(lead,column.key))
        return <Column key={column.key}><ColumnHeader><ColumnTitle>{column.label}</ColumnTitle><Pill $tone={column.key==='finished'?'green':'neutral'}>{items.length}</Pill></ColumnHeader>{items.map((lead)=><LeadCard key={lead._id}><div style={{display:'flex',justifyContent:'space-between',gap:8}}><Pill $tone={lead.stage==='won'?'green':lead.stage==='lost'?'red':'blue'}>{lead.source||'origem não definida'}</Pill><MaterialIcon>more_horiz</MaterialIcon></div><RowTitle style={{marginTop:10}}>{lead.name||'Lead sem nome'}</RowTitle><RowMeta>{lead.interestCategories?.join(' · ')||'Interesse não registrado'}</RowMeta><CardSub style={{marginTop:10}}>{lead.nextAction||'Sem próxima ação definida'}</CardSub><ActionRow><span style={{fontSize:11,color:t.color.lineStrong}}>{lead.owner||'Sem responsável'}</span><SecondaryIntentAction type="lead" id={lead._id}>Abrir</SecondaryIntentAction></ActionRow></LeadCard>)}{!items.length?<div style={{border:`1px dashed ${t.color.line}`,borderRadius:10,padding:18,color:t.color.textSecondary,fontSize:13,textAlign:'center'}}>Nenhum lead nesta etapa.</div>:null}</Column>
      })}
    </Board>
  </Shell></Page>
}
