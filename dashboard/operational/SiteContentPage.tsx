import {useClient} from 'sanity'
import styled from 'styled-components'
import {esmeraTokens as t} from '../../studio/esmeraTokens'
import {
  Card,
  CardHeader,
  CardSub,
  CardTitle,
  Grid,
  Header,
  HeaderActions,
  IconTile,
  MaterialIcon,
  Page,
  Pill,
  RowMeta,
  RowTitle,
  SectionLabel,
  Shell,
  Subtitle,
  Title,
} from '../stitch/StitchUI'
import {
  API_VERSION,
  ErrorState,
  LoadingState,
  NativeButton,
  SecondaryIntentAction,
  getStudioEnv,
  useQueryState,
} from './shared'

const ContentHero = styled(Card)`
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(260px, .55fr);
  gap: 24px;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`
const BlockGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  @media (max-width: 800px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 560px) { grid-template-columns: 1fr; }
`
const ContentBlock = styled.div`
  border: 1px solid ${t.color.line};
  border-radius: 10px;
  background: ${t.color.surfaceLowest};
  padding: 16px;
`
const ContentIcon = styled(IconTile)`width: 38px; height: 38px;`
const GlobalRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid ${t.color.line};
  padding: 12px 0;
`
const PreviewAnchor = styled.a`
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid ${t.color.line};
  border-radius: ${t.radius.control}px;
  background: ${t.color.surfaceLowest};
  color: ${t.color.ink};
  padding: 0 16px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  &:hover { background: ${t.color.surfaceLow}; }
`

type ContentState = {
  documents: {
    type: string
    id: string
    published: boolean
    draft: boolean
    updatedAt?: string
  }[]
}

const CONTENT_QUERY = `{
  "documents": [
    {"type":"homePage","id":"homePage","published":defined(*[_id=="homePage"][0]._id),"draft":defined(*[_id=="drafts.homePage"][0]._id),"updatedAt":coalesce(*[_id=="drafts.homePage"][0]._updatedAt,*[_id=="homePage"][0]._updatedAt)},
    {"type":"aboutPage","id":"aboutPage","published":defined(*[_id=="aboutPage"][0]._id),"draft":defined(*[_id=="drafts.aboutPage"][0]._id),"updatedAt":coalesce(*[_id=="drafts.aboutPage"][0]._updatedAt,*[_id=="aboutPage"][0]._updatedAt)},
    {"type":"contactPage","id":"contactPage","published":defined(*[_id=="contactPage"][0]._id),"draft":defined(*[_id=="drafts.contactPage"][0]._id),"updatedAt":coalesce(*[_id=="drafts.contactPage"][0]._updatedAt,*[_id=="contactPage"][0]._updatedAt)},
    {"type":"collectionPage","id":"collectionPage","published":defined(*[_id=="collectionPage"][0]._id),"draft":defined(*[_id=="drafts.collectionPage"][0]._id),"updatedAt":coalesce(*[_id=="drafts.collectionPage"][0]._updatedAt,*[_id=="collectionPage"][0]._updatedAt)},
    {"type":"navigation","id":"navigation","published":defined(*[_id=="navigation"][0]._id),"draft":defined(*[_id=="drafts.navigation"][0]._id),"updatedAt":coalesce(*[_id=="drafts.navigation"][0]._updatedAt,*[_id=="navigation"][0]._updatedAt)},
    {"type":"siteSettings","id":"siteSettings","published":defined(*[_id=="siteSettings"][0]._id),"draft":defined(*[_id=="drafts.siteSettings"][0]._id),"updatedAt":coalesce(*[_id=="drafts.siteSettings"][0]._updatedAt,*[_id=="siteSettings"][0]._updatedAt)}
  ]
}`

const blocks = [
  ['photo_library', 'Bloco 01', 'Hero Visual', 'Galeria, headline e CTA'],
  ['subject', 'Bloco 02', 'Manifesto', 'Textos institucionais e valores'],
  ['auto_awesome_motion', 'Bloco 03', 'Seleção de Produtos', 'Curadoria manual da Home'],
  ['texture', 'Bloco 04', 'Matter', 'Foco em materiais e texturas'],
  ['draw', 'Bloco 05', 'Signature', 'Peças e narrativa editorial'],
  ['map', 'Bloco 06', 'Provenance', 'Origem e história'],
] as const

function StatusPill({published, draft}: {published?: boolean; draft?: boolean}) {
  if (draft) return <Pill $tone="sand">Rascunho pendente</Pill>
  if (published) return <Pill $tone="green">Publicado</Pill>
  return <Pill>Não configurado</Pill>
}

