import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useTheme } from '@/hooks/useTheme'

export function Providers({ children }: { children: ReactNode }) {
  // Initialize theme on mount
  const { theme } = useTheme()

  useEffect(() => {
    // Ensuring the HTML class matches on initial mount
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
  }, [theme])

  return <>{children}</>
}
