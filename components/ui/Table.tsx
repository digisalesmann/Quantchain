import React from 'react'
import { cn } from '../../lib/utils'

export function Table({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn('w-full caption-bottom text-sm', className)}>{children}</table>
    </div>
  )
}

export function THead({ children }: { children: React.ReactNode }) {
  return <thead className="border-b border-border">{children}</thead>
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-border">{children}</tbody>
}

export function TR({ className, children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn('transition-colors hover:bg-accent/50', className)} {...props}>
      {children}
    </tr>
  )
}

export function TH({ className, children, align = 'left' }: { className?: string; children: React.ReactNode; align?: 'left' | 'right' | 'center' }) {
  return (
    <th
      className={cn(
        'h-10 px-3 text-2xs font-medium uppercase tracking-wide text-muted-foreground first:pl-0 last:pr-0',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        align === 'left' && 'text-left',
        className
      )}
    >
      {children}
    </th>
  )
}

export function TD({
  className,
  children,
  align = 'left',
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement> & { align?: 'left' | 'right' | 'center' }) {
  return (
    <td
      className={cn(
        'px-3 py-3.5 first:pl-0 last:pr-0',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        align === 'left' && 'text-left',
        className
      )}
      {...props}
    >
      {children}
    </td>
  )
}
