import {
  defineArrayMember,
  defineField,
  defineType,
  type SlugValue,
  type ValidationContext,
} from 'sanity'
import {CogIcon} from '@sanity/icons/Cog'
import {DocumentIcon} from '@sanity/icons/Document'
import {EnvelopeIcon} from '@sanity/icons/Envelope'
import {HomeIcon} from '@sanity/icons/Home'
import {MenuIcon} from '@sanity/icons/Menu'
import {PackageIcon} from '@sanity/icons/Package'
import {StackIcon} from '@sanity/icons/Stack'
import {TagIcon} from '@sanity/icons/Tag'

const API_VERSION = '2026-07-30'

function uniqueValue(fieldName: 'title' | 'code', label: string) {
  return async (
    value: string | undefined,
    context: {
      document?: {_id?: string; _type?: string}
      getClient: (options: {apiVersion: string}) => {
        fetch: (query: string, params: Record<string, unknown>) => Promise<number>
      }
    },
  ) => {
    if (!value || !context.document?._type) return true

    const publishedId = context.document._id?.replace(/^drafts\./, '')
    const count = await context.getClient({apiVersion: API_VERSION}).fetch(
      `count(*[
        _type == $type &&
        ${fieldName} == $value &&
        !(_id in [$publishedId, "drafts." + $publishedId])
      ])`,
      {
        type: context.document._type,
        value,
        publishedId,
      },
    )

    return count === 0 || `Já existe um produto com este ${label}.`
  }
}

export const category = defineType({
  name: 'category',
  title: 'Categoria',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Nome',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (rule) =>
        rule.required().custom((value: SlugValue | undefined) => {
          if (!value?.current) return 'Informe o slug.'
          return /^[a-z0-9-]+$/.test(value.current) || 'Use letras minúsculas, números e hífens.'
        }),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Ativa', value: 'active'},
          {title: 'Arquivada', value: 'archive'},
        ],
        layout: 'radio',
      },
      initialValue: 'active',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'parent',
      title: 'Categoria principal',
      type: 'reference',
      to: [{type: 'category'}],
      validation: (rule) =>
        rule.custom((value, context) => {
          const ownId = context.document?._id?.replace(/^drafts\./, '')
          return !value?._ref || value._ref.replace(/^drafts\./, '') !== ownId || 'Uma categoria não pode referenciar a si mesma.'
        }),
    }),
    defineField({
      name: 'description',
      title: 'Descrição',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'image',
      title: 'Imagem',
      type: 'siteImage',
    }),
    defineField({
      name: 'order',
      title: 'Ordem editorial',
      type: 'number',
      initialValue: 100,
      validation: (rule) => rule.integer().min(0),
    }),
    defineField({
      name: 'searchTerms',
      title: 'Sinônimos de busca',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.unique(),
    }),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
  ],
  orderings: [
    {title: 'Ordem editorial', name: 'editorialOrder', by: [{field: 'order', direction: 'asc'}]},
    {title: 'Nome', name: 'titleAsc', by: [{field: 'title', direction: 'asc'}]},
  ],
  preview: {
    select: {title: 'title', status: 'status', parent: 'parent.title', media: 'image'},
    prepare({title, status, parent, media}) {
      return {
        title,
        subtitle: [parent, status === 'archive' ? 'Arquivada' : 'Ativa'].filter(Boolean).join(' · '),
        media,
      }
    },
  },
})

type Variant = {
  sku?: string
  status?: string
  priceMode?: string
  priceCents?: number
  selection?: {option?: string; value?: string}[]
  mediaKeys?: string[]
}

type OptionDefinition = {
  code?: string
  values?: {value?: string}[]
}

