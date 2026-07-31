import styled, {keyframes} from 'styled-components'

const legacy = {
  color: {
    ink: '#111210',
    graphite: '#262724',
    emerald: '#2F6B54',
    ivory: '#F3F0E8',
    surface: '#FCFBF7',
    sand: '#E9E5DC',
    line: '#D7D1C6',
    lineStrong: '#BEB7AB',
    textSecondary: '#5F5D56',
    warning: '#946527',
    error: '#944742',
  },
  typography: {
    page: {size: 28, lineHeight: 34, weight: 500},
    section: {size: 22, lineHeight: 28, weight: 500},
    component: {size: 15, lineHeight: 20, weight: 500},
    body: {size: 14, lineHeight: 20, weight: 400},
    bodySmall: {size: 13, lineHeight: 18, weight: 400},
    label: {size: 12, lineHeight: 16, weight: 500},
    caption: {size: 11, lineHeight: 15, weight: 400},
  },
  layout: {
    contentMax: 1680,
    pagePaddingDesktop: 32,
    pagePaddingTablet: 24,
    pagePaddingMobile: 16,
  },
  radius: {control: 2, status: 999},
  motion: {easing: 'cubic-bezier(.2, .8, .2, 1)'},
} as const

export const palette = {
  ink: legacy.color.ink,
  graphite: legacy.color.graphite,
  green: legacy.color.emerald,
  greenSoft: '#E3ECE7',
  greenPale: '#F1F5F2',
  ivory: legacy.color.ivory,
  surface: legacy.color.surface,
  line: legacy.color.line,
  lineStrong: legacy.color.lineStrong,
  muted: legacy.color.textSecondary,
  sand: legacy.color.sand,
  caution: legacy.color.warning,
  error: legacy.color.error,
}

export const DashboardPage = styled.div`
  min-height: 100%;
  box-sizing: border-box;
  background: ${palette.ivory};
  color: ${palette.ink};
  padding: ${legacy.layout.pagePaddingDesktop}px;

  @media (max-width: 1023px) {
    padding: ${legacy.layout.pagePaddingTablet}px;
  }

  @media (max-width: 767px) {
    padding: ${legacy.layout.pagePaddingMobile}px;
  }
`

export const DashboardShell = styled.div`
  width: min(${legacy.layout.contentMax}px, 100%);
  margin: 0 auto;
`

export const PageHeader = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 767px) {
    align-items: flex-start;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 24px;
  }
`

export const Eyebrow = styled.div`
  margin-bottom: 8px;
  color: ${palette.green};
  font-size: ${legacy.typography.caption.size}px;
  font-weight: 500;
  line-height: ${legacy.typography.caption.lineHeight}px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

export const PageTitle = styled.h1`
  max-width: 900px;
  margin: 0;
  color: ${palette.ink};
  font-size: ${legacy.typography.page.size}px;
  font-weight: ${legacy.typography.page.weight};
  letter-spacing: 0;
  line-height: ${legacy.typography.page.lineHeight}px;
`

export const PageSubtitle = styled.p`
  max-width: 720px;
  margin: 8px 0 0;
  color: ${palette.muted};
  font-size: ${legacy.typography.body.size}px;
  font-weight: 400;
  line-height: ${legacy.typography.body.lineHeight}px;
`

export const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 1199px) {
    gap: 16px;
  }

  @media (max-width: 1023px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 599px) {
    grid-template-columns: 1fr;
  }
`

export const MetricCard = styled.section`
  min-height: 132px;
  box-sizing: border-box;
  border: 1px solid ${palette.line};
  border-radius: ${legacy.radius.control}px;
  background: ${palette.surface};
  padding: 24px;
`

export const MetricLabel = styled.div`
  color: ${palette.muted};
  font-size: ${legacy.typography.label.size}px;
  font-weight: 500;
  line-height: ${legacy.typography.label.lineHeight}px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`

export const MetricValue = styled.div`
  margin-top: 12px;
  color: ${palette.ink};
  font-size: 30px;
  font-weight: 500;
  line-height: 36px;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
`

export const MetricDetail = styled.div`
  margin-top: 8px;
  color: ${palette.muted};
  font-size: ${legacy.typography.bodySmall.size}px;
  line-height: ${legacy.typography.bodySmall.lineHeight}px;
`

export const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.12fr) minmax(320px, 0.88fr);
  gap: 24px;

  @media (max-width: 1199px) {
    gap: 16px;
  }

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
  }
`

export const Panel = styled.section`
  border: 1px solid ${palette.line};
  border-radius: ${legacy.radius.control}px;
  background: ${palette.surface};
  padding: 24px;
`

export const PanelTitle = styled.h2`
  margin: 0 0 20px;
  color: ${palette.ink};
  font-size: ${legacy.typography.component.size}px;
  font-weight: 500;
  line-height: ${legacy.typography.component.lineHeight}px;
  letter-spacing: 0;
`

