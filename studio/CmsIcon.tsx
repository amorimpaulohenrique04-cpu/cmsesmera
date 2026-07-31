import type {ComponentType, SVGProps} from 'react'
import {ActivityIcon} from '@sanity/icons/Activity'
import {BillIcon} from '@sanity/icons/Bill'
import {CaseIcon} from '@sanity/icons/Case'
import {CogIcon} from '@sanity/icons/Cog'
import {DashboardIcon} from '@sanity/icons/Dashboard'
import {DiamondIcon} from '@sanity/icons/Diamond'
import {DocumentIcon} from '@sanity/icons/Document'
import {EnvelopeIcon} from '@sanity/icons/Envelope'
import {HeartIcon} from '@sanity/icons/Heart'
import {HomeIcon} from '@sanity/icons/Home'
import {MenuIcon} from '@sanity/icons/Menu'
import {PackageIcon} from '@sanity/icons/Package'
import {StackIcon} from '@sanity/icons/Stack'
import {TagIcon} from '@sanity/icons/Tag'
import {TaskIcon} from '@sanity/icons/Task'
import {UserIcon} from '@sanity/icons/User'
import {UsersIcon} from '@sanity/icons/Users'

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

type CmsIconProps = {
  name: string
  size?: number
  className?: string
  title?: string
}

const sanityIcons: Record<string, IconComponent> = {
  dashboard: DashboardIcon,
  web: DiamondIcon,
  travel_explore: DiamondIcon,
  inventory_2: PackageIcon,
  category: TagIcon,
  sell: TagIcon,
  group: UsersIcon,
  groups: UsersIcon,
  person_add: UserIcon,
  shopping_cart: BillIcon,
  payments: BillIcon,
  attach_money: BillIcon,
  receipt_long: BillIcon,
  support_agent: HeartIcon,
  favorite: HeartIcon,
  analytics: ActivityIcon,
  trending_up: ActivityIcon,
  settings: CogIcon,
  tune: CogIcon,
  task: TaskIcon,
  add_task: TaskIcon,
  sticky_note: DocumentIcon,
  description: DocumentIcon,
  feed: DocumentIcon,
  edit_note: DocumentIcon,
  menu: MenuIcon,
  layers: StackIcon,
  collections: StackIcon,
  auto_awesome_motion: StackIcon,
  mail: EnvelopeIcon,
  home: HomeIcon,
  business: CaseIcon,
}

