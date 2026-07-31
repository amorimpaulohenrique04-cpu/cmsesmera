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
import {
  SiteCategoriesPage,
  SiteContentPage,
  SiteDashboardPage,
  SiteProductsPage,
  SiteSettingsPage,
} from '../dashboard/stitch/SitePages'

export const SITE_SINGLETON_TYPES = ['homePage','aboutPage','contactPage','collectionPage','navigation','siteSettings']

function singleton(S:StructureBuilder,typeName:string,documentId:string,title:string,icon:ComponentType){
  return S.listItem().id(typeName).title(title).icon(icon).child(S.document().schemaType(typeName).documentId(documentId).title(title))
}

export const siteStructure: StructureResolver = (S) =>
  S.list().title('ESMÉRA').items([
    S.listItem().id('dashboard').title('Dashboard').icon(DashboardIcon).child(S.component(SiteDashboardPage).title('Dashboard')),
    S.listItem().id('content').title('Conteúdo do site').icon(DocumentIcon).child(S.component(SiteContentPage).title('Conteúdo do site')),
    S.listItem().id('products').title('Produtos').icon(PackageIcon).child(S.component(SiteProductsPage).title('Produtos')),
    S.listItem().id('categories').title('Categorias').icon(TagIcon).child(S.component(SiteCategoriesPage).title('Categorias')),
    S.listItem().id('settings').title('Configurações').icon(CogIcon).child(S.component(SiteSettingsPage).title('Configurações')),
    S.divider(),
    S.listItem().id('documents').title('Documentos').icon(StackIcon).child(
      S.list().title('Documentos').items([
        S.documentTypeListItem('product').title('Produtos').icon(PackageIcon),
        S.documentTypeListItem('category').title('Categorias').icon(TagIcon),
        singleton(S,'homePage','homePage','Home',HomeIcon),
        singleton(S,'aboutPage','aboutPage','Sobre',DocumentIcon),
        singleton(S,'contactPage','contactPage','Contato',EnvelopeIcon),
        singleton(S,'collectionPage','collectionPage','Coleção',StackIcon),
        singleton(S,'navigation','navigation','Navegação',MenuIcon),
        singleton(S,'siteSettings','siteSettings','SiteSettings',CogIcon),
      ])
    ),
  ])
