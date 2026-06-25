'use client'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cn } from '../../lib/utils'

export function Avatar({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <AvatarPrimitive.Root className={cn('relative inline-flex h-8 w-8 shrink-0 overflow-hidden rounded-full', className)}>
      {children}
    </AvatarPrimitive.Root>
  )
}

export function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return <AvatarPrimitive.Image className={cn('h-full w-full object-cover', className)} {...props} />
}

export function AvatarFallback({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <AvatarPrimitive.Fallback
      className={cn('flex h-full w-full items-center justify-center bg-primary text-xs font-semibold text-primary-foreground', className)}
    >
      {children}
    </AvatarPrimitive.Fallback>
  )
}
