import {defineArrayMember, defineField, defineType} from 'sanity'
import {BlockContentIcon} from '@sanity/icons/BlockContent'
import {ImageIcon} from '@sanity/icons/Image'
import {LinkIcon} from '@sanity/icons/Link'
import {MenuIcon} from '@sanity/icons/Menu'
import {SparklesIcon} from '@sanity/icons/Sparkles'
import {TagIcon} from '@sanity/icons/Tag'

export const richText = defineType({
  name: 'richText',
  title: 'Texto rico',
  type: 'array',
  icon: BlockContentIcon,
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        {title: 'Normal', value: 'normal'},
        {title: 'Título 2', value: 'h2'},
        {title: 'Título 3', value: 'h3'},
        {title: 'Citação', value: 'blockquote'},
      ],
      lists: [
        {title: 'Lista', value: 'bullet'},
        {title: 'Lista numerada', value: 'number'},
      ],
      marks: {
        annotations: [
          {
            name: 'link',
            title: 'Link',
            type: 'object',
            fields: [
              defineField({
                name: 'href',
                title: 'URL',
                type: 'url',
                validation: (rule) =>
                  rule.uri({scheme: ['http', 'https', 'mailto', 'tel']}).required(),
              }),
              defineField({
                name: 'blank',
                title: 'Abrir em nova aba',
                type: 'boolean',
                initialValue: false,
              }),
            ],
          },
        ],
      },
    }),
    defineArrayMember({type: 'siteImage'}),
  ],
})

export const siteImage = defineType({
  name: 'siteImage',
  title: 'Imagem',
  type: 'image',
  icon: ImageIcon,
  options: {hotspot: true},
  fields: [
    defineField({
      name: 'alt',
      title: 'Texto alternativo',
      description: 'Descreva a imagem para pessoas que usam leitores de tela.',
      type: 'string',
      validation: (rule) => rule.required().max(180),
    }),
    defineField({
      name: 'caption',
      title: 'Legenda',
      type: 'string',
    }),
  ],
  preview: {
    select: {title: 'alt', media: 'asset'},
  },
})

export const callToAction = defineType({
  name: 'callToAction',
  title: 'Chamada para ação',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'label',
      title: 'Texto do botão',
      type: 'string',
      validation: (rule) => rule.required().max(50),
    }),
    defineField({
      name: 'destinationType',
      title: 'Destino',
      type: 'string',
      options: {
        list: [
          {title: 'Página do site', value: 'internal'},
          {title: 'Link externo', value: 'external'},
          {title: 'WhatsApp oficial', value: 'whatsapp'},
        ],
        layout: 'radio',
      },
      initialValue: 'internal',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'path',
      title: 'Caminho no site',
      description: 'Exemplo: /colecao',
      type: 'string',
      hidden: ({parent}) => parent?.destinationType !== 'internal',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as {destinationType?: string} | undefined
          if (parent?.destinationType !== 'internal') return true
          if (!value) return 'Informe o caminho.'
          return /^\/(?:[a-z0-9-]+\/?)*$/.test(value) || 'Use um caminho como /colecao.'
        }),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      hidden: ({parent}) => parent?.destinationType !== 'external',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as {destinationType?: string} | undefined
          return parent?.destinationType !== 'external' || Boolean(value) || 'Informe a URL.'
        }),
    }),
  ],
  preview: {
    select: {title: 'label', destinationType: 'destinationType', path: 'path', url: 'url'},
    prepare({title, destinationType, path, url}) {
      const destination =
        destinationType === 'whatsapp' ? 'WhatsApp' : destinationType === 'external' ? url : path
      return {title, subtitle: destination}
    },
  },
})

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  icon: SparklesIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Título para busca',
      type: 'string',
      validation: (rule) => rule.max(60).warning('Tente manter o título em até 60 caracteres.'),
    }),
    defineField({
      name: 'description',
      title: 'Descrição para busca',
      type: 'text',
      rows: 3,
      validation: (rule) =>
        rule.max(160).warning('Tente manter a descrição em até 160 caracteres.'),
    }),
    defineField({
      name: 'socialImage',
      title: 'Imagem social',
      type: 'siteImage',
    }),
    defineField({
      name: 'noIndex',
      title: 'Ocultar dos buscadores',
      type: 'boolean',
      initialValue: false,
    }),
  ],
})