const paths: Record<string, string[]> = {
  eco: [
    'M19.4 4.6C13.9 4.4 8.2 7 5.7 11.3c-1.8 3.1-.9 6.7 1.8 8.2 2.8 1.6 6.4.6 8.1-2.2 2.3-3.9 2.5-8.6 3.8-12.7Z',
    'M5 20c2.1-4.8 5.8-8.7 11.2-11.5',
  ],
  search: ['M10.8 5.2a5.6 5.6 0 1 0 0 11.2 5.6 5.6 0 0 0 0-11.2Z', 'm15 15 4 4'],
  add: ['M12 5v14', 'M5 12h14'],
  add_circle: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M12 8v8', 'M8 12h8'],
  notifications: ['M6.5 16.5h11l-1.4-2V10a4.1 4.1 0 0 0-8.2 0v4.5l-1.4 2Z', 'M10 19h4'],
  help: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M9.8 9a2.3 2.3 0 1 1 3.5 2c-1 .7-1.3 1.1-1.3 2.1', 'M12 17h.01'],
  logout: ['M10 5H6.8A1.8 1.8 0 0 0 5 6.8v10.4A1.8 1.8 0 0 0 6.8 19H10', 'M14 8l4 4-4 4', 'M18 12H9'],
  arrow_forward: ['M5 12h14', 'm14 7 5 5-5 5'],
  chevron_right: ['m9 6 6 6-6 6'],
  edit: ['m5 16-.8 3.8L8 19l9.7-9.7-3-3L5 16Z', 'm13.8 7.2 3 3'],
  visibility: ['M2.8 12s3.2-5.5 9.2-5.5 9.2 5.5 9.2 5.5-3.2 5.5-9.2 5.5S2.8 12 2.8 12Z', 'M12 9.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6Z'],
  image: ['M4 5h16v14H4Z', 'm5 17 4.6-4.6 3.2 3.2 2.2-2.2 4 3.6', 'M15.8 9.2h.01'],
  photo_library: ['M5 4h14v14H5Z', 'M3 7v13h13', 'm6 15 3.4-3.4 2.7 2.7 1.9-1.9 3 2.7'],
  add_photo_alternate: ['M4 5h10v10H4Z', 'm5 14 2.8-2.8 2.2 2.2 1.5-1.5 2.5 2.1', 'M18 12v7', 'M14.5 15.5h7'],
  upload: ['M12 16V5', 'm8 9 4-4 4 4', 'M5 18v2h14v-2'],
  priority_high: ['M12 5v8', 'M12 17h.01'],
  warning: ['M12 3 2.8 5 5.2 9.2A2 2 0 0 1 18.3 20H5.7A2 2 0 0 1 4 17l5.2-9.8L12 3Z', 'M12 9v4', 'M12 16h.01'],
  error: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M12 8v5', 'M12 16.5h.01'],
  check_circle: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'm8 12 2.5 2.5L16 9'],
  chat_bubble: ['M5 5h14v10H9l-4 4V5Z'],
  local_shipping: ['M3 6h11v10H3Z', 'M14 9h4l3 3v4h-7Z', 'M7 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z', 'M18 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z'],
  call: ['M7 4 4.5 5.5c1 4.5 4.5 8 9 9L15 12l4 1.8v4C11.2 18.8 5.2 12.8 6.2 5L7 4Z'],
  phone_in_talk: ['M7 4 4.5 5.5c1 4.5 4.5 8 9 9L15 12l4 1.8v4C11.2 18.8 5.2 12.8 6.2 5L7 4Z', 'M15 5c2 1 3 2.4 3.5 4', 'M15 2c3.5 1.1 5.5 3.4 6 6.5'],
  calendar_today: ['M5 5h14v14H5Z', 'M8 3v4', 'M16 3v4', 'M5 9h14'],
  event: ['M5 5h14v14H5Z', 'M8 3v4', 'M16 3v4', 'M8 12h3', 'M8 15h6'],
  event_repeat: ['M5 5h14v14H5Z', 'M8 3v4', 'M16 3v4', 'M8 13h7', 'm13 11 2 2-2 2'],
  schedule: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M12 7v5l3 2'],
  file_download: ['M12 4v10', 'm8 10 4 4 4-4', 'M5 19h14'],
  download: ['M12 4v10', 'm8 10 4 4 4-4', 'M5 19h14'],
  share: ['M8 12 16 7', 'M8 12l8 5', 'M6 12a2 2 0 1 0 0 .01', 'M18 6a2 2 0 1 0 0 .01', 'M18 18a2 2 0 1 0 0 .01'],
  percent: ['M7 17 17 7', 'M7.5 7.5h.01', 'M16.5 16.5h.01'],
  handshake: ['M4 11 8 7l3 1 2-1 7 5', 'm4 13 4 4c1 1 2.2 1 3.2.2L18 14', 'm10 10 3 3'],
  info: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M12 11v6', 'M12 7h.01'],
  close: ['m6 6 12 12', 'm18 6-12 12'],
  publish: ['M12 16V5', 'm8 9 4-4 4 4', 'M5 19h14'],
  swap_vert: ['M8 4v14', 'm5 7 3-3 3 3', 'M16 20V6', 'm13 17 3 3 3-3'],
  collections: ['M5 5h12v12H5Z', 'M8 8h11v11H8Z'],
  travel_explore: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M3 12h18', 'M12 3c2.3 2.4 3.4 5.4 3.4 9S14.3 18.6 12 21c-2.3-2.4-3.4-5.4-3.4-9S9.7 5.4 12 3Z'],
  dock_to_bottom: ['M5 4h14v16H5Z', 'M5 15h14'],
  chat: ['M5 5h14v11H9l-4 4V5Z'],
  lightbulb: ['M9 17h6', 'M10 20h4', 'M8 11a4 4 0 1 1 8 0c0 2-1 3-2 4H10c-1-1-2-2-2-4Z'],
  shield: ['M12 3 19 6v5c0 4.8-2.8 8-7 10-4.2-2-7-5.2-7-10V6l7-3Z', 'm9 12 2 2 4-4'],
  assignment_late: ['M7 5h10v15H7Z', 'M9 3h6v4H9Z', 'M12 10v4', 'M12 17h.01'],
  list: ['M8 7h11', 'M8 12h11', 'M8 17h11', 'M5 7h.01', 'M5 12h.01', 'M5 17h.01'],
  view_kanban: ['M4 5h5v14H4Z', 'M10.5 5h4v9h-4Z', 'M16 5h4v11h-4Z'],
  tips_and_updates: ['M9 17h6', 'M10 20h4', 'M8 11a4 4 0 1 1 8 0c0 2-1 3-2 4H10c-1-1-2-2-2-4Z'],
}

function LocalIcon({name, size, className, title}: CmsIconProps) {
  const iconPaths = paths[name] || paths.info
  return (
    <svg
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={className}
      fill="none"
      height={size}
      role={title ? 'img' : undefined}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      width={size}
    >
      {title ? <title>{title}</title> : null}
      {iconPaths.map((d) => <path d={d} key={d} />)}
    </svg>
  )
}

export function CmsIcon({name, size = 22, className, title}: CmsIconProps) {
  const Icon = sanityIcons[name]
  if (Icon) {
    return <Icon aria-label={title} className={className} height={size} width={size} />
  }
  return <LocalIcon className={className} name={name} size={size} title={title} />
}
