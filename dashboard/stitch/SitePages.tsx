import {useEffect, useMemo, useState, type ReactNode} from 'react'
import {useClient} from 'sanity'
import {useIntentLink} from 'sanity/router'
import {
  Bar, Card, CardHeader, CardSub, CardTitle, Chip, Chips, DetailPanel, Divider, Empty,
  Grid, Header, HeaderActions, IconTile, InfoGrid, InfoLabel, InfoValue, MaterialIcon,
  MiniBars, Page, Pill, PrimaryButton, Row, RowMain, RowMeta, RowTitle, SearchBox,
  SearchInput, SecondaryButton, SectionLabel, Shell, Split, StatCard, StatGrid, StatLabel,
  StatTop, StatValue, Subtitle, Table, TextButton, Thumb, Timeline, TimelineItem, Title,
  Toolbar, money,
} from './StitchUI'
import styled from 'styled-components'
import {esmeraTokens as t} from '../../studio/esmeraTokens'

const API_VERSION = '2026-07-30'

function IntentLink({type,id,children,className}: {type:string;id?:string;children:ReactNode;className?:string}) {
  const link = useIntentLink({intent: id ? 'edit' : 'create', params: id ? {id:id.replace(/^drafts\./,''),type} : {type}})
  return <a className={className} href={link.href} onClick={link.onClick}>{children}</a>
}
const StyledPrimaryIntent = styled(IntentLink)`display:inline-flex;min-height:40px;align-items:center;justify-content:center;gap:8px;border-radius:999px;background:${t.color.primary};color:${t.color.onPrimary};padding:0 18px;font-size:13px;font-weight:600;text-decoration:none;.material-symbols-outlined{font-size:19px}`
const StyledSecondaryIntent = styled(IntentLink)`display:inline-flex;min-height:38px;align-items:center;justify-content:center;gap:7px;border:1px solid ${t.color.line};border-radius:8px;background:${t.color.surfaceLowest};color:${t.color.ink};padding:0 14px;font-size:13px;font-weight:600;text-decoration:none;&:hover{background:${t.color.surfaceLow}}`

const DashboardMain = styled.div`display:grid;grid-template-columns:minmax(0,2fr) minmax(300px,1fr);gap:24px;align-items:start;@media(max-width:1050px){grid-template-columns:1fr}`
const Pipeline = styled(Card)`min-height:420px;`
const PipelineTrack = styled.div`position:relative;display:flex;align-items:flex-start;justify-content:space-between;margin:36px 12px 44px;&::before{content:'';position:absolute;left:18px;right:18px;top:19px;height:4px;border-radius:999px;background:${t.color.surfaceHighest}}&::after{content:'';position:absolute;left:18px;width:72%;top:19px;height:4px;border-radius:999px;background:${t.color.primary}}`
const PipelineStep = styled.div`position:relative;z-index:2;display:flex;min-width:72px;flex-direction:column;align-items:center;gap:10px;text-align:center;`
const PipelineBubble = styled.span<{$active?:boolean}>`display:grid;width:40px;height:40px;place-items:center;border-radius:50%;background:${({$active})=>$active?t.color.primary:t.color.surfaceHighest};color:${({$active})=>$active?t.color.onPrimary:t.color.textSecondary};font-weight:700;box-shadow:${({$active})=>$active?'0 4px 12px rgba(50,79,70,.18)':'none'};`
const Pending = styled.div`display:grid;gap:6px;`
const PendingRow = styled.div`display:flex;align-items:flex-start;gap:13px;border-left:4px solid transparent;border-radius:10px;padding:13px 10px;transition:.16s ease;&:hover{border-left-color:${t.color.primary};background:${t.color.surfaceContainer}}`
const PendingCopy = styled.div`min-width:0;flex:1;`
const PendingTitle = styled.div`color:${t.color.ink};font-size:14px;font-weight:600;line-height:20px;`
const PendingMeta = styled.div`margin-top:2px;color:${t.color.textSecondary};font-size:12px;line-height:17px;`

