import { Link, useLocation } from 'react-router-dom'
import { useEntryCount } from '@/store/entryStore'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Header - Navigation and branding
 *
 * Design: Clean, minimal header with refined navigation
 */
export function Header() {
  const location = useLocation()
  const entryCount = useEntryCount()

  const navItems = [
    { path: '/', label: 'Today' },
    { path: '/history', label: 'History' },
  ]

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <Link
            to="/"
            className="flex items-center gap-2 text-stone-900 hover:text-amber-600 transition-colors"
          >
            <Sparkles className="w-5 h-5 text-amber-600" />
            <span className="text-lg font-semibold">Gratefulness Jar</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'px-4 py-2 rounded-md text-sm font-medium transition-all',
                    'hover:bg-stone-100',
                    'focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2',
                    isActive
                      ? 'bg-amber-50 text-amber-900'
                      : 'text-stone-600 hover:text-stone-900'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Entry count (subtle) */}
          {entryCount > 0 && (
            <div className="hidden sm:block text-xs text-stone-500 font-mono">
              {entryCount} {entryCount === 1 ? 'entry' : 'entries'}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
