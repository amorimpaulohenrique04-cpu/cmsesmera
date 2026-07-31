import {createContext, useContext, useMemo, useState, type ReactNode} from 'react'

type CmsShellContextValue = {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
}

const CmsShellContext = createContext<CmsShellContextValue | null>(null)

export function CmsShellProvider({children}: {children: ReactNode}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const value = useMemo(
    () => ({sidebarOpen, setSidebarOpen, toggleSidebar: () => setSidebarOpen((open) => !open)}),
    [sidebarOpen],
  )
  return <CmsShellContext.Provider value={value}>{children}</CmsShellContext.Provider>
}

export function useCmsShell() {
  const value = useContext(CmsShellContext)
  if (!value) {
    return {sidebarOpen: false, setSidebarOpen: () => undefined, toggleSidebar: () => undefined}
  }
  return value
}