export function SiteContentPage() {
  const client = useClient({apiVersion: API_VERSION})
  const query = useQueryState<ContentState>(client, CONTENT_QUERY)
  const previewUrl = getStudioEnv('SANITY_STUDIO_PREVIEW_URL')

  if (query.state.status === 'loading') {
    return <Page><Shell><Header><div><Title>Conteúdo do Site</Title><Subtitle>Gerencie a narrativa visual e institucional da Esméra.</Subtitle></div></Header><LoadingState /></Shell></Page>
  }
  if (query.state.status === 'error') {
    return <Page><Shell><Header><div><Title>Conteúdo do Site</Title><Subtitle>Gerencie a narrativa visual e institucional da Esméra.</Subtitle></div></Header><ErrorState code={query.state.code} detail={query.state.message} onRetry={query.retry} /></Shell></Page>
  }

  const byId = new Map(query.state.data.documents.map((item) => [item.id, item]))
  const home = byId.get('homePage')

  return (
    <Page>
      <Shell>
        <Header>
          <div>
            <Title>Conteúdo do Site</Title>
            <Subtitle>Gerencie a narrativa visual e institucional da Esméra.</Subtitle>
          </div>
          <HeaderActions>
            {previewUrl ? (
              <PreviewAnchor href={previewUrl} target="_blank" rel="noreferrer"><MaterialIcon>visibility</MaterialIcon>Visualizar Site</PreviewAnchor>
            ) : (
              <NativeButton disabled title="Configure SANITY_STUDIO_PREVIEW_URL"><MaterialIcon>visibility_off</MaterialIcon>Preview não configurado</NativeButton>
            )}
            <SecondaryIntentAction type="homePage" id="homePage"><MaterialIcon>publish</MaterialIcon>Revisar publicação</SecondaryIntentAction>
          </HeaderActions>
        </Header>

        <ContentHero>
          <div>
            <CardHeader>
              <div><CardTitle>Home Page</CardTitle><CardSub>Composição editorial da página principal.</CardSub></div>
              <StatusPill published={home?.published} draft={home?.draft} />
            </CardHeader>
            <BlockGrid>
              {blocks.map(([icon, small, title, desc]) => (
                <ContentBlock key={title}>
                  <div style={{display: 'flex', justifyContent: 'space-between', gap: 8}}>
                    <ContentIcon><MaterialIcon>{icon}</MaterialIcon></ContentIcon>
                    <StatusPill published={home?.published} draft={home?.draft} />
                  </div>
                  <SectionLabel style={{marginTop: 14}}>{small}</SectionLabel>
                  <RowTitle>{title}</RowTitle>
                  <RowMeta>{desc}</RowMeta>
                  <div style={{marginTop: 14}}><SecondaryIntentAction type="homePage" id="homePage">Editar</SecondaryIntentAction></div>
                </ContentBlock>
              ))}
            </BlockGrid>
          </div>
          <div>
            <CardTitle style={{fontSize: 17}}>Configurações Globais</CardTitle>
            <CardSub>Ajustes estruturais do site.</CardSub>
            <div style={{display: 'grid', gap: 10, marginTop: 16}}>
              {[
                ['settings', 'WhatsApp Atendimento', 'SiteSettings'],
                ['travel_explore', 'Global SEO', 'SiteSettings'],
                ['dock_to_bottom', 'Footer Content', 'SiteSettings'],
              ].map(([icon, title, subtitle]) => (
                <GlobalRow key={title}>
                  <MaterialIcon>{icon}</MaterialIcon>
                  <div style={{flex: 1}}><RowTitle>{title}</RowTitle><RowMeta>{subtitle}</RowMeta></div>
                  <MaterialIcon>arrow_forward</MaterialIcon>
                </GlobalRow>
              ))}
            </div>
            <div style={{marginTop: 16}}><SecondaryIntentAction type="siteSettings" id="siteSettings">Ver todas as configurações</SecondaryIntentAction></div>
          </div>
        </ContentHero>

        <Grid $cols={3} style={{marginTop: 24}}>
          {[
            ['auto_stories', 'A Maison', 'Conteúdo institucional e narrativa da marca.', 'aboutPage'],
            ['account_tree', 'Estrutura', 'Coleção, navegação e organização editorial.', 'collectionPage'],
            ['alternate_email', 'Contato', 'Canais, mensagem e redes sociais.', 'contactPage'],
          ].map(([icon, title, description, id]) => {
            const state = byId.get(id)
            const type = id
            return (
              <Card key={id}>
                <CardHeader><IconTile><MaterialIcon>{icon}</MaterialIcon></IconTile><StatusPill published={state?.published} draft={state?.draft} /></CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardSub>{description}</CardSub>
                <div style={{marginTop: 18}}><SecondaryIntentAction type={type} id={id}>Editar</SecondaryIntentAction></div>
              </Card>
            )
          })}
        </Grid>

        <Card style={{marginTop: 24, textAlign: 'center'}}>
          <MaterialIcon>info</MaterialIcon>
          <CardTitle style={{marginTop: 8, fontSize: 17}}>Publicação permanece no fluxo nativo do Sanity</CardTitle>
          <CardSub>O portal operacional mostra o estado real. Para publicar, revisar histórico, validações e campos avançados, use “Revisar publicação” ou o Admin técnico.</CardSub>
        </Card>
      </Shell>
    </Page>
  )
}
