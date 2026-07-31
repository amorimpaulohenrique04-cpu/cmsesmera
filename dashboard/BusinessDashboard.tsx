import {useEffect, useMemo, useState} from 'react'
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
  PipelineCell,
  PipelineGrid,
  PipelineLabel,
  PipelineValue,
  Row,
  RowCopy,
  RowMeta,
  Rows,
  RowTitle,
  Section,
  SectionHeading,
  SkeletonBlock,
  SkeletonGrid,
  StatusPill,
  TwoColumnGrid,
} from './dashboardStyles'

const API_VERSION = '2026-07-30'

type PendingTask = {
  _id: string
  title: string
  dueAt?: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
}

type SaleSummary = {
  totalCents?: number
  channel?: string
}

type DashboardData = {
  openLeads: number
  wonLeads: number
  lostLeads: number
  pendingFollowUps: number
  pendingTasks: PendingTask[]
  pipeline: {
    new: number
    curation: number
    proposal: number
    negotiation: number
    won: number
  }
  sales: SaleSummary[]
}

type SiteData = {
  activeProducts: number
  drafts: number
}

const businessQuery = `{
  "openLeads": count(*[_type == "lead" && !(stage in ["won", "lost"])]),
  "wonLeads": count(*[_type == "lead" && stage == "won"]),
  "lostLeads": count(*[_type == "lead" && stage == "lost"]),
  "pendingFollowUps": count(*[
    _type == "afterSale" &&
    count(followUps[status == "pending" && dueAt <= $tomorrow]) > 0
  ]),
  "pendingTasks": *[
    _type == "task" &&
    status in ["pending", "in_progress"] &&
    dueAt <= $tomorrow
  ] | order(dueAt asc)[0...6]{
    _id,
    title,
    dueAt,
    priority
  },
  "pipeline": {
    "new": count(*[_type == "lead" && stage == "new"]),
    "curation": count(*[_type == "lead" && stage == "curation"]),
    "proposal": count(*[_type == "lead" && stage == "proposal"]),
    "negotiation": count(*[_type == "lead" && stage == "negotiation"]),
    "won": count(*[_type == "lead" && stage == "won"])
  },
  "sales": *[
    _type == "sale" &&
    _createdAt >= $monthStart &&
    status != "cancelled"
  ]{
    totalCents,
    channel
  }
}`

const siteQuery = `{
  "activeProducts": count(*[_type == "product" && status == "active"]),
  "drafts": count(*[_id in path("drafts.**")])
}`

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  })
}

