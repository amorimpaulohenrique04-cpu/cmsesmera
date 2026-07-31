import {type LayoutProps} from 'sanity'
import styled, {createGlobalStyle} from 'styled-components'
import {esmeraTokens as t} from './esmeraTokens'
import {StitchSidebar} from './stitch/StitchSidebar'

const Global = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600&family=Manrope:wght@400;500;600;700;800&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');
  :root { color-scheme: light; --esmera-primary:${t.color.primary}; --esmera-surface:${t.color.surface}; --esmera-line:${t.color.line}; }
  *,*::before,*::after{box-sizing:border-box}
  html,body,#sanity{min-height:100%;background:${t.color.surface}}
  body,button,input,textarea,select{font-family:${t.typography.family};font-synthesis:none}
  body{margin:0;color:${t.color.ink};font-size:16px;line-height:24px;text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased}
  .material-symbols-outlined{font-family:'Material Symbols Outlined';font-weight:normal;font-style:normal;line-height:1;letter-spacing:normal;text-transform:none;display:inline-block;white-space:nowrap;word-wrap:normal;direction:ltr;-webkit-font-feature-settings:'liga';-webkit-font-smoothing:antialiased;font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24}
  ::selection{background:${t.color.primarySoft};color:${t.color.ink}}
  :focus-visible{outline:2px solid ${t.color.primary};outline-offset:2px}
  [data-ui='Button']{border-radius:8px!important;box-shadow:none!important;font-weight:600;}
  [data-ui='TextInput'],[data-ui='TextArea'],[data-ui='Select']{border-radius:8px!important;background:${t.color.surfaceLow}!important}
  input,textarea,select{border-radius:8px!important}
  [data-ui='Dialog'],[data-ui='Popover'],[data-ui='Menu']{border-radius:12px!important;box-shadow:${t.shadow.popover}!important}
  [data-ui='Card']{border-color:${t.color.line}}
  [data-testid='document-panel-scroller'], [data-ui='Pane'] [data-ui='Layer'] { background:${t.color.surface}; }
  [data-testid='document-panel-scroller'] > div { max-width: 1180px; margin-inline:auto; }
  [data-testid='document-panel-scroller'] [data-ui='Card'] { border-radius:12px; }
  [data-testid='document-panel-scroller'] [data-ui='TabList'] { gap:4px; border-bottom:1px solid ${t.color.line}; padding:0 8px; }
  [data-testid='document-panel-scroller'] [data-ui='Tab'] { border-radius:8px 8px 0 0!important; font-size:13px; font-weight:600; }
  [data-testid='document-panel-scroller'] label { color:${t.color.textSecondary}; font-size:13px; font-weight:600; }
  [data-testid='document-panel-scroller'] [data-ui='Stack'] { --card-bg-color:${t.color.surfaceLowest}; }
  [data-testid='document-panel-scroller'] [data-ui='TextInput'],
  [data-testid='document-panel-scroller'] [data-ui='TextArea'],
  [data-testid='document-panel-scroller'] [data-ui='Select'] { border:1px solid ${t.color.line}!important; background:${t.color.surfaceLow}!important; }
  [data-testid='document-panel-scroller'] [data-ui='TextInput']:focus-within,
  [data-testid='document-panel-scroller'] [data-ui='TextArea']:focus-within { box-shadow:0 0 0 1px ${t.color.primary}!important; }
  *{scrollbar-color:${t.color.lineStrong} ${t.color.surface};scrollbar-width:thin}
  *::-webkit-scrollbar{width:9px;height:9px} *::-webkit-scrollbar-track{background:${t.color.surface}} *::-webkit-scrollbar-thumb{border:3px solid ${t.color.surface};border-radius:999px;background:${t.color.lineStrong}}
  @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
`
const Content = styled.div`
  min-height:100vh;
  margin-left:${t.layout.sidebar}px;
  background:${t.color.surface};
  @media(max-width:1023px){margin-left:84px}
  @media(max-width:720px){margin-left:72px}
`
export function EsmeraStudioLayout(props: LayoutProps) {
  return <><Global/><StitchSidebar/><Content>{props.renderDefault(props)}</Content></>
}
