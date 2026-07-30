import {useEffect, useMemo, useState} from 'react'
import {Badge, Box, Card, Flex, Grid, Heading, Spinner, Stack, Text} from '@sanity/ui'
import {useClient} from 'sanity'

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

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string
  value: string | number
  detail?: string
}) {
  return (
    <Card border padding={4} radius={3}>
      <Stack space={3}>
        <Text muted size={1} weight="semibold">
          {label.toUpperCase()}
        </Text>
        <Heading size={3}>{value}</Heading>
        {detail ? (
          <Text muted size={1}>
            {detail}
          </Text>
        ) : null}
      </Stack>
    </Card>
  )
}

export function BusinessDashboard() {
  const businessClient = useClient({apiVersion: API_VERSION})
  const siteClient = useMemo(
    () => businessClient.withConfig({dataset: 'production'}),
    [businessClient],
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
      <Box padding={5}>
        <Card padding={4} radius={3} tone="critical">
          <Stack space={3}>
            <Heading size={2}>O painel ainda não conseguiu acessar os dados</Heading>
            <Text>{error}</Text>
            <Text size={1}>
              Confirme que o dataset privado <strong>business</strong> foi criado e que o seu
              usuário tem permissão de leitura.
            </Text>
          </Stack>
        </Card>
      </Box>
    )
  }

  if (!business || !site) {
    return (
      <Flex align="center" height="fill" justify="center">
        <Spinner muted />
      </Flex>
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
    <Box padding={[4, 4, 5]}>
      <Stack space={5}>
        <Stack space={2}>
          <Heading size={4}>Bom dia.</Heading>
          <Text muted>Visão rápida do site e do comercial</Text>
        </Stack>

        <Grid columns={[1, 2, 4]} gap={3}>
          <MetricCard
            label="Produtos ativos"
            value={site.activeProducts}
            detail={`${site.drafts} rascunhos editoriais`}
          />
          <MetricCard label="Leads abertos" value={business.openLeads} detail="pipeline comercial" />
          <MetricCard label="Vendas no mês" value={business.sales.length} detail={formatMoney(salesTotal)} />
          <MetricCard
            label="Follow-ups"
            value={business.pendingFollowUps}
            detail="com prazo até amanhã"
          />
        </Grid>

        <Grid columns={[1, 1, 2]} gap={4}>
          <Card border padding={4} radius={3}>
            <Stack space={4}>
              <Heading size={2}>Pipeline comercial</Heading>
              <Grid columns={5} gap={2}>
                {pipeline.map(([label, count]) => (
                  <Card key={label} padding={3} radius={2} tone={label === 'Ganho' ? 'positive' : 'transparent'}>
                    <Stack space={3}>
                      <Heading size={2}>{count}</Heading>
                      <Text muted size={1}>
                        {label}
                      </Text>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </Stack>
          </Card>

          <Card border padding={4} radius={3}>
            <Stack space={4}>
              <Heading size={2}>Pendências de hoje</Heading>
              {business.pendingTasks.length ? (
                <Stack space={3}>
                  {business.pendingTasks.map((task) => (
                    <Flex align="center" gap={3} justify="space-between" key={task._id}>
                      <Stack space={2}>
                        <Text weight="medium">{task.title}</Text>
                        <Text muted size={1}>
                          {formatDate(task.dueAt)}
                        </Text>
                      </Stack>
                      <Badge tone={task.priority === 'urgent' || task.priority === 'high' ? 'critical' : 'caution'}>
                        {task.priority || 'normal'}
                      </Badge>
                    </Flex>
                  ))}
                </Stack>
              ) : (
                <Text muted>Nenhuma tarefa vencendo até amanhã.</Text>
              )}
            </Stack>
          </Card>
        </Grid>

        <Stack space={3}>
          <Heading size={2}>Indicadores do mês</Heading>
          <Grid columns={[1, 2, 3]} gap={3}>
            <MetricCard label="Conversão" value={`${conversion}%`} detail="ganhos entre leads encerrados" />
            <MetricCard label="Ticket médio" value={formatMoney(averageTicket)} detail="vendas com valor registrado" />
            <MetricCard label="Valor registrado" value={formatMoney(salesTotal)} detail="não substitui o financeiro" />
          </Grid>
        </Stack>
      </Stack>
    </Box>
  )
}