type DashData={products:number;recent?:{_id:string;title?:string;image?:string}[];leads:number;sales:number;salesValue:number;followups:number;pipeline:Record<string,number>;tasks:{_id:string;title?:string;kind?:string;detail?:string}[]}
export function SiteDashboardPage(){
  const client=useClient({apiVersion:API_VERSION})
  const [data,setData]=useState<DashData|null>(null)
  useEffect(()=>{let alive=true;const siteQ=`{"products":count(*[_type=="product"&&status=="active"]),"recent":*[_type=="product"]|order(_updatedAt desc)[0...1]{_id,title,"image":gallery[0].asset->url}}`;const biz=client.withConfig({dataset:'business'});const bizQ=`{"leads":count(*[_type=="lead"&&!(stage in ["won","lost"])]),"sales":count(*[_type=="sale"&&_createdAt>=now()-60*60*24*30]),"salesTotals":*[_type=="sale"&&_createdAt>=now()-60*60*24*30].totalCents,"followups":count(*[_type=="afterSale"&&count(followUps[status=="pending"])>0]),"new":count(*[_type=="lead"&&stage=="new"]),"curation":count(*[_type=="lead"&&stage=="curation"]),"proposal":count(*[_type=="lead"&&stage=="proposal"]),"negotiation":count(*[_type=="lead"&&stage=="negotiation"]),"won":count(*[_type=="lead"&&stage=="won"]),"tasks":*[_type=="task"&&status!="done"]|order(dueAt asc)[0...5]{_id,title,"kind":priority,"detail":description}}`;Promise.all([client.fetch<any>(siteQ),biz.fetch<any>(bizQ).catch(()=>({}))]).then(([s,b])=>{if(alive)setData({products:s.products||0,recent:s.recent||[],leads:b.leads||0,sales:b.sales||0,salesValue:Array.isArray(b.salesTotals)?b.salesTotals.reduce((sum:number,value:number|undefined)=>sum+(value||0),0):0,followups:b.followups||0,pipeline:{new:b.new||0,curation:b.curation||0,proposal:b.proposal||0,negotiation:b.negotiation||0,won:b.won||0},tasks:b.tasks||[]})});return()=>{alive=false}},[client])
  const d=data||{products:0,leads:0,sales:0,salesValue:0,followups:0,pipeline:{new:0,curation:0,proposal:0,negotiation:0,won:0},tasks:[],recent:[]}
  const date=new Intl.DateTimeFormat('pt-BR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'}).format(new Date())
  return <Page><Shell>
    <Header><div><Title>Olá, Esméra!</Title><Subtitle>Visão rápida do site e do comercial.</Subtitle></div><div style={{color:t.color.lineStrong,fontSize:13,fontWeight:600,textTransform:'capitalize'}}>{date}</div></Header>
    <StatGrid>
      <StatCard><StatTop><IconTile><MaterialIcon>inventory_2</MaterialIcon></IconTile><Pill $tone="green">Catálogo</Pill></StatTop><div><StatLabel>Produtos Ativos</StatLabel><StatValue>{d.products}</StatValue></div></StatCard>
      <StatCard><StatTop><IconTile $tone="blue"><MaterialIcon>group</MaterialIcon></IconTile><Pill $tone="blue">Pipeline</Pill></StatTop><div><StatLabel>Leads Abertos</StatLabel><StatValue>{d.leads}</StatValue></div></StatCard>
      <StatCard><StatTop><IconTile $tone="sand"><MaterialIcon>payments</MaterialIcon></IconTile><Pill $tone="sand">30 dias</Pill></StatTop><div><StatLabel>Vendas no Mês</StatLabel><StatValue>{d.salesValue?money(d.salesValue):d.sales}</StatValue></div></StatCard>
      <StatCard><StatTop><IconTile $tone="red"><MaterialIcon>priority_high</MaterialIcon></IconTile><Pill $tone="red">Atenção</Pill></StatTop><div><StatLabel>Follow-ups Pendentes</StatLabel><StatValue>{d.followups}</StatValue></div></StatCard>
    </StatGrid>
    <DashboardMain>
      <Pipeline><CardHeader><CardTitle>Pipeline Comercial</CardTitle><SecondaryButton href="/business/cms/sales">Ver CRM completo <MaterialIcon>arrow_forward</MaterialIcon></SecondaryButton></CardHeader>
        <PipelineTrack>{[['new','Novo'],['curation','Curadoria'],['proposal','Proposta'],['negotiation','Negociação'],['won','Ganho']].map(([k,l],i)=><PipelineStep key={k}><PipelineBubble $active={i<4}>{d.pipeline[k]||0}</PipelineBubble><span style={{fontSize:13,fontWeight:600}}>{l}</span></PipelineStep>)}</PipelineTrack>
        <MiniBars>{[38,62,84,51,29,46,72].map((h,i)=><Bar key={i} $h={h} $active={i===2}/>)}</MiniBars>
      </Pipeline>
      <Card><CardHeader><CardTitle>Pendências de hoje</CardTitle><Pill $tone={d.tasks.length?'red':'green'}>{d.tasks.length} ações</Pill></CardHeader><Pending>
        {(d.tasks.length?d.tasks:[{_id:'1',title:'Revisar catálogo publicado',detail:'Nenhuma tarefa comercial urgente cadastrada.'}]).map((task,i)=><PendingRow key={task._id}><MaterialIcon>{['chat_bubble','local_shipping','call','edit_note','receipt_long'][i%5]}</MaterialIcon><PendingCopy><PendingTitle>{task.title||'Ação pendente'}</PendingTitle><PendingMeta>{task.detail||'Acompanhar a próxima ação comercial.'}</PendingMeta></PendingCopy><MaterialIcon>chevron_right</MaterialIcon></PendingRow>)}
      </Pending><SecondaryButton href="/business/cms/after-sales" style={{width:'100%',marginTop:16,borderStyle:'dashed'}}>+ Agendar nova tarefa</SecondaryButton></Card>
    </DashboardMain>
    <Grid $cols={2} style={{marginTop:24}}>
      <Card style={{display:'flex',alignItems:'center',gap:20}}>{d.recent?.[0]?.image?<Thumb style={{width:116,height:116,flexBasis:116}}><img src={d.recent[0].image} alt=""/></Thumb>:<Thumb style={{width:116,height:116,flexBasis:116}}><MaterialIcon>image</MaterialIcon></Thumb>}<div><Pill $tone="green">Destaque recente</Pill><CardTitle style={{marginTop:10}}>{d.recent?.[0]?.title||'Catálogo Esméra'}</CardTitle><CardSub>Conteúdo atualizado recentemente no CMS.</CardSub><div style={{marginTop:14}}><SecondaryButton href="/site/cms/products">Editar Produto</SecondaryButton></div></div></Card>
      <Card><CardHeader><CardTitle>Performance de Tráfego</CardTitle><Pill $tone="green"><MaterialIcon>trending_up</MaterialIcon> 15%</Pill></CardHeader><MiniBars style={{height:90,paddingTop:10}}>{[40,60,50,80,95,70,60,85,55,75].map((h,i)=><Bar key={i} $h={h} $active={i===4}/>)}</MiniBars><CardSub style={{textAlign:'center',marginTop:12}}>Visão operacional preparada para conexão com Analytics.</CardSub></Card>
    </Grid>
  </Shell></Page>
}