function validateVariants(
  variants: Variant[] | undefined,
  context: ValidationContext,
) {
  if (!variants?.length) return true

  const document = context.document as
    | {
        optionDefinitions?: OptionDefinition[]
        gallery?: {mediaKey?: string}[]
      }
    | undefined
  const definitions = new Map(
    (document?.optionDefinitions || []).map((option) => [
      option.code,
      new Set((option.values || []).map((value) => value.value)),
    ]),
  )
  const galleryKeys = new Set((document?.gallery || []).map((media) => media.mediaKey))
  const combinations = new Set<string>()
  const skus = new Set<string>()

  for (const variant of variants) {
    if (variant.sku && skus.has(variant.sku)) return `O código de variante ${variant.sku} está repetido.`
    if (variant.sku) skus.add(variant.sku)

    const selection = variant.selection || []
    const optionCodes = selection.map((item) => item.option).filter(Boolean)
    if (new Set(optionCodes).size !== optionCodes.length) {
      return `A variante ${variant.sku || ''} repete uma opção na combinação.`
    }

    for (const item of selection) {
      const allowedValues = definitions.get(item.option)
      if (!allowedValues) return `A variante ${variant.sku || ''} usa a opção inexistente "${item.option}".`
      if (!allowedValues.has(item.value)) {
        return `A variante ${variant.sku || ''} usa o valor inexistente "${item.value}" em "${item.option}".`
      }
    }

    const combination = selection
      .map((item) => `${item.option}:${item.value}`)
      .sort()
      .join('|')
    if (combinations.has(combination)) return `A combinação "${combination}" está duplicada.`
    combinations.add(combination)

    for (const mediaKey of variant.mediaKeys || []) {
      if (!galleryKeys.has(mediaKey)) {
        return `A variante ${variant.sku || ''} aponta para a mídia inexistente "${mediaKey}".`
      }
    }
  }

  return true
}

