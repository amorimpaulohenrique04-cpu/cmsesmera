import {type NavbarProps, useWorkspace} from 'sanity'
import {useIntentLink} from 'sanity/router'
import styled from 'styled-components'
import {CmsIcon} from './CmsIcon'
import {useCmsShell} from './CmsShellContext'
import {esmeraTokens as t} from './esmeraTokens'

const Bar = styled.header`
  position: sticky;
  top: 0;
  z-index: 900;
  display: flex;
  min-height: ${t.layout.header}px;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  background: color-mix(in srgb, ${t.color.surface} 86%, transparent);
  padding: 0 ${t.layout.pagePaddingDesktop}px;
  backdrop-filter: blur(14px);

  @media (max-width: 1023px) { padding: 0 24px; }
  @media (max-width: 720px) { min-height: 68px; gap: 12px; padding: 0 16px; }
`

const Left = styled.div`
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  gap: 12px;
`

const MenuButton = styled.button`
  display: none;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  place-items: center;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: ${t.color.textSecondary};
  cursor: pointer;

  &:hover { background: ${t.color.surfaceContainer}; }

  @media (max-width: 720px) { display: grid; }
`

const SearchWrap = styled.label`
  position: relative;
  display: block;
  width: min(448px, 46vw);

  > svg {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: ${t.color.lineStrong};
    pointer-events: none;
  }

  @media (max-width: 720px) { width: 100%; }
`

const Search = styled.input`
  width: 100%;
  height: 42px;
  border: 1px solid transparent;
  border-radius: 999px;
  outline: 0;
  background: ${t.color.surfaceLow};
  color: ${t.color.ink};
  padding: 0 16px 0 48px;
  font-family: ${t.typography.family};
  font-size: 14px;
  line-height: 20px;

  &:focus {
    border-color: color-mix(in srgb, ${t.color.primary} 55%, transparent);
    box-shadow: 0 0 0 2px color-mix(in srgb, ${t.color.primary} 12%, transparent);
  }

  &::placeholder { color: ${t.color.textSecondary}; opacity: .72; }
`

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const NewButton = styled.a`
  display: inline-flex;
  height: 42px;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  background: ${t.color.primary};
  color: ${t.color.onPrimary};
  padding: 0 22px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: opacity .15s ease;

  &:hover { opacity: .9; }
  @media (max-width: 760px) { display: none; }
`

const IconButton = styled.button`
  position: relative;
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: ${t.color.textSecondary};
  cursor: pointer;

  &:hover { background: ${t.color.surfaceContainer}; }

  &::after {
    content: '';
    position: absolute;
    right: 9px;
    top: 8px;
    width: 7px;
    height: 7px;
    border: 2px solid ${t.color.surface};
    border-radius: 50%;
    background: ${t.color.error};
  }
`

const Avatar = styled.div`
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border: 2px solid ${t.color.primaryContainer};
  border-radius: 999px;
  background: ${t.color.primarySoft};
  color: ${t.color.primary};
  font-family: ${t.typography.family};
  font-size: 12px;
  font-weight: 700;

  @media (max-width: 560px) { display: none; }
`

export function EsmeraNavbar(_props: NavbarProps) {
  const {dataset} = useWorkspace()
  const {toggleSidebar} = useCmsShell()
  const createLink = useIntentLink({intent: 'create', params: {type: dataset === 'business' ? 'lead' : 'product'}})

  return (
    <Bar>
      <Left>
        <MenuButton aria-label="Abrir menu" onClick={toggleSidebar} type="button">
          <CmsIcon name="menu" size={22} />
        </MenuButton>
        <SearchWrap>
          <CmsIcon name="search" size={21} />
          <Search aria-label="Pesquisar" placeholder="Pesquisar qualquer coisa..." />
        </SearchWrap>
      </Left>
      <Actions>
        <NewButton href={createLink.href} onClick={createLink.onClick}>
          <CmsIcon name="add" size={18} />
          Novo
        </NewButton>
        <IconButton aria-label="Notificações" type="button">
          <CmsIcon name="notifications" size={23} />
        </IconButton>
        <Avatar title="Perfil Esméra">ES</Avatar>
      </Actions>
    </Bar>
  )
}
