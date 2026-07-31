import {type NavbarProps, useWorkspace} from 'sanity'
import styled from 'styled-components'
import {esmeraTokens as t} from './esmeraTokens'

const NavbarShell = styled.div`
  display: grid;
  grid-template-columns: ${t.layout.sidebar}px minmax(0, 1fr);
  min-height: ${t.layout.header}px;
  border-bottom: 1px solid ${t.color.line};
  background: ${t.color.surface};

  @media (max-width: 1279px) {
    grid-template-columns: 208px minmax(0, 1fr);
  }

  @media (max-width: 767px) {
    grid-template-columns: 112px minmax(0, 1fr);
  }
`

const Brand = styled.div`
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: ${t.layout.header}px;
  border-right: 1px solid ${t.color.graphite};
  background: ${t.color.ink};
  padding: 0 16px;
  color: ${t.color.ivory};
`

const BrandName = styled.div`
  flex: 0 0 auto;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.08em;
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

  @media (max-width: 767px) {
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
