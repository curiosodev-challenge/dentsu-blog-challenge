import { useEffect, useState } from 'react'

type ThemeMode = 'light' | 'dark'
const THEME_STORAGE_KEY = 'dws-theme-mode'

function getInitialThemeMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light'
  }

  try {
    const savedThemeMode = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (savedThemeMode === 'light' || savedThemeMode === 'dark') {
      return savedThemeMode
    }
  } catch {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function useThemeMode() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode)

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, themeMode)
    } catch {
      // Ignore write failures in restricted environments.
    }
  }, [themeMode])

  const toggleThemeMode = () => {
    setThemeMode((currentMode) => (currentMode === 'dark' ? 'light' : 'dark'))
  }

  return {
    themeMode,
    isDarkMode: themeMode === 'dark',
    toggleThemeMode,
  }
}
