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

const projectId = 'u60dwmhb'

export default defineConfig([
  {
    name: 'site',
    title: 'ESMÉRA / Site',
    icon: DiamondIcon,
    basePath: '/site',
    projectId,
    dataset: 'production',
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
        title: 'CMS',
        icon: DiamondIcon,
        component: SiteCmsTool,
        router: cmsToolRouter,
      },
    ],
    plugins: [
      structureTool({
        name: 'documents',
        title: 'Documentos',
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
        title: 'CMS',
        icon: CaseIcon,
        component: BusinessCmsTool,
        router: cmsToolRouter,
      },
    ],
    plugins: [
      structureTool({
        name: 'documents',
        title: 'Documentos',
        structure: businessStructure,
      }),
    ],
    schema: {
      types: businessSchemaTypes,
    },
  },
])
