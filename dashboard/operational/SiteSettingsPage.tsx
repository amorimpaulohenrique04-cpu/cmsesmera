import {useClient} from 'sanity'
import {Card, CardHeader, CardSub, CardTitle, Chip, Chips, Grid, Header, IconTile, InfoGrid, InfoLabel, InfoValue, MaterialIcon, Page, Pill, Shell, Subtitle, Title} from '../stitch/StitchUI'
import {API_VERSION, ErrorState, LoadingState, SecondaryIntentAction, getStudioEnv, useQueryState} from './shared'

type SettingsState = {
  settingsPublished: boolean
  settingsDraft: boolean
  navigationPublished: boolean
  navigationDraft: boolean
}

const QUERY = `{
  "settingsPublished": defined(*[_id == "siteSettings"][0]._id),
  "settingsDraft": defined(*[_id == "drafts.siteSettings"][0]._id),
  "navigationPublished": defined(*[_id == "navigation"][0]._id),
  "navigationDraft": defined(*[_id == "drafts.navigation"][0]._id)
}`

export function SiteSettingsPage() {
  const client = useClient({apiVersion: API_VERSION})
  const state = useQueryState<SettingsState>(client, QUERY)
  const previewUrl = getStudioEnv('SANITY_STUDIO_PREVIEW_URL')
  const projectId = getStudioEnv('SANITY_STUDIO_PROJECT_ID') || 'configurado no Studio'
  const siteDataset = getStudioEnv('SANITY_STUDIO_SITE_DATASET') || 'production'
  const businessDataset = getStudioEnv('SANITY_STUDIO_BUSINESS_DATASET') || 'business'

  if (state.state.status === 'loading') return <Page><Shell><Header><div><Title>Configurações</Title><Subtitle>Preferências globais, navegação, SEO e canais oficiais.</Subtitle></div></Header><LoadingState /></Shell></Page>
  if (state.state.status === 'error') return <Page><Shell><Header><div><Title>Configurações</Title><Subtitle>Preferências globais, navegação, SEO e canais oficiais.</Subtitle></div></Header><ErrorState code={state.state.code} detail={state.state.message} onRetry={state.retry} /></Shell></Page>

  const data = state.state.data
  return (
    <Page>
      <Shell>
        <Header><div><Title>Configurações</Title><Subtitle>Preferências globais, navegação, SEO e canais oficiais.</Subtitle></div></Header>
        <Grid $cols={2}>
          <Card>
            <CardHeader><div><CardTitle>SiteSettings</CardTitle><CardSub>WhatsApp, locale, moeda, rodapé e SEO padrão.</CardSub></div><IconTile><MaterialIcon>settings</MaterialIcon></IconTile></CardHeader>
            <InfoGrid>
              <div><InfoLabel>Moeda</InfoLabel><InfoValue>BRL</InfoValue></div>
              <div><InfoLabel>Locale</InfoLabel><InfoValue>pt-BR</InfoValue></div>
              <div><InfoLabel>Dataset</InfoLabel><InfoValue>{siteDataset}</InfoValue></div>
              <div><InfoLabel>Estado</InfoLabel><InfoValue>{data.settingsDraft ? 'Rascunho pendente' : data.settingsPublished ? 'Publicado' : 'Não configurado'}</InfoValue></div>
            </InfoGrid>
            <div style={{marginTop: 20}}><SecondaryIntentAction type="siteSettings" id="siteSettings">Editar configurações globais</SecondaryIntentAction></div>
          </Card>

          <Card>
            <CardHeader><div><CardTitle>Navegação</CardTitle><CardSub>Menu universal para desktop e mobile.</CardSub></div><IconTile $tone="blue"><MaterialIcon>menu</MaterialIcon></IconTile></CardHeader>
            <CardSub>Links principais, categorias referenciadas e destinos utilitários são administrados em uma única fonte.</CardSub>
            <div style={{marginTop: 16}}><Pill $tone={data.navigationDraft ? 'sand' : data.navigationPublished ? 'green' : 'neutral'}>{data.navigationDraft ? 'Rascunho pendente' : data.navigationPublished ? 'Publicado' : 'Não configurado'}</Pill></div>
            <div style={{marginTop: 20}}><SecondaryIntentAction type="navigation" id="navigation">Editar navegação</SecondaryIntentAction></div>
          </Card>

          <Card>
            <CardHeader><div><CardTitle>SEO global</CardTitle><CardSub>Metadados padrão e imagem social.</CardSub></div><IconTile $tone="sand"><MaterialIcon>travel_explore</MaterialIcon></IconTile></CardHeader>
            <CardSub>As páginas podem sobrescrever o padrão; o fallback global permanece centralizado no SiteSettings.</CardSub>
            <div style={{marginTop: 20}}><SecondaryIntentAction type="siteSettings" id="siteSettings">Revisar SEO</SecondaryIntentAction></div>
          </Card>

          <Card>
            <CardHeader><div><CardTitle>Ambiente e segurança</CardTitle><CardSub>Configuração declarada pelo código; permissões e CORS exigem verificação administrativa.</CardSub></div><IconTile $tone="red"><MaterialIcon>shield</MaterialIcon></IconTile></CardHeader>
            <Chips>
              <Chip>Projeto: {projectId}</Chip>
              <Chip>Site: {siteDataset}</Chip>
              <Chip>Business: {businessDataset}</Chip>
              <Chip>Preview: {previewUrl ? 'configurado' : 'não configurado'}</Chip>
            </Chips>
            <CardSub style={{marginTop: 16}}>O portal não afirma “Business privado” nem “CORS controlado” sem consultar a configuração administrativa externa do Sanity.</CardSub>
          </Card>
        </Grid>
      </Shell>
    </Page>
  )
}
