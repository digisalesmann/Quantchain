'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'

const MIN_VISIBLE_MS = 500

export default function SplashScreen() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    let cancelled = false
    const minDelay = new Promise<void>((resolve) => setTimeout(resolve, MIN_VISIBLE_MS))
    const pageReady =
      document.readyState === 'complete'
        ? Promise.resolve()
        : new Promise<void>((resolve) => window.addEventListener('load', () => resolve(), { once: true }))

    Promise.all([minDelay, pageReady]).then(() => {
      if (!cancelled) setVisible(false)
    })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
        >
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Image src="/images/QuantChain.png" alt="Quantchain" width={96} height={96} priority />
          </motion.div>
          <span className="sr-only">Loading Quantchain…</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
