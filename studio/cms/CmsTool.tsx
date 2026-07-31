import type {ReactNode} from 'react'
import {route, useRouter} from 'sanity/router'
import {
  AfterSalesPage,
  BusinessHealthGate,
  CustomersPage,
  PipelinePage,
  ReportsPage,
  SalesPage,
  SiteCategoriesPage,
  SiteContentPage,
  SiteDashboardPage,
  SiteProductEditorPage,
  SiteProductsPage,
  SiteSettingsPage,
} from '../../dashboard/operational'

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
  const {view, id} = state as CmsRouteState

  switch (view || 'dashboard') {
    case 'dashboard': return <SiteDashboardPage />
    case 'content': return <SiteContentPage />
    case 'products': return <SiteProductsPage />
    case 'product': return id ? <SiteProductEditorPage id={id} /> : <SiteProductsPage />
    case 'categories': return <SiteCategoriesPage />
    case 'settings': return <SiteSettingsPage />
    default: return <NotFound workspace="site" />
  }
}

export function BusinessCmsTool() {
  const {state} = useRouter()
  const {view} = state as CmsRouteState

  let page: ReactNode
  switch (view || 'customers') {
    case 'customers': page = <CustomersPage />; break
    case 'sales': page = <SalesPage />; break
    case 'pipeline': page = <PipelinePage />; break
    case 'after-sales': page = <AfterSalesPage />; break
    case 'reports': page = <ReportsPage />; break
    default: return <NotFound workspace="business" />
  }

  return <BusinessHealthGate>{page}</BusinessHealthGate>
}