export const contactChannel = defineType({
  name: 'contactChannel',
  title: 'Canal de contato',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'label',
      title: 'Nome',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'kind',
      title: 'Tipo',
      type: 'string',
      options: {
        list: [
          {title: 'Instagram', value: 'instagram'},
          {title: 'E-mail', value: 'email'},
          {title: 'Telefone', value: 'phone'},
          {title: 'WhatsApp', value: 'whatsapp'},
          {title: 'Site externo', value: 'website'},
          {title: 'Outro', value: 'other'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'value',
      title: 'Endereço, usuário ou número',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'Link',
      type: 'url',
      validation: (rule) => rule.uri({scheme: ['http', 'https', 'mailto', 'tel']}),
    }),
    defineField({
      name: 'active',
      title: 'Ativo',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {title: 'label', subtitle: 'value'},
  },
})

export const navigationLink = defineType({
  name: 'navigationLink',
  title: 'Link de navegação',
  type: 'object',
  icon: MenuIcon,
  fields: [
    defineField({
      name: 'label',
      title: 'Nome',
      type: 'string',
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: 'path',
      title: 'Destino',
      description: 'Caminho que funciona em qualquer rota. Exemplo: /sobre',
      type: 'string',
      validation: (rule) =>
        rule
          .required()
          .custom((value) => /^\/(?:[a-z0-9-]+\/?)*$/.test(value || '') || 'Use / ou /nome-da-pagina.'),
    }),
    defineField({
      name: 'active',
      title: 'Ativo',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {title: 'label', subtitle: 'path'},
  },
})

export const heroSlide = defineType({
  name: 'heroSlide',
  title: 'Slide da galeria',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'desktopImage',
      title: 'Imagem desktop',
      type: 'siteImage',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'mobileImage',
      title: 'Imagem mobile',
      type: 'siteImage',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'statement',
      title: 'Frase principal',
      type: 'string',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'callToAction',
      title: 'Chamada para ação',
      type: 'callToAction',
    }),
    defineField({
      name: 'active',
      title: 'Ativo',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {title: 'statement', media: 'desktopImage', active: 'active'},
    prepare({title, media, active}) {
      return {title, subtitle: active ? 'Ativo' : 'Inativo', media}
    },
  },
})

export const matterPanel = defineType({
  name: 'matterPanel',
  title: 'Painel Matter',
  type: 'object',
  icon: SparklesIcon,
  fields: [
    defineField({
      name: 'category',
      title: 'Categoria',
      type: 'reference',
      to: [{type: 'category'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Imagem',
      type: 'siteImage',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'eyebrow', title: 'Sobretítulo', type: 'string'}),
    defineField({
      name: 'headline',
      title: 'Título',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'copy', title: 'Texto', type: 'text', rows: 4}),
    defineField({name: 'callToAction', title: 'Chamada para ação', type: 'callToAction'}),
  ],
  preview: {
    select: {title: 'headline', subtitle: 'category.title', media: 'image'},
  },
})

export const signatureSlide = defineType({
  name: 'signatureSlide',
  title: 'Slide Signature',
  type: 'object',
  icon: SparklesIcon,
  fields: [
    defineField({
      name: 'product',
      title: 'Produto',
      type: 'reference',
      to: [{type: 'product'}],
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'eyebrow', title: 'Sobretítulo', type: 'string'}),
    defineField({name: 'headline', title: 'Título editorial', type: 'string'}),
    defineField({name: 'copy', title: 'Texto editorial', type: 'text', rows: 4}),
  ],
  preview: {
    select: {title: 'product.title', subtitle: 'headline', media: 'product.gallery.0'},
  },
})

export const productMedia = defineType({
  name: 'productMedia',
  title: 'Mídia do produto',
  type: 'image',
  icon: ImageIcon,
  options: {hotspot: true},
  fields: [
    defineField({
      name: 'mediaKey',
      title: 'Chave da mídia',
      description: 'Identificador curto usado para associar fotos a variantes. Exemplo: verde-frente.',
      type: 'string',
      validation: (rule) =>
        rule
          .required()
          .regex(/^[a-z0-9-]+$/, {name: 'chave', invert: false})
          .error('Use letras minúsculas, números e hífens.'),
    }),
    defineField({
      name: 'role',
      title: 'Uso principal',
      type: 'string',
      options: {
        list: [
          {title: 'Capa', value: 'cover'},
          {title: 'Detalhe', value: 'detail'},
          {title: 'Contexto', value: 'context'},
          {title: 'Escala', value: 'scale'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'alt',
      title: 'Texto alternativo',
      type: 'string',
      validation: (rule) => rule.required().max(180),
    }),
  ],
  preview: {
    select: {title: 'alt', subtitle: 'role', media: 'asset'},
  },
})

export const optionValue = defineType({
  name: 'optionValue',
  title: 'Valor da opção',
  type: 'object',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'value',
      title: 'Código',
      description: 'Exemplo: verde-esmeralda',
      type: 'string',
      validation: (rule) =>
        rule.required().regex(/^[a-z0-9-]+$/, {name: 'código', invert: false}),
    }),
    defineField({
      name: 'label',
      title: 'Nome visível',
      description: 'O nome textual é obrigatório inclusive para cores.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'swatch',
      title: 'Amostra de cor',
      type: 'string',
      description: 'Opcional. O nome visível continua sendo obrigatório.',
      validation: (rule) =>
        rule.regex(/^#[0-9a-fA-F]{6}$/, {
          name: 'cor hexadecimal',
          invert: false,
        }),
    }),
  ],
  preview: {
    select: {title: 'label', subtitle: 'value'},
  },
})

export const optionDefinition = defineType({
  name: 'optionDefinition',
  title: 'Opção',
  type: 'object',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'code',
      title: 'Código',
      description: 'Exemplo: tamanho, cor ou kit',
      type: 'string',
      validation: (rule) =>
        rule.required().regex(/^[a-z0-9-]+$/, {name: 'código', invert: false}),
    }),
    defineField({
      name: 'label',
      title: 'Nome',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'values',
      title: 'Valores disponíveis',
      type: 'array',
      of: [defineArrayMember({type: 'optionValue'})],
      validation: (rule) =>
        rule
          .required()
          .min(1)
          .custom((values) => {
            const codes = ((values || []) as {value?: string}[])
              .map((item) => item.value)
              .filter(Boolean)
            return new Set(codes).size === codes.length || 'Não repita o mesmo valor nesta opção.'
          }),
    }),
  ],
  preview: {
    select: {title: 'label', values: 'values'},
    prepare({title, values}) {
      return {title, subtitle: `${values?.length || 0} valores`}
    },
  },
})

export const variantSelection = defineType({
  name: 'variantSelection',
  title: 'Seleção',
  type: 'object',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'option',
      title: 'Código da opção',
      description: 'Exemplo: tamanho',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'value',
      title: 'Código do valor',
      description: 'Exemplo: m',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {option: 'option', value: 'value'},
    prepare({option, value}) {
      return {title: `${option}: ${value}`}
    },
  },
})

