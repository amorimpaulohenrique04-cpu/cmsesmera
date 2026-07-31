import {type NavbarProps, useWorkspace} from 'sanity'
import styled from 'styled-components'
import {esmeraTokens as t} from './esmeraTokens'

const NavbarShell = styled.div`
  display: grid;
  grid-template-columns: ${t.layout.sidebar}px minmax(0, 1fr);
  min-height: ${t.layout.header}px;
  border-bottom: 1px solid ${t.color.line};
  background: ${t.color.surface};

  @media (max-width: 1439px) {
    grid-template-columns: 240px minmax(0, 1fr);
    min-height: 72px;
  }

  @media (max-width: 1199px) {
    grid-template-columns: 216px minmax(0, 1fr);
  }

  @media (max-width: 1023px) {
    grid-template-columns: 84px minmax(0, 1fr);
    min-height: 68px;
  }

  @media (max-width: 767px) {
    grid-template-columns: 72px minmax(0, 1fr);
    min-height: 64px;
  }
`

const Brand = styled.div`
  display: flex;
  min-width: 0;
  min-height: ${t.layout.header}px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-right: 0;
  background: ${t.color.ink};
  padding: 0 24px;
  color: ${t.color.surface};

  @media (max-width: 1439px) {
    min-height: 72px;
    padding: 0 20px;
  }

  @media (max-width: 1023px) {
    min-height: 68px;
    justify-content: center;
    padding: 0 12px;
  }

  @media (max-width: 767px) {
    min-height: 64px;
    padding: 0 10px;
  }
`

const BrandName = styled.div`
  flex: 0 0 auto;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.08em;
  line-height: 1;

  @media (max-width: 767px) {
    font-size: 11px;
    letter-spacing: 0.06em;
  }
`

const Workspace = styled.div`
  min-width: 0;
  overflow: hidden;
  color: #b7b4ab;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.07em;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;

  @media (max-width: 1023px) {
    display: none;
  }
`

const DefaultNavigation = styled.div`
  min-width: 0;
  min-height: ${t.layout.header}px;
  overflow: hidden;
  background: ${t.color.surface};

  > * {
    min-height: ${t.layout.header}px !important;
    border: 0 !important;
    background: ${t.color.surface} !important;
    box-shadow: none !important;
  }

  [data-ui='Button'] {
    min-height: 40px;
    border-radius: ${t.radius.navItem}px !important;
    box-shadow: none !important;
  }

  [data-ui='Button'][data-selected='true'],
  [data-ui='Button'][aria-selected='true'],
  [data-ui='Button'][aria-current='page'] {
    background: ${t.color.emeraldSoft} !important;
    color: ${t.color.ink} !important;
  }

  @media (max-width: 1439px) {
    min-height: 72px;

    > * {
      min-height: 72px !important;
    }
  }

  @media (max-width: 1023px) {
    min-height: 68px;

    > * {
      min-height: 68px !important;
    }
  }

  @media (max-width: 767px) {
    min-height: 64px;

    > * {
      min-height: 64px !important;
    }
  }
`

export function EsmeraNavbar(props: NavbarProps) {
  const {dataset} = useWorkspace()
  const workspaceLabel = dataset === 'business' ? 'Business Desk / privado' : 'CMS / site'

  return (
    <NavbarShell>
      <Brand>
        <BrandName>ESMÉRA</BrandName>
        <Workspace>{workspaceLabel}</Workspace>
      </Brand>
      <DefaultNavigation>{props.renderDefault(props)}</DefaultNavigation>
    </NavbarShell>
  )
}
