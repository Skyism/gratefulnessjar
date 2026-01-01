import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { useEffect } from 'react'
import { initDatabase } from '@/lib/db/schema'

/**
 * Layout - Main application layout
 *
 * Design: Simple wrapper with header and content area
 * Cream/off-white background for warmth
 */
export function Layout() {
  // Initialize database on mount
  useEffect(() => {
    initDatabase().catch((error) => {
      console.error('Failed to initialize database:', error)
    })
  }, [])

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
