import {useEffect, type ReactNode} from 'react'
import {type LayoutProps} from 'sanity'
import {useRouter} from 'sanity/router'
import styled, {createGlobalStyle} from 'styled-components'
import {CmsShellProvider} from './CmsShellContext'
import {esmeraTokens as t} from './esmeraTokens'
import {StitchSidebar} from './stitch/StitchSidebar'

const FONT_STYLESHEET_ID = 'esmera-stitch-fonts'
const FONT_URL =
  'https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600&family=Manrope:wght@400;500;600;700;800&display=swap'

const Global = createGlobalStyle`
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

  button, input, select, textarea {
    font: inherit;
  }

  ::selection {
    background: ${t.color.primarySoft};
    color: ${t.color.ink};
  }

  :focus-visible {
    outline: 2px solid ${t.color.primary};
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      scroll-behavior: auto !important;
      animation-duration: .01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: .01ms !important;
    }
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

function DocumentContract({children}: {children: ReactNode}) {
  useEffect(() => {
    document.documentElement.lang = 'pt-BR'

    if (!document.getElementById(FONT_STYLESHEET_ID)) {
      const link = document.createElement('link')
      link.id = FONT_STYLESHEET_ID
      link.rel = 'stylesheet'
      link.href = FONT_URL
      document.head.appendChild(link)
    }
  }, [])

  return children
}

export function EsmeraStudioLayout(props: LayoutProps) {
  useRouter()
  const pathname = typeof window === 'undefined' ? '' : window.location.pathname
  const isCmsTool = /\/(site|business)\/cms(?:\/|$)/.test(pathname)

  return (
    <CmsShellProvider>
      <DocumentContract>
        <Global />
        {isCmsTool ? <StitchSidebar /> : null}
        <Content $withSidebar={isCmsTool}>{props.renderDefault(props)}</Content>
      </DocumentContract>
    </CmsShellProvider>
  )
}
