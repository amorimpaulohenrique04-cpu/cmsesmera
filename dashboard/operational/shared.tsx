import {useEffect, useMemo, useRef, useState, type ReactNode} from 'react'
import type {SanityClient} from 'sanity'
import {useIntentLink} from 'sanity/router'
import styled from 'styled-components'
import {esmeraTokens as t} from '../../studio/esmeraTokens'
import {Card, CardSub, CardTitle, MaterialIcon} from '../stitch/StitchUI'

export const API_VERSION = '2026-07-31'

export type LoadErrorCode = 'missing_dataset' | 'forbidden' | 'query_failed'
export type LoadState<T> =
  | {status: 'loading'}
  | {status: 'ready'; data: T; updatedAt: Date}
  | {status: 'empty'; data: T; updatedAt: Date}
  | {status: 'error'; code: LoadErrorCode; message: string}

export function classifySanityError(reason: unknown): {code: LoadErrorCode; message: string} {
  const error = reason as {message?: string; statusCode?: number; response?: {statusCode?: number}}
  const message = error?.message || 'A consulta não pôde ser concluída.'
  const status = error?.statusCode || error?.response?.statusCode
  const normalized = message.toLowerCase()

  if (normalized.includes('dataset') && normalized.includes('not found')) {
    return {code: 'missing_dataset', message}
  }
  if (status === 401 || status === 403 || normalized.includes('permission') || normalized.includes('forbidden')) {
    return {code: 'forbidden', message}
  }
  return {code: 'query_failed', message}
}

export function useQueryState<T>(
  client: SanityClient,
  query: string,
  params: Record<string, unknown> = {},
  isEmpty?: (data: T) => boolean,
) {
  const paramsKey = JSON.stringify(params)
  const stableParams = useMemo(
    () => JSON.parse(paramsKey) as Record<string, unknown>,
    [paramsKey],
  )
  const emptyCheckRef = useRef(isEmpty)
  emptyCheckRef.current = isEmpty
  const [state, setState] = useState<LoadState<T>>({status: 'loading'})
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    let active = true
    setState({status: 'loading'})

    client
      .fetch<T>(query, stableParams)
      .then((data) => {
        if (!active) return
        const updatedAt = new Date()
        const empty = emptyCheckRef.current
          ? emptyCheckRef.current(data)
          : Array.isArray(data)
            ? data.length === 0
            : data === null || data === undefined
        setState(empty ? {status: 'empty', data, updatedAt} : {status: 'ready', data, updatedAt})
      })
      .catch((reason: unknown) => {
        if (!active) return
        const parsed = classifySanityError(reason)
        setState({status: 'error', ...parsed})
      })

    return () => {
      active = false
    }
  }, [client, query, stableParams, revision])

  return {state, retry: () => setRevision((value) => value + 1)}
}

const FeedbackCard = styled(Card)`
  display: grid;
  min-height: 220px;
  place-items: center;
  text-align: center;
`

const FeedbackInner = styled.div`
  display: grid;
  max-width: 620px;
  justify-items: center;
  gap: 12px;
`

const RetryButton = styled.button`
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: 999px;
  background: ${t.color.primary};
  color: ${t.color.onPrimary};
  padding: 0 18px;
  font-weight: 600;
  cursor: pointer;
`

const SkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;

  @media (max-width: 1100px) { grid-template-columns: repeat(2, 1fr); gap: 16px; }
  @media (max-width: 620px) { grid-template-columns: 1fr; }
`

const Skeleton = styled.div`
  min-height: 150px;
  border-radius: ${t.radius.card}px;
  background: linear-gradient(90deg, ${t.color.surfaceLow}, ${t.color.surfaceContainer}, ${t.color.surfaceLow});
  background-size: 200% 100%;
  animation: esmera-shimmer 1.3s linear infinite;

  @keyframes esmera-shimmer {
    from { background-position: 200% 0; }
    to { background-position: -200% 0; }
  }
`

export function LoadingState({label = 'Carregando dados'}: {label?: string}) {
  return (
    <div aria-busy="true" aria-label={label}>
      <SkeletonGrid>
        <Skeleton />
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </SkeletonGrid>
    </div>
  )
}

export function ErrorState({
  code,
  detail,
  onRetry,
}: {
  code: LoadErrorCode
  detail?: string
  onRetry?: () => void
}) {
  const copy =
    code === 'missing_dataset'
      ? {
          title: 'Dados comerciais indisponíveis',
          text: 'O dataset Business não existe neste projeto ou não está disponível neste ambiente. Nenhum indicador foi convertido em zero.',
        }
      : code === 'forbidden'
        ? {
            title: 'Acesso ao Business não autorizado',
            text: 'O usuário atual não possui permissão para consultar o dataset Business. Revise os papéis no Sanity.',
          }
        : {
            title: 'Não foi possível carregar os dados',
            text: 'A fonte respondeu com erro. Tente novamente e consulte o log técnico se o problema persistir.',
          }

  return (
    <FeedbackCard role="alert">
      <FeedbackInner>
        <MaterialIcon>warning</MaterialIcon>
        <CardTitle>{copy.title}</CardTitle>
        <CardSub>{copy.text}</CardSub>
        {detail ? <CardSub>{detail}</CardSub> : null}
        {onRetry ? (
          <RetryButton type="button" onClick={onRetry}>
            <MaterialIcon>refresh</MaterialIcon>
            Tentar novamente
          </RetryButton>
        ) : null}
      </FeedbackInner>
    </FeedbackCard>
  )
}

export function formatUpdatedAt(value: Date) {
  return value.toLocaleString('pt-BR', {day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'})
}

export const KpiMeta = styled.div`
  margin-top: 10px;
  color: ${t.color.lineStrong};
  font-size: 11px;
  line-height: 16px;
`

export function IntentAction({
  type,
  id,
  children,
  className,
  title,
}: {
  type: string
  id?: string
  children: ReactNode
  className?: string
  title?: string
}) {
  const link = useIntentLink({
    intent: id ? 'edit' : 'create',
    params: id ? {id: id.replace(/^drafts\./, ''), type} : {type},
  })
  return (
    <a className={className} href={link.href} onClick={link.onClick} title={title}>
      {children}
    </a>
  )
}

export const PrimaryIntentAction = styled(IntentAction)`
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 999px;
  background: ${t.color.primary};
  color: ${t.color.onPrimary};
  padding: 0 18px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
`

export const SecondaryIntentAction = styled(IntentAction)`
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid ${t.color.line};
  border-radius: ${t.radius.control}px;
  background: ${t.color.surfaceLowest};
  color: ${t.color.ink};
  padding: 0 16px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;

  &:hover { background: ${t.color.surfaceLow}; }
`

export const NativeButton = styled.button`
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid ${t.color.line};
  border-radius: ${t.radius.control}px;
  background: ${t.color.surfaceLowest};
  color: ${t.color.ink};
  padding: 0 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  &:hover:not(:disabled) { background: ${t.color.surfaceLow}; }
  &:disabled { cursor: not-allowed; opacity: .48; }
`

export const PrimaryNativeButton = styled(NativeButton)`
  border-color: ${t.color.primary};
  border-radius: 999px;
  background: ${t.color.primary};
  color: ${t.color.onPrimary};

  &:hover:not(:disabled) { background: ${t.color.primaryContainer}; }
`

export function getStudioEnv(name: string): string | undefined {
  const meta = import.meta as ImportMeta & {env?: Record<string, string | undefined>}
  return meta.env?.[name]
}
