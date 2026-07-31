import {useEffect} from 'react'
import {useRouter} from 'sanity/router'
import styled from 'styled-components'
import {CmsIcon} from '../CmsIcon'
import {useCmsShell} from '../CmsShellContext'
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

const Aside = styled.aside<{$open: boolean}>`
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 1100;
  display: flex;
  width: ${t.layout.sidebar}px;
  height: 100dvh;
  flex-direction: column;
  gap: 8px;
  border-right: 1px solid color-mix(in srgb, ${t.color.line} 72%, transparent);
  background: ${t.color.surface};
  padding: 24px 0;
  transition: transform ${t.motion.drawer} ${t.motion.easing};

  @media (max-width: 1023px) and (min-width: 721px) {
    width: ${t.layout.sidebarTablet}px;
  }

  @media (max-width: 720px) {
    width: min(${t.layout.sidebar}px, 86vw);
    transform: translateX(${({$open}) => ($open ? '0' : '-105%')});
    box-shadow: ${({$open}) => ($open ? t.shadow.modal : 'none')};
  }
`

const Overlay = styled.button<{$open: boolean}>`
  position: fixed;
  inset: 0;
  z-index: 1050;
  display: none;
  border: 0;
  background: rgba(17, 28, 45, .22);
  opacity: ${({$open}) => ($open ? 1 : 0)};
  pointer-events: ${({$open}) => ($open ? 'auto' : 'none')};
  transition: opacity ${t.motion.drawer} ${t.motion.easing};

  @media (max-width: 720px) { display: block; }
`

const Brand = styled.a`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 24px 30px;
  color: ${t.color.primary};
  text-decoration: none;

  @media (max-width: 1023px) and (min-width: 721px) {
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
`

const BrandCopy = styled.span`
  min-width: 0;
  @media (max-width: 1023px) and (min-width: 721px) { display: none; }
`

const BrandTitle = styled.strong`
  display: block;
  font-family: ${t.typography.family};
  font-size: 19px;
  line-height: 26px;
  font-weight: 600;
`

const BrandMeta = styled.small`
  display: block;
  margin-top: 1px;
  color: ${t.color.textSecondary};
  font-size: 12px;
  line-height: 16px;
  opacity: .72;
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
  border-radius: ${t.radius.navItem}px;
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

  > svg { width: 22px; height: 22px; flex: 0 0 22px; }

  @media (max-width: 1023px) and (min-width: 721px) {
    justify-content: center;
    padding: 0;
    [data-nav-label] { display: none; }
  }
`

const Bottom = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-top: 1px solid color-mix(in srgb, ${t.color.line} 72%, transparent);
  padding-top: 16px;
`

function activeFor(path: string, matches: string[]) {
  if (path.includes('/intent/')) {
    return matches.some((match) => path.toLowerCase().includes(match.toLowerCase()))
  }
  return matches.some((match) => path.split(/[/?;]/).some((part) => part === match))
}

export function StitchSidebar() {
  const {state} = useRouter()
  const {sidebarOpen, setSidebarOpen} = useCmsShell()
  const path = typeof window === 'undefined' ? '' : `${window.location.pathname}${window.location.search}`

  useEffect(() => {
    setSidebarOpen(false)
  }, [state, setSidebarOpen])

  return (
    <>
      <Overlay $open={sidebarOpen} aria-label="Fechar menu" onClick={() => setSidebarOpen(false)} type="button" />
      <Aside $open={sidebarOpen} aria-label="Navegação principal">
        <Brand href="/site/cms/dashboard">
          <BrandMark><CmsIcon name="eco" size={23} /></BrandMark>
          <BrandCopy>
            <BrandTitle>Esméra CMS</BrandTitle>
            <BrandMeta>Management Portal</BrandMeta>
          </BrandCopy>
        </Brand>
        <Nav>
          {nav.map((item) => (
            <NavLink key={item.label} href={item.href} $active={activeFor(path, item.match)}>
              <CmsIcon name={item.icon} size={22} />
              <span data-nav-label>{item.label}</span>
            </NavLink>
          ))}
        </Nav>
        <Bottom>
          <NavLink href="mailto:suporte@esmera.com.br">
            <CmsIcon name="help" size={22} />
            <span data-nav-label>Suporte</span>
          </NavLink>
          <NavLink href="/logout">
            <CmsIcon name="logout" size={22} />
            <span data-nav-label>Sair</span>
          </NavLink>
        </Bottom>
      </Aside>
    </>
  )
}
