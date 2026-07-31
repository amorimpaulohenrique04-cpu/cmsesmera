import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {CaseIcon} from '@sanity/icons/Case'
import {DiamondIcon} from '@sanity/icons/Diamond'
import {businessSchemaTypes, siteSchemaTypes} from './schemaTypes'
import {businessStructure} from './structure/businessStructure'
import {SITE_SINGLETON_TYPES, siteStructure} from './structure/siteStructure'
import {EsmeraActiveToolLayout} from './studio/EsmeraActiveToolLayout'
import {EsmeraNavbar} from './studio/EsmeraNavbar'
import {EsmeraStudioLayout} from './studio/EsmeraStudioLayout'
import {BusinessCmsTool, cmsToolRouter, SiteCmsTool} from './studio/cms/CmsTool'
import {esmeraTheme} from './studio/esmeraTheme'

const env = (import.meta as ImportMeta & {env?: Record<string, string | undefined>}).env || {}
const projectId = env.SANITY_STUDIO_PROJECT_ID || 'u60dwmhb'
const siteDataset = env.SANITY_STUDIO_SITE_DATASET || 'production'
const businessDataset = env.SANITY_STUDIO_BUSINESS_DATASET || 'business'

export default defineConfig([
  {
    name: 'site',
    title: 'ESMÉRA / Site',
    icon: DiamondIcon,
    basePath: '/site',
    projectId,
    dataset: siteDataset,
    theme: esmeraTheme,
    studio: {
      components: {
        activeToolLayout: EsmeraActiveToolLayout,
        layout: EsmeraStudioLayout,
        navbar: EsmeraNavbar,
      },
    },
    tools: [
      {
        name: 'cms',
        title: 'Portal operacional',
        icon: DiamondIcon,
        component: SiteCmsTool,
        router: cmsToolRouter,
      },
    ],
    plugins: [
      structureTool({
        name: 'documents',
        title: 'Admin técnico',
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
    dataset: businessDataset,
    theme: esmeraTheme,
    studio: {
      components: {
        activeToolLayout: EsmeraActiveToolLayout,
        layout: EsmeraStudioLayout,
        navbar: EsmeraNavbar,
      },
    },
    tools: [
      {
        name: 'cms',
        title: 'Portal operacional',
        icon: CaseIcon,
        component: BusinessCmsTool,
        router: cmsToolRouter,
      },
    ],
    plugins: [
      structureTool({
        name: 'documents',
        title: 'Admin técnico',
        structure: businessStructure,
      }),
    ],
    schema: {
      types: businessSchemaTypes,
    },
  },
])
