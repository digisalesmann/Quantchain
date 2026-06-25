'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

export default function PhoneVideo({ src, className }: { src: string; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={cn('relative mx-auto w-full max-w-[560px] select-none', className)}
    >
      <video src={src} autoPlay loop muted playsInline className="block w-full rounded-3xl shadow-2xl" />
    </motion.div>
  )
}
