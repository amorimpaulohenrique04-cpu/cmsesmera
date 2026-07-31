import styled, {keyframes} from 'styled-components'
import {esmeraTokens as t} from '../../studio/esmeraTokens'

export const palette = {
  ink: t.color.ink,
  graphite: t.color.graphite,
  canvas: t.color.canvas,
  surface: t.color.surface,
  line: t.color.line,
  lineStrong: t.color.lineStrong,
  muted: t.color.textSecondary,
  sand: t.color.sand,
  sage: t.color.emerald,
  sageSoft: t.color.emeraldSoft,
  orange: t.color.orange,
  orangeSoft: t.color.orangeSoft,
  success: t.color.success,
  warning: t.color.warning,
  error: t.color.error,
} as const

export const DashboardPage = styled.div`
  min-height: 100%;
  box-sizing: border-box;
  background: ${palette.canvas};
  color: ${palette.ink};
  padding: 48px;

  @media (max-width: 1439px) {
    padding: 32px;
  }

  @media (max-width: 1199px) {
    padding: 28px;
  }

  @media (max-width: 1023px) {
    padding: 24px;
  }

  @media (max-width: 767px) {
    padding: 20px;
  }
`

export const DashboardShell = styled.div`
  width: min(${t.layout.contentMax}px, 100%);
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
    margin-bottom: 24px;
  }
`

export const Eyebrow = styled.div`
  margin-bottom: 8px;
  color: ${palette.sage};
  font-size: 11px;
  font-weight: 600;
  line-height: 14px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`

export const PageTitle = styled.h1`
  max-width: 900px;
  margin: 0;
  color: ${palette.ink};
  font-size: 32px;
  font-weight: 500;
  letter-spacing: -0.02em;
  line-height: 38px;

  @media (max-width: 767px) {
    font-size: 30px;
    line-height: 36px;
  }
`

export const PageSubtitle = styled.p`
  max-width: 680px;
  margin: 8px 0 0;
  color: ${palette.muted};
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
`

