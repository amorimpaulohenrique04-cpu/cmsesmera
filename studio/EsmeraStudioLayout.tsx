import {type LayoutProps} from 'sanity'
import {createGlobalStyle} from 'styled-components'
import {esmeraTokens as t} from './esmeraTokens'

const EsmeraGlobalStyle = createGlobalStyle`
  :root {
    color-scheme: light;
    --esmera-ink: ${t.color.ink};
    --esmera-graphite: ${t.color.graphite};
    --esmera-ivory: ${t.color.ivory};
    --esmera-surface: ${t.color.surface};
    --esmera-sand: ${t.color.sand};
    --esmera-line: ${t.color.line};
    --esmera-line-strong: ${t.color.lineStrong};
    --esmera-emerald: ${t.color.emerald};
    --esmera-text-secondary: ${t.color.textSecondary};
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  html,
  body,
  #sanity {
    min-height: 100%;
    background: ${t.color.ivory};
  }

  body,
  button,
  input,
  textarea,
  select {
    font-family: ${t.typography.family};
    font-synthesis: none;
  }

  body {
    margin: 0;
    color: ${t.color.ink};
    font-size: ${t.typography.body.size}px;
    line-height: ${t.typography.body.lineHeight}px;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
  }

  ::selection {
    background: rgba(47, 107, 84, 0.18);
    color: ${t.color.ink};
  }

  :focus-visible {
    outline: 2px solid ${t.color.emerald};
    outline-offset: 2px;
  }

  [data-ui='Card'] {
    border-radius: ${t.radius.control}px;
  }

  [data-ui='Button'] {
    min-height: 40px;
    border-radius: ${t.radius.control}px;
    box-shadow: none !important;
    font-weight: 500;
    letter-spacing: 0;
    text-transform: none;
    transition:
      background-color ${t.motion.fast} ${t.motion.easing},
      border-color ${t.motion.fast} ${t.motion.easing},
      color ${t.motion.fast} ${t.motion.easing},
      opacity ${t.motion.fast} ${t.motion.easing};
  }

  [data-ui='Button']:hover,
  [data-ui='Button']:active {
    transform: none !important;
  }

  [data-ui='TextInput'],
  [data-ui='TextArea'],
  [data-ui='Select'] {
    border-radius: ${t.radius.input}px;
  }

  [data-ui='TextInput'] input,
  [data-ui='Select'] select {
    min-height: 44px;
  }

  input,
  textarea,
  select {
    border-radius: ${t.radius.input}px !important;
  }

  [data-ui='Badge'] {
    border-radius: ${t.radius.status}px;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0;
  }

  [data-ui='Dialog'] {
    border-radius: ${t.radius.overlay}px;
    box-shadow: ${t.shadow.modal} !important;
  }

  [data-ui='Popover'],
  [data-ui='Menu'] {
    border-radius: ${t.radius.overlay}px;
    box-shadow: ${t.shadow.popover} !important;
  }

  [data-ui='Tooltip'] {
    border-radius: ${t.radius.control}px;
  }

  [data-ui='Skeleton'] {
    border-radius: ${t.radius.control}px;
  }

  [data-ui='Stack'] > hr,
  hr {
    border-color: ${t.color.line};
  }

  a,
  button {
    -webkit-tap-highlight-color: transparent;
  }

  * {
    scrollbar-color: ${t.color.lineStrong} ${t.color.ivory};
    scrollbar-width: thin;
  }

  *::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  *::-webkit-scrollbar-track {
    background: ${t.color.ivory};
  }

  *::-webkit-scrollbar-thumb {
    border: 3px solid ${t.color.ivory};
    border-radius: 999px;
    background: ${t.color.lineStrong};
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      scroll-behavior: auto !important;
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`

export function EsmeraStudioLayout(props: LayoutProps) {
  return (
    <>
      <EsmeraGlobalStyle />
      {props.renderDefault(props)}
    </>
  )
}
