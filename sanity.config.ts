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
    plugins: [
      structureTool({
        name: 'cms',
        title: 'CMS',
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
    plugins: [
      structureTool({
        name: 'cms',
        title: 'CMS',
        structure: businessStructure,
      }),
    ],
    schema: {
      types: businessSchemaTypes,
    },
  },
])
