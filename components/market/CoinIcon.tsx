import React from 'react'
import { cn } from '../../lib/utils'

export default function CoinIcon({
  logo,
  baseAsset,
  iconBg = '#FFFFFF',
  size = 32,
  className
}: {
  logo: string
  baseAsset: string
  iconBg?: string
  size?: number
  className?: string
}) {
  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-border/50', className)}
      style={{ width: size, height: size, backgroundColor: logo ? iconBg : undefined }}
    >
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt={baseAsset} width={size} height={size} className="h-full w-full object-contain" />
      ) : (
        <span className="flex h-full w-full items-center justify-center bg-muted text-2xs font-semibold text-muted-foreground">
          {baseAsset.slice(0, 1)}
        </span>
      )}
    </span>
  )
}
