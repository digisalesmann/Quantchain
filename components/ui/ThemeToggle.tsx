'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { cn } from '../../lib/utils'

export default function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      aria-pressed={isDark}
      className={cn(
        'relative inline-flex h-7 w-[52px] shrink-0 items-center rounded-full border border-border bg-muted px-1 transition-colors',
        className
      )}
    >
      <Sun size={12} className={cn('relative z-10 transition-colors', isDark ? 'text-muted-foreground/50' : 'text-amber-500')} />
      <Moon size={12} className={cn('relative z-10 ml-auto transition-colors', isDark ? 'text-indigo-400' : 'text-muted-foreground/50')} />
      <motion.span
        className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-background shadow"
        animate={{ x: isDark ? 24 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
      >
        {isDark ? <Moon size={11} className="text-indigo-400" /> : <Sun size={11} className="text-amber-500" />}
      </motion.span>
    </button>
  )
}
