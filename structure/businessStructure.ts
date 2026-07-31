import type {StructureResolver} from 'sanity/structure'
import {BillIcon} from '@sanity/icons/Bill'
import {HeartIcon} from '@sanity/icons/Heart'
import {TaskIcon} from '@sanity/icons/Task'
import {UserIcon} from '@sanity/icons/User'
import {UsersIcon} from '@sanity/icons/Users'

export const businessStructure: StructureResolver = (S) =>
  S.list().title('Registros').items([
    S.documentTypeListItem('lead').title('Leads').icon(UserIcon),
    S.documentTypeListItem('customer').title('Clientes').icon(UsersIcon),
    S.documentTypeListItem('sale').title('Vendas').icon(BillIcon),
    S.documentTypeListItem('afterSale').title('Pós-venda').icon(HeartIcon),
    S.documentTypeListItem('task').title('Tarefas').icon(TaskIcon),
  ])
