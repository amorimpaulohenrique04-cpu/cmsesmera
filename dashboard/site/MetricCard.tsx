import type {ReactNode} from 'react'
import {
  MetricBars,
  MetricCardSurface,
  MetricDetail,
  MetricIcon,
  MetricLabel,
  MetricTop,
  MetricValue,
  MetricVisual,
} from './siteDashboardStyles'

type Tone = 'sage' | 'orange' | 'neutral'
type Visual = 'bars' | 'line' | 'compactBars'

type MetricCardProps = {
  label: string
  value: string | number
  detail: string
  icon: ReactNode
  tone: Tone
  visual?: Visual
}

const tallBars = ['30%', '46%', '38%', '58%', '48%', '78%', '94%', '62%']
const compactBars = ['34%', '56%', '42%', '68%', '50%', '76%']

function DecorativeVisual({tone, visual = 'bars'}: {tone: Tone; visual?: Visual}) {
  if (visual === 'line') {
    return (
      <MetricVisual $tone={tone} aria-hidden="true">
        <svg viewBox="0 0 68 48" focusable="false">
          <path d="M2 32 C9 29, 12 36, 19 31 S29 12, 37 18 S46 37, 54 27 S62 18, 66 10" />
          <circle cx="66" cy="10" r="1.8" fill="currentColor" stroke="none" />
        </svg>
      </MetricVisual>
    )
  }

  const heights = visual === 'compactBars' ? compactBars : tallBars

  return (
    <MetricVisual $tone={tone} aria-hidden="true">
      <MetricBars>
        {heights.map((height, index) => (
          <i key={`${height}-${index}`} style={{height}} />
        ))}
      </MetricBars>
    </MetricVisual>
  )
}

export function MetricCard({label, value, detail, icon, tone, visual}: MetricCardProps) {
  return (
    <MetricCardSurface>
      <MetricTop>
        <MetricIcon $tone={tone} aria-hidden="true">
          {icon}
        </MetricIcon>
        <MetricLabel>{label}</MetricLabel>
      </MetricTop>
      <MetricValue>{value}</MetricValue>
      <MetricDetail>{detail}</MetricDetail>
      <DecorativeVisual tone={tone} visual={visual} />
    </MetricCardSurface>
  )
}