export const product = defineType({
  name: 'product',
  title: 'Produto',
  type: 'document',
  icon: PackageIcon,
  groups: [
    {name: 'identity', title: 'Identidade', default: true},
    {name: 'media', title: 'Galeria'},
    {name: 'commercial', title: 'Preço e disponibilidade'},
    {name: 'variants', title: 'Variantes'},
    {name: 'discovery', title: 'Busca e SEO'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      group: 'identity',
      validation: (rule) => rule.required().custom(uniqueValue('title', 'título')),
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtítulo',
      type: 'string',
      group: 'identity',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'identity',
      options: {source: 'title', maxLength: 96},
      validation: (rule) =>
        rule.required().custom((value: SlugValue | undefined) => {
          if (!value?.current) return 'Informe o slug.'
          return /^[a-z0-9-]+$/.test(value.current) || 'Use letras minúsculas, números e hífens.'
        }),
    }),
    defineField({
      name: 'code',
      title: 'Código',
      description: 'Identificador interno, como OBJ-021.',
      type: 'string',
      group: 'identity',
      validation: (rule) =>
        rule.required().uppercase().custom(uniqueValue('code', 'código')),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'identity',
      options: {
        list: [
          {title: 'Rascunho', value: 'draft'},
          {title: 'Ativo', value: 'active'},
          {title: 'Arquivado', value: 'archive'},
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'categories',
      title: 'Categorias',
      type: 'array',
      group: 'identity',
      of: [defineArrayMember({type: 'reference', to: [{type: 'category'}]})],
      validation: (rule) =>
        rule.custom((value, context) => {
          const document = context.document as {status?: string}
          if (document.status === 'active' && !value?.length) {
            return 'Um produto ativo precisa ter ao menos uma categoria.'
          }
          return true
        }).unique(),
    }),
    defineField({
      name: 'material',
      title: 'Material',
      type: 'string',
      group: 'identity',
    }),
    defineField({
      name: 'description',
      title: 'Descrição editorial',
      type: 'richText',
      group: 'identity',
    }),
    defineField({
      name: 'edition',
      title: 'Edição',
      description: 'Exemplo: peça única, edição de 8 ou numerada.',
      type: 'string',
      group: 'identity',
    }),
    defineField({
      name: 'attributes',
      title: 'Ficha técnica',
      type: 'array',
      group: 'identity',
      of: [defineArrayMember({type: 'productAttribute'})],
    }),
    defineField({
      name: 'gallery',
      title: 'Galeria',
      description: 'A primeira imagem com uso "Capa" será a principal.',
      type: 'array',
      group: 'media',
      of: [defineArrayMember({type: 'productMedia'})],
      validation: (rule) =>
        rule
          .custom((value, context) => {
            const document = context.document as {status?: string}
            if (document.status === 'active' && !value?.length) {
              return 'Um produto ativo precisa ter pelo menos uma imagem.'
            }
            const media = (value || []) as {mediaKey?: string; role?: string}[]
            const keys = media.map((item) => item.mediaKey).filter(Boolean)
            if (new Set(keys).size !== keys.length) return 'As chaves de mídia não podem se repetir.'
            const covers = media.filter((item) => item.role === 'cover')
            return covers.length <= 1 || 'Defina no máximo uma imagem como capa.'
          })
          .max(12),
    }),
    defineField({
      name: 'availability',
      title: 'Disponibilidade',
      type: 'string',
      group: 'commercial',
      options: {
        list: [
          {title: 'Peça única', value: 'unique'},
          {title: 'Disponível', value: 'available'},
          {title: 'Sob encomenda', value: 'made_to_order'},
          {title: 'Edição limitada', value: 'limited'},
          {title: 'Arquivada', value: 'archive'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'priceMode',
      title: 'Modo de preço',
      type: 'string',
      group: 'commercial',
      options: {
        list: [
          {title: 'Preço fixo', value: 'fixed'},
          {title: 'Sob consulta', value: 'inquiry'},
        ],
        layout: 'radio',
      },
      initialValue: 'inquiry',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'basePriceCents',
      title: 'Preço base em centavos',
      description: 'Exemplo: R$ 14.900,00 = 1490000.',
      type: 'number',
      group: 'commercial',
      hidden: ({document}) => document?.priceMode !== 'fixed',
      validation: (rule) =>
        rule.integer().min(0).custom((value, context) => {
          const document = context.document as {
            priceMode?: string
            variants?: Variant[]
          }
          if (document.priceMode !== 'fixed') return true
          const hasVariantPrice = (document.variants || []).some(
            (variant) => variant.status !== 'disabled' && variant.priceMode === 'fixed' && variant.priceCents !== undefined,
          )
          return value !== undefined || hasVariantPrice || 'Informe o preço base ou um preço de variante.'
        }),
    }),
    defineField({
      name: 'optionDefinitions',
      title: 'Opções',
      description: 'Cadastre Tamanho, Cor, Kit e seus valores antes das combinações.',
      type: 'array',
      group: 'variants',
      of: [defineArrayMember({type: 'optionDefinition'})],
      validation: (rule) =>
        rule.custom((options) => {
          const codes = ((options || []) as OptionDefinition[])
            .map((item) => item.code)
            .filter(Boolean)
          return new Set(codes).size === codes.length || 'Os códigos das opções não podem se repetir.'
        }),
    }),
    defineField({
      name: 'variants',
      title: 'Combinações',
      type: 'array',
      group: 'variants',
      of: [defineArrayMember({type: 'productVariant'})],
      validation: (rule) => rule.custom(validateVariants),
    }),
    defineField({
      name: 'searchTerms',
      title: 'Termos e sinônimos',
      type: 'array',
      group: 'discovery',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: 'tags',
      title: 'Tags editoriais',
      type: 'array',
      group: 'discovery',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.unique(),
    }),
    defineField({name: 'seo', title: 'SEO', type: 'seo', group: 'discovery'}),
  ],
  orderings: [
    {title: 'Título', name: 'titleAsc', by: [{field: 'title', direction: 'asc'}]},
    {title: 'Código', name: 'codeAsc', by: [{field: 'code', direction: 'asc'}]},
    {title: 'Mais recentes', name: 'updatedDesc', by: [{field: '_updatedAt', direction: 'desc'}]},
  ],
  preview: {
    select: {
      title: 'title',
      code: 'code',
      status: 'status',
      availability: 'availability',
      media: 'gallery.0',
    },
    prepare({title, code, status, availability, media}) {
      return {
        title,
        subtitle: [code, status === 'archive' ? 'Arquivado' : availability].filter(Boolean).join(' · '),
        media,
      }
    },
  },
})

export const homePage = defineType({
  name: 'homePage',
  title: 'Home',
  type: 'document',
  icon: HomeIcon,
  groups: [
    {name: 'hero', title: 'Galeria Hero', default: true},
    {name: 'manifesto', title: 'Manifesto'},
    {name: 'selection', title: 'Seleção de produtos'},
    {name: 'matter', title: 'Matter'},
    {name: 'signature', title: 'Signature'},
    {name: 'provenance', title: 'Proveniência'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'heroMode',
      title: 'Modo da Hero',
      type: 'string',
      group: 'hero',
      options: {
        list: [
          {title: 'Uma imagem', value: 'single'},
          {title: 'Carrossel', value: 'carousel'},
        ],
        layout: 'radio',
      },
      initialValue: 'single',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroSlides',
      title: 'Galeria da Hero',
      type: 'array',
      group: 'hero',
      of: [defineArrayMember({type: 'heroSlide'})],
      validation: (rule) =>
        rule.required().min(1).max(5).custom((slides, context) => {
          const document = context.document as {heroMode?: string}
          const activeCount = ((slides || []) as {active?: boolean}[]).filter(
            (slide) => slide.active !== false,
          ).length
          if (document.heroMode === 'single' && activeCount !== 1) {
            return 'No modo de uma imagem, deixe exatamente um slide ativo.'
          }
          if (document.heroMode === 'carousel' && (activeCount < 2 || activeCount > 5)) {
            return 'No carrossel, deixe entre 2 e 5 slides ativos.'
          }
          return true
        }),
    }),
    defineField({
      name: 'autoplay',
      title: 'Avançar automaticamente',
      type: 'boolean',
      group: 'hero',
      hidden: ({document}) => document?.heroMode !== 'carousel',
      initialValue: false,
    }),
    defineField({
      name: 'autoplaySeconds',
      title: 'Intervalo em segundos',
      type: 'number',
      group: 'hero',
      hidden: ({document}) => document?.heroMode !== 'carousel' || document?.autoplay !== true,
      validation: (rule) => rule.integer().min(3).max(12),
    }),
    defineField({name: 'manifestoEyebrow', title: 'Sobretítulo', type: 'string', group: 'manifesto'}),
    defineField({
      name: 'manifestoTitle',
      title: 'Título',
      type: 'string',
      group: 'manifesto',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'manifestoCopy', title: 'Texto', type: 'richText', group: 'manifesto'}),
    defineField({name: 'manifestoPrimaryImage', title: 'Imagem principal', type: 'siteImage', group: 'manifesto'}),
    defineField({name: 'manifestoSecondaryImage', title: 'Imagem secundária', type: 'siteImage', group: 'manifesto'}),
    defineField({
      name: 'selectedProducts',
      title: 'Seleção de produtos',
      description: 'Escolha exatamente 4 produtos existentes. Nenhum dado do produto é copiado aqui.',
      type: 'array',
      group: 'selection',
      of: [defineArrayMember({type: 'reference', to: [{type: 'product'}]})],
      validation: (rule) => rule.required().min(4).max(4).unique(),
    }),
    defineField({
      name: 'matterPanels',
      title: 'Painéis Matter',
      description: 'Três painéis ligados a categorias existentes.',
      type: 'array',
      group: 'matter',
      of: [defineArrayMember({type: 'matterPanel'})],
      validation: (rule) => rule.required().min(3).max(3),
    }),
    defineField({
      name: 'signatureSlides',
      title: 'Slides Signature',
      type: 'array',
      group: 'signature',
      of: [defineArrayMember({type: 'signatureSlide'})],
      validation: (rule) => rule.required().min(1).max(6),
    }),
    defineField({name: 'provenanceTitle', title: 'Título', type: 'string', group: 'provenance'}),
    defineField({name: 'provenanceCopy', title: 'Texto', type: 'richText', group: 'provenance'}),
    defineField({name: 'provenanceImage', title: 'Imagem', type: 'siteImage', group: 'provenance'}),
    defineField({
      name: 'provenanceSteps',
      title: 'Etapas',
      type: 'array',
      group: 'provenance',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'provenanceStep',
          title: 'Etapa',
          fields: [
            defineField({name: 'title', title: 'Título', type: 'string', validation: (rule) => rule.required()}),
            defineField({name: 'copy', title: 'Texto', type: 'text', rows: 3}),
          ],
          preview: {select: {title: 'title', subtitle: 'copy'}},
        }),
      ],
      validation: (rule) => rule.max(6),
    }),
    defineField({name: 'provenanceCallToAction', title: 'Chamada para ação', type: 'callToAction', group: 'provenance'}),
    defineField({name: 'seo', title: 'SEO', type: 'seo', group: 'seo'}),
  ],
  preview: {
    prepare() {
      return {title: 'Home', subtitle: 'Hero, manifesto, seleção, Matter e Signature'}
    },
  },
})