function formatDate(value?: string) {
  if (!value) return 'Sem prazo'
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

export function BusinessDashboard() {
  const workspaceClient = useClient({apiVersion: API_VERSION})
  const businessClient = useMemo(
    () => workspaceClient.withConfig({dataset: 'business'}),
    [workspaceClient],
  )
  const siteClient = useMemo(
    () => workspaceClient.withConfig({dataset: 'production'}),
    [workspaceClient],
  )

  const [business, setBusiness] = useState<DashboardData | null>(null)
  const [site, setSite] = useState<SiteData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
    let active = true

    Promise.all([
      businessClient.fetch<DashboardData>(businessQuery, {monthStart, tomorrow}),
      siteClient.fetch<SiteData>(siteQuery),
    ])
      .then(([businessData, siteData]) => {
        if (!active) return
        setBusiness(businessData)
        setSite(siteData)
      })
      .catch((reason: unknown) => {
        if (!active) return
        setError(reason instanceof Error ? reason.message : 'Não foi possível carregar o painel.')
      })

    return () => {
      active = false
    }
  }, [businessClient, siteClient])

  if (error) {
    return (
      <DashboardPage>
        <DashboardShell>
          <Eyebrow>BUSINESS DESK</Eyebrow>
          <PageTitle>Não foi possível carregar a operação.</PageTitle>
          <PageSubtitle>
            {error}. Confirme que o dataset privado business existe e que o usuário atual possui
            permissão de leitura.
          </PageSubtitle>
        </DashboardShell>
      </DashboardPage>
    )
  }

  if (!business || !site) {
    return (
      <DashboardPage>
        <DashboardShell>
          <LoadingWrap aria-label="Carregando visão comercial">
            <SkeletonBlock $height={74} />
            <SkeletonGrid>
              <SkeletonBlock />
              <SkeletonBlock />
              <SkeletonBlock />
              <SkeletonBlock />
            </SkeletonGrid>
            <TwoColumnGrid>
              <SkeletonBlock $height={320} />
              <SkeletonBlock $height={320} />
            </TwoColumnGrid>
          </LoadingWrap>
        </DashboardShell>
      </DashboardPage>
    )
  }

  const salesTotal = business.sales.reduce((sum, sale) => sum + (sale.totalCents || 0), 0)
  const salesWithValue = business.sales.filter((sale) => typeof sale.totalCents === 'number')
  const averageTicket = salesWithValue.length ? salesTotal / salesWithValue.length : 0
  const finishedLeads = business.wonLeads + business.lostLeads
  const conversion = finishedLeads ? Math.round((business.wonLeads / finishedLeads) * 100) : 0

  const pipeline = [
    ['Novo', business.pipeline.new],
    ['Curadoria', business.pipeline.curation],
    ['Proposta', business.pipeline.proposal],
    ['Negociação', business.pipeline.negotiation],
    ['Ganho', business.pipeline.won],
  ] as const

  return (
    <DashboardPage>
      <DashboardShell>
        <PageHeader>
          <div>
            <Eyebrow>HOJE</Eyebrow>
            <PageTitle>Visão comercial</PageTitle>
            <PageSubtitle>Leads, vendas e pendências que exigem uma próxima ação.</PageSubtitle>
          </div>
        </PageHeader>

        <MetricsGrid>
          <Metric
            label="Produtos ativos"
            value={site.activeProducts}
            detail={`${site.drafts} rascunhos editoriais no site`}
          />
          <Metric
            label="Leads abertos"
            value={business.openLeads}
            detail="em acompanhamento no pipeline"
          />
          <Metric
            label="Vendas no mês"
            value={business.sales.length}
            detail={formatMoney(salesTotal)}
          />
          <Metric
            label="Follow-ups"
            value={business.pendingFollowUps}
            detail="com prazo até amanhã"
          />
        </MetricsGrid>

        <TwoColumnGrid>
          <Panel>
            <PanelTitle>Pipeline comercial</PanelTitle>
            <PipelineGrid>
              {pipeline.map(([label, count]) => (
                <PipelineCell $active={label === 'Ganho'} key={label}>
                  <PipelineValue>{count}</PipelineValue>
                  <PipelineLabel>{label}</PipelineLabel>
                </PipelineCell>
              ))}
            </PipelineGrid>
          </Panel>

          <Panel>
            <PanelTitle>Pendências de hoje</PanelTitle>
            {business.pendingTasks.length ? (
              <Rows>
                {business.pendingTasks.map((task) => (
                  <Row key={task._id}>
                    <RowCopy>
                      <RowTitle>{task.title}</RowTitle>
                      <RowMeta>{formatDate(task.dueAt)}</RowMeta>
                    </RowCopy>
                    <StatusPill
                      $tone={
                        task.priority === 'urgent' || task.priority === 'high'
                          ? 'sand'
                          : 'neutral'
                      }
                    >
                      {task.priority || 'normal'}
                    </StatusPill>
                  </Row>
                ))}
              </Rows>
            ) : (
              <EmptyState>Nenhuma tarefa vencendo até amanhã.</EmptyState>
            )}
          </Panel>
        </TwoColumnGrid>

        <Section>
          <SectionHeading>Indicadores do mês</SectionHeading>
          <MetricsGrid>
            <Metric
              label="Conversão"
              value={`${conversion}%`}
              detail="ganhos entre leads encerrados"
            />
            <Metric
              label="Ticket médio"
              value={formatMoney(averageTicket)}
              detail="vendas com valor registrado"
            />
            <Metric
              label="Valor registrado"
              value={formatMoney(salesTotal)}
              detail="visão operacional; não substitui financeiro"
            />
            <Metric
              label="Rascunhos"
              value={site.drafts}
              detail="conteúdo editorial ainda não publicado"
            />
          </MetricsGrid>
        </Section>
      </DashboardShell>
    </DashboardPage>
  )
}