type Product={_id:string;title?:string;code?:string;status?:string;availability?:string;material?:string;subtitle?:string;priceMode?:string;basePriceCents?:number;category?:string;image?:string;updated?:string}
export function SiteProductsPage(){
 const client=useClient({apiVersion:API_VERSION});const [products,setProducts]=useState<Product[]>([]);const [selected,setSelected]=useState<string>('');const [q,setQ]=useState('')
 useEffect(()=>{client.fetch<Product[]>(`*[_type=="product"]|order(_updatedAt desc){_id,title,code,status,availability,material,subtitle,priceMode,basePriceCents,"category":categories[0]->title,"image":gallery[0].asset->url,"updated":_updatedAt}`).then(x=>{setProducts(x);setSelected(s=>s||x[0]?._id||'')})},[client])
 const filtered=useMemo(()=>products.filter(p=>`${p.title||''} ${p.code||''} ${p.category||''}`.toLowerCase().includes(q.toLowerCase())),[products,q]);const p=products.find(x=>x._id===selected)||filtered[0]
 const counts={active:products.filter(x=>x.status==='active').length,inquiry:products.filter(x=>x.priceMode==='inquiry').length,archive:products.filter(x=>x.status==='archive').length}
 return <Page><Shell><Header><div><Title>Produtos</Title><Subtitle>Gerencie o catálogo central da Esméra.</Subtitle></div><HeaderActions><StyledPrimaryIntent type="product"><MaterialIcon>add</MaterialIcon>+ Novo produto</StyledPrimaryIntent></HeaderActions></Header>
  <Toolbar><SearchBox><MaterialIcon>search</MaterialIcon><SearchInput value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar produtos..."/></SearchBox><Chips><Chip>Catálogo Total <strong>{products.length}</strong></Chip><Chip>Ativos <strong>{counts.active}</strong></Chip><Chip>Sob consulta <strong>{counts.inquiry}</strong></Chip><Chip>Arquivados <strong>{counts.archive}</strong></Chip></Chips></Toolbar>
  <Split><div><Table>{filtered.map(item=><Row key={item._id} $selected={item._id===p?._id} onClick={()=>setSelected(item._id)}><RowMain><Thumb>{item.image?<img src={item.image} alt=""/>:<MaterialIcon>inventory_2</MaterialIcon>}</Thumb><div><RowTitle>{item.title||'Produto sem título'}</RowTitle><RowMeta>{item.code||'Sem código'} · {item.category||'Sem categoria'}</RowMeta></div></RowMain><div>{item.category||'—'}</div><div>{item.priceMode==='fixed'?money(item.basePriceCents):'Sob consulta'}</div><Pill $tone={item.status==='active'?'green':item.status==='archive'?'neutral':'sand'}>{item.status==='active'?'Ativo':item.status==='archive'?'Arquivado':'Rascunho'}</Pill></Row>)}</Table>{!filtered.length&&<Empty>Nenhum produto encontrado.</Empty>}</div>
   {p?<DetailPanel><div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:14}}><div><Pill $tone="green">Produto Selecionado</Pill><CardTitle style={{fontSize:24,lineHeight:'32px',marginTop:10}}>{p.title}</CardTitle><CardSub>{p.code||'Sem código'}</CardSub></div><StyledSecondaryIntent type="product" id={p._id}><MaterialIcon>edit</MaterialIcon></StyledSecondaryIntent></div>
    {p.image&&<div style={{height:220,overflow:'hidden',borderRadius:12,marginTop:18,background:t.color.surfaceLow}}><img src={p.image} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/></div>}
    <Divider/><CardTitle style={{fontSize:16}}>Informações Básicas</CardTitle><InfoGrid style={{marginTop:16}}><div><InfoLabel>Disponibilidade</InfoLabel><InfoValue>{p.availability||'—'}</InfoValue></div><div><InfoLabel>Material</InfoLabel><InfoValue>{p.material||'—'}</InfoValue></div><div><InfoLabel>Preço</InfoLabel><InfoValue>{p.priceMode==='fixed'?money(p.basePriceCents):'Sob consulta'}</InfoValue></div><div><InfoLabel>Categoria</InfoLabel><InfoValue>{p.category||'—'}</InfoValue></div></InfoGrid>
    <Divider/><CardTitle style={{fontSize:16}}>Gestão de Seções</CardTitle><Grid $cols={2} style={{gap:8,marginTop:12}}>{[['collections','Galeria'],['layers','Variantes'],['sell','Preço'],['travel_explore','SEO']].map(([i,l])=><StyledSecondaryIntent key={l} type="product" id={p._id}><MaterialIcon>{i}</MaterialIcon>{l}</StyledSecondaryIntent>)}</Grid>
   </DetailPanel>:<Empty>Selecione um produto.</Empty>}
  </Split>
 </Shell></Page>
}

