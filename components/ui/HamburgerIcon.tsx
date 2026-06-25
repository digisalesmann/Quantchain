'use client'
import { motion } from 'framer-motion'

export default function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <span className="flex h-[14px] w-[18px] flex-col justify-between">
      <motion.span
        className="block h-[1.5px] w-full rounded-full bg-current"
        animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
      />
      <motion.span
        className="block h-[1.5px] w-full rounded-full bg-current"
        animate={open ? { opacity: 0, x: -6 } : { opacity: 1, x: 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      />
      <motion.span
        className="block h-[1.5px] w-full rounded-full bg-current"
        animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
      />
    </span>
  )
}
