import {Card, Flex, Text} from '@sanity/ui'
import {type NavbarProps, useWorkspace} from 'sanity'

export function EsmeraNavbar(props: NavbarProps) {
  const {dataset} = useWorkspace()
  const workspaceLabel =
    dataset === 'business' ? 'BUSINESS DESK / PRIVADO' : 'SANITY CMS / SITE'

  return (
    <>
      <Card
        padding={3}
        style={{
          background: '#173E35',
          borderBottom: '1px solid #31574F',
          color: '#F3F0E8',
        }}
      >
        <Flex align="center" gap={3} justify="space-between">
          <Text
            size={1}
            weight="bold"
            style={{color: '#F3F0E8', letterSpacing: '0.1em'}}
          >
            ESMÉRA
          </Text>
          <Text
            size={1}
            style={{color: '#B9CBC5', letterSpacing: '0.06em'}}
          >
            {workspaceLabel}
          </Text>
        </Flex>
      </Card>

      {props.renderDefault(props)}
    </>
  )
}
