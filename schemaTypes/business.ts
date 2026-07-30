import {defineArrayMember, defineField, defineType, type Rule} from 'sanity'
import {ActivityIcon} from '@sanity/icons/Activity'
import {BillIcon} from '@sanity/icons/Bill'
import {HeartIcon} from '@sanity/icons/Heart'
import {PackageIcon} from '@sanity/icons/Package'
import {TaskIcon} from '@sanity/icons/Task'
import {UserIcon} from '@sanity/icons/User'
import {UsersIcon} from '@sanity/icons/Users'

const API_VERSION = '2026-07-30'

const productReference = {
  type: 'crossDatasetReference' as const,
  dataset: 'production',
  to: [
    {
      type: 'product',
      title: 'Produto',
      icon: PackageIcon,
      preview: {
        select: {
          title: 'title',
          subtitle: 'code',
          media: 'gallery.0',
        },
      },
    },
  ],
}

export const saleItem = defineType({
  name: 'saleItem',
  title: 'Item da venda',
  type: 'object',
  icon: PackageIcon,
  fields: [
    defineField({
      name: 'product',
      title: 'Produto do catálogo',
      ...productReference,
      validation: (rule: Rule) => rule.required(),
    }),
    defineField({
      name: 'variantSku',
      title: 'Código da variante',
      description: 'Use o código da variante escolhida no momento da venda.',
      type: 'string',
    }),
    defineField({
      name: 'snapshotTitle',
      title: 'Nome no momento da venda',
      description: 'Snapshot obrigatório para preservar o histórico.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'snapshotSlug',
      title: 'Slug no momento da venda',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'snapshotSelection',
      title: 'Seleção no momento da venda',
      description: 'Exemplo: M · Verde Esmeralda · Kit 2.',
      type: 'string',
    }),
    defineField({
      name: 'priceMode',
      title: 'Modo de preço',
      type: 'string',
      options: {
        list: [
          {title: 'Preço fixo', value: 'fixed'},
          {title: 'Sob consulta', value: 'inquiry'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'unitPriceCents',
      title: 'Valor unitário em centavos',
      type: 'number',
      hidden: ({parent}) => parent?.priceMode !== 'fixed',
      validation: (rule) =>
        rule.integer().min(0).custom((value, context) => {
          const parent = context.parent as {priceMode?: string} | undefined
          return parent?.priceMode !== 'fixed' || value !== undefined || 'Informe o valor unitário.'
        }),
    }),
    defineField({
      name: 'quantity',
      title: 'Quantidade',
      type: 'number',
      initialValue: 1,
      validation: (rule) => rule.required().integer().min(1),
    }),
  ],
  preview: {
    select: {
      title: 'snapshotTitle',
      selection: 'snapshotSelection',
      quantity: 'quantity',
      priceMode: 'priceMode',
      unitPriceCents: 'unitPriceCents',
    },
    prepare({title, selection, quantity, priceMode, unitPriceCents}) {
      const price =
        priceMode === 'inquiry'
          ? 'Sob consulta'
          : typeof unitPriceCents === 'number'
            ? (unitPriceCents / 100).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})
            : 'Sem preço'
      return {title: `${quantity || 1}x ${title}`, subtitle: [selection, price].filter(Boolean).join(' · ')}
    },
  },
})

export const followUp = defineType({
  name: 'followUp',
  title: 'Follow-up',
  type: 'object',
  icon: HeartIcon,
  fields: [
    defineField({
      name: 'moment',
      title: 'Momento',
      type: 'string',
      options: {
        list: [
          {title: 'D+3', value: 'd3'},
          {title: 'D+15', value: 'd15'},
          {title: 'D+90', value: 'd90'},
          {title: 'Personalizado', value: 'custom'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'dueAt',
      title: 'Prazo',
      type: 'datetime',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'purpose',
      title: 'Objetivo',
      type: 'string',
      options: {
        list: [
          {title: 'Confirmar recebimento', value: 'receipt'},
          {title: 'Medir satisfação', value: 'satisfaction'},
          {title: 'Pedir foto ou depoimento', value: 'testimonial'},
          {title: 'Manutenção preventiva', value: 'maintenance'},
          {title: 'Nova curadoria', value: 'curation'},
          {title: 'Outro', value: 'other'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Pendente', value: 'pending'},
          {title: 'Concluído', value: 'done'},
          {title: 'Cancelado', value: 'cancelled'},
        ],
        layout: 'radio',
      },
      initialValue: 'pending',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'notes', title: 'Observações', type: 'text', rows: 3}),
    defineField({name: 'completedAt', title: 'Concluído em', type: 'datetime'}),
  ],
  preview: {
    select: {title: 'purpose', dueAt: 'dueAt', status: 'status'},
    prepare({title, dueAt, status}) {
      return {
        title,
        subtitle: [dueAt ? new Date(dueAt).toLocaleDateString('pt-BR') : undefined, status].filter(Boolean).join(' · '),
      }
    },
  },
})

export const lead = defineType({
  name: 'lead',
  title: 'Lead',
  type: 'document',
  icon: UserIcon,
  groups: [
    {name: 'contact', title: 'Contato', default: true},
    {name: 'pipeline', title: 'Pipeline'},
    {name: 'interest', title: 'Interesse'},
    {name: 'privacy', title: 'Privacidade'},
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Nome',
      type: 'string',
      group: 'contact',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'phone',
      title: 'Telefone',
      description: 'Preferencialmente em formato E.164.',
      type: 'string',
      group: 'contact',
      validation: (rule) =>
        rule.custom((value, context) => {
          const document = context.document as {email?: string}
          if (!value && !document.email) return 'Informe telefone ou e-mail.'
          if (value && !/^\+[1-9]\d{7,14}$/.test(value)) return 'Use o formato E.164, como +5511999990000.'
          return true
        }),
    }),
    defineField({
      name: 'email',
      title: 'E-mail',
      type: 'string',
      group: 'contact',
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: 'source',
      title: 'Origem',
      type: 'string',
      group: 'pipeline',
      options: {
        list: [
          {title: 'Instagram', value: 'instagram'},
          {title: 'Indicação', value: 'referral'},
          {title: 'Site', value: 'site'},
          {title: 'Arquiteto', value: 'architect'},
          {title: 'Orgânico', value: 'organic'},
          {title: 'WhatsApp', value: 'whatsapp'},
          {title: 'Outro', value: 'other'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'stage',
      title: 'Etapa',
      type: 'string',
      group: 'pipeline',
      options: {
        list: [
          {title: 'Novo', value: 'new'},
          {title: 'Curadoria', value: 'curation'},
          {title: 'Proposta', value: 'proposal'},
          {title: 'Negociação', value: 'negotiation'},
          {title: 'Ganho', value: 'won'},
          {title: 'Perdido', value: 'lost'},
        ],
        layout: 'radio',
      },
      initialValue: 'new',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'owner', title: 'Responsável', type: 'string', group: 'pipeline'}),
    defineField({name: 'nextAction', title: 'Próxima ação', type: 'string', group: 'pipeline'}),
    defineField({name: 'nextActionAt', title: 'Prazo da próxima ação', type: 'datetime', group: 'pipeline'}),
    defineField({
      name: 'lossReason',
      title: 'Motivo da perda',
      type: 'string',
      group: 'pipeline',
      hidden: ({document}) => document?.stage !== 'lost',
    }),
    defineField({
      name: 'interestCategories',
      title: 'Categorias de interesse',
      type: 'array',
      group: 'interest',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: 'interestedProducts',
      title: 'Produtos de interesse',
      type: 'array',
      group: 'interest',
      of: [defineArrayMember(productReference)],
    }),
    defineField({name: 'notes', title: 'Notas', type: 'text', rows: 5, group: 'interest'}),
    defineField({
      name: 'customer',
      title: 'Cliente qualificado',
      type: 'reference',
      group: 'pipeline',
      to: [{type: 'customer'}],
      hidden: ({document}) => document?.stage !== 'won',
    }),
    defineField({
      name: 'marketingConsent',
      title: 'Consentimento para comunicações',
      type: 'boolean',
      group: 'privacy',
      initialValue: false,
    }),
    defineField({
      name: 'consentRecordedAt',
      title: 'Consentimento registrado em',
      type: 'datetime',
      group: 'privacy',
      hidden: ({document}) => document?.marketingConsent !== true,
    }),
  ],
  orderings: [
    {title: 'Próxima ação', name: 'nextActionAsc', by: [{field: 'nextActionAt', direction: 'asc'}]},
    {title: 'Mais recentes', name: 'createdDesc', by: [{field: '_createdAt', direction: 'desc'}]},
  ],
  preview: {
    select: {title: 'name', stage: 'stage', source: 'source', interest: 'interestCategories.0'},
    prepare({title, stage, source, interest}) {
      return {title, subtitle: [stage, interest, source].filter(Boolean).join(' · ')}
    },
  },
})

export const customer = defineType({
  name: 'customer',
  title: 'Cliente',
  type: 'document',
  icon: UsersIcon,
  groups: [
    {name: 'contact', title: 'Contato', default: true},
    {name: 'relationship', title: 'Relacionamento'},
    {name: 'privacy', title: 'Privacidade'},
  ],
  fields: [
    defineField({name: 'name', title: 'Nome', type: 'string', group: 'contact', validation: (rule) => rule.required()}),
    defineField({
      name: 'phone',
      title: 'Telefone',
      type: 'string',
      group: 'contact',
      validation: (rule) =>
        rule.custom((value, context) => {
          const document = context.document as {email?: string}
          if (!value && !document.email) return 'Informe telefone ou e-mail.'
          if (value && !/^\+[1-9]\d{7,14}$/.test(value)) return 'Use o formato E.164.'
          return true
        }),
    }),
    defineField({name: 'email', title: 'E-mail', type: 'string', group: 'contact', validation: (rule) => rule.email()}),
    defineField({name: 'city', title: 'Cidade', type: 'string', group: 'contact'}),
    defineField({name: 'state', title: 'Estado', type: 'string', group: 'contact'}),
    defineField({
      name: 'sourceLead',
      title: 'Lead de origem',
      type: 'reference',
      group: 'relationship',
      to: [{type: 'lead'}],
    }),
    defineField({
      name: 'preferences',
      title: 'Preferências',
      type: 'array',
      group: 'relationship',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      group: 'relationship',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.unique(),
    }),
    defineField({name: 'relationshipNotes', title: 'Notas do relacionamento', type: 'text', rows: 6, group: 'relationship'}),
    defineField({
      name: 'marketingConsent',
      title: 'Consentimento para comunicações',
      type: 'boolean',
      group: 'privacy',
      initialValue: false,
    }),
    defineField({
      name: 'consentRecordedAt',
      title: 'Consentimento registrado em',
      type: 'datetime',
      group: 'privacy',
      hidden: ({document}) => document?.marketingConsent !== true,
    }),
    defineField({
      name: 'dataHandlingNotes',
      title: 'Observações de privacidade',
      type: 'text',
      rows: 3,
      group: 'privacy',
    }),
  ],
  preview: {
    select: {title: 'name', phone: 'phone', email: 'email', tags: 'tags'},
    prepare({title, phone, email, tags}) {
      return {title, subtitle: [phone || email, ...(tags || []).slice(0, 2)].filter(Boolean).join(' · ')}
    },
  },
})

async function uniqueSaleNumber(
  value: string | undefined,
  context: {
    document?: {_id?: string}
    getClient: (options: {apiVersion: string}) => {
      fetch: (query: string, params: Record<string, unknown>) => Promise<number>
    }
  },
) {
  if (!value) return true
  const publishedId = context.document?._id?.replace(/^drafts\./, '')
  const count = await context.getClient({apiVersion: API_VERSION}).fetch(
    `count(*[_type == "sale" && number == $value && !(_id in [$publishedId, "drafts." + $publishedId])])`,
    {value, publishedId},
  )
  return count === 0 || 'Este número de venda já existe.'
}

export const sale = defineType({
  name: 'sale',
  title: 'Venda',
  type: 'document',
  icon: BillIcon,
  groups: [
    {name: 'sale', title: 'Venda', default: true},
    {name: 'items', title: 'Itens e valores'},
    {name: 'delivery', title: 'Entrega'},
  ],
  fields: [
    defineField({
      name: 'number',
      title: 'Número',
      description: 'Exemplo: 024.',
      type: 'string',
      group: 'sale',
      validation: (rule) => rule.required().custom(uniqueSaleNumber),
    }),
    defineField({
      name: 'customer',
      title: 'Cliente',
      type: 'reference',
      group: 'sale',
      to: [{type: 'customer'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'channel',
      title: 'Canal',
      type: 'string',
      group: 'sale',
      options: {
        list: [
          {title: 'WhatsApp', value: 'whatsapp'},
          {title: 'Instagram', value: 'instagram'},
          {title: 'Site', value: 'site'},
          {title: 'Indicação', value: 'referral'},
          {title: 'Arquiteto', value: 'architect'},
          {title: 'Outro', value: 'other'},
        ],
      },
      initialValue: 'whatsapp',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'sale',
      options: {
        list: [
          {title: 'Rascunho', value: 'draft'},
          {title: 'Proposta enviada', value: 'proposal'},
          {title: 'Negociação', value: 'negotiation'},
          {title: 'Confirmada', value: 'confirmed'},
          {title: 'Em produção', value: 'production'},
          {title: 'Pronta para entrega', value: 'ready'},
          {title: 'Entregue', value: 'delivered'},
          {title: 'Cancelada', value: 'cancelled'},
        ],
        layout: 'dropdown',
      },
      initialValue: 'draft',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'owner', title: 'Responsável', type: 'string', group: 'sale'}),
    defineField({name: 'nextAction', title: 'Próxima ação', type: 'string', group: 'sale'}),
    defineField({name: 'nextActionAt', title: 'Prazo da próxima ação', type: 'datetime', group: 'sale'}),
    defineField({
      name: 'items',
      title: 'Itens',
      type: 'array',
      group: 'items',
      of: [defineArrayMember({type: 'saleItem'})],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'discountCents',
      title: 'Desconto em centavos',
      type: 'number',
      group: 'items',
      initialValue: 0,
      validation: (rule) => rule.integer().min(0),
    }),
    defineField({
      name: 'shippingCents',
      title: 'Frete em centavos',
      type: 'number',
      group: 'items',
      initialValue: 0,
      validation: (rule) => rule.integer().min(0),
    }),
    defineField({
      name: 'totalCents',
      title: 'Total fechado em centavos',
      description: 'Snapshot financeiro final da venda.',
      type: 'number',
      group: 'items',
      validation: (rule) => rule.integer().min(0),
    }),
    defineField({name: 'expectedDeliveryAt', title: 'Entrega prevista', type: 'datetime', group: 'delivery'}),
    defineField({name: 'deliveredAt', title: 'Entrega realizada', type: 'datetime', group: 'delivery'}),
    defineField({
      name: 'deliveryMode',
      title: 'Forma de entrega',
      type: 'string',
      group: 'delivery',
      options: {
        list: [
          {title: 'Transportadora', value: 'carrier'},
          {title: 'Retirada', value: 'pickup'},
          {title: 'Entrega própria', value: 'own_delivery'},
        ],
      },
    }),
    defineField({name: 'deliveryNotes', title: 'Observações da entrega', type: 'text', rows: 4, group: 'delivery'}),
  ],
  orderings: [
    {title: 'Mais recentes', name: 'createdDesc', by: [{field: '_createdAt', direction: 'desc'}]},
    {title: 'Próxima ação', name: 'nextActionAsc', by: [{field: 'nextActionAt', direction: 'asc'}]},
  ],
  preview: {
    select: {number: 'number', customer: 'customer.name', status: 'status', total: 'totalCents'},
    prepare({number, customer, status, total}) {
      const price =
        typeof total === 'number'
          ? (total / 100).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})
          : undefined
      return {title: `Venda #${number} · ${customer || 'Sem cliente'}`, subtitle: [status, price].filter(Boolean).join(' · ')}
    },
  },
})

export const afterSale = defineType({
  name: 'afterSale',
  title: 'Pós-venda',
  type: 'document',
  icon: HeartIcon,
  groups: [
    {name: 'case', title: 'Acompanhamento', default: true},
    {name: 'delivery', title: 'Entrega'},
    {name: 'followups', title: 'Follow-ups'},
    {name: 'incident', title: 'Ocorrência'},
  ],
  fields: [
    defineField({
      name: 'sale',
      title: 'Venda',
      type: 'reference',
      group: 'case',
      to: [{type: 'sale'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'customer',
      title: 'Cliente',
      type: 'reference',
      group: 'case',
      to: [{type: 'customer'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'case',
      options: {
        list: [
          {title: 'Aberto', value: 'open'},
          {title: 'Acompanhando', value: 'following'},
          {title: 'Resolvido', value: 'resolved'},
          {title: 'Encerrado', value: 'closed'},
        ],
        layout: 'radio',
      },
      initialValue: 'open',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'priority',
      title: 'Prioridade',
      type: 'string',
      group: 'case',
      options: {
        list: [
          {title: 'Baixa', value: 'low'},
          {title: 'Normal', value: 'normal'},
          {title: 'Alta', value: 'high'},
          {title: 'Urgente', value: 'urgent'},
        ],
        layout: 'radio',
      },
      initialValue: 'normal',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'owner', title: 'Responsável', type: 'string', group: 'case'}),
    defineField({name: 'expectedDeliveryAt', title: 'Entrega prevista', type: 'datetime', group: 'delivery'}),
    defineField({name: 'deliveredAt', title: 'Entrega realizada', type: 'datetime', group: 'delivery'}),
    defineField({name: 'deliveryNotes', title: 'Observações da entrega', type: 'text', rows: 3, group: 'delivery'}),
    defineField({
      name: 'followUps',
      title: 'Follow-ups',
      type: 'array',
      group: 'followups',
      of: [defineArrayMember({type: 'followUp'})],
    }),
    defineField({
      name: 'incidentType',
      title: 'Tipo de ocorrência',
      type: 'string',
      group: 'incident',
      options: {
        list: [
          {title: 'Sem ocorrência', value: 'none'},
          {title: 'Avaria', value: 'damage'},
          {title: 'Ajuste', value: 'adjustment'},
          {title: 'Manutenção', value: 'maintenance'},
          {title: 'Outro', value: 'other'},
        ],
        layout: 'radio',
      },
      initialValue: 'none',
    }),
    defineField({
      name: 'incidentDetails',
      title: 'Descrição da ocorrência',
      type: 'text',
      rows: 4,
      group: 'incident',
      hidden: ({document}) => !document?.incidentType || document.incidentType === 'none',
    }),
    defineField({
      name: 'resolution',
      title: 'Resolução',
      type: 'text',
      rows: 4,
      group: 'incident',
      hidden: ({document}) => !document?.incidentType || document.incidentType === 'none',
    }),
  ],
  orderings: [
    {title: 'Prioridade e prazo', name: 'priority', by: [{field: 'priority', direction: 'desc'}, {field: '_updatedAt', direction: 'desc'}]},
  ],
  preview: {
    select: {customer: 'customer.name', sale: 'sale.number', status: 'status', priority: 'priority'},
    prepare({customer, sale, status, priority}) {
      return {title: `${customer || 'Cliente'} · Venda #${sale || '—'}`, subtitle: [priority, status].join(' · ')}
    },
  },
})

export const task = defineType({
  name: 'task',
  title: 'Tarefa',
  type: 'document',
  icon: TaskIcon,
  fields: [
    defineField({name: 'title', title: 'Tarefa', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Pendente', value: 'pending'},
          {title: 'Em andamento', value: 'in_progress'},
          {title: 'Concluída', value: 'done'},
          {title: 'Cancelada', value: 'cancelled'},
        ],
        layout: 'radio',
      },
      initialValue: 'pending',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'priority',
      title: 'Prioridade',
      type: 'string',
      options: {
        list: [
          {title: 'Baixa', value: 'low'},
          {title: 'Normal', value: 'normal'},
          {title: 'Alta', value: 'high'},
          {title: 'Urgente', value: 'urgent'},
        ],
        layout: 'radio',
      },
      initialValue: 'normal',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'dueAt', title: 'Prazo', type: 'datetime', validation: (rule) => rule.required()}),
    defineField({name: 'assignee', title: 'Responsável', type: 'string'}),
    defineField({
      name: 'relatedTo',
      title: 'Vínculos',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'lead'}, {type: 'customer'}, {type: 'sale'}, {type: 'afterSale'}],
        }),
      ],
      validation: (rule) => rule.unique(),
    }),
    defineField({name: 'notes', title: 'Observações', type: 'text', rows: 4}),
    defineField({name: 'completedAt', title: 'Concluída em', type: 'datetime'}),
  ],
  orderings: [
    {title: 'Prazo', name: 'dueAsc', by: [{field: 'dueAt', direction: 'asc'}]},
    {title: 'Prioridade', name: 'priorityDesc', by: [{field: 'priority', direction: 'desc'}]},
  ],
  preview: {
    select: {title: 'title', dueAt: 'dueAt', priority: 'priority', status: 'status'},
    prepare({title, dueAt, priority, status}) {
      return {
        title,
        subtitle: [priority, dueAt ? new Date(dueAt).toLocaleDateString('pt-BR') : undefined, status]
          .filter(Boolean)
          .join(' · '),
      }
    },
  },
})

export const activity = defineType({
  name: 'activity',
  title: 'Atividade',
  type: 'document',
  icon: ActivityIcon,
  fields: [
    defineField({
      name: 'kind',
      title: 'Tipo',
      type: 'string',
      options: {
        list: [
          {title: 'Contato', value: 'contact'},
          {title: 'Mensagem', value: 'message'},
          {title: 'Proposta', value: 'proposal'},
          {title: 'Mudança de etapa', value: 'stage_change'},
          {title: 'Nota', value: 'note'},
          {title: 'Entrega', value: 'delivery'},
          {title: 'Follow-up', value: 'follow_up'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'occurredAt', title: 'Data e hora', type: 'datetime', validation: (rule) => rule.required()}),
    defineField({name: 'summary', title: 'Resumo', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'details', title: 'Detalhes', type: 'text', rows: 5}),
    defineField({name: 'owner', title: 'Responsável', type: 'string'}),
    defineField({
      name: 'relatedTo',
      title: 'Vínculos',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'lead'}, {type: 'customer'}, {type: 'sale'}, {type: 'afterSale'}, {type: 'task'}],
        }),
      ],
      validation: (rule) => rule.required().min(1).unique(),
    }),
  ],
  orderings: [
    {title: 'Mais recentes', name: 'occurredDesc', by: [{field: 'occurredAt', direction: 'desc'}]},
  ],
  preview: {
    select: {title: 'summary', subtitle: 'kind', occurredAt: 'occurredAt'},
    prepare({title, subtitle, occurredAt}) {
      return {
        title,
        subtitle: [occurredAt ? new Date(occurredAt).toLocaleString('pt-BR') : undefined, subtitle]
          .filter(Boolean)
          .join(' · '),
      }
    },
  },
})

export const businessSchemaTypes = [
  saleItem,
  followUp,
  lead,
  customer,
  sale,
  afterSale,
  task,
  activity,
]
