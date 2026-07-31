import {useEffect, useMemo, useState} from 'react'
import {useClient} from 'sanity'
import styled from 'styled-components'
import {esmeraTokens as t} from '../../studio/esmeraTokens'
import {
  Card,
  CardHeader,
  CardSub,
  CardTitle,
  Divider,
  Grid,
  Header,
  HeaderActions,
  InfoLabel,
  MaterialIcon,
  Page,
  Pill,
  Shell,
  Subtitle,
  Thumb,
  Title,
  money,
} from '../stitch/StitchUI'
import {
  API_VERSION,
  ErrorState,
  LoadingState,
  NativeButton,
  PrimaryNativeButton,
  SecondaryIntentAction,
  getStudioEnv,
  useQueryState,
} from './shared'

const EditorGrid = styled.div`
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr) 320px;
  gap: 20px;
  align-items: start;

  @media (max-width: 1180px) { grid-template-columns: 190px minmax(0, 1fr); > aside:last-child { grid-column: 1 / -1; } }
  @media (max-width: 820px) { grid-template-columns: 1fr; }
`

const SectionNav = styled(Card)`
  position: sticky;
  top: ${t.layout.header + 16}px;
  padding: 12px;
  @media (max-width: 820px) { position: static; }
`

const SectionLink = styled.a<{$active?: boolean}>`
  display: flex;
  min-height: 42px;
  align-items: center;
  gap: 10px;
  border-radius: 8px;
  background: ${({$active}) => ($active ? t.color.surfaceContainer : 'transparent')};
  color: ${({$active}) => ($active ? t.color.primary : t.color.textSecondary)};
  padding: 0 10px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  &:hover { background: ${t.color.surfaceLow}; }
`

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  @media (max-width: 620px) { grid-template-columns: 1fr; }
`

const Field = styled.label`
  display: grid;
  gap: 7px;
  color: ${t.color.textSecondary};
  font-size: 12px;
  font-weight: 600;
`

const Input = styled.input`
  width: 100%;
  min-height: 42px;
  border: 1px solid ${t.color.line};
  border-radius: 8px;
  background: ${t.color.surfaceLowest};
  color: ${t.color.ink};
  padding: 0 12px;
  outline: 0;
  &:focus { border-color: ${t.color.primary}; box-shadow: 0 0 0 1px ${t.color.primary}; }
`

const Select = styled.select`
  width: 100%;
  min-height: 42px;
  border: 1px solid ${t.color.line};
  border-radius: 8px;
  background: ${t.color.surfaceLowest};
  color: ${t.color.ink};
  padding: 0 12px;
`

const RadioRow = styled.div`display: flex; gap: 8px; flex-wrap: wrap;`
const RadioButton = styled.button<{$active?: boolean}>`
  min-height: 38px;
  border: 1px solid ${({$active}) => ($active ? t.color.primary : t.color.line)};
  border-radius: 999px;
  background: ${({$active}) => ($active ? t.color.primarySoft : t.color.surfaceLowest)};
  color: ${({$active}) => ($active ? t.color.primary : t.color.ink)};
  padding: 0 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
`

const MediaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  @media (max-width: 760px) { grid-template-columns: repeat(2, 1fr); }
`
const Media = styled.div`
  overflow: hidden;
  border: 1px solid ${t.color.line};
  border-radius: 10px;
  background: ${t.color.surfaceLow};
  img { display: block; width: 100%; aspect-ratio: 1; object-fit: cover; }
`

const SideCard = styled(Card)`position: sticky; top: ${t.layout.header + 16}px; @media (max-width: 1180px) { position: static; }`
const StatusLine = styled.div`display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid ${t.color.line}; &:last-child { border-bottom: 0; }`

const Toast = styled.div<{$error?: boolean}>`
  margin-bottom: 16px;
  border: 1px solid ${({$error}) => ($error ? t.color.error : t.color.primary)};
  border-radius: 10px;
  background: ${({$error}) => ($error ? t.color.errorSoft : t.color.primarySoft)};
  color: ${({$error}) => ($error ? t.color.error : t.color.primary)};
  padding: 12px 14px;
  font-size: 13px;
  font-weight: 600;
`

