import styled from 'styled-components'

export const palette = {
  ink: '#111210',
  green: '#173E35',
  greenSoft: '#DCE8E3',
  greenPale: '#EDF3F0',
  ivory: '#F3F0E8',
  surface: '#FCFBF7',
  line: '#D8D4CB',
  muted: '#77756E',
  sand: '#EEE8DA',
  caution: '#8A6B35',
}

export const DashboardPage = styled.div`
  min-height: 100%;
  box-sizing: border-box;
  background: ${palette.ivory};
  color: ${palette.ink};
  padding: clamp(24px, 4vw, 56px);
`

export const DashboardShell = styled.div`
  width: min(1440px, 100%);
  margin: 0 auto;
`

export const PageHeader = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 720px) {
    align-items: flex-start;
    flex-direction: column;
  }
`

export const Eyebrow = styled.div`
  margin-bottom: 10px;
  color: ${palette.green};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
`

export const PageTitle = styled.h1`
  max-width: 900px;
  margin: 0;
  color: ${palette.ink};
  font-size: clamp(34px, 4vw, 58px);
  font-weight: 400;
  letter-spacing: -0.04em;
  line-height: 0.98;
`

export const PageSubtitle = styled.p`
  max-width: 720px;
  margin: 14px 0 0;
  color: ${palette.muted};
  font-size: 14px;
  line-height: 1.5;
`

export const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 22px;

  @media (max-width: 980px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`

export const MetricCard = styled.section`
  min-height: 122px;
  box-sizing: border-box;
  border: 1px solid ${palette.line};
  border-radius: 12px;
  background: ${palette.surface};
  padding: 20px;
`

export const MetricLabel = styled.div`
  color: ${palette.muted};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

export const MetricValue = styled.div`
  margin-top: 12px;
  color: ${palette.ink};
  font-size: 34px;
  font-weight: 500;
  letter-spacing: -0.04em;
`

export const MetricDetail = styled.div`
  margin-top: 8px;
  color: ${palette.muted};
  font-size: 12px;
  line-height: 1.4;
`

export const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.12fr) minmax(0, 0.88fr);
  gap: 16px;

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
  }
`

export const Panel = styled.section`
  border: 1px solid ${palette.line};
  border-radius: 14px;
  background: ${palette.surface};
  padding: clamp(20px, 3vw, 30px);
`

export const PanelTitle = styled.h2`
  margin: 0 0 22px;
  color: ${palette.ink};
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.025em;
`

export const PipelineGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  border: 1px solid ${palette.line};
  border-radius: 10px;
  overflow: hidden;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`

export const PipelineCell = styled.div<{$active?: boolean}>`
  min-height: 112px;
  box-sizing: border-box;
  padding: 18px;
  background: ${({$active}) => ($active ? palette.green : palette.greenPale)};
  color: ${({$active}) => ($active ? '#F6F2E9' : palette.ink)};
  border-right: 1px solid ${palette.line};

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
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.04em;
`

export const PipelineLabel = styled.div`
  margin-top: 18px;
  font-size: 12px;
`

export const Rows = styled.div`
  display: grid;
`

export const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-height: 62px;
  border-top: 1px solid ${palette.line};

  &:first-child {
    border-top: 0;
  }
`

export const RowCopy = styled.div`
  min-width: 0;
`

export const RowTitle = styled.div`
  overflow: hidden;
  color: ${palette.ink};
  font-size: 13px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const RowMeta = styled.div`
  margin-top: 5px;
  color: ${palette.muted};
  font-size: 11px;
`

export const StatusPill = styled.span<{$tone?: 'green' | 'sand' | 'neutral'}>`
  flex: 0 0 auto;
  border-radius: 999px;
  background: ${({$tone}) =>
    $tone === 'green'
      ? palette.greenSoft
      : $tone === 'sand'
        ? palette.sand
        : '#ECEAE4'};
  color: ${({$tone}) => ($tone === 'sand' ? palette.caution : palette.green)};
  padding: 6px 9px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`

export const Section = styled.section`
  margin-top: 24px;
`

export const SectionHeading = styled.h2`
  margin: 0 0 14px;
  color: ${palette.ink};
  font-size: 18px;
  font-weight: 600;
`

export const EmptyState = styled.div`
  border: 1px dashed ${palette.line};
  border-radius: 10px;
  color: ${palette.muted};
  padding: 24px;
  font-size: 13px;
`

export const ReportGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 16px;
  margin-top: 16px;

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
  margin-bottom: 7px;
  color: ${palette.ink};
  font-size: 12px;
`

export const BarTrack = styled.div`
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: #E8E5DE;
`

export const BarFill = styled.div`
  height: 100%;
  border-radius: inherit;
  background: ${palette.green};
`

export const LoadingWrap = styled.div`
  display: grid;
  min-height: 360px;
  place-items: center;
`
