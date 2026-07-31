import {type LayoutProps} from 'sanity'
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

const Content = styled.div`
  min-width: 0;
  min-height: 100vh;
  margin-left: ${t.layout.sidebar}px;
  background: ${t.color.surface};
  color: ${t.color.ink};
  font-family: ${t.typography.family};

  @media (max-width: 1023px) {
    margin-left: ${t.layout.sidebarTablet}px;
  }

  @media (max-width: 720px) {
    margin-left: 0;
  }
`

export function EsmeraStudioLayout(props: LayoutProps) {
  return (
    <CmsShellProvider>
      <Global />
      <StitchSidebar />
      <Content>{props.renderDefault(props)}</Content>
    </CmsShellProvider>
  )
}