const ContentHero = styled(Card)`display:grid;grid-template-columns:minmax(0,1.5fr) minmax(260px,.55fr);gap:24px;@media(max-width:900px){grid-template-columns:1fr}`
const BlockGrid = styled.div`display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;@media(max-width:800px){grid-template-columns:repeat(2,1fr)}@media(max-width:560px){grid-template-columns:1fr}`
const ContentBlock = styled.div`border:1px solid ${t.color.line};border-radius:10px;background:${t.color.surfaceLowest};padding:16px;`
const ContentIcon = styled(IconTile)`width:38px;height:38px;`
function SingletonEdit({type,id,label='Editar'}:{type:string;id:string;label?:string}){return <StyledSecondaryIntent type={type} id={id}>{label}</StyledSecondaryIntent>}
export function SiteContentPage(){
 return <Page><Shell><Header><div><Title>Conteúdo do Site</Title><Subtitle>Gerencie a narrativa visual e institucional da Esméra.</Subtitle></div><HeaderActions><SecondaryButton href="/" target="_blank"><MaterialIcon>visibility</MaterialIcon>Visualizar Site</SecondaryButton><PrimaryButton href="/site/cms/content"><MaterialIcon>publish</MaterialIcon>Publicar Alterações</PrimaryButton></HeaderActions></Header>
  <ContentHero><div><CardHeader><div><CardTitle>Home Page</CardTitle><CardSub>Composição editorial da página principal.</CardSub></div><Pill $tone="green">Live agora</Pill></CardHeader><BlockGrid>
   {[['photo_library','Bloco 01','Hero Visual','Galeria, headline e CTA','hero'],['subject','Bloco 02','Manifesto','Textos institucionais e valores','manifesto'],['auto_awesome_motion','Bloco 03','Seleção de Produtos','Curadoria manual da Home','selection'],['texture','Bloco 04','Matter','Foco em materiais e texturas','matter'],['draw','Bloco 05','Signature','Peças e narrativa editorial','signature'],['map','Bloco 06','Provenance','Origem e história','provenance']].map(([icon,small,title,desc])=><ContentBlock key={title}><div style={{display:'flex',justifyContent:'space-between',gap:8}}><ContentIcon><MaterialIcon>{icon}</MaterialIcon></ContentIcon><Pill $tone="green">Ativo</Pill></div><SectionLabel style={{marginTop:14}}>{small}</SectionLabel><RowTitle>{title}</RowTitle><RowMeta>{desc}</RowMeta><div style={{marginTop:14}}><SingletonEdit type="homePage" id="homePage"/></div></ContentBlock>)}
  </BlockGrid></div><div><CardTitle style={{fontSize:17}}>Configurações Globais</CardTitle><CardSub>Ajustes estruturais do site.</CardSub><div style={{display:'grid',gap:10,marginTop:16}}>{[['settings','WhatsApp Atendimento','SiteSettings'],['travel_explore','Global SEO','SiteSettings'],['dock_to_bottom','Footer Content','SiteSettings']].map(([i,a,b])=><div key={a} style={{display:'flex',alignItems:'center',gap:10,borderBottom:`1px solid ${t.color.line}`,padding:'12px 0'}}><MaterialIcon>{i}</MaterialIcon><div style={{flex:1}}><RowTitle>{a}</RowTitle><RowMeta>{b}</RowMeta></div><MaterialIcon>arrow_forward</MaterialIcon></div>)}</div><div style={{marginTop:16}}><SingletonEdit type="siteSettings" id="siteSettings" label="Ver todas as configurações"/></div></div></ContentHero>
  <Grid $cols={3} style={{marginTop:24}}>
   <Card><CardTitle>A Maison</CardTitle><CardSub>Sobre, visão, matéria e proveniência.</CardSub><Divider/><Chips><Chip><MaterialIcon>visibility</MaterialIcon>Visão & Matéria</Chip><Chip><MaterialIcon>history_edu</MaterialIcon>Provenance</Chip><Chip><MaterialIcon>call_to_action</MaterialIcon>CTAs</Chip></Chips><div style={{marginTop:18}}><SingletonEdit type="aboutPage" id="aboutPage" label="Configurar Página Sobre"/></div></Card>
   <Card><CardTitle>Estrutura</CardTitle><CardSub>Navegação universal e coleção.</CardSub><Divider/><div style={{display:'grid',gap:12}}><div><RowTitle>Menu Principal</RowTitle><RowMeta>Desktop e mobile compartilham destinos.</RowMeta></div><div><RowTitle>Coleções</RowTitle><RowMeta>Categorias e filtros públicos.</RowMeta></div></div><div style={{marginTop:18}}><SingletonEdit type="navigation" id="navigation" label="Editar navegação"/></div></Card>
   <Card><CardTitle>Contato</CardTitle><CardSub>Canais de atendimento e CTA.</CardSub><Divider/><Chips><Chip><MaterialIcon>chat</MaterialIcon>WhatsApp</Chip><Chip><MaterialIcon>mail</MaterialIcon>E-mail</Chip><Chip><MaterialIcon>phone_in_talk</MaterialIcon>Atendimento</Chip></Chips><div style={{marginTop:18}}><SingletonEdit type="contactPage" id="contactPage" label="Editar Tudo"/></div></Card>
  </Grid>
 </Shell></Page>
}

