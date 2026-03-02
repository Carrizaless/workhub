'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(false)

  // Load saved preference on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('workhub-theme')
      if (saved === 'dark') {
        setDark(true)
        document.documentElement.classList.add('dark')
      }
    } catch {}
  }, [])

  function toggleTheme() {
    setDark((prev) => {
      const next = !prev
      try {
        localStorage.setItem('workhub-theme', next ? 'dark' : 'light')
      } catch {}
      if (next) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}