type ProductDoc = {
  _id: string
  title?: string
  subtitle?: string
  slug?: string
  code?: string
  status?: string
  availability?: string
  material?: string
  priceMode?: string
  basePriceCents?: number
  categoryRefs?: string[]
  categories?: {title?: string}[]
  gallery?: {mediaKey?: string; role?: string; alt?: string; url?: string}[]
  variantsCount?: number
  optionsCount?: number
  searchTerms?: string[]
  updatedAt?: string
}

type Category = {_id: string; title?: string}

const PRODUCT_QUERY = `coalesce(*[_id == $draftId][0], *[_id == $id][0]){
  _id,
  title,
  subtitle,
  "slug": slug.current,
  code,
  status,
  availability,
  material,
  priceMode,
  basePriceCents,
  "categoryRefs": categories[]._ref,
  "categories": categories[]->{title},
  gallery[]{mediaKey, role, alt, "url": asset->url},
  "variantsCount": count(variants),
  "optionsCount": count(optionDefinitions),
  searchTerms,
  "updatedAt": _updatedAt
}`
const CATEGORY_QUERY = `*[_type == "category" && status == "active"] | order(order asc, title asc){_id,title}`

function sanitizePublishedForDraft(value: Record<string, unknown>) {
  const copy = {...value}
  delete copy._rev
  delete copy._createdAt
  delete copy._updatedAt
  return copy
}

