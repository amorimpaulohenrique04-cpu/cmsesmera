import type {StructureResolver} from 'sanity/structure'
import {ActivityIcon} from '@sanity/icons/Activity'
import {BillIcon} from '@sanity/icons/Bill'
import {HeartIcon} from '@sanity/icons/Heart'
import {TaskIcon} from '@sanity/icons/Task'
import {UserIcon} from '@sanity/icons/User'
import {UsersIcon} from '@sanity/icons/Users'
import {AfterSalesPage, CustomersPage, ReportsPage, SalesPage} from '../dashboard/stitch/BusinessPages'

export const businessStructure: StructureResolver = (S) =>
  S.list().title('ESMÉRA').items([
    S.listItem().id('customers').title('Clientes').icon(UsersIcon).child(S.component(CustomersPage).title('Clientes')),
    S.listItem().id('sales').title('Vendas').icon(BillIcon).child(S.component(SalesPage).title('Vendas')),
    S.listItem().id('after-sales').title('Pós-venda').icon(HeartIcon).child(S.component(AfterSalesPage).title('Pós-venda')),
    S.listItem().id('reports').title('Relatórios').icon(ActivityIcon).child(S.component(ReportsPage).title('Relatórios')),
    S.divider(),
    S.listItem().id('records').title('Registros').icon(TaskIcon).child(
      S.list().title('Registros').items([
        S.documentTypeListItem('lead').title('Leads').icon(UserIcon),
        S.documentTypeListItem('customer').title('Clientes').icon(UsersIcon),
        S.documentTypeListItem('sale').title('Vendas').icon(BillIcon),
        S.documentTypeListItem('afterSale').title('Pós-venda').icon(HeartIcon),
        S.documentTypeListItem('task').title('Tarefas').icon(TaskIcon),
      ]),
    ),
  ])