export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'Sobre',
  type: 'document',
  icon: DocumentIcon,
  groups: [
    {name: 'intro', title: 'Introdução', default: true},
    {name: 'maison', title: 'Maison'},
    {name: 'vision', title: 'Visão e matéria'},
    {name: 'provenance', title: 'Proveniência'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({name: 'title', title: 'Título', type: 'string', group: 'intro', validation: (rule) => rule.required()}),
    defineField({name: 'intro', title: 'Introdução', type: 'richText', group: 'intro'}),
    defineField({name: 'heroImage', title: 'Imagem principal', type: 'siteImage', group: 'intro'}),
    defineField({name: 'maisonTitle', title: 'Título', type: 'string', group: 'maison'}),
    defineField({name: 'maisonCopy', title: 'Texto', type: 'richText', group: 'maison'}),
    defineField({name: 'maisonImage', title: 'Imagem', type: 'siteImage', group: 'maison'}),
    defineField({name: 'visionTitle', title: 'Título', type: 'string', group: 'vision'}),
    defineField({name: 'visionCopy', title: 'Texto', type: 'richText', group: 'vision'}),
    defineField({name: 'visionImage', title: 'Imagem', type: 'siteImage', group: 'vision'}),
    defineField({name: 'provenanceTitle', title: 'Título', type: 'string', group: 'provenance'}),
    defineField({name: 'provenanceCopy', title: 'Texto', type: 'richText', group: 'provenance'}),
    defineField({name: 'provenanceImage', title: 'Imagem', type: 'siteImage', group: 'provenance'}),
    defineField({name: 'callToAction', title: 'Chamada para ação', type: 'callToAction', group: 'provenance'}),
    defineField({name: 'seo', title: 'SEO', type: 'seo', group: 'seo'}),
  ],
  preview: {prepare: () => ({title: 'Sobre', subtitle: 'Conteúdo institucional'})},
})