type Category={_id:string;title?:string;slug?:string;status?:string;description?:string;order?:number;image?:string;productCount:number}
export function SiteCategoriesPage(){
 const client=useClient({apiVersion:API_VERSION});const[cats,setCats]=useState<Category[]>([]);const[selected,setSelected]=useState('');const[q,setQ]=useState('')
 useEffect(()=>{client.fetch<Category[]>(`*[_type=="category"]|order(order asc,title asc){_id,title,"slug":slug.current,status,description,order,"image":image.asset->url,"productCount":count(*[_type=="product"&&references(^._id)])}`).then(x=>{setCats(x);setSelected(s=>s||x[0]?._id||'')})},[client]);const filtered=cats.filter(c=>(c.title||'').toLowerCase().includes(q.toLowerCase()));const c=cats.find(x=>x._id===selected)||filtered[0]
 return <Page><Shell><Header><div><Title>Categorias</Title><Subtitle>Organize o catálogo e a navegação do site.</Subtitle></div><StyledPrimaryIntent type="category"><MaterialIcon>add_circle</MaterialIcon>Nova categoria</StyledPrimaryIntent></Header><Toolbar><SearchBox><MaterialIcon>search</MaterialIcon><SearchInput value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar categoria..."/></SearchBox><Chips><Chip>Ativos {cats.filter(x=>x.status==='active').length}</Chip><Chip>Inativos {cats.filter(x=>x.status==='archive').length}</Chip><Chip><MaterialIcon>swap_vert</MaterialIcon>Ordem Editorial</Chip></Chips></Toolbar><Split>
  <div style={{display:'grid',gap:10}}>{filtered.map(item=><Card key={item._id} onClick={()=>setSelected(item._id)} style={{padding:16,cursor:'pointer',background:item._id===c?._id?t.color.surfaceLow:t.color.surfaceLowest}}><div style={{display:'flex',alignItems:'center',gap:12}}><Thumb>{item.image?<img src={item.image} alt=""/>:<MaterialIcon>category</MaterialIcon>}</Thumb><div style={{flex:1}}><RowTitle>{item.title}</RowTitle><RowMeta>{item.productCount} produtos · /{item.slug||'sem-slug'}</RowMeta></div><Pill $tone={item.status==='active'?'green':'neutral'}>{item.status==='active'?'Ativa':'Arquivada'}</Pill><span style={{fontFamily:t.typography.headline,fontWeight:700,color:t.color.lineStrong}}>{String(item.order??0).padStart(2,'0')}</span></div></Card>)}</div>
  {c?<DetailPanel><div style={{display:'flex',justifyContent:'space-between',gap:12}}><div><Pill $tone={c.status==='active'?'green':'neutral'}>{c.status==='active'?'Categoria ativa':'Arquivada'}</Pill><CardTitle style={{fontSize:24,marginTop:10}}>{c.title}</CardTitle><CardSub>/{c.slug}</CardSub></div><StyledSecondaryIntent type="category" id={c._id}><MaterialIcon>edit</MaterialIcon>Editar</StyledSecondaryIntent></div>{c.image&&<div style={{height:200,marginTop:18,borderRadius:12,overflow:'hidden'}}><img src={c.image} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/></div>}<Divider/><InfoGrid><div><InfoLabel>Produtos</InfoLabel><InfoValue>{c.productCount}</InfoValue></div><div><InfoLabel>Ordem editorial</InfoLabel><InfoValue>{c.order??'—'}</InfoValue></div></InfoGrid><Divider/><InfoLabel>Descrição</InfoLabel><InfoValue>{c.description||'Sem descrição cadastrada.'}</InfoValue></DetailPanel>:<Empty>Selecione uma categoria.</Empty>}
 </Split></Shell></Page>
}

