import {useMemo} from 'react'
import {useClient} from 'sanity'
import styled from 'styled-components'
import {esmeraTokens as t} from '../../studio/esmeraTokens'
import {
  Bar,
  Card,
  CardHeader,
  CardSub,
  CardTitle,
  Grid,
  Header,
  IconTile,
  MaterialIcon,
  MiniBars,
  Page,
  Pill,
  SecondaryButton,
  Shell,
  StatCard,
  StatGrid,
  StatLabel,
  StatTop,
  StatValue,
  Subtitle,
  Thumb,
  Title,
  money,
} from '../stitch/StitchUI'
import {
  API_VERSION,
  ErrorState,
  KpiMeta,
  LoadingState,
  formatUpdatedAt,
  getStudioEnv,
  useQueryState,
} from './shared'

const DashboardMain = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(300px, 1fr);
  gap: 24px;
  align-items: start;

  @media (max-width: 1050px) { grid-template-columns: 1fr; }
`

const PipelineCard = styled(Card)`min-height: 380px;`

const PipelineTrack = styled.div`
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin: 34px 8px 40px;

  &::before {
    content: '';
    position: absolute;
    left: 18px;
    right: 18px;
    top: 19px;
    height: 4px;
    border-radius: 999px;
    background: ${t.color.surfaceHighest};
  }
`

const PipelineStep = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  min-width: 72px;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
`

const PipelineBubble = styled.span<{$won?: boolean}>`
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 50%;
  background: ${({$won}) => ($won ? t.color.surfaceHighest : t.color.primary)};
  color: ${({$won}) => ($won ? t.color.textSecondary : t.color.onPrimary)};
  font-family: ${t.typography.headline};
  font-weight: 700;
  box-shadow: ${({$won}) => ($won ? 'none' : '0 4px 12px rgba(50,79,70,.18)')};
`

const PendingList = styled.div`display: grid; gap: 6px;`
const PendingRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 13px;
  border-left: 4px solid transparent;
  border-radius: 10px;
  padding: 13px 10px;

  &:hover { border-left-color: ${t.color.primary}; background: ${t.color.surfaceContainer}; }
`
const PendingCopy = styled.div`min-width: 0; flex: 1;`
const PendingTitle = styled.div`color: ${t.color.ink}; font-size: 14px; font-weight: 600; line-height: 20px;`
const PendingMeta = styled.div`margin-top: 2px; color: ${t.color.textSecondary}; font-size: 12px; line-height: 17px;`

const Unconfigured = styled.div`
  display: grid;
  min-height: 112px;
  place-items: center;
  border-radius: ${t.radius.card}px;
  background: ${t.color.surfaceLow};
  color: ${t.color.textSecondary};
  padding: 20px;
  text-align: center;
