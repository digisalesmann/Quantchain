'use client'
import { useEffect, useState } from 'react'

const KEY = 'quantchain:advanced-nav'

export function useAdvancedMode() {
  const [advanced, setAdvanced] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setAdvanced(localStorage.getItem(KEY) === '1')
    setHydrated(true)
  }, [])

  function update(value: boolean) {
    setAdvanced(value)
    localStorage.setItem(KEY, value ? '1' : '0')
  }

  return { advanced: hydrated ? advanced : false, setAdvanced: update, hydrated }
}
