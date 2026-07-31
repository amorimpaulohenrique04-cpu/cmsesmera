import {useEffect, useMemo, useState} from 'react'
import {type NavbarProps, useClient, useCurrentUser, useWorkspace} from 'sanity'
import {useIntentLink, useRouter} from 'sanity/router'
import styled from 'styled-components'
import {CmsIcon} from './CmsIcon'
import {useCmsShell} from './CmsShellContext'
import {esmeraTokens as t} from './esmeraTokens'

const API_VERSION = '2026-07-31'

const Bar = styled.header`
  position: sticky; top: 0; z-index: 900; display: flex; min-height: ${t.layout.header}px;
  align-items: center; justify-content: space-between; gap: 24px;
  background: color-mix(in srgb, ${t.color.surface} 86%, transparent);
  padding: 0 ${t.layout.pagePaddingDesktop}px; backdrop-filter: blur(14px);
  @media (max-width: 1023px) { padding: 0 24px; }
  @media (max-width: 720px) { min-height: 68px; gap: 12px; padding: 0 16px; }
`
const Left = styled.div`position:relative;display:flex;min-width:0;flex:1;align-items:center;gap:12px;`
const MenuButton = styled.button`
  display:none;width:42px;height:42px;flex:0 0 42px;place-items:center;border:0;border-radius:999px;background:transparent;color:${t.color.textSecondary};cursor:pointer;
  &:hover{background:${t.color.surfaceContainer}} @media(max-width:720px){display:grid}
`
const SearchWrap = styled.div`position:relative;display:block;width:min(448px,46vw);@media(max-width:720px){width:100%}`
const SearchIcon = styled.span`position:absolute;left:16px;top:50%;transform:translateY(-50%);color:${t.color.lineStrong};pointer-events:none;`
const Search = styled.input`
  width:100%;height:42px;border:1px solid transparent;border-radius:999px;outline:0;background:${t.color.surfaceLow};color:${t.color.ink};padding:0 16px 0 48px;font-family:${t.typography.family};font-size:14px;line-height:20px;
  &:focus{border-color:color-mix(in srgb,${t.color.primary} 55%,transparent);box-shadow:0 0 0 2px color-mix(in srgb,${t.color.primary} 12%,transparent)}
  &::placeholder{color:${t.color.textSecondary};opacity:.72}
`
const SearchPanel = styled.div`
  position:absolute;left:0;top:48px;width:min(448px,calc(100vw - 32px));overflow:hidden;border:1px solid ${t.color.line};border-radius:12px;background:${t.color.surfaceLowest};box-shadow:${t.shadow.popover};
`
const SearchResult = styled.a`display:flex;align-items:center;justify-content:space-between;gap:12px;border-bottom:1px solid ${t.color.line};color:${t.color.ink};padding:12px 14px;font-size:13px;text-decoration:none;&:last-child{border-bottom:0}&:hover{background:${t.color.surfaceLow}}`
const SearchStatus = styled.div`padding:14px;color:${t.color.textSecondary};font-size:13px;`
const Actions = styled.div`position:relative;display:flex;align-items:center;gap:12px;`
const NewButton = styled.a`display:inline-flex;height:42px;align-items:center;gap:8px;border-radius:999px;background:${t.color.primary};color:${t.color.onPrimary};padding:0 22px;font-size:13px;font-weight:600;text-decoration:none;&:hover{opacity:.9}@media(max-width:760px){display:none}`
const IconButton = styled.button`position:relative;display:grid;width:42px;height:42px;place-items:center;border:0;border-radius:999px;background:transparent;color:${t.color.textSecondary};cursor:pointer;&:hover{background:${t.color.surfaceContainer}}`
const NotificationDot = styled.span`position:absolute;right:8px;top:7px;min-width:9px;height:9px;border:2px solid ${t.color.surface};border-radius:999px;background:${t.color.error};`
const NotificationPanel = styled.div`position:absolute;right:44px;top:50px;width:300px;border:1px solid ${t.color.line};border-radius:12px;background:${t.color.surfaceLowest};box-shadow:${t.shadow.popover};padding:14px;@media(max-width:560px){right:0;width:min(300px,calc(100vw - 32px))}`
const Avatar = styled.div`display:grid;width:40px;height:40px;place-items:center;border:2px solid ${t.color.primaryContainer};border-radius:999px;background:${t.color.primarySoft};color:${t.color.primary};font-family:${t.typography.family};font-size:12px;font-weight:700;@media(max-width:560px){display:none}`

type SearchEntry={label:string;count:number;href:string}