export const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
  margin-bottom: 28px;

  @media (max-width: 1199px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  @media (max-width: 599px) {
    grid-template-columns: 1fr;
  }
`

export const MetricCardSurface = styled.section`
  position: relative;
  min-height: 196px;
  overflow: hidden;
  border: 1px solid ${palette.line};
  border-radius: ${t.radius.card}px;
  background: ${palette.surface};
  box-shadow: ${t.shadow.card};
  padding: 24px;

  @media (max-width: 767px) {
    min-height: 180px;
  }
`

export const MetricTop = styled.div`
  display: flex;
  min-height: 36px;
  align-items: center;
  gap: 10px;
`

export const MetricIcon = styled.span<{$tone: 'sage' | 'orange' | 'neutral'}>`
  display: inline-flex;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  align-items: center;
  justify-content: center;
  border: 1px solid
    ${({$tone}) =>
      $tone === 'sage' ? '#D4E0D8' : $tone === 'orange' ? '#F4D7C5' : palette.line};
  border-radius: 999px;
  background: ${({$tone}) =>
    $tone === 'sage'
      ? palette.sageSoft
      : $tone === 'orange'
        ? palette.orangeSoft
        : '#F3F1EB'};
  color: ${({$tone}) =>
    $tone === 'sage' ? palette.sage : $tone === 'orange' ? palette.orange : palette.graphite};

  svg {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.55;
  }
`

export const MetricLabel = styled.div`
  color: ${palette.graphite};
  font-size: 11px;
  font-weight: 600;
  line-height: 14px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`

export const MetricValue = styled.div`
  margin-top: 18px;
  color: ${palette.ink};
  font-size: 40px;
  font-weight: 500;
  line-height: 44px;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
`

export const MetricDetail = styled.div`
  max-width: 58%;
  margin-top: 8px;
  color: ${palette.muted};
  font-size: 12px;
  font-weight: 400;
  line-height: 17px;

  @media (max-width: 767px) {
    max-width: 64%;
  }

  @media (max-width: 420px) {
    max-width: 58%;
  }
`

export const MetricVisual = styled.div<{$tone: 'sage' | 'orange' | 'neutral'}>`
  position: absolute;
  right: 24px;
  bottom: 24px;
  display: flex;
  width: 68px;
  height: 58px;
  align-items: flex-end;
  justify-content: flex-end;
  color: ${({$tone}) =>
    $tone === 'sage' ? palette.sage : $tone === 'orange' ? palette.orange : palette.lineStrong};
  opacity: 0.72;
  pointer-events: none;

  svg {
    width: 68px;
    height: 48px;
    overflow: visible;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.25;
  }
`

export const MetricBars = styled.div`
  display: flex;
  width: 68px;
  height: 54px;
  align-items: flex-end;
  justify-content: flex-end;
  gap: 5px;

  i {
    display: block;
    width: 2px;
    min-height: 10px;
    border-radius: 999px;
    background: currentColor;
  }
`

export const LowerGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(360px, 0.95fr);
  gap: 24px;

  @media (max-width: 1199px) {
    gap: 16px;
  }

  @media (max-width: 1023px) {
    grid-template-columns: 1fr;
  }
`

export const Panel = styled.section`
  min-height: 340px;
  border: 1px solid ${palette.line};
  border-radius: ${t.radius.card}px;
  background: ${palette.surface};
  box-shadow: ${t.shadow.card};
  padding: 24px;

  @media (max-width: 767px) {
    padding: 20px;
  }
`

export const PanelHeader = styled.div`
  display: flex;
  min-height: 40px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;

  @media (max-width: 420px) {
    align-items: flex-start;
  }
`

export const PanelTitle = styled.h2`
  margin: 0;
  color: ${palette.ink};
  font-size: 18px;
  font-weight: 500;
  line-height: 24px;
  letter-spacing: -0.01em;
`

export const PanelAction = styled.a`
  display: inline-flex;
  min-width: 40px;
  min-height: 40px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border: 1px solid ${palette.line};
  border-radius: 999px;
  background: transparent;
  color: ${palette.graphite};
  padding: 0 14px;
  font-size: 11px;
  font-weight: 500;
  line-height: 16px;
  text-decoration: none;
  transition:
    border-color ${t.motion.fast} ${t.motion.easing},
    background-color ${t.motion.fast} ${t.motion.easing},
    color ${t.motion.fast} ${t.motion.easing};

  &:hover {
    border-color: ${palette.lineStrong};
    background: #F7F5F0;
    color: ${palette.ink};
  }
`

export const RecentRows = styled.div`
  display: grid;
  gap: 8px;
`

export const RecentRowLink = styled.a`
  display: flex;
  min-height: 64px;
  align-items: center;
  gap: 12px;
  border: 1px solid ${palette.line};
  border-radius: 8px;
  background: ${palette.surface};
  color: ${palette.ink};
  padding: 10px 12px;
  text-decoration: none;
  transition:
    border-color 160ms ${t.motion.easing},
    box-shadow 160ms ${t.motion.easing},
    background-color 160ms ${t.motion.easing};

  &:hover {
    border-color: ${palette.lineStrong};
    background: #FEFDFB;
    box-shadow: ${t.shadow.cardHover};
  }

  @media (max-width: 420px) {
    gap: 10px;
    padding-right: 10px;
    padding-left: 10px;
  }
`

export const Thumbnail = styled.div`
  display: grid;
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  overflow: hidden;
  place-items: center;
  border: 1px solid ${palette.line};
  border-radius: 8px;
  background: ${palette.sand};
  color: ${palette.sage};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  svg {
    width: 17px;
    height: 17px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.5;
  }
`

export const RowCopy = styled.div`
  min-width: 0;
  flex: 1 1 auto;
`

export const RowTitle = styled.div`
  overflow: hidden;
  color: ${palette.ink};
  font-size: 13px;
  font-weight: 500;
  line-height: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const RowMeta = styled.div`
  overflow: hidden;
  margin-top: 3px;
  color: ${palette.muted};
  font-size: 12px;
  font-weight: 400;
  line-height: 17px;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const StatusPill = styled.span<{$tone?: 'green' | 'sand' | 'neutral' | 'error'}>`
  display: inline-flex;
  min-height: 24px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border: 1px solid
    ${({$tone}) =>
      $tone === 'green'
        ? '#C8D8CF'
        : $tone === 'sand'
          ? '#E4CFBB'
          : $tone === 'error'
            ? '#D8B8B4'
            : palette.line};
  border-radius: ${t.radius.status}px;
  background: ${({$tone}) =>
    $tone === 'green'
      ? palette.sageSoft
      : $tone === 'sand'
        ? palette.orangeSoft
        : $tone === 'error'
          ? '#F3E5E3'
          : '#F3F1EB'};
  color: ${({$tone}) =>
    $tone === 'green'
      ? palette.sage
      : $tone === 'sand'
        ? palette.warning
        : $tone === 'error'
          ? palette.error
          : palette.muted};
  padding: 3px 9px;
  font-size: 11px;
  font-weight: 500;
  line-height: 16px;
  white-space: nowrap;
`

export const PendingList = styled.div`
  display: grid;
  gap: 8px;
`

export const PendingItem = styled.div`
  display: flex;
  min-height: 64px;
  align-items: center;
  gap: 12px;
  border: 1px solid ${palette.line};
  border-radius: 8px;
  background: #FEFDFB;
  padding: 10px 12px;

  @media (max-width: 420px) {
    gap: 10px;
    padding-right: 10px;
    padding-left: 10px;
  }
`

export const PendingIcon = styled.span<{$tone?: 'sage' | 'orange'}>`
  display: inline-flex;
  width: 30px;
  height: 30px;
  flex: 0 0 30px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: ${({$tone}) => ($tone === 'orange' ? palette.orangeSoft : palette.sageSoft)};
  color: ${({$tone}) => ($tone === 'orange' ? palette.orange : palette.sage)};

  svg {
    width: 15px;
    height: 15px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.55;
  }
`

export const PendingCopy = styled.div`
  min-width: 0;
  flex: 1 1 auto;
`

export const PendingTitle = styled.div`
  color: ${palette.ink};
  font-size: 13px;
  font-weight: 500;
  line-height: 18px;
`

export const PendingMeta = styled.div`
  margin-top: 2px;
  color: ${palette.muted};
  font-size: 12px;
  font-weight: 400;
  line-height: 17px;
`

export const EmptyStateBox = styled.div`
  display: grid;
  min-height: 260px;
  place-items: center;
  border: 1px dashed ${palette.lineStrong};
  border-radius: 12px;
  background: #FEFDFB;
  padding: 28px 24px;
  text-align: center;
`

export const EmptyStateInner = styled.div`
  display: grid;
  max-width: 360px;
  justify-items: center;
`

export const EmptyIllustration = styled.div`
  display: grid;
  width: 76px;
  height: 76px;
  place-items: center;
  border: 1px solid ${palette.line};
  border-radius: 999px;
  background: linear-gradient(145deg, #F2EEE5 0%, #FBFAF6 100%);
  color: ${palette.graphite};

  svg {
    width: 34px;
    height: 34px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.25;
  }
`

export const EmptyTitle = styled.div`
  margin-top: 18px;
  color: ${palette.ink};
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
`

export const EmptyCopy = styled.p`
  max-width: 310px;
  margin: 6px 0 0;
  color: ${palette.muted};
  font-size: 12px;
  font-weight: 400;
  line-height: 17px;
`

export const PrimaryAction = styled.a`
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 18px;
  border: 1px solid ${palette.ink};
  border-radius: ${t.radius.control}px;
  background: ${palette.ink};
  color: ${palette.surface};
  padding: 0 16px;
  font-size: 12px;
  font-weight: 500;
  line-height: 17px;
  text-decoration: none;
  transition:
    background-color ${t.motion.fast} ${t.motion.easing},
    border-color ${t.motion.fast} ${t.motion.easing};

  &:hover {
    border-color: ${palette.graphite};
    background: ${palette.graphite};
  }
`

export const ErrorPanel = styled.div`
  border: 1px solid ${palette.line};
  border-radius: ${t.radius.card}px;
  background: ${palette.surface};
  box-shadow: ${t.shadow.card};
  padding: 24px;
`

const skeletonPulse = keyframes`
  0%, 100% { opacity: .58; }
  50% { opacity: 1; }
`

export const LoadingWrap = styled.div`
  display: grid;
  min-height: 420px;
  align-content: start;
  gap: 28px;
`

export const SkeletonHeader = styled.div`
  width: min(520px, 100%);
  height: 82px;
  border-radius: 12px;
  background: ${palette.sand};
  animation: ${skeletonPulse} 1.2s ${t.motion.easing} infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

export const SkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;

  @media (max-width: 1199px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  @media (max-width: 599px) {
    grid-template-columns: 1fr;
  }
`

export const SkeletonBlock = styled.div<{$height?: number}>`
  min-height: ${({$height}) => $height || 196}px;
  border: 1px solid ${palette.line};
  border-radius: ${t.radius.card}px;
  background: linear-gradient(110deg, #ECE8DF 8%, #F4F1EA 18%, #ECE8DF 33%);
  background-size: 200% 100%;
  box-shadow: ${t.shadow.card};
  animation: ${skeletonPulse} 1.2s ${t.motion.easing} infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`
