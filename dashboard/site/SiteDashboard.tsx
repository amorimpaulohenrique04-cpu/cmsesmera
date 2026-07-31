import {useEffect, useState} from 'react'
import {useClient, useWorkspace} from 'sanity'
import {useIntentLink} from 'sanity/router'
import {EmptyRecentState} from './EmptyRecentState'
import {MetricCard} from './MetricCard'
import {PendingRow} from './PendingRow'
import {
  DashboardPage,
  DashboardShell,
  ErrorPanel,
  Eyebrow,
  LoadingWrap,
  LowerGrid,
  MetricsGrid,
  PageHeader,
  PageSubtitle,
  PageTitle,
  Panel,
  PanelAction,
  PanelHeader,
  PanelTitle,
  PendingList,
  RecentRowLink,
  RecentRows,
  RowCopy,
  RowMeta,
  RowTitle,
  SkeletonBlock,
  SkeletonGrid,
  SkeletonHeader,
  StatusPill,
  Thumbnail,
} from './siteDashboardStyles'

const API_VERSION = '2026-07-30'

type RecentProduct = {
  _id: string
  title?: string
  code?: string
  status?: string
  availability?: string
  priceMode?: string
  thumbnailUrl?: string
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
    "thumbnailUrl": coalesce(gallery[role == "cover"][0].asset->url, gallery[0].asset->url),
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

function CubeIcon() {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="m12 3 7 4v10l-7 4-7-4V7z" />
      <path d="m5 7 7 4 7-4M12 11v10" />
    </svg>
  )
}

function CheckCubeIcon() {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="m12 3 7 4v10l-7 4-7-4V7z" />
      <path d="m5 7 7 4 7-4M12 11v10" />
      <path d="m14.5 15.3 1.4 1.4 3-3.2" />
    </svg>
  )
}

function InquiryIcon() {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.8 9.4a2.4 2.4 0 0 1 4.6.8c0 1.8-2.4 2-2.4 3.7M12 17.2h.01" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="m6 17.8.8-4.1L16.6 4l3.4 3.4-9.8 9.8zM14.8 5.8l3.4 3.4M5.5 20h13" />
    </svg>
  )
}

function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.4" />
      <path d="m6.5 17 4.2-4 2.6 2.3 2.3-2.1 2.4 2.3" />
    </svg>
  )
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <rect x="5" y="5" width="5" height="5" rx="1" />
      <rect x="14" y="5" width="5" height="5" rx="1" />
      <rect x="5" y="14" width="5" height="5" rx="1" />
      <rect x="14" y="14" width="5" height="5" rx="1" />
    </svg>
  )
}

function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M4.5 12.2V6a1.5 1.5 0 0 1 1.5-1.5h6.2l7.3 7.3-7.7 7.7z" />
      <circle cx="8.4" cy="8.4" r="1.2" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.8 12h16.4M12 3.5c2.3 2.4 3.4 5.2 3.4 8.5s-1.1 6.1-3.4 8.5M12 3.5C9.7 5.9 8.6 8.7 8.6 12s1.1 6.1 3.4 8.5" />
    </svg>
  )
}

function PlaceholderImageIcon() {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="m6.5 16.5 4-3.8 2.7 2.4 2.2-2 2.5 2.4" />
    </svg>
  )
}

function RecentProductRow({product}: {product: RecentProduct}) {
  const state = productState(product)
  const editLink = useIntentLink({
    intent: 'edit',
    params: {id: product._id.replace(/^drafts\./, ''), type: 'product'},
  })

  return (
    <RecentRowLink href={editLink.href} onClick={editLink.onClick}>
      <Thumbnail aria-hidden="true">
        {product.thumbnailUrl ? (
          <img src={product.thumbnailUrl} alt="" loading="lazy" decoding="async" />
        ) : (
          <PlaceholderImageIcon />
        )}
      </Thumbnail>
      <RowCopy>
        <RowTitle>{product.title || 'Produto sem título'}</RowTitle>
        <RowMeta>
          {[product.code, formatUpdatedAt(product._updatedAt)].filter(Boolean).join(' · ')}
        </RowMeta>
      </RowCopy>
      <StatusPill $tone={state.tone}>{state.label}</StatusPill>
    </RecentRowLink>
  )
}