export function SiteProductEditorPage({id}: {id: string}) {
  const client = useClient({apiVersion: API_VERSION})
  const publishedId = decodeURIComponent(id).replace(/^drafts\./, '')
  const draftId = `drafts.${publishedId}`
  const product = useQueryState<ProductDoc | null>(client, PRODUCT_QUERY, {id: publishedId, draftId}, (value) => !value)
  const categories = useQueryState<Category[]>(client, CATEGORY_QUERY)
  const previewBase = getStudioEnv('SANITY_STUDIO_PREVIEW_URL')

  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [code, setCode] = useState('')
  const [material, setMaterial] = useState('')
  const [status, setStatus] = useState('draft')
  const [availability, setAvailability] = useState('available')
  const [priceMode, setPriceMode] = useState('inquiry')
  const [basePrice, setBasePrice] = useState('')
  const [primaryCategory, setPrimaryCategory] = useState('')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{text: string; error?: boolean} | null>(null)

  const loaded = product.state.status === 'ready' || product.state.status === 'empty'
  const doc = loaded ? product.state.data : null

  useEffect(() => {
    if (!doc) return
    setTitle(doc.title || '')
    setSubtitle(doc.subtitle || '')
    setCode(doc.code || '')
    setMaterial(doc.material || '')
    setStatus(doc.status || 'draft')
    setAvailability(doc.availability || 'available')
    setPriceMode(doc.priceMode || 'inquiry')
    setBasePrice(typeof doc.basePriceCents === 'number' ? String(doc.basePriceCents / 100) : '')
    setPrimaryCategory(doc.categoryRefs?.[0] || '')
  }, [doc])

  const categoryItems = categories.state.status === 'ready' || categories.state.status === 'empty' ? categories.state.data : []
  const previewUrl = useMemo(() => previewBase && doc?.slug ? `${previewBase.replace(/\/$/, '')}/produto/${doc.slug}` : previewBase, [doc?.slug, previewBase])

  async function save() {
    if (!title.trim() || !code.trim()) {
      setFeedback({text: 'Título e código são obrigatórios.', error: true})
      return
    }
    setSaving(true)
    setFeedback(null)
    try {
      const existingDraft = await client.fetch<Record<string, unknown> | null>(`*[_id == $draftId][0]`, {draftId})
      if (!existingDraft) {
        const published = await client.fetch<Record<string, unknown> | null>(`*[_id == $id][0]`, {id: publishedId})
        const base = sanitizePublishedForDraft(published || {_type: 'product'})
        await client.createIfNotExists({...base, _id: draftId, _type: 'product'})
      }

      const currentRefs = doc?.categoryRefs || []
      const refs = primaryCategory
        ? [primaryCategory, ...currentRefs.filter((ref) => ref !== primaryCategory)].map((ref, index) => ({_type: 'reference', _ref: ref, _key: `category-${index}-${ref.slice(-6)}`}))
        : []
      const cents = priceMode === 'fixed' && basePrice ? Math.round(Number(basePrice.replace(',', '.')) * 100) : undefined
      const patch: Record<string, unknown> = {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        code: code.trim().toUpperCase(),
        material: material.trim() || undefined,
        status,
        availability,
        priceMode,
        categories: refs,
      }
      if (priceMode === 'fixed' && Number.isFinite(cents)) patch.basePriceCents = cents

      let transaction = client.patch(draftId).set(patch)
      if (priceMode !== 'fixed') transaction = transaction.unset(['basePriceCents'])
      await transaction.commit()
      setFeedback({text: 'Rascunho salvo com sucesso. A publicação continua no fluxo nativo do Sanity.'})
      product.retry()
    } catch (reason) {
      setFeedback({text: reason instanceof Error ? reason.message : 'Não foi possível salvar o produto.', error: true})
    } finally {
      setSaving(false)
    }
  }

  if (product.state.status === 'loading' || categories.state.status === 'loading') {
    return <Page><Shell><Header><div><Title>Produto</Title><Subtitle>Carregando ficha editorial.</Subtitle></div></Header><LoadingState /></Shell></Page>
  }
  if (product.state.status === 'error') {
    return <Page><Shell><Header><div><Title>Produto</Title><Subtitle>Ficha editorial.</Subtitle></div></Header><ErrorState code={product.state.code} detail={product.state.message} onRetry={product.retry} /></Shell></Page>
  }
  if (!doc) {
    return <Page><Shell><Header><div><Title>Produto não encontrado</Title><Subtitle>O documento solicitado não existe neste dataset.</Subtitle></div></Header><Card><a href="/site/cms/products">Voltar aos produtos</a></Card></Shell></Page>
  }

  return (
    <Page>
      <Shell>
        <Header>
          <div>
            <div style={{display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, fontSize: 12}}><a href="/site/cms/products" style={{color: t.color.primary, textDecoration: 'none'}}>Produtos</a><span>/</span><span>{doc.title || 'Produto'}</span></div>
            <Title>{doc.title || 'Produto sem título'}</Title>
            <Subtitle>{doc.code || 'Sem código'} · edição operacional em rascunho</Subtitle>
          </div>
          <HeaderActions>
            {previewUrl ? <a href={previewUrl} target="_blank" rel="noreferrer" style={{display: 'inline-flex', minHeight: 40, alignItems: 'center', gap: 8, border: `1px solid ${t.color.line}`, borderRadius: 8, color: t.color.ink, padding: '0 16px', fontSize: 13, fontWeight: 600, textDecoration: 'none'}}><MaterialIcon>visibility</MaterialIcon>Pré-visualizar</a> : <NativeButton disabled><MaterialIcon>visibility_off</MaterialIcon>Preview não configurado</NativeButton>}
            <PrimaryNativeButton type="button" onClick={save} disabled={saving}><MaterialIcon>save</MaterialIcon>{saving ? 'Salvando...' : 'Salvar Alterações'}</PrimaryNativeButton>
          </HeaderActions>
        </Header>

        {feedback ? <Toast $error={feedback.error}>{feedback.text}</Toast> : null}

        <EditorGrid>
          <SectionNav as="nav" aria-label="Seções do produto">
            {[
              ['info', 'Visão Geral', '#overview'],
              ['photo_library', `Mídia ${doc.gallery?.length || 0}`, '#media'],
              ['payments', 'Preço', '#pricing'],
              ['layers', 'Variantes', '#variants'],
              ['description', 'Informações Técnicas', '#technical'],
              ['search', 'SEO', '#seo'],
            ].map(([icon, label, href], index) => <SectionLink key={href} href={href} $active={index === 0}><MaterialIcon>{icon}</MaterialIcon>{label}</SectionLink>)}
          </SectionNav>

          <main style={{display: 'grid', gap: 20}}>
            <Card id="overview">
              <CardHeader><div><CardTitle><MaterialIcon>feed</MaterialIcon> Informações Principais</CardTitle><CardSub>Identidade, status e classificação do produto.</CardSub></div><Pill $tone={doc._id.startsWith('drafts.') ? 'sand' : 'green'}>{doc._id.startsWith('drafts.') ? 'Rascunho' : 'Publicado'}</Pill></CardHeader>
              <FormGrid>
                <Field>Título<Input value={title} onChange={(event) => setTitle(event.target.value)} /></Field>
                <Field>Código<Input value={code} onChange={(event) => setCode(event.target.value)} /></Field>
                <Field>Subtítulo<Input value={subtitle} onChange={(event) => setSubtitle(event.target.value)} /></Field>
                <Field>Material<Input value={material} onChange={(event) => setMaterial(event.target.value)} /></Field>
                <Field>Categoria principal<Select value={primaryCategory} onChange={(event) => setPrimaryCategory(event.target.value)}><option value="">Sem categoria</option>{categoryItems.map((category) => <option key={category._id} value={category._id}>{category.title}</option>)}</Select></Field>
                <Field>Disponibilidade<Select value={availability} onChange={(event) => setAvailability(event.target.value)}><option value="unique">Peça única</option><option value="available">Disponível</option><option value="made_to_order">Sob encomenda</option><option value="limited">Edição limitada</option><option value="archive">Arquivada</option></Select></Field>
              </FormGrid>
              <Divider />
              <InfoLabel>Status editorial</InfoLabel>
              <RadioRow style={{marginTop: 10}}>{[['draft', 'Rascunho'], ['active', 'Ativo'], ['archive', 'Arquivado']].map(([value, label]) => <RadioButton type="button" key={value} $active={status === value} onClick={() => setStatus(value)}>{label}</RadioButton>)}</RadioRow>
            </Card>

            <Card id="media">
              <CardHeader><div><CardTitle><MaterialIcon>photo_camera</MaterialIcon> Galeria de Mídia</CardTitle><CardSub>A imagem com papel “Capa” é usada como principal no portal.</CardSub></div><SecondaryIntentAction type="product" id={publishedId}><MaterialIcon>add</MaterialIcon>Gerenciar mídia</SecondaryIntentAction></CardHeader>
              {doc.gallery?.length ? <MediaGrid>{doc.gallery.map((media, index) => <Media key={media.mediaKey || `${index}`}>
                {media.url ? <img src={media.url} alt={media.alt || doc.title || 'Mídia do produto'} /> : <Thumb style={{width: '100%', height: 120}}><MaterialIcon>image</MaterialIcon></Thumb>}
                <div style={{padding: 10}}><Pill $tone={media.role === 'cover' ? 'green' : 'neutral'}>{media.role === 'cover' ? 'Capa' : media.role || 'Galeria'}</Pill><CardSub>{media.alt || 'Sem texto alternativo'}</CardSub></div>
              </Media>)}</MediaGrid> : <CardSub>Nenhuma mídia cadastrada. Use “Gerenciar mídia” para adicionar imagens e texto alternativo.</CardSub>}
            </Card>

            <Card id="pricing">
              <CardHeader><div><CardTitle><MaterialIcon>tune</MaterialIcon> Variantes e Preços</CardTitle><CardSub>Defina como o valor comercial é exibido.</CardSub></div></CardHeader>
              <InfoLabel>Modo de preço</InfoLabel>
              <RadioRow style={{marginTop: 10}}><RadioButton type="button" $active={priceMode === 'fixed'} onClick={() => setPriceMode('fixed')}>Preço Fixo</RadioButton><RadioButton type="button" $active={priceMode === 'inquiry'} onClick={() => setPriceMode('inquiry')}>Sob Consulta</RadioButton></RadioRow>
              {priceMode === 'fixed' ? <Field style={{marginTop: 16}}>Preço base (R$)<Input inputMode="decimal" value={basePrice} onChange={(event) => setBasePrice(event.target.value)} placeholder="0,00" /></Field> : <CardSub style={{marginTop: 16}}>O cliente verá “Sob consulta”; o valor não será exibido publicamente.</CardSub>}
            </Card>

            <Card id="variants">
              <CardHeader><div><CardTitle>Variantes</CardTitle><CardSub>Tamanho, cor, kit e combinações cadastradas.</CardSub></div><SecondaryIntentAction type="product" id={publishedId}><MaterialIcon>edit</MaterialIcon>Editar variantes</SecondaryIntentAction></CardHeader>
              <Grid $cols={2}><div><InfoLabel>Opções</InfoLabel><div style={{fontFamily: t.typography.headline, fontSize: 28, fontWeight: 600, marginTop: 5}}>{doc.optionsCount || 0}</div></div><div><InfoLabel>Combinações</InfoLabel><div style={{fontFamily: t.typography.headline, fontSize: 28, fontWeight: 600, marginTop: 5}}>{doc.variantsCount || 0}</div></div></Grid>
            </Card>

            <Card id="technical">
              <CardHeader><div><CardTitle>Informações Técnicas</CardTitle><CardSub>Descrição rica, edição, atributos e documentação.</CardSub></div><SecondaryIntentAction type="product" id={publishedId}><MaterialIcon>edit</MaterialIcon>Editar campos avançados</SecondaryIntentAction></CardHeader>
              <CardSub>Esses campos permanecem no Admin técnico para preservar validações, histórico e tipos ricos do Sanity.</CardSub>
            </Card>

            <Card id="seo">
              <CardHeader><div><CardTitle>SEO e descoberta</CardTitle><CardSub>Slug, termos de busca e metadados.</CardSub></div><SecondaryIntentAction type="product" id={publishedId}><MaterialIcon>travel_explore</MaterialIcon>Editar SEO</SecondaryIntentAction></CardHeader>
              <FormGrid><div><InfoLabel>Slug</InfoLabel><div style={{marginTop: 6}}>{doc.slug || 'Não configurado'}</div></div><div><InfoLabel>Termos</InfoLabel><div style={{marginTop: 6}}>{doc.searchTerms?.join(', ') || 'Não configurados'}</div></div></FormGrid>
            </Card>
          </main>

          <SideCard as="aside">
            <CardTitle style={{fontSize: 17}}>Resumo do produto</CardTitle>
            <Divider />
            <StatusLine><InfoLabel>Status</InfoLabel><Pill $tone={status === 'active' ? 'green' : status === 'archive' ? 'neutral' : 'sand'}>{status}</Pill></StatusLine>
            <StatusLine><InfoLabel>Disponibilidade</InfoLabel><span>{availability}</span></StatusLine>
            <StatusLine><InfoLabel>Preço</InfoLabel><strong>{priceMode === 'fixed' ? money(basePrice ? Math.round(Number(basePrice.replace(',', '.')) * 100) : undefined) : 'Sob consulta'}</strong></StatusLine>
            <StatusLine><InfoLabel>Mídias</InfoLabel><strong>{doc.gallery?.length || 0}</strong></StatusLine>
            <StatusLine><InfoLabel>Variantes</InfoLabel><strong>{doc.variantsCount || 0}</strong></StatusLine>
            <Divider />
            <SecondaryIntentAction type="product" id={publishedId}><MaterialIcon>settings</MaterialIcon>Admin técnico</SecondaryIntentAction>
            <CardSub style={{marginTop: 12}}>O portal salva um rascunho. Publicação, histórico e validações completas continuam no editor técnico.</CardSub>
          </SideCard>
        </EditorGrid>
      </Shell>
    </Page>
  )
}
