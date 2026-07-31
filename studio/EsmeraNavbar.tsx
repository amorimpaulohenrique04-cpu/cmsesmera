import {type NavbarProps, useWorkspace} from 'sanity'
import {useIntentLink} from 'sanity/router'
import styled from 'styled-components'
import {esmeraTokens as t} from './esmeraTokens'

const Bar = styled.header`
  position: relative;
  z-index: 50;
  display: flex;
  min-height: ${t.layout.header}px;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  border-bottom: 0;
  background: color-mix(in srgb, ${t.color.surface} 84%, transparent);
  padding: 0 ${t.layout.pagePaddingDesktop}px;
  backdrop-filter: blur(14px);
  @media (max-width: 1023px) { padding: 0 24px; }
  @media (max-width: 720px) { min-height: 68px; padding: 0 16px; }
`
const SearchWrap = styled.label`
  position: relative;
  display: block;
  width: min(448px, 46vw);
  .material-symbols-outlined { position:absolute; left:16px; top:50%; transform:translateY(-50%); color:${t.color.lineStrong}; font-size:22px; }
  @media (max-width: 680px) { width: 100%; }
`
const Search = styled.input`
  width: 100%; height: 42px; border: 0 !important; border-radius: 999px !important;
  background: ${t.color.surfaceLow}; color:${t.color.ink}; padding: 0 16px 0 48px;
  font-family:${t.typography.family}; font-size:16px; line-height:24px; outline:0;
  &:focus { box-shadow: 0 0 0 2px ${t.color.primary} !important; }
  &::placeholder { color:${t.color.textSecondary}; opacity:.72; }
`
const Actions = styled.div`display:flex; align-items:center; gap:12px; @media(max-width:680px){display:none;}`
const NewButton = styled.a`
  display:inline-flex; height:42px; align-items:center; gap:8px; border-radius:999px;
  background:${t.color.primary}; color:${t.color.onPrimary}; padding:0 22px;
  font-size:13px; font-weight:600; text-decoration:none; transition:opacity .15s ease;
  &:hover{opacity:.9} .material-symbols-outlined{font-size:20px}
`
const IconButton = styled.button`
  position:relative; display:grid; width:42px; height:42px; place-items:center; border:0; border-radius:999px;
  background:transparent; color:${t.color.textSecondary}; cursor:pointer;
  &:hover{background:${t.color.surfaceContainer}} .material-symbols-outlined{font-size:24px}
  &::after{content:'';position:absolute;right:9px;top:8px;width:7px;height:7px;border-radius:50%;background:${t.color.error};}
`
const Avatar = styled.div`
  display:grid; width:40px; height:40px; place-items:center; border:2px solid ${t.color.primaryContainer}; border-radius:999px;
  background:${t.color.primarySoft}; color:${t.color.primary}; font-family:${t.typography.headline}; font-size:13px; font-weight:700;
`

export function EsmeraNavbar(_props: NavbarProps) {
  const {dataset} = useWorkspace()
  const createLink = useIntentLink({intent: 'create', params: {type: dataset === 'business' ? 'lead' : 'product'}})
  return (
    <Bar>
      <SearchWrap>
        <span className="material-symbols-outlined">search</span>
        <Search aria-label="Pesquisar" placeholder="Pesquisar qualquer coisa..." onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const value = e.currentTarget.value.trim()
            if (value) window.location.href = `${dataset === 'business' ? '/business' : '/site'}/search?query=${encodeURIComponent(value)}`
          }
        }}/>
      </SearchWrap>
      <Actions>
        <NewButton href={createLink.href} onClick={createLink.onClick}><span className="material-symbols-outlined">add</span>Novo</NewButton>
        <IconButton aria-label="Notificações"><span className="material-symbols-outlined">notifications</span></IconButton>
        <Avatar title="Perfil">ES</Avatar>
      </Actions>
    </Bar>
  )
}
