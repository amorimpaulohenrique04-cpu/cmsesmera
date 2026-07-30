import {definePlugin} from 'sanity'
import {DashboardIcon} from '@sanity/icons/Dashboard'
import {BusinessDashboard} from './BusinessDashboard'

export const businessDashboardTool = definePlugin({
  name: 'esmera-business-dashboard',
  tools: [
    {
      name: 'dashboard',
      title: 'Visão geral',
      icon: DashboardIcon,
      component: BusinessDashboard,
    },
  ],
})
