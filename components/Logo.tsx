import Image from 'next/image'
import { cn } from '../lib/utils'

export default function Logo({ size = 28, withWordmark = true, className }: { size?: number; withWordmark?: boolean; className?: string }) {
  return (
    <span className={cn('flex items-center gap-2', className)}>
      <Image src="/images/QuantChain.png" alt="Quantchain" width={size} height={size} priority />
      {withWordmark && <span className="text-[15px] font-semibold tracking-tight">Quantchain</span>}
    </span>
  )
}