export function EsmeraNavbar(_props: NavbarProps) {
  const workspace = useWorkspace()
  const client = useClient({apiVersion: API_VERSION})
  const currentUser = useCurrentUser()
  useRouter()
  const {toggleSidebar} = useCmsShell()
  const createLink = useIntentLink({intent: 'create', params: {type: workspace.dataset === 'business' ? 'lead' : 'product'}})
  const pathname = typeof window === 'undefined' ? '' : window.location.pathname
  const isCmsTool = /\/(site|business)\/cms(?:\/|$)/.test(pathname)
  const initials = (currentUser?.name || 'Esméra').split(/\s+/).filter(Boolean).slice(0,2).map((part)=>part[0]).join('').toUpperCase()
  const businessClient = useMemo(()=>client.withConfig({dataset:'business'}),[client])
  const [query,setQuery]=useState('')
  const [searching,setSearching]=useState(false)
  const [searchError,setSearchError]=useState(false)
  const [results,setResults]=useState<SearchEntry[]>([])
  const [notificationCount,setNotificationCount]=useState<number|null>(null)
  const [notificationsOpen,setNotificationsOpen]=useState(false)

  useEffect(()=>{
    const needle=query.trim()
    if(needle.length<2){setResults([]);setSearching(false);setSearchError(false);return}
    setSearching(true);setSearchError(false)
    const timer=window.setTimeout(()=>{
      const pattern=`*${needle}*`
      const request=workspace.dataset==='business'
        ? client.fetch<{customers:number;leads:number;sales:number}>(`{"customers":count(*[_type=="customer"&&name match $pattern]),"leads":count(*[_type=="lead"&&name match $pattern]),"sales":count(*[_type=="sale"&&(number match $pattern||customer->name match $pattern)])}`,{pattern})
        : client.fetch<{products:number;categories:number}>(`{"products":count(*[_type=="product"&&(title match $pattern||code match $pattern)]),"categories":count(*[_type=="category"&&title match $pattern])}`,{pattern})
      request.then((data)=>{
        if(workspace.dataset==='business'){
          const value=data as {customers:number;leads:number;sales:number}
          setResults([
            {label:'Clientes',count:value.customers,href:`/business/cms/customers?search=${encodeURIComponent(needle)}`},
            {label:'Leads / Pipeline',count:value.leads,href:'/business/cms/pipeline'},
            {label:'Vendas',count:value.sales,href:`/business/cms/sales?search=${encodeURIComponent(needle)}`},
          ])
        }else{
          const value=data as {products:number;categories:number}
          setResults([
            {label:'Produtos',count:value.products,href:`/site/cms/products?search=${encodeURIComponent(needle)}`},
            {label:'Categorias',count:value.categories,href:`/site/cms/categories?search=${encodeURIComponent(needle)}`},
          ])
        }
        setSearching(false)
      }).catch(()=>{setSearchError(true);setSearching(false);setResults([])})
    },250)
    return()=>window.clearTimeout(timer)
  },[client,query,workspace.dataset])

  useEffect(()=>{
    businessClient.fetch<{tasks:number;followups:number}>(`{"tasks":count(*[_type=="task"&&status!="done"]),"followups":count(*[_type=="afterSale"&&count(followUps[status=="pending"])>0])}`).then((value)=>setNotificationCount(value.tasks+value.followups)).catch(()=>setNotificationCount(null))
  },[businessClient,pathname])

  return <Bar>
    <Left>
      {isCmsTool?<MenuButton aria-label="Abrir menu" onClick={toggleSidebar} type="button"><CmsIcon name="menu" size={22}/></MenuButton>:null}
      <SearchWrap>
        <SearchIcon><CmsIcon name="search" size={21}/></SearchIcon>
        <Search aria-label="Pesquisar no CMS" placeholder="Pesquisar qualquer coisa..." value={query} onChange={(event)=>setQuery(event.target.value)} />
        {query.trim().length>=2?<SearchPanel>{searching?<SearchStatus>Pesquisando...</SearchStatus>:searchError?<SearchStatus>Busca indisponível nesta fonte.</SearchStatus>:results.map((result)=><SearchResult key={result.label} href={result.href}><span>{result.label}</span><strong>{result.count}</strong></SearchResult>)}</SearchPanel>:null}
      </SearchWrap>
    </Left>
    <Actions>
      <NewButton href={createLink.href} onClick={createLink.onClick}><CmsIcon name="add" size={18}/>Novo</NewButton>
      <IconButton aria-label="Notificações" aria-expanded={notificationsOpen} type="button" onClick={()=>setNotificationsOpen((open)=>!open)}><CmsIcon name="notifications" size={23}/>{typeof notificationCount==='number'&&notificationCount>0?<NotificationDot/>:null}</IconButton>
      {notificationsOpen?<NotificationPanel><strong style={{fontFamily:t.typography.headline,fontSize:14}}>Pendências comerciais</strong>{notificationCount===null?<p style={{margin:'8px 0 0',fontSize:13,color:t.color.textSecondary}}>Fonte Business indisponível.</p>:notificationCount===0?<p style={{margin:'8px 0 0',fontSize:13,color:t.color.textSecondary}}>Nenhuma pendência registrada.</p>:<><p style={{margin:'8px 0 12px',fontSize:13,color:t.color.textSecondary}}>{notificationCount} item(ns) exigem acompanhamento.</p><a href="/business/cms/after-sales" style={{color:t.color.primary,fontSize:13,fontWeight:600}}>Abrir pós-venda</a></>}</NotificationPanel>:null}
      <Avatar title={currentUser?.name||'Perfil Esméra'}>{initials||'ES'}</Avatar>
    </Actions>
  </Bar>
}