export function SiteDashboard() {
  const client = useClient({apiVersion: API_VERSION})
  const workspace = useWorkspace()
  const [data, setData] = useState<SiteDashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const basePath = workspace.basePath || ''
  const workspaceBase = basePath === '/' ? '' : basePath.replace(/\/$/, '')
  const productsHref = `${workspaceBase}/cms/product`

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
          <PageHeader>
            <div>
              <Eyebrow>VISÃO GERAL</Eyebrow>
              <PageTitle>Não foi possível carregar o catálogo.</PageTitle>
              <PageSubtitle>O conteúdo continua seguro no Sanity. Tente recarregar o painel.</PageSubtitle>
            </div>
          </PageHeader>
          <ErrorPanel>
            <PageSubtitle>{error}</PageSubtitle>
          </ErrorPanel>
        </DashboardShell>
      </DashboardPage>
    )
  }

  if (!data) {
    return (
      <DashboardPage>
        <DashboardShell>
          <LoadingWrap aria-label="Carregando visão geral">
            <SkeletonHeader />
            <SkeletonGrid>
              <SkeletonBlock />
              <SkeletonBlock />
              <SkeletonBlock />
              <SkeletonBlock />
            </SkeletonGrid>
            <LowerGrid>
              <SkeletonBlock $height={340} />
              <SkeletonBlock $height={340} />
            </LowerGrid>
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
          <MetricCard
            label="Peças"
            value={data.pieces}
            detail="no catálogo ativo e em preparação"
            icon={<CubeIcon />}
            tone="orange"
            visual="bars"
          />
          <MetricCard
            label="Disponíveis"
            value={data.available}
            detail="prontas para apresentação"
            icon={<CheckCubeIcon />}
            tone="sage"
            visual="compactBars"
          />
          <MetricCard
            label="Sob consulta"
            value={data.inquiry}
            detail="sem preço público"
            icon={<InquiryIcon />}
            tone="orange"
            visual="line"
          />
          <MetricCard
            label="Rascunhos"
            value={data.drafts}
            detail="com alterações ainda não publicadas"
            icon={<PencilIcon />}
            tone="orange"
            visual="compactBars"
          />
        </MetricsGrid>

        <LowerGrid>
          <Panel>
            <PanelHeader>
              <PanelTitle>Recentemente editadas</PanelTitle>
              <PanelAction href={productsHref}>Ver tudo</PanelAction>
            </PanelHeader>
            {data.recentProducts.length ? (
              <RecentRows>
                {data.recentProducts.map((product) => (
                  <RecentProductRow key={product._id} product={product} />
                ))}
              </RecentRows>
            ) : (
              <EmptyRecentState />
            )}
          </Panel>

          <Panel>
            <PanelHeader>
              <PanelTitle>Pendências editoriais</PanelTitle>
              <PanelAction href={productsHref}>Ver todas</PanelAction>
            </PanelHeader>
            <PendingList>
              <PendingRow
                label="Texto alternativo"
                count={data.missingAlt}
                detail="Imagens publicadas precisam de descrição acessível."
                icon={<ImageIcon />}
              />
              <PendingRow
                label="Galeria"
                count={data.missingGallery}
                detail="Peças ativas precisam ter mídia cadastrada."
                icon={<GridIcon />}
              />
              <PendingRow
                label="Categoria"
                count={data.missingCategory}
                detail="A classificação mantém busca e navegação coerentes."
                icon={<TagIcon />}
              />
              <PendingRow
                label="Disponibilidade"
                count={data.missingAvailability}
                detail="O estado comercial deve estar explícito antes da publicação."
                icon={<GlobeIcon />}
              />
            </PendingList>
          </Panel>
        </LowerGrid>
      </DashboardShell>
    </DashboardPage>
  )
}