export const contactPage = defineType({
  name: 'contactPage',
  title: 'Contato',
  type: 'document',
  icon: EnvelopeIcon,
  fields: [
    defineField({name: 'title', title: 'Título', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'intro', title: 'Texto de abertura', type: 'richText'}),
    defineField({
      name: 'useOfficialChannels',
      title: 'Usar canais oficiais das Configurações',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'channels',
      title: 'Canais específicos desta página',
      type: 'array',
      hidden: ({document}) => document?.useOfficialChannels !== false,
      of: [defineArrayMember({type: 'contactChannel'})],
    }),
    defineField({name: 'serviceHours', title: 'Horário de atendimento', type: 'text', rows: 3}),
    defineField({name: 'callToAction', title: 'Chamada para ação', type: 'callToAction'}),
    defineField({name: 'image', title: 'Imagem', type: 'siteImage'}),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
  ],
  preview: {prepare: () => ({title: 'Contato', subtitle: 'Canais, atendimento e CTA'})},
})

export const collectionPage = defineType({
  name: 'collectionPage',
  title: 'Coleção',
  type: 'document',
  icon: StackIcon,
  fields: [
    defineField({name: 'title', title: 'Título', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'intro', title: 'Introdução', type: 'richText'}),
    defineField({
      name: 'visibleFilters',
      title: 'Filtros visíveis',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'string',
          options: {
            list: [
              {title: 'Categoria', value: 'category'},
              {title: 'Material', value: 'material'},
              {title: 'Disponibilidade', value: 'availability'},
              {title: 'Preço', value: 'price'},
            ],
          },
        }),
      ],
      validation: (rule) => rule.unique(),
    }),
    defineField({name: 'allLabel', title: 'Rótulo para "todos"', type: 'string', initialValue: 'Todos'}),
    defineField({
      name: 'inquiryLabel',
      title: 'Rótulo para preço sob consulta',
      type: 'string',
      initialValue: 'Sob consulta',
    }),
    defineField({
      name: 'emptyStateTitle',
      title: 'Título quando não houver resultados',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'emptyStateCopy', title: 'Texto quando não houver resultados', type: 'text', rows: 3}),
    defineField({name: 'emptyStateCallToAction', title: 'Ação alternativa', type: 'callToAction'}),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
  ],
  preview: {prepare: () => ({title: 'Coleção', subtitle: 'Introdução, filtros e estado vazio'})},
})