`

type SiteData = {
  products: number
  recent: {_id: string; title?: string; image?: string; alt?: string}[]
}

type BusinessData = {
  leads: number
  salesCount: number
  salesValues: number[]
  followupCases: number
  pipeline: {new: number; curation: number; proposal: number; negotiation: number; won: number}
  tasks: {_id: string; title?: string; detail?: string; dueAt?: string; priority?: string}[]
}

const SITE_QUERY = `{
  "products": count(*[_type == "product" && status == "active" && !(_id in path("drafts.**"))]),
  "recent": *[_type == "product" && !(_id in path("drafts.**"))] | order(_updatedAt desc)[0...1]{
    _id,
    title,
    "image": coalesce(gallery[role == "cover"][0].asset->url, gallery[0].asset->url),
    "alt": coalesce(gallery[role == "cover"][0].alt, gallery[0].alt, title)
  }
}`

const BUSINESS_QUERY = `{
  "leads": count(*[_type == "lead" && !(stage in ["won", "lost"])]),
  "salesCount": count(*[
    _type == "sale" &&
    status in ["confirmed", "production", "ready", "delivered"] &&
    _createdAt >= $from
  ]),
  "salesValues": *[
    _type == "sale" &&
    status in ["confirmed", "production", "ready", "delivered"] &&
    _createdAt >= $from
  ].totalCents,
  "followupCases": count(*[_type == "afterSale" && count(followUps[status == "pending"]) > 0]),
  "pipeline": {
    "new": count(*[_type == "lead" && stage == "new"]),
    "curation": count(*[_type == "lead" && stage == "curation"]),
    "proposal": count(*[_type == "lead" && stage == "proposal"]),
    "negotiation": count(*[_type == "lead" && stage == "negotiation"]),
    "won": count(*[_type == "lead" && stage == "won"])
  },
  "tasks": *[_type == "task" && status != "done"] | order(dueAt asc)[0...5]{
    _id,
    title,
    dueAt,
    priority,
    "detail": notes
  }
}`

export function SiteDashboardPage() {
  const client = useClient({apiVersion: API_VERSION})
  const businessDataset = getStudioEnv('SANITY_STUDIO_BUSINESS_DATASET') || 'business'
  const businessClient = useMemo(
    () => client.withConfig({dataset: businessDataset}),
    [businessDataset, client],
  )
  const from = useMemo(() => {
    const date = new Date()
    date.setDate(date.getDate() - 30)
    return date.toISOString()
  }, [])

  const site = useQueryState<SiteData>(client, SITE_QUERY)
  const business = useQueryState<BusinessData>(businessClient, BUSINESS_QUERY, {from})
  const date = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  if (site.state.status === 'loading' || business.state.status === 'loading') {
    return (
      <Page>
        <Shell>
          <Header>
            <div><Title>Olá, Esméra!</Title><Subtitle>Visão rápida do site e do comercial.</Subtitle></div>
          </Header>
          <LoadingState label="Carregando dashboard Esméra" />
        </Shell>
      </Page>
    )
  }

  if (site.state.status === 'error') {
    return (
      <Page><Shell><Header><div><Title>Olá, Esméra!</Title><Subtitle>Visão rápida do site e do comercial.</Subtitle></div></Header><ErrorState code={site.state.code} detail={site.state.message} onRetry={site.retry} /></Shell></Page>
    )
  }

  const siteData = site.state.data
  const businessUnavailable = business.state.status === 'error'
  const businessData = business.state.status === 'ready' || business.state.status === 'empty'
    ? business.state.data
    : null
  const updatedAt = business.state.status === 'ready' || business.state.status === 'empty'
    ? business.state.updatedAt
    : site.state.updatedAt
  const salesValue = businessData?.salesValues?.reduce((sum, value) => sum + (value || 0), 0) || 0
  const pipeline = businessData?.pipeline || {new: 0, curation: 0, proposal: 0, negotiation: 0, won: 0}
  const maxPipeline = Math.max(1, ...Object.values(pipeline))

  return (
    <Page>
      <Shell>
        <Header>
          <div>
            <Title>Olá, Esméra!</Title>
            <Subtitle>Visão rápida do site e do comercial.</Subtitle>
          </div>
          <div style={{color: t.color.lineStrong, fontSize: 13, fontWeight: 600, textTransform: 'capitalize'}}>{date}</div>
        </Header>

        <StatGrid>
          <StatCard>
            <StatTop><IconTile><MaterialIcon>inventory_2</MaterialIcon></IconTile><Pill $tone="green">Catálogo</Pill></StatTop>
            <div><StatLabel>Produtos Ativos</StatLabel><StatValue>{siteData.products}</StatValue><KpiMeta>Fonte: production · publicados com status active · {formatUpdatedAt(site.state.updatedAt)}</KpiMeta></div>
          </StatCard>
          <StatCard>
            <StatTop><IconTile $tone="blue"><MaterialIcon>group</MaterialIcon></IconTile><Pill $tone="blue">Pipeline</Pill></StatTop>
            <div><StatLabel>Leads Abertos</StatLabel><StatValue>{businessData ? businessData.leads : '—'}</StatValue><KpiMeta>{businessData ? `Fonte: ${businessDataset} · exclui ganho/perdido · ${formatUpdatedAt(updatedAt)}` : 'Fonte Business indisponível'}</KpiMeta></div>
          </StatCard>
          <StatCard>
            <StatTop><IconTile $tone="sand"><MaterialIcon>payments</MaterialIcon></IconTile><Pill $tone="sand">30 dias</Pill></StatTop>
            <div><StatLabel>Vendas no Mês</StatLabel><StatValue>{businessData ? businessData.salesCount : '—'}</StatValue><KpiMeta>{businessData ? `Receita registrada: ${money(salesValue)} · status elegíveis · ${formatUpdatedAt(updatedAt)}` : 'Fonte Business indisponível'}</KpiMeta></div>
          </StatCard>
          <StatCard>
            <StatTop><IconTile $tone="red"><MaterialIcon>priority_high</MaterialIcon></IconTile><Pill $tone="red">Atenção</Pill></StatTop>
            <div><StatLabel>Casos com Follow-up Pendente</StatLabel><StatValue>{businessData ? businessData.followupCases : '—'}</StatValue><KpiMeta>{businessData ? `Métrica: casos com ≥1 follow-up pendente · ${formatUpdatedAt(updatedAt)}` : 'Fonte Business indisponível'}</KpiMeta></div>
          </StatCard>
        </StatGrid>

        {businessUnavailable ? <div style={{marginBottom: 24}}><ErrorState code={business.state.code} detail={business.state.message} onRetry={business.retry} /></div> : null}

        <DashboardMain>
          <PipelineCard>
            <CardHeader><CardTitle>Pipeline Comercial</CardTitle><SecondaryButton href="/business/cms/pipeline">Ver CRM completo <MaterialIcon>arrow_forward</MaterialIcon></SecondaryButton></CardHeader>
            <PipelineTrack>
              {([
                ['new', 'Novo'],
                ['curation', 'Curadoria'],
                ['proposal', 'Proposta'],
                ['negotiation', 'Negociação'],
                ['won', 'Ganho'],
              ] as const).map(([key, label]) => (
                <PipelineStep key={key}>
                  <PipelineBubble $won={key === 'won'}>{businessData ? pipeline[key] : '—'}</PipelineBubble>
                  <span style={{fontSize: 13, fontWeight: 600}}>{label}</span>
                </PipelineStep>
              ))}
            </PipelineTrack>
            {businessData ? (
              <MiniBars aria-label="Distribuição textual do pipeline">
                {Object.values(pipeline).map((value, index) => <Bar key={index} $h={Math.max(10, Math.round((value / maxPipeline) * 100))} $active={index === 2} />)}
              </MiniBars>
            ) : <Unconfigured>Pipeline indisponível até a fonte Business responder.</Unconfigured>}
          </PipelineCard>

          <Card>
            <CardHeader><CardTitle>Pendências de hoje</CardTitle><Pill $tone={businessData?.tasks.length ? 'red' : 'green'}>{businessData ? `${businessData.tasks.length} ações` : '—'}</Pill></CardHeader>
            {businessData?.tasks.length ? (
              <PendingList>
                {businessData.tasks.map((task, index) => (
                  <PendingRow key={task._id}>
                    <MaterialIcon>{['chat_bubble', 'local_shipping', 'call', 'edit_note', 'receipt_long'][index % 5]}</MaterialIcon>
                    <PendingCopy>
                      <PendingTitle>{task.title || 'Ação pendente'}</PendingTitle>
                      <PendingMeta>{task.detail || 'Sem observação cadastrada.'}</PendingMeta>
                    </PendingCopy>
                    <MaterialIcon>chevron_right</MaterialIcon>
                  </PendingRow>
                ))}
              </PendingList>
            ) : (
              <Unconfigured>{businessData ? 'Nenhuma tarefa comercial pendente.' : 'Pendências indisponíveis.'}</Unconfigured>
            )}
            <SecondaryButton href="/business/cms/after-sales" style={{width: '100%', marginTop: 16, borderStyle: 'dashed'}}>+ Agendar nova tarefa</SecondaryButton>
          </Card>
        </DashboardMain>

        <Grid $cols={2} style={{marginTop: 24}}>
          <Card style={{display: 'flex', alignItems: 'center', gap: 20}}>
            {siteData.recent?.[0]?.image ? (
              <Thumb style={{width: 116, height: 116, flexBasis: 116}}><img src={siteData.recent[0].image} alt={siteData.recent[0].alt || siteData.recent[0].title || 'Produto Esméra'} /></Thumb>
            ) : (
              <Thumb style={{width: 116, height: 116, flexBasis: 116}}><MaterialIcon>image</MaterialIcon></Thumb>
            )}
            <div>
              <Pill $tone="green">Destaque recente</Pill>
              <CardTitle style={{marginTop: 10}}>{siteData.recent?.[0]?.title || 'Catálogo Esméra'}</CardTitle>
              <CardSub>Conteúdo atualizado recentemente no CMS.</CardSub>
              <div style={{marginTop: 14}}><SecondaryButton href="/site/cms/products">Editar Produto</SecondaryButton></div>
            </div>
          </Card>
          <Card>
            <CardHeader><CardTitle>Performance de Tráfego</CardTitle><Pill>Não configurado</Pill></CardHeader>
            <Unconfigured>
              Conecte uma fonte Analytics verificada para exibir tráfego, tendência e período. Nenhum percentual demonstrativo é mostrado.
            </Unconfigured>
          </Card>
        </Grid>
      </Shell>
    </Page>
  )
}
