import {useEffect} from 'react'
import {type ActiveToolLayoutProps} from 'sanity'
import styled from 'styled-components'
import {esmeraTokens as t} from './esmeraTokens'

const Frame = styled.div`
  position: relative;
  min-height: 0;
  height: 100%;
  background: ${t.color.surface};

  &[data-esmera-tool='cms'] {
    [data-ui='Pane'] { border-color: ${t.color.line} !important; background: ${t.color.surface}; }
    [data-ui='Pane']:not(:last-of-type) { display: none !important; }
    [data-ui='Pane']:last-of-type { flex: 1 1 100% !important; width: 100% !important; max-width: none !important; }
  }
`
export function EsmeraActiveToolLayout(props: ActiveToolLayoutProps) {
  useEffect(() => {
    if (props.activeTool.name !== 'cms' || typeof window === 'undefined') return
    const path = window.location.pathname.replace(/\/$/, '')
    if (path === '/site/cms') window.location.replace('/site/cms/dashboard')
    if (path === '/business/cms') window.location.replace('/business/cms/customers')
  }, [props.activeTool.name])
  return <Frame data-esmera-tool={props.activeTool.name}>{props.renderDefault(props)}</Frame>
}