export const productVariant = defineType({
  name: 'productVariant',
  title: 'Variante',
  type: 'object',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'sku',
      title: 'Código da variante',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'selection',
      title: 'Combinação',
      type: 'array',
      of: [defineArrayMember({type: 'variantSelection'})],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'priceMode',
      title: 'Preço',
      type: 'string',
      options: {
        list: [
          {title: 'Herdar do produto', value: 'inherit'},
          {title: 'Preço próprio', value: 'fixed'},
          {title: 'Sob consulta', value: 'inquiry'},
        ],
        layout: 'radio',
      },
      initialValue: 'inherit',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'priceCents',
      title: 'Preço em centavos',
      description: 'Exemplo: R$ 14.900,00 = 1490000.',
      type: 'number',
      hidden: ({parent}) => parent?.priceMode !== 'fixed',
      validation: (rule) =>
        rule.integer().min(0).custom((value, context) => {
          const parent = context.parent as {priceMode?: string} | undefined
          return parent?.priceMode !== 'fixed' || value !== undefined || 'Informe o preço.'
        }),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Ativa', value: 'enabled'},
          {title: 'Desabilitada', value: 'disabled'},
        ],
        layout: 'radio',
      },
      initialValue: 'enabled',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'mediaKeys',
      title: 'Fotos priorizadas',
      description: 'Use as chaves cadastradas na galeria do produto.',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.unique(),
    }),
  ],
  preview: {
    select: {sku: 'sku', selection: 'selection', status: 'status'},
    prepare({sku, selection, status}) {
      const combination = (selection || [])
        .map((item: {option?: string; value?: string}) => `${item.option}: ${item.value}`)
        .join(' · ')
      return {title: combination || sku, subtitle: `${sku} · ${status === 'disabled' ? 'Desabilitada' : 'Ativa'}`}
    },
  },
})

export const productAttribute = defineType({
  name: 'productAttribute',
  title: 'Atributo',
  type: 'object',
  icon: TagIcon,
  fields: [
    defineField({name: 'label', title: 'Nome', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'value', title: 'Valor', type: 'string', validation: (rule) => rule.required()}),
  ],
  preview: {
    select: {title: 'label', subtitle: 'value'},
  },
})

export const siteObjectTypes = [
  richText,
  siteImage,
  callToAction,
  seo,
  contactChannel,
  navigationLink,
  heroSlide,
  matterPanel,
  signatureSlide,
  productMedia,
  optionValue,
  optionDefinition,
  variantSelection,
  productVariant,
  productAttribute,
]
