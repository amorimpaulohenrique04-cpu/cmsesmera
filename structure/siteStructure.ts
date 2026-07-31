import type {ComponentType} from 'react'
import type {StructureBuilder, StructureResolver} from 'sanity/structure'
import {CogIcon} from '@sanity/icons/Cog'
import {DashboardIcon} from '@sanity/icons/Dashboard'
import {DocumentIcon} from '@sanity/icons/Document'
import {EnvelopeIcon} from '@sanity/icons/Envelope'
import {HomeIcon} from '@sanity/icons/Home'
import {MenuIcon} from '@sanity/icons/Menu'
import {PackageIcon} from '@sanity/icons/Package'
import {StackIcon} from '@sanity/icons/Stack'
import {TagIcon} from '@sanity/icons/Tag'
import {SiteDashboard} from '../dashboard/site/SiteDashboard'

export const SITE_SINGLETON_TYPES = [
  'homePage',
  'aboutPage',
  'contactPage',
  'collectionPage',
  'navigation',
  'siteSettings',
]

function singleton(
  S: StructureBuilder,
  typeName: string,
  documentId: string,
  title: string,
  icon: ComponentType,
) {
  return S.listItem()
    .id(typeName)
    .title(title)
    .icon(icon)
    .child(S.document().schemaType(typeName).documentId(documentId).title(title))
}

export const siteStructure: StructureResolver = (S) =>
  S.list()
    .title('ESMÉRA')
    .items([
      S.listItem()
        .id('dashboard')
        .title('Visão geral')
        .icon(DashboardIcon)
        .child(S.component(SiteDashboard).title('Visão geral')),
      S.divider(),
      S.documentTypeListItem('product').title('Produtos').icon(PackageIcon),
      S.documentTypeListItem('category').title('Categorias').icon(TagIcon),
      S.listItem()
        .id('pages')
        .title('Páginas')
        .icon(DocumentIcon)
        .child(
          S.list()
            .title('Páginas')
            .items([
              singleton(S, 'homePage', 'homePage', 'Home', HomeIcon),
              singleton(S, 'aboutPage', 'aboutPage', 'Sobre', DocumentIcon),
              singleton(S, 'contactPage', 'contactPage', 'Contato', EnvelopeIcon),
              singleton(S, 'collectionPage', 'collectionPage', 'Coleção', StackIcon),
              singleton(S, 'navigation', 'navigation', 'Navegação', MenuIcon),
            ]),
        ),
      S.divider(),
      singleton(S, 'siteSettings', 'siteSettings', 'Configurações', CogIcon),
    ])
