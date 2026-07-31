import {route, useRouter} from 'sanity/router'
import {
  SiteCategoriesPage,
  SiteContentPage,
  SiteDashboardPage,
  SiteProductsPage,
  SiteSettingsPage,
} from '../../dashboard/stitch/SitePages'
import {
  AfterSalesPage,
  CustomersPage,
  ReportsPage,
  SalesPage,
} from '../../dashboard/stitch/BusinessPages'

export const cmsToolRouter = route.create('/', [
  route.create('/:view', [route.create('/:id')]),
])

type CmsRouteState = {
  view?: string
  id?: string
}

function NotFound({workspace}: {workspace: 'site' | 'business'}) {
  const href = workspace === 'site' ? '/site/cms/dashboard' : '/business/cms/customers'
  return (
    <main style={{padding: 40}}>
      <h1 style={{margin: 0, fontSize: 28}}>Página não encontrada</h1>
      <p>O endereço solicitado não faz parte do CMS Esméra.</p>
      <a href={href}>Voltar ao CMS</a>
    </main>
  )
}

export function SiteCmsTool() {
  const {state} = useRouter()
  const {view} = state as CmsRouteState

  switch (view || 'dashboard') {
    case 'dashboard': return <SiteDashboardPage />
    case 'content': return <SiteContentPage />
    case 'products': return <SiteProductsPage />
    case 'categories': return <SiteCategoriesPage />
    case 'settings': return <SiteSettingsPage />
    default: return <NotFound workspace="site" />
  }
}

export function BusinessCmsTool() {
  const {state} = useRouter()
  const {view} = state as CmsRouteState

  switch (view || 'customers') {
    case 'customers': return <CustomersPage />
    case 'sales':
    case 'pipeline': return <SalesPage />
    case 'after-sales': return <AfterSalesPage />
    case 'reports': return <ReportsPage />
    default: return <NotFound workspace="business" />
  }
}
