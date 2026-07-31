import {useEffect, useState} from 'react'
import styled from 'styled-components'
import {esmeraTokens as t} from '../esmeraTokens'

const nav = [
  {label: 'Dashboard', icon: 'dashboard', href: '/site/cms/dashboard', match: ['dashboard']},
  {label: 'Conteúdo do site', icon: 'web', href: '/site/cms/content', match: ['content', 'homePage', 'aboutPage', 'contactPage', 'collectionPage', 'navigation']},
  {label: 'Produtos', icon: 'inventory_2', href: '/site/cms/products', match: ['products', 'product']},
  {label: 'Categorias', icon: 'category', href: '/site/cms/categories', match: ['categories', 'category']},
  {label: 'Clientes', icon: 'group', href: '/business/cms/customers', match: ['customers', 'customer', 'lead']},
  {label: 'Vendas', icon: 'shopping_cart', href: '/business/cms/sales', match: ['sales', 'sale', 'pipeline']},
  {label: 'Pós-venda', icon: 'support_agent', href: '/business/cms/after-sales', match: ['after-sales', 'afterSale']},
  {label: 'Relatórios', icon: 'analytics', href: '/business/cms/reports', match: ['reports']},
  {label: 'Configurações', icon: 'settings', href: '/site/cms/settings', match: ['settings', 'siteSettings']},
]

const Aside = styled.aside`
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 1000;
  display: flex;
  width: ${t.layout.sidebar}px;
  height: 100vh;
  flex-direction: column;
  gap: 8px;
  border-right: 1px solid ${t.color.line};
  background: ${t.color.surface};
  padding: 24px 0;

  @media (max-width: 1023px) {
    width: 84px;
  }
  @media (max-width: 720px) {
    width: 72px;
  }
`

const Brand = styled.a`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 24px 30px;
  color: ${t.color.primary};
  text-decoration: none;

  @media (max-width: 1023px) {
    justify-content: center;
    margin: 0 0 30px;
  }
`
const BrandMark = styled.span`
  display: grid;
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  place-items: center;
  border-radius: 12px;
  background: ${t.color.primaryContainer};
  color: ${t.color.onPrimaryContainer};
  font-family: 'Material Symbols Outlined';
  font-size: 24px;
  font-variation-settings: 'FILL' 1;
`
const BrandCopy = styled.span`
  min-width: 0;
  @media (max-width: 1023px) { display: none; }
`
const BrandTitle = styled.strong`
  display: block;
  font-family: ${t.typography.headline};
  font-size: 20px;
  line-height: 28px;
`
const BrandMeta = styled.small`
  display: block;
  margin-top: 1px;
  color: ${t.color.textSecondary};
  font-size: 13px;
  line-height: 16px;
  opacity: .7;
`
const Nav = styled.nav`
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`
const NavLink = styled.a<{$active?: boolean}>`
  position: relative;
  display: flex;
  min-height: 48px;
  align-items: center;
  gap: 12px;
  margin: 0 8px;
  border-left: 4px solid ${({$active}) => ($active ? t.color.primary : 'transparent')};
  border-radius: 12px;
  background: ${({$active}) => ($active ? t.color.primaryContainer : 'transparent')};
  color: ${({$active}) => ($active ? t.color.onPrimaryContainer : t.color.textSecondary)};
  padding: 0 14px 0 12px;
  font-size: 13px;
  font-weight: 600;
  line-height: 16px;
  text-decoration: none;
  transition: background-color .16s ease, color .16s ease, transform .12s ease;
  &:hover { background: ${({$active}) => ($active ? t.color.primaryContainer : t.color.surfaceHigh)}; }
  &:active { transform: scale(.985); }
  .material-symbols-outlined {
    width: 24px;
    flex: 0 0 24px;
    font-size: 24px;
    font-variation-settings: 'FILL' ${({$active}) => ($active ? 1 : 0)};
  }
  @media (max-width: 1023px) {
    justify-content: center;
    padding: 0;
    span:last-child { display: none; }
  }
`
const Bottom = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-top: 1px solid ${t.color.line};
  padding-top: 16px;
`

function activeFor(path: string, matches: string[]) {
  if (path.includes('/intent/')) {
    return matches.some((m) => path.toLowerCase().includes(m.toLowerCase()))
  }
  return matches.some((m) => path.split(/[/?;]/).some((part) => part === m))
}

export function StitchSidebar() {
  const [path, setPath] = useState(() => (typeof window === 'undefined' ? '' : window.location.pathname + window.location.search))
  useEffect(() => {
    const sync = () => setPath(window.location.pathname + window.location.search)
    window.addEventListener('popstate', sync)
    const interval = window.setInterval(sync, 500)
    return () => { window.removeEventListener('popstate', sync); window.clearInterval(interval) }
  }, [])

  return (
    <Aside aria-label="Navegação principal">
      <Brand href="/site/cms/dashboard">
        <BrandMark>eco</BrandMark>
        <BrandCopy><BrandTitle>Esméra CMS</BrandTitle><BrandMeta>Management Portal</BrandMeta></BrandCopy>
      </Brand>
      <Nav>
        {nav.map((item) => (
          <NavLink key={item.label} href={item.href} $active={activeFor(path, item.match)}>
            <span className="material-symbols-outlined">{item.icon}</span><span>{item.label}</span>
          </NavLink>
        ))}
      </Nav>
      <Bottom>
        <NavLink href="mailto:suporte@esmera.com.br"><span className="material-symbols-outlined">help</span><span>Suporte</span></NavLink>
        <NavLink href="/logout"><span className="material-symbols-outlined">logout</span><span>Sair</span></NavLink>
      </Bottom>
    </Aside>
  )
}
