import {useEffect, useState} from 'react'
import {Spinner} from '@sanity/ui'
import {useClient} from 'sanity'
import {
  DashboardPage,
  DashboardShell,
  EmptyState,
  Eyebrow,
  LoadingWrap,
  MetricCard,
  MetricDetail,
  MetricLabel,
  MetricsGrid,
  MetricValue,
  PageHeader,
  PageSubtitle,
  PageTitle,
  Panel,
  PanelTitle,
  Row,
  RowCopy,
  RowMeta,
  Rows,
  RowTitle,
  StatusPill,
  TwoColumnGrid,
} from './dashboardStyles'

const API_VERSION = '2026-07-30'

type RecentProduct = {
  _id: string
  title?: string
  code?: string
  status?: string
  availability?: string
  _updatedAt?: string
}

type SiteDashboardData = {
  activeProducts: number
  archivedProducts: number
  categories: number
  drafts: number
  publishedPages: number
  recentProducts: RecentProduct[]
}

const query = `{
  "activeProducts": count(*[_type == "product" && status == "active"]),
  "archivedProducts": count(*[_type == "product" && status == "archive"]),
  "categories": count(*[_type == "category" && status == "active"]),
  "drafts": count(*[_id in path("drafts.**")]),
  "publishedPages": count(*[
    _id in ["homePage", "aboutPage", "contactPage", "collectionPage", "navigation", "siteSettings"]
  ]),
  "recentProducts": *[_type == "product"] | order(_updatedAt desc)[0...6]{
    _id,
    title,
    code,
    status,
    availability,
    _updatedAt
  }
}`

function formatUpdatedAt(value?: string) {
  if (!value) return 'Sem data'
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function Metric({
  label,
  value,
  detail,
}: {
  label: string
  value: string | number
  detail?: string
}) {
  return (
    <MetricCard>
      <MetricLabel>{label}</MetricLabel>
      <MetricValue>{value}</MetricValue>
      {detail ? <MetricDetail>{detail}</MetricDetail> : null}
    </MetricCard>
  )
}

export function SiteDashboard() {
  const client = useClient({apiVersion: API_VERSION})
  const [data, setData] = useState<SiteDashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    client
      .fetch<SiteDashboardData>(query)
      .then((result) => {
        if (active) setData(result)
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : 'Não foi possível carregar o painel.')
        }
      })

    return () => {
      active = false
    }
  }, [client])

  if (error) {
    return (
      <DashboardPage>
        <DashboardShell>
          <Eyebrow>ESMÉRA / SANITY CMS</Eyebrow>
          <PageTitle>Não foi possível carregar a visão editorial.</PageTitle>
          <PageSubtitle>{error}</PageSubtitle>
        </DashboardShell>
      </DashboardPage>
    )
  }

  if (!data) {
    return (
      <DashboardPage>
        <LoadingWrap>
          <Spinner muted />
        </LoadingWrap>
      </DashboardPage>
    )
  }

  return (
    <DashboardPage>
      <DashboardShell>
        <PageHeader>
          <div>
            <Eyebrow>ESMÉRA / SANITY CMS</Eyebrow>
            <PageTitle>Conteúdo claro. Catálogo confiável.</PageTitle>
            <PageSubtitle>
              O que precisa de atenção no site, sem expor nomes técnicos de schema.
            </PageSubtitle>
          </div>
        </PageHeader>

        <MetricsGrid>
          <Metric
            label="Produtos ativos"
            value={data.activeProducts}
            detail={`${data.archivedProducts} arquivados`}
          />
          <Metric
            label="Categorias"
            value={data.categories}
            detail="ativas no catálogo"
          />
          <Metric
            label="Rascunhos"
            value={data.drafts}
            detail="conteúdo ainda não publicado"
          />
          <Metric
            label="Áreas publicadas"
            value={`${data.publishedPages}/6`}
            detail="Home, páginas, navegação e configurações"
          />
        </MetricsGrid>

        <TwoColumnGrid>
          <Panel>
            <PanelTitle>Produtos atualizados recentemente</PanelTitle>
            {data.recentProducts.length ? (
              <Rows>
                {data.recentProducts.map((product) => (
                  <Row key={product._id}>
                    <RowCopy>
                      <RowTitle>{product.title || 'Produto sem título'}</RowTitle>
                      <RowMeta>
                        {[product.code, formatUpdatedAt(product._updatedAt)]
                          .filter(Boolean)
                          .join(' · ')}
                      </RowMeta>
                    </RowCopy>
                    <StatusPill $tone={product.status === 'active' ? 'green' : 'neutral'}>
                      {product.status === 'active' ? 'Ativo' : product.status || 'Rascunho'}
                    </StatusPill>
                  </Row>
                ))}
              </Rows>
            ) : (
              <EmptyState>Nenhum produto cadastrado ainda.</EmptyState>
            )}
          </Panel>

          <Panel>
            <PanelTitle>Regra de ouro</PanelTitle>
            <PageSubtitle>
              Produto é entidade única. Home, Signature e Matter devem selecionar referências
              existentes — nunca reescrever título, preço, código ou disponibilidade.
            </PageSubtitle>
          </Panel>
        </TwoColumnGrid>
      </DashboardShell>
    </DashboardPage>
  )
}
