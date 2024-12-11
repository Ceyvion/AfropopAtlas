'use client'

import React, { useState } from 'react'
import { useServerInsertedHTML } from 'next/navigation'
import { createStyleRegistry, StyleRegistry } from 'styled-jsx'

export default function StyledJsxRegistry({
  children,
}: {
  children: React.ReactNode
}) {
  // Create a new style registry instance
  const [jsxStyleRegistry] = useState(() => createStyleRegistry())

  useServerInsertedHTML(() => {
    const styles = jsxStyleRegistry.styles()
    jsxStyleRegistry.flush()
    return <>{styles}</>
  })

  return <StyleRegistry registry={jsxStyleRegistry}>{children}</StyleRegistry>
}

// Utility function to generate dynamic CSS variables
export function generateCSSVariables(colors: Record<string, string>) {
  return Object.entries(colors).reduce((acc, [key, value]) => {
    acc[`--color-${key}`] = value
    return acc
  }, {} as Record<string, string>)
}

// Utility function to generate dynamic class names
export function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

// Utility function to generate dynamic styles
export function generateDynamicStyles(styles: Record<string, any>) {
  return Object.entries(styles).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null) {
      acc[key] = value
    }
    return acc
  }, {} as Record<string, any>)
}

// Animation utility for smooth transitions
export function withTransition(
  Component: React.ComponentType<any>,
  options = { duration: 300, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }
) {
  return React.forwardRef((props: any, ref) => {
    const [isVisible, setIsVisible] = useState(false)

    React.useEffect(() => {
      const timer = requestAnimationFrame(() => setIsVisible(true))
      return () => cancelAnimationFrame(timer)
    }, [])

    const style = {
      transition: `all ${options.duration}ms ${options.easing}`,
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'none' : 'translateY(10px)',
    }

    return <Component {...props} ref={ref} style={{ ...style, ...props.style }} />
  })
}

// Theme context for dynamic theming
export const ThemeContext = React.createContext({
  theme: 'dark',
  setTheme: (theme: string) => {},
})

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Media query hook for responsive design
export function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false)

  React.useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [matches, query])

  return matches
}

// Intersection observer hook for lazy loading
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)

  React.useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, options)

    observer.observe(element)
    return () => observer.disconnect()
  }, [elementRef, options])

  return isIntersecting
}

// Performance optimization utilities
export const memo = React.memo
export const useMemo = React.useMemo
export const useCallback = React.useCallback

// Error boundary component
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }

    return this.props.children
  }
}
