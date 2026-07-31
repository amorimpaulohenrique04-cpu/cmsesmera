import {useEffect, useState} from 'react'
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
  SkeletonBlock,
  SkeletonGrid,
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
  priceMode?: string
  _updatedAt?: string
}

type SiteDashboardData = {
  pieces: number
  available: number
  inquiry: number
  drafts: number
  missingAlt: number
  missingGallery: number
  missingCategory: number
  missingAvailability: number
  recentProducts: RecentProduct[]
}

const query = `{
  "pieces": count(*[_type == "product" && status != "archive"]),
  "available": count(*[
    _type == "product" &&
    status == "active" &&
    availability in ["unique", "available", "limited"]
  ]),
  "inquiry": count(*[_type == "product" && status == "active" && priceMode == "inquiry"]),
  "drafts": count(*[_type == "product" && _id in path("drafts.**")]),
  "missingAlt": count(*[
    _type == "product" &&
    status == "active" &&
    count(gallery[!defined(alt) || alt == ""]) > 0
  ]),
  "missingGallery": count(*[_type == "product" && status == "active" && count(gallery) == 0]),
  "missingCategory": count(*[_type == "product" && status == "active" && count(categories) == 0]),
  "missingAvailability": count(*[_type == "product" && !defined(availability)]),
  "recentProducts": *[_type == "product"] | order(_updatedAt desc)[0...6]{
    _id,
    title,
    code,
    status,
    availability,
    priceMode,
    _updatedAt
  }
}`

function formatUpdatedAt(value?: string) {
  if (!value) return 'Sem data'

  const updated = new Date(value)
  const today = new Date()
  const sameDay = updated.toDateString() === today.toDateString()

  if (sameDay) {
    return `Hoje, ${updated.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}`
  }

  return updated.toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})
}

function productState(product: RecentProduct) {
  if (product.status === 'archive') return {label: 'Arquivado', tone: 'neutral' as const}
  if (product.status !== 'active') return {label: 'Rascunho', tone: 'neutral' as const}
  if (product.priceMode === 'inquiry') return {label: 'Sob consulta', tone: 'sand' as const}

  const labels: Record<string, string> = {
    unique: 'Peça única',
    available: 'Disponível',
    made_to_order: 'Sob encomenda',
    limited: 'Edição limitada',
  }

  return {label: labels[product.availability || ''] || 'Ativo', tone: 'green' as const}
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

function PendingRow({label, count, detail}: {label: string; count: number; detail: string}) {
  return (
    <Row>
      <RowCopy>
        <RowTitle>{label}</RowTitle>
        <RowMeta>{detail}</RowMeta>
      </RowCopy>
      <StatusPill $tone={count ? 'sand' : 'green'}>{count ? `${count} revisar` : 'OK'}</StatusPill>
    </Row>
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
          <Eyebrow>VISÃO GERAL</Eyebrow>
          <PageTitle>Não foi possível carregar o catálogo.</PageTitle>
          <PageSubtitle>{error}</PageSubtitle>
        </DashboardShell>
      </DashboardPage>
    )
  }

  if (!data) {
    return (
      <DashboardPage>
        <DashboardShell>
          <LoadingWrap aria-label="Carregando visão geral">
            <SkeletonBlock $height={74} />
            <SkeletonGrid>
              <SkeletonBlock />
              <SkeletonBlock />
              <SkeletonBlock />
              <SkeletonBlock />
            </SkeletonGrid>
            <TwoColumnGrid>
              <SkeletonBlock $height={340} />
              <SkeletonBlock $height={340} />
            </TwoColumnGrid>
          </LoadingWrap>
        </DashboardShell>
      </DashboardPage>
    )
  }

  return (
    <DashboardPage>
      <DashboardShell>
        <PageHeader>
          <div>
            <Eyebrow>HOJE</Eyebrow>
            <PageTitle>Visão geral</PageTitle>
            <PageSubtitle>Conteúdo, disponibilidade e publicação da Esméra.</PageSubtitle>
          </div>
        </PageHeader>

        <MetricsGrid>
          <Metric label="Peças" value={data.pieces} detail="no catálogo ativo e em preparação" />
          <Metric label="Disponíveis" value={data.available} detail="prontas para apresentação" />
          <Metric label="Sob consulta" value={data.inquiry} detail="sem preço público" />
          <Metric label="Rascunhos" value={data.drafts} detail="com alterações ainda não publicadas" />
        </MetricsGrid>

        <TwoColumnGrid>
          <Panel>
            <PanelTitle>Recentemente editadas</PanelTitle>
            {data.recentProducts.length ? (
              <Rows>
                {data.recentProducts.map((product) => {
                  const state = productState(product)

                  return (
                    <Row key={product._id}>
                      <RowCopy>
                        <RowTitle>{product.title || 'Produto sem título'}</RowTitle>
                        <RowMeta>
                          {[product.code, formatUpdatedAt(product._updatedAt)]
                            .filter(Boolean)
                            .join(' · ')}
                        </RowMeta>
                      </RowCopy>
                      <StatusPill $tone={state.tone}>{state.label}</StatusPill>
                    </Row>
                  )
                })}
              </Rows>
            ) : (
              <EmptyState>Nenhuma peça cadastrada ainda.</EmptyState>
            )}
          </Panel>

          <Panel>
            <PanelTitle>Pendências editoriais</PanelTitle>
            <Rows>
              <PendingRow
                label="Texto alternativo"
                count={data.missingAlt}
                detail="Imagens publicadas precisam de descrição acessível."
              />
              <PendingRow
                label="Galeria"
                count={data.missingGallery}
                detail="Peças ativas precisam ter mídia cadastrada."
              />
              <PendingRow
                label="Categoria"
                count={data.missingCategory}
                detail="A classificação mantém busca e navegação coerentes."
              />
              <PendingRow
                label="Disponibilidade"
                count={data.missingAvailability}
                detail="O estado comercial deve estar explícito antes da publicação."
              />
            </Rows>
          </Panel>
        </TwoColumnGrid>
      </DashboardShell>
    </DashboardPage>
  )
}
