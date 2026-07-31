import type {ReactNode} from 'react'
import {
  PendingCopy,
  PendingIcon,
  PendingItem,
  PendingMeta,
  PendingTitle,
  StatusPill,
} from './siteDashboardStyles'

type PendingRowProps = {
  label: string
  count: number
  detail: string
  icon: ReactNode
}

export function PendingRow({label, count, detail, icon}: PendingRowProps) {
  const needsReview = count > 0

  return (
    <PendingItem>
      <PendingIcon $tone={needsReview ? 'orange' : 'sage'} aria-hidden="true">
        {icon}
      </PendingIcon>
      <PendingCopy>
        <PendingTitle>{label}</PendingTitle>
        <PendingMeta>{detail}</PendingMeta>
      </PendingCopy>
      <StatusPill $tone={needsReview ? 'sand' : 'green'}>
        {needsReview ? `${count} revisar` : 'OK'}
      </StatusPill>
    </PendingItem>
  )
}
