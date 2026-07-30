import {useEffect, useMemo, useState} from 'react'
import {Spinner} from '@sanity/ui'
import {useClient} from 'sanity'
import {
  BarFill,
  BarHeader,
  BarList,
  BarTrack,
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
  ReportGrid,
  Row,
  RowCopy,
  RowMeta,
  Rows,
  RowTitle,
} from './dashboardStyles'

const API_VERSION = '2026-07-30'

type LeadRow = {
  source?: string
  stage?: string
}

type SaleItem = {
  snapshotTitle?: string
  quantity?: number
}

type SaleRow = {
  totalCents?: number
  channel?: string
  items?: SaleItem[]
}

type ReportData = {
  leads: LeadRow[]
  sales: SaleRow[]
}

const query = `{
  "leads": *[_type == "lead" && _createdAt >= $monthStart]{
    source,
    stage
  },
  "sales": *[
    _type == "sale" &&
    _createdAt >= $monthStart &&
    status != "cancelled"
  ]{
    totalCents,
    channel,
    items[]{
      snapshotTitle,
      quantity
    }
  }
}`

const sourceLabels: Record<string, string> = {
  instagram: 'Instagram',
  referral: 'Indicação',
  site: 'Site',
  architect: 'Arquitetos',
  organic: 'Orgânico',
  whatsapp: 'WhatsApp',
  other: 'Outro',
}

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
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

export function BusinessReports() {
  const workspaceClient = useClient({apiVersion: API_VERSION})
  const businessClient = useMemo(
    () => workspaceClient.withConfig({dataset: 'business'}),
    [workspaceClient],
  )
  const [data, setData] = useState<ReportData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    let active = true

    businessClient
      .fetch<ReportData>(query, {monthStart})
      .then((result) => {
        if (active) setData(result)
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : 'Não foi possível carregar os relatórios.')
        }
      })

    return () => {
      active = false
    }
  }, [businessClient])

  if (error) {
    return (
      <DashboardPage>
        <DashboardShell>
          <Eyebrow>ESMÉRA / RELATÓRIOS</Eyebrow>
          <PageTitle>Não foi possível carregar os indicadores.</PageTitle>
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

  const salesTotal = data.sales.reduce((sum, sale) => sum + (sale.totalCents || 0), 0)
  const salesWithValue = data.sales.filter((sale) => typeof sale.totalCents === 'number')
  const averageTicket = salesWithValue.length ? salesTotal / salesWithValue.length : 0
  const won = data.leads.filter((lead) => lead.stage === 'won').length
  const lost = data.leads.filter((lead) => lead.stage === 'lost').length
  const closed = won + lost
  const conversion = closed ? Math.round((won / closed) * 100) : 0

  const sourceCounts = data.leads.reduce<Record<string, number>>((acc, lead) => {
    const key = lead.source || 'other'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
  const sources = (Object.entries(sourceCounts) as [string, number][]).sort((a, b) => b[1] - a[1])
  const maxSource = Math.max(1, ...sources.map(([, value]) => value))

  const productCounts = data.sales.reduce<Record<string, number>>((acc, sale) => {
    for (const item of sale.items || []) {
      const title = item.snapshotTitle || 'Produto sem nome'
      acc[title] = (acc[title] || 0) + (item.quantity || 1)
    }
    return acc
  }, {})
  const products = (Object.entries(productCounts) as [string, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)

  return (
    <DashboardPage>
      <DashboardShell>
        <PageHeader>
          <div>
            <Eyebrow>ESMÉRA / RELATÓRIOS</Eyebrow>
            <PageTitle>Poucos números. Números que ajudam a decidir.</PageTitle>
            <PageSubtitle>Visão operacional do mês atual, sem tentar substituir um BI.</PageSubtitle>
          </div>
        </PageHeader>

        <MetricsGrid>
          <Metric label="Leads no mês" value={data.leads.length} detail="entradas registradas" />
          <Metric label="Conversão" value={`${conversion}%`} detail="entre leads encerrados" />
          <Metric label="Ticket médio" value={formatMoney(averageTicket)} detail="vendas com valor" />
          <Metric label="Vendas" value={data.sales.length} detail={formatMoney(salesTotal)} />
        </MetricsGrid>

        <ReportGrid>
          <Panel>
            <PanelTitle>Leads por origem</PanelTitle>
            {sources.length ? (
              <BarList>
                {sources.map(([source, value]) => (
                  <div key={source}>
                    <BarHeader>
                      <span>{sourceLabels[source] || source}</span>
                      <strong>{value}</strong>
                    </BarHeader>
                    <BarTrack>
                      <BarFill style={{width: `${Math.round((value / maxSource) * 100)}%`}} />
                    </BarTrack>
                  </div>
                ))}
              </BarList>
            ) : (
              <EmptyState>Nenhum lead registrado no mês.</EmptyState>
            )}
          </Panel>

          <Panel>
            <PanelTitle>Itens registrados em vendas</PanelTitle>
            {products.length ? (
              <Rows>
                {products.map(([title, quantity]) => (
                  <Row key={title}>
                    <RowCopy>
                      <RowTitle>{title}</RowTitle>
                      <RowMeta>Quantidade registrada no mês</RowMeta>
                    </RowCopy>
                    <strong>{quantity}</strong>
                  </Row>
                ))}
              </Rows>
            ) : (
              <EmptyState>Nenhuma venda com itens registrada no mês.</EmptyState>
            )}
          </Panel>
        </ReportGrid>
      </DashboardShell>
    </DashboardPage>
  )
}
