import {type ActiveToolLayoutProps} from 'sanity'
import styled from 'styled-components'
import {esmeraTokens as t} from './esmeraTokens'

const ActiveToolFrame = styled.div`
  position: relative;
  min-height: 0;
  height: 100%;
  background: ${t.color.canvas};

  &[data-esmera-tool='cms'] {
    [data-ui='Pane'] {
      border-color: ${t.color.line} !important;
      background: ${t.color.surface};
    }

    [data-ui='Pane']:first-of-type {
      flex: 0 0 ${t.layout.sidebar}px !important;
      width: ${t.layout.sidebar}px !important;
      max-width: ${t.layout.sidebar}px !important;
      background: ${t.color.surface};
    }

    [data-ui='Pane']:first-of-type nav {
      padding-right: 12px;
      padding-left: 12px;
    }

    [data-ui='Pane']:first-of-type nav [data-ui='Button'],
    [data-ui='Pane']:first-of-type nav [role='button'] {
      min-height: 44px;
      border-radius: ${t.radius.navItem}px !important;
      box-shadow: none !important;
      transition:
        background-color ${t.motion.fast} ${t.motion.easing},
        color ${t.motion.fast} ${t.motion.easing};
    }

    [data-ui='Pane']:first-of-type nav [data-ui='Button']:hover,
    [data-ui='Pane']:first-of-type nav [role='button']:hover {
      background: rgba(73, 107, 89, 0.07) !important;
      transform: none !important;
    }

    [data-ui='Pane']:first-of-type nav [data-ui='Button'][data-selected='true'],
    [data-ui='Pane']:first-of-type nav [data-ui='Button'][aria-selected='true'],
    [data-ui='Pane']:first-of-type nav [data-ui='Button'][aria-current='page'],
    [data-ui='Pane']:first-of-type nav [role='button'][data-selected='true'],
    [data-ui='Pane']:first-of-type nav [role='button'][aria-selected='true'],
    [data-ui='Pane']:first-of-type nav [role='button'][aria-current='page'] {
      background: ${t.color.emeraldSoft} !important;
      color: ${t.color.ink} !important;
    }

    [data-ui='Pane']:first-of-type nav svg {
      width: 18px;
      height: 18px;
    }

    [data-ui='Pane']:first-of-type hr {
      margin-top: 10px;
      margin-bottom: 10px;
      border-color: ${t.color.line};
    }
  }

  @media (max-width: 1439px) and (min-width: 1200px) {
    &[data-esmera-tool='cms'] [data-ui='Pane']:first-of-type {
      flex-basis: 240px !important;
      width: 240px !important;
      max-width: 240px !important;
    }
  }

  @media (max-width: 1199px) and (min-width: 1024px) {
    &[data-esmera-tool='cms'] [data-ui='Pane']:first-of-type {
      flex-basis: 216px !important;
      width: 216px !important;
      max-width: 216px !important;
    }
  }

  @media (max-width: 1023px) {
    &[data-esmera-tool='cms'] [data-ui='Pane']:first-of-type {
      width: auto !important;
      max-width: none !important;
      flex-basis: auto !important;
    }
  }
`

export function EsmeraActiveToolLayout(props: ActiveToolLayoutProps) {
  return (
    <ActiveToolFrame data-esmera-tool={props.activeTool.name}>
      {props.renderDefault(props)}
    </ActiveToolFrame>
  )
}
