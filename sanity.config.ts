import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {CaseIcon} from '@sanity/icons/Case'
import {DiamondIcon} from '@sanity/icons/Diamond'
import {businessSchemaTypes, siteSchemaTypes} from './schemaTypes'
import {businessDashboardTool} from './dashboard/businessDashboardTool'
import {businessStructure} from './structure/businessStructure'
import {SITE_SINGLETON_TYPES, siteStructure} from './structure/siteStructure'

const projectId = 'u60dwmhb'

export default defineConfig([
  {
    name: 'site',
    title: 'ESMÉRA / Site',
    icon: DiamondIcon,
    basePath: '/site',
    projectId,
    dataset: 'production',
    plugins: [
      structureTool({
        name: 'content',
        title: 'Conteúdo',
        structure: siteStructure,
      }),
    ],
    schema: {
      types: siteSchemaTypes,
    },
    document: {
      newDocumentOptions: (previous) =>
        previous.filter((template) => !SITE_SINGLETON_TYPES.includes(template.templateId)),
      actions: (previous, context) =>
        SITE_SINGLETON_TYPES.includes(context.schemaType)
          ? previous.filter((action) => !['delete', 'duplicate'].includes(action.action || ''))
          : previous,
    },
  },
  {
    name: 'business',
    title: 'ESMÉRA / Business Desk',
    icon: CaseIcon,
    basePath: '/business',
    projectId,
    dataset: 'business',
    plugins: [
      businessDashboardTool(),
      structureTool({
        name: 'business',
        title: 'Business Desk',
        structure: businessStructure,
      }),
    ],
    schema: {
      types: businessSchemaTypes,
    },
  },
])