export const PipelineGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  overflow: hidden;
  border: 1px solid ${palette.line};
  border-radius: ${legacy.radius.control}px;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`

export const PipelineCell = styled.div<{$active?: boolean}>`
  min-height: 104px;
  box-sizing: border-box;
  border-right: 1px solid ${palette.line};
  background: ${({$active}) => ($active ? palette.greenPale : palette.surface)};
  box-shadow: ${({$active}) => ($active ? `inset 0 2px 0 ${palette.green}` : 'none')};
  color: ${palette.ink};
  padding: 16px;

  &:last-child {
    border-right: 0;
  }

  @media (max-width: 680px) {
    min-height: auto;
    border-right: 0;
    border-bottom: 1px solid ${palette.line};

    &:last-child {
      border-bottom: 0;
    }
  }
`

export const PipelineValue = styled.div`
  color: ${palette.ink};
  font-size: 28px;
  font-weight: 500;
  line-height: 34px;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
`

export const PipelineLabel = styled.div`
  margin-top: 12px;
  color: ${palette.muted};
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
`

export const Rows = styled.div`
  display: grid;
`

export const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-height: 56px;
  border-top: 1px solid ${palette.line};

  &:first-child {
    border-top: 0;
  }
`

export const RowCopy = styled.div`
  min-width: 0;
  padding: 10px 0;
`

export const RowTitle = styled.div`
  overflow: hidden;
  color: ${palette.ink};
  font-size: ${legacy.typography.bodySmall.size}px;
  font-weight: 500;
  line-height: ${legacy.typography.bodySmall.lineHeight}px;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const RowMeta = styled.div`
  margin-top: 4px;
  color: ${palette.muted};
  font-size: ${legacy.typography.caption.size}px;
  line-height: ${legacy.typography.caption.lineHeight}px;
`

export const StatusPill = styled.span<{$tone?: 'green' | 'sand' | 'neutral' | 'error'}>`
  display: inline-flex;
  min-height: 24px;
  flex: 0 0 auto;
  align-items: center;
  border: 1px solid
    ${({$tone}) =>
      $tone === 'green'
        ? '#BFD2C8'
        : $tone === 'sand'
          ? '#D8C5A5'
          : $tone === 'error'
            ? '#D8B8B4'
            : palette.line};
  border-radius: ${legacy.radius.status}px;
  background: ${({$tone}) =>
    $tone === 'green'
      ? palette.greenSoft
      : $tone === 'sand'
        ? '#F2E9DB'
        : $tone === 'error'
          ? '#F3E5E3'
          : '#F1EFEA'};
  color: ${({$tone}) =>
    $tone === 'green'
      ? palette.green
      : $tone === 'sand'
        ? palette.caution
        : $tone === 'error'
          ? palette.error
          : palette.muted};
  padding: 3px 9px;
  font-size: 11px;
  font-weight: 500;
  line-height: 16px;
  white-space: nowrap;
`

export const Section = styled.section`
  margin-top: 32px;
`

export const SectionHeading = styled.h2`
  margin: 0 0 16px;
  color: ${palette.ink};
  font-size: ${legacy.typography.section.size}px;
  font-weight: 500;
  line-height: ${legacy.typography.section.lineHeight}px;
`

export const EmptyState = styled.div`
  border: 1px dashed ${palette.lineStrong};
  border-radius: ${legacy.radius.control}px;
  color: ${palette.muted};
  padding: 24px;
  font-size: ${legacy.typography.bodySmall.size}px;
  line-height: ${legacy.typography.bodySmall.lineHeight}px;
`

export const ReportGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 24px;
  margin-top: 24px;

  @media (max-width: 1199px) {
    gap: 16px;
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`

export const BarList = styled.div`
  display: grid;
  gap: 16px;
`

export const BarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 8px;
  color: ${palette.ink};
  font-size: ${legacy.typography.bodySmall.size}px;
  line-height: ${legacy.typography.bodySmall.lineHeight}px;
  font-variant-numeric: tabular-nums;
`

export const BarTrack = styled.div`
  height: 6px;
  overflow: hidden;
  background: ${palette.sand};
`

export const BarFill = styled.div`
  height: 100%;
  background: ${palette.green};
`

const skeletonPulse = keyframes`
  0%, 100% { opacity: .58; }
  50% { opacity: 1; }
`

export const LoadingWrap = styled.div`
  display: grid;
  min-height: 420px;
  align-content: start;
  gap: 24px;
`

export const SkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;

  @media (max-width: 1023px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  @media (max-width: 599px) {
    grid-template-columns: 1fr;
  }
`

export const SkeletonBlock = styled.div<{$height?: number}>`
  min-height: ${({$height}) => $height || 120}px;
  border: 1px solid ${palette.line};
  border-radius: ${legacy.radius.control}px;
  background: ${palette.sand};
  animation: ${skeletonPulse} 1.2s ${legacy.motion.easing} infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`
