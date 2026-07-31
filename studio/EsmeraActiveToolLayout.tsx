import {type ActiveToolLayoutProps} from 'sanity'
import styled from 'styled-components'
import {esmeraTokens as t} from './esmeraTokens'

const Frame = styled.div`
  position: relative;
  min-height: 0;
  height: 100%;
  background: ${t.color.surface};
`

export function EsmeraActiveToolLayout(props: ActiveToolLayoutProps) {
  return <Frame data-esmera-tool={props.activeTool.name}>{props.renderDefault(props)}</Frame>
}
