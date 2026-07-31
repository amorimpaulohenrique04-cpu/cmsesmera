import type {StructureResolver} from 'sanity/structure'
import {ActivityIcon} from '@sanity/icons/Activity'
import {BillIcon} from '@sanity/icons/Bill'
import {DashboardIcon} from '@sanity/icons/Dashboard'
import {HeartIcon} from '@sanity/icons/Heart'
import {TaskIcon} from '@sanity/icons/Task'
import {UserIcon} from '@sanity/icons/User'
import {UsersIcon} from '@sanity/icons/Users'
import {BusinessDashboard} from '../dashboard/BusinessDashboard'
import {BusinessReports} from '../dashboard/BusinessReports'

export const businessStructure: StructureResolver = (S) =>
  S.list()
    .title('ESMÉRA')
    .items([
      S.listItem()
        .id('dashboard')
        .title('Visão geral')
        .icon(DashboardIcon)
        .child(S.component(BusinessDashboard).title('Visão geral')),
      S.divider(),
      S.listItem()
        .id('leads')
        .title('Leads')
        .icon(UserIcon)
        .child(
          S.list()
            .title('Leads')
            .items([
              S.listItem()
                .title('Pipeline aberto')
                .child(
                  S.documentList()
                    .title('Pipeline aberto')
                    .schemaType('lead')
                    .filter('_type == "lead" && !(stage in ["won", "lost"])'),
                ),
              S.listItem()
                .title('Ganhos')
                .child(
                  S.documentList()
                    .title('Leads ganhos')
                    .schemaType('lead')
                    .filter('_type == "lead" && stage == "won"'),
                ),
              S.listItem()
                .title('Perdidos')
                .child(
                  S.documentList()
                    .title('Leads perdidos')
                    .schemaType('lead')
                    .filter('_type == "lead" && stage == "lost"'),
                ),
              S.documentTypeListItem('lead').title('Todos os leads'),
            ]),
        ),
      S.documentTypeListItem('customer').title('Clientes').icon(UsersIcon),
      S.documentTypeListItem('sale').title('Vendas').icon(BillIcon),
      S.listItem()
        .id('afterSales')
        .title('Pós-venda')
        .icon(HeartIcon)
        .child(
          S.list()
            .title('Pós-venda')
            .items([
              S.listItem()
                .title('Fila aberta')
                .child(
                  S.documentList()
                    .title('Fila de pós-venda')
                    .schemaType('afterSale')
                    .filter('_type == "afterSale" && !(status in ["resolved", "closed"])'),
                ),
              S.documentTypeListItem('afterSale').title('Todos os acompanhamentos'),
            ]),
        ),
      S.documentTypeListItem('task').title('Tarefas').icon(TaskIcon),
      S.divider(),
      S.listItem()
        .id('reports')
        .title('Relatórios')
        .icon(ActivityIcon)
        .child(S.component(BusinessReports).title('Relatórios')),
    ])
