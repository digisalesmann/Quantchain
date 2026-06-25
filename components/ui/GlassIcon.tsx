import React from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

const GLASS_CLASSES =
  'relative inline-flex shrink-0 items-center justify-center rounded-full border border-white/40 bg-gradient-to-br from-white/50 via-white/10 to-white/0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_1px_3px_rgba(0,0,0,0.12)] backdrop-blur-[2px] dark:border-white/10 dark:from-white/15 dark:via-white/5 dark:to-transparent dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_1px_3px_rgba(0,0,0,0.5)]'

type GlassIconProps =
  | { icon: LucideIcon; size?: number; className?: string; iconClassName?: string; children?: never }
  | { icon?: undefined; size?: number; className?: string; iconClassName?: never; children: React.ReactNode }

export default function GlassIcon({ icon: Icon, size = 16, className, iconClassName, children }: GlassIconProps) {
  const padding = Math.max(3, Math.round(size * 0.4))
  const box = size + padding * 2

  return (
    <span className={cn(GLASS_CLASSES, className)} style={{ width: box, height: box }}>
      {Icon ? <Icon size={size} className={iconClassName} /> : children}
    </span>
  )
}