export const navigation = defineType({
  name: 'navigation',
  title: 'Navegação',
  type: 'document',
  icon: MenuIcon,
  fields: [
    defineField({
      name: 'mainLinks',
      title: 'Links principais',
      description: 'A mesma lista atende menu desktop e mobile.',
      type: 'array',
      of: [defineArrayMember({type: 'navigationLink'})],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'categoryLinks',
      title: 'Categorias no submenu',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'category'}]})],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: 'utilityLinks',
      title: 'Links utilitários',
      type: 'array',
      of: [defineArrayMember({type: 'navigationLink'})],
    }),
  ],
  preview: {prepare: () => ({title: 'Navegação', subtitle: 'Menu desktop e mobile'})},
})

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Configurações do site',
  type: 'document',
  icon: CogIcon,
  groups: [
    {name: 'contact', title: 'Contato', default: true},
    {name: 'regional', title: 'Idioma e moeda'},
    {name: 'footer', title: 'Rodapé'},
    {name: 'publishing', title: 'Publicação e preview'},
    {name: 'seo', title: 'SEO padrão'},
  ],
  fields: [
    defineField({
      name: 'whatsapp',
      title: 'WhatsApp oficial',
      description: 'Formato E.164. Exemplo: +5511999990000.',
      type: 'string',
      group: 'contact',
      validation: (rule) =>
        rule.required().regex(/^\+[1-9]\d{7,14}$/, {
          name: 'telefone E.164',
          invert: false,
        }),
    }),
    defineField({
      name: 'email',
      title: 'E-mail oficial',
      type: 'string',
      group: 'contact',
      validation: (rule) => rule.email().required(),
    }),
    defineField({
      name: 'channels',
      title: 'Canais oficiais',
      type: 'array',
      group: 'contact',
      of: [defineArrayMember({type: 'contactChannel'})],
    }),
    defineField({
      name: 'locale',
      title: 'Idioma e região',
      type: 'string',
      group: 'regional',
      readOnly: true,
      initialValue: 'pt-BR',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'currency',
      title: 'Moeda',
      type: 'string',
      group: 'regional',
      readOnly: true,
      initialValue: 'BRL',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'footerStatement', title: 'Texto institucional', type: 'text', rows: 3, group: 'footer'}),
    defineField({name: 'footerLegal', title: 'Texto legal', type: 'string', group: 'footer'}),
    defineField({
      name: 'siteUrl',
      title: 'URL pública',
      type: 'url',
      group: 'publishing',
      validation: (rule) => rule.uri({scheme: ['https']}).required(),
    }),
    defineField({
      name: 'previewUrl',
      title: 'URL de preview / staging',
      type: 'url',
      group: 'publishing',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}).required(),
    }),
    defineField({name: 'defaultSeo', title: 'SEO padrão', type: 'seo', group: 'seo'}),
  ],
  preview: {prepare: () => ({title: 'Configurações do site', subtitle: 'WhatsApp, rodapé, moeda e SEO'})},
})

export const siteDocumentTypes = [
  siteSettings,
  navigation,
  category,
  product,
  homePage,
  aboutPage,
  contactPage,
  collectionPage,
]
