import type {ReactNode} from 'react'
import {useClient} from 'sanity'
import {Header, Page, Shell, Subtitle, Title} from '../stitch/StitchUI'
import {API_VERSION, ErrorState, LoadingState, useQueryState} from './shared'

export function BusinessHealthGate({children}: {children: ReactNode}) {
  const client = useClient({apiVersion: API_VERSION})
  const health = useQueryState<number>(client, 'count(*)')

  if (health.state.status === 'loading') {
    return <Page><Shell><Header><div><Title>Business Desk</Title><Subtitle>Validando acesso à fonte comercial.</Subtitle></div></Header><LoadingState label="Validando dataset Business" /></Shell></Page>
  }

  if (health.state.status === 'error') {
    return <Page><Shell><Header><div><Title>Business Desk</Title><Subtitle>A fonte comercial precisa estar disponível antes de exibir qualquer indicador.</Subtitle></div></Header><ErrorState code={health.state.code} detail={health.state.message} onRetry={health.retry} /></Shell></Page>
  }

  return children
}
