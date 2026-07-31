import {type ActiveToolLayoutProps} from 'sanity'
import styled from 'styled-components'
import {esmeraTokens as t} from './esmeraTokens'

const Frame = styled.div`
  position: relative;
  min-height: 0;
  height: 100%;
  background: ${t.color.surface};
  color: ${t.color.ink};
  font-family: ${t.typography.family};

  &[data-esmera-tool='documents'] {
    [data-ui='Pane'] {
      border-color: color-mix(in srgb, ${t.color.line} 72%, transparent);
      background: ${t.color.surface};
    }

    [data-testid='document-panel-scroller'] {
      background: ${t.color.surface};
    }

    [data-testid='document-panel-scroller'] > div {
      width: min(1180px, 100%);
      margin-inline: auto;
    }

    [data-testid='document-panel-scroller'] [data-ui='Card'] {
      border-radius: ${t.radius.card}px;
    }

    [data-testid='document-panel-scroller'] [data-ui='TabList'] {
      gap: 4px;
      border-bottom: 1px solid ${t.color.line};
      padding-inline: 8px;
    }

    [data-testid='document-panel-scroller'] [data-ui='Tab'] {
      border-radius: ${t.radius.control}px ${t.radius.control}px 0 0;
      font-family: ${t.typography.family};
      font-size: 13px;
      font-weight: 600;
    }

    [data-testid='document-panel-scroller'] label {
      color: ${t.color.textSecondary};
      font-family: ${t.typography.family};
      font-size: 13px;
      font-weight: 600;
    }

    [data-testid='document-panel-scroller'] input,
    [data-testid='document-panel-scroller'] textarea,
    [data-testid='document-panel-scroller'] select {
      font-family: ${t.typography.family};
    }
  }
`

export function EsmeraActiveToolLayout(props: ActiveToolLayoutProps) {
  return <Frame data-esmera-tool={props.activeTool.name}>{props.renderDefault(props)}</Frame>
}
