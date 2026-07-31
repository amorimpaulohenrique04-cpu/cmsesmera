import type {MouseEventHandler} from 'react'
import {
  EmptyCopy,
  EmptyIllustration,
  EmptyStateBox,
  EmptyStateInner,
  EmptyTitle,
  PrimaryAction,
} from './siteDashboardStyles'

type EmptyRecentStateProps = {
  href: string
  onClick: MouseEventHandler<HTMLAnchorElement>
}

export function EmptyRecentState({href, onClick}: EmptyRecentStateProps) {
  return (
    <EmptyStateBox>
      <EmptyStateInner>
        <EmptyIllustration aria-hidden="true">
          <svg viewBox="0 0 40 40" focusable="false">
            <path d="M10.5 6.5h13l6 6v20h-19z" />
            <path d="M23.5 6.5v6h6M15 18h10M15 23h8" />
            <path d="M27 29c2.6-4.2 4.8-6.2 7-7M29 27c2.3.1 3.9.8 5 2M30.5 25c-.2-2 .3-3.6 1.4-4.8" />
          </svg>
        </EmptyIllustration>
        <EmptyTitle>Nenhuma peça cadastrada ainda.</EmptyTitle>
        <EmptyCopy>
          Comece adicionando uma peça ao catálogo para vê-la aparecer aqui.
        </EmptyCopy>
        <PrimaryAction href={href} onClick={onClick}>
          <span aria-hidden="true">+</span>
          Adicionar peça
        </PrimaryAction>
      </EmptyStateInner>
    </EmptyStateBox>
  )
}
