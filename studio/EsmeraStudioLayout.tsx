import {type LayoutProps} from 'sanity'
import {useRouter} from 'sanity/router'
import styled, {createGlobalStyle} from 'styled-components'
import {CmsShellProvider} from './CmsShellContext'
import {esmeraTokens as t} from './esmeraTokens'
import {StitchSidebar} from './stitch/StitchSidebar'

const Global = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  :root {
    color-scheme: light;
    --esmera-primary: ${t.color.primary};
    --esmera-surface: ${t.color.surface};
    --esmera-line: ${t.color.line};
  }

  html, body, #sanity {
    min-height: 100%;
    background: ${t.color.surface};
  }

  body {
    margin: 0;
    color: ${t.color.ink};
    font-family: ${t.typography.family};
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
  }

  ::selection {
    background: ${t.color.primarySoft};
    color: ${t.color.ink};
  }
`

const Content = styled.div<{$withSidebar: boolean}>`
  min-width: 0;
  min-height: 100vh;
  margin-left: ${({$withSidebar}) => ($withSidebar ? `${t.layout.sidebar}px` : '0')};
  background: ${t.color.surface};
  color: ${t.color.ink};
  font-family: ${t.typography.family};

  @media (max-width: 1023px) {
    margin-left: ${({$withSidebar}) => ($withSidebar ? `${t.layout.sidebarTablet}px` : '0')};
  }

  @media (max-width: 720px) {
    margin-left: 0;
  }
`

export function EsmeraStudioLayout(props: LayoutProps) {
  useRouter()
  const pathname = typeof window === 'undefined' ? '' : window.location.pathname
  const isCmsTool = /\/(site|business)\/cms(?:\/|$)/.test(pathname)

  return (
    <CmsShellProvider>
      <Global />
      {isCmsTool ? <StitchSidebar /> : null}
      <Content $withSidebar={isCmsTool}>{props.renderDefault(props)}</Content>
    </CmsShellProvider>
  )
}