export function SiteSettingsPage(){return <Page><Shell><Header><div><Title>Configurações</Title><Subtitle>Preferências globais, navegação, SEO e canais oficiais.</Subtitle></div></Header><Grid $cols={2}>
 <Card><CardHeader><div><CardTitle>SiteSettings</CardTitle><CardSub>WhatsApp, locale, moeda, rodapé e SEO padrão.</CardSub></div><IconTile><MaterialIcon>settings</MaterialIcon></IconTile></CardHeader><InfoGrid><div><InfoLabel>Moeda</InfoLabel><InfoValue>BRL</InfoValue></div><div><InfoLabel>Locale</InfoLabel><InfoValue>pt-BR</InfoValue></div><div><InfoLabel>Ambiente</InfoLabel><InfoValue>production</InfoValue></div><div><InfoLabel>Preview</InfoLabel><InfoValue>Separado de produção</InfoValue></div></InfoGrid><div style={{marginTop:20}}><SingletonEdit type="siteSettings" id="siteSettings" label="Editar configurações globais"/></div></Card>
 <Card><CardHeader><div><CardTitle>Navegação</CardTitle><CardSub>Menu universal para desktop e mobile.</CardSub></div><IconTile $tone="blue"><MaterialIcon>menu</MaterialIcon></IconTile></CardHeader><CardSub>Links principais, categorias referenciadas e destinos utilitários devem ser administrados em uma única fonte.</CardSub><div style={{marginTop:20}}><SingletonEdit type="navigation" id="navigation" label="Editar navegação"/></div></Card>
 <Card><CardHeader><div><CardTitle>SEO global</CardTitle><CardSub>Metadados padrão e imagem social.</CardSub></div><IconTile $tone="sand"><MaterialIcon>travel_explore</MaterialIcon></IconTile></CardHeader><CardSub>As páginas podem sobrescrever o padrão; o fallback global permanece centralizado no SiteSettings.</CardSub><div style={{marginTop:20}}><SingletonEdit type="siteSettings" id="siteSettings" label="Revisar SEO"/></div></Card>
 <Card><CardHeader><div><CardTitle>Segurança de dados</CardTitle><CardSub>Site público isolado do Business Desk.</CardSub></div><IconTile $tone="red"><MaterialIcon>shield</MaterialIcon></IconTile></CardHeader><Chips><Chip>Dataset: production</Chip><Chip>Business: privado</Chip><Chip>CORS controlado</Chip></Chips></Card>
 </Grid></Shell></Page>}
