import type {ReactNode} from 'react'
import styled from 'styled-components'
import {CmsIcon} from '../../studio/CmsIcon'
import {esmeraTokens as t} from '../../studio/esmeraTokens'

export const Page = styled.main`
  min-height: calc(100vh - ${t.layout.header}px);
  background: ${t.color.surface};
  color: ${t.color.ink};
  padding: 32px ${t.layout.pagePaddingDesktop}px 48px;
  font-family: ${t.typography.family};

  *, *::before, *::after { box-sizing: border-box; }

  @media(max-width:1023px){padding:28px 24px 40px}
  @media(max-width:720px){padding:24px 16px 36px}
`
export const Shell = styled.div`width:min(${t.layout.contentMax}px,100%);margin:0 auto;`
export const Header = styled.header`
  display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:28px;
  @media(max-width:760px){align-items:flex-start;flex-direction:column}
`
export const Title = styled.h1`
  margin:0;font-family:${t.typography.headline};font-size:32px;font-weight:600;line-height:40px;letter-spacing:-.01em;color:${t.color.ink};
  @media(max-width:720px){font-size:28px;line-height:36px}
`
export const Subtitle = styled.p`margin:4px 0 0;color:${t.color.textSecondary};font-size:16px;line-height:24px;`
export const Eyebrow = styled.span`display:block;margin-bottom:6px;color:${t.color.primary};font-size:11px;font-weight:600;line-height:14px;letter-spacing:.08em;text-transform:uppercase;`
export const HeaderActions = styled.div`display:flex;align-items:center;gap:10px;flex-wrap:wrap;`
export const Card = styled.section`
  border:1px solid color-mix(in srgb, ${t.color.line} 48%, transparent);border-radius:${t.radius.card}px;background:${t.color.surfaceLowest};box-shadow:${t.shadow.card};padding:24px;
`
export const FlatCard = styled.section`border:1px solid ${t.color.line};border-radius:${t.radius.card}px;background:${t.color.surfaceLowest};padding:20px;`
export const CardHeader = styled.div`display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:20px;`
export const CardTitle = styled.h2`margin:0;font-family:${t.typography.headline};font-size:20px;font-weight:600;line-height:28px;color:${t.color.ink};`
export const CardSub = styled.p`margin:4px 0 0;color:${t.color.textSecondary};font-size:14px;line-height:20px;`
export const Grid = styled.div<{$cols?:number}>`
  display:grid;grid-template-columns:repeat(${({$cols=2})=>$cols},minmax(0,1fr));gap:24px;
  @media(max-width:1100px){grid-template-columns:repeat(${({$cols=2})=>Math.min($cols,2)},minmax(0,1fr));gap:16px}
  @media(max-width:700px){grid-template-columns:1fr}
`
export const Split = styled.div`display:grid;grid-template-columns:minmax(0,1fr) minmax(340px,.72fr);gap:24px;align-items:start;@media(max-width:1080px){grid-template-columns:1fr}`
export const PrimaryButton = styled.a`
  display:inline-flex;min-height:40px;align-items:center;justify-content:center;gap:8px;border:0;border-radius:999px;background:${t.color.primary};color:${t.color.onPrimary};padding:0 18px;font-size:13px;font-weight:600;text-decoration:none;cursor:pointer;
  &:hover{opacity:.9} svg{flex:0 0 auto}
`
export const SecondaryButton = styled.a`
  display:inline-flex;min-height:40px;align-items:center;justify-content:center;gap:8px;border:1px solid ${t.color.line};border-radius:${t.radius.control}px;background:${t.color.surfaceLowest};color:${t.color.ink};padding:0 16px;font-size:13px;font-weight:600;text-decoration:none;cursor:pointer;
  &:hover{background:${t.color.surfaceLow};border-color:${t.color.lineStrong}} svg{flex:0 0 auto}
`
export const TextButton = styled.button`
  display:inline-flex;min-height:34px;align-items:center;gap:6px;border:0;background:transparent;color:${t.color.primary};padding:0;font-size:13px;font-weight:600;cursor:pointer;
`
export const Pill = styled.span<{$tone?:'green'|'blue'|'red'|'sand'|'neutral'}>`
  display:inline-flex;min-height:24px;align-items:center;justify-content:center;gap:4px;border-radius:999px;padding:3px 9px;font-size:11px;font-weight:600;white-space:nowrap;
  ${({$tone='neutral'})=>{
    if($tone==='green')return `background:${t.color.primarySoft};color:${t.color.primary};`
    if($tone==='blue')return `background:${t.color.secondarySoft};color:${t.color.secondary};`
    if($tone==='red')return `background:${t.color.errorSoft};color:${t.color.error};`
    if($tone==='sand')return `background:${t.color.tertiarySoft};color:${t.color.tertiary};`
    return `background:${t.color.surfaceContainer};color:${t.color.textSecondary};`
  }}
`
export const StatGrid = styled.div`display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:24px;margin-bottom:24px;@media(max-width:1180px){grid-template-columns:repeat(2,1fr);gap:16px}@media(max-width:620px){grid-template-columns:1fr}`
export const StatCard = styled(Card)`display:flex;min-height:150px;flex-direction:column;justify-content:space-between;gap:16px;transition:transform .2s ease,box-shadow .2s ease;&:hover{transform:translateY(-2px);box-shadow:${t.shadow.cardHover}}`
export const StatTop = styled.div`display:flex;align-items:center;justify-content:space-between;gap:12px;`
export const IconTile = styled.span<{$tone?:'green'|'blue'|'red'|'sand'}>`
  display:grid;width:44px;height:44px;place-items:center;border-radius:8px;background:${({$tone='green'})=>$tone==='blue'?`${t.color.secondaryContainer}55`:$tone==='red'?`${t.color.errorSoft}66`:$tone==='sand'?`${t.color.tertiarySoft}99`:`${t.color.primarySoft}88`};color:${({$tone='green'})=>$tone==='blue'?t.color.secondary:$tone==='red'?t.color.error:$tone==='sand'?t.color.tertiary:t.color.primary};
  svg{width:24px;height:24px}
`
export const StatLabel = styled.div`color:${t.color.textSecondary};font-size:13px;font-weight:600;line-height:16px;`
export const StatValue = styled.div`margin-top:5px;font-family:${t.typography.headline};font-size:24px;font-weight:600;line-height:32px;color:${t.color.ink};font-variant-numeric:tabular-nums;`
export const Toolbar = styled.div`display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:20px;`
export const SearchBox = styled.label`position:relative;display:block;min-width:260px;max-width:460px;flex:1;> svg{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:${t.color.lineStrong};pointer-events:none}`
export const SearchInput = styled.input`width:100%;height:40px;border:1px solid transparent!important;border-radius:999px!important;background:${t.color.surfaceLow};padding:0 15px 0 44px;color:${t.color.ink};font-family:${t.typography.family};font-size:14px;&:focus{border-color:${t.color.primary}!important;box-shadow:0 0 0 1px ${t.color.primary}!important;outline:0}`
export const Table = styled.div`overflow:hidden;border:1px solid ${t.color.line};border-radius:${t.radius.card}px;background:${t.color.surfaceLowest};`
export const Row = styled.div<{$selected?:boolean}>`
  display:grid;grid-template-columns:minmax(0,1.4fr) minmax(120px,.7fr) minmax(110px,.55fr) minmax(90px,.4fr);gap:16px;align-items:center;min-height:68px;border-bottom:1px solid ${t.color.line};background:${({$selected})=>$selected?t.color.surfaceLow:t.color.surfaceLowest};padding:12px 16px;cursor:pointer;&:last-child{border-bottom:0}&:hover{background:${t.color.surfaceLow}}@media(max-width:760px){grid-template-columns:1fr auto;> *:nth-child(2),> *:nth-child(3){display:none}}
`
export const RowMain = styled.div`display:flex;min-width:0;align-items:center;gap:12px;`
export const Thumb = styled.div`display:grid;width:46px;height:46px;flex:0 0 46px;overflow:hidden;place-items:center;border-radius:8px;background:${t.color.surfaceContainer};color:${t.color.primary};img{width:100%;height:100%;object-fit:cover}svg{width:22px;height:22px}`
export const RowTitle = styled.div`overflow:hidden;color:${t.color.ink};font-size:14px;font-weight:600;line-height:20px;text-overflow:ellipsis;white-space:nowrap;`
export const RowMeta = styled.div`margin-top:2px;color:${t.color.textSecondary};font-size:12px;line-height:17px;`
export const Divider = styled.hr`height:1px;border:0;background:${t.color.line};margin:20px 0;`
export const InfoGrid = styled.div`display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;@media(max-width:580px){grid-template-columns:1fr}`
export const InfoLabel = styled.div`color:${t.color.textSecondary};font-size:11px;font-weight:600;line-height:14px;letter-spacing:.04em;text-transform:uppercase;`
export const InfoValue = styled.div`margin-top:5px;color:${t.color.ink};font-size:14px;font-weight:500;line-height:20px;`
export const Empty = styled.div`display:grid;min-height:180px;place-items:center;border:1px dashed ${t.color.line};border-radius:${t.radius.card}px;background:${t.color.surfaceLow};padding:24px;color:${t.color.textSecondary};text-align:center;`
export const MiniBars = styled.div`display:flex;height:130px;align-items:flex-end;gap:12px;border-radius:${t.radius.card}px;background:${t.color.surfaceLow};padding:20px 18px 0;`
export const Bar = styled.i<{$h:number;$active?:boolean}>`display:block;flex:1;height:${({$h})=>$h}%;border-radius:7px 7px 0 0;background:${({$active})=>$active?t.color.primary:`${t.color.primaryContainer}35`};min-width:12px;`
export const DetailPanel = styled(Card)`position:sticky;top:${t.layout.header + 16}px;@media(max-width:1080px){position:static}`
export const Timeline = styled.div`display:grid;gap:0;`
export const TimelineItem = styled.div`position:relative;padding:0 0 20px 26px;&::before{content:'';position:absolute;left:7px;top:7px;bottom:-7px;width:1px;background:${t.color.line}}&:last-child::before{display:none}&::after{content:'';position:absolute;left:3px;top:5px;width:9px;height:9px;border-radius:50%;background:${t.color.primary}}`
export const SectionLabel = styled.div`margin-bottom:10px;color:${t.color.textSecondary};font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;`
export const Chips = styled.div`display:flex;gap:8px;flex-wrap:wrap;`
export const Chip = styled.span`display:inline-flex;align-items:center;gap:5px;border:1px solid ${t.color.line};border-radius:999px;background:${t.color.surfaceLow};padding:5px 10px;color:${t.color.textSecondary};font-size:12px;font-weight:500;`

export function MaterialIcon({children}: {children: ReactNode}) {
  const name = typeof children === 'string' ? children : String(children ?? 'info')
  return <CmsIcon name={name} size={22} />
}
export function money(cents?: number) { return typeof cents === 'number' ? (cents/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}) : 'Sob consulta' }
export function dateBR(value?: string) { if(!value)return '—'; const d=new Date(value); return Number.isNaN(d.getTime())?'—':d.toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'}) }
export function shortDate(value?: string) { if(!value)return '—'; const d=new Date(value); return Number.isNaN(d.getTime())?'—':d.toLocaleDateString('pt-BR',{day:'2-digit',month:'short'}) }
