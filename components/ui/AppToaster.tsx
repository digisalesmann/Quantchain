'use client'
import React from 'react'
import { Toaster } from 'sonner'
import { useTheme } from './ThemeProvider'

export default function AppToaster() {
  const { theme } = useTheme()

  return (
    <Toaster
      position="top-right"
      theme={theme}
      toastOptions={{
        classNames: {
          toast: 'rounded-lg border border-border bg-background text-foreground shadow-xl',
          title: 'text-sm font-medium text-foreground',
          description: 'text-sm text-muted-foreground',
          actionButton: '!bg-primary !text-primary-foreground',
          cancelButton: '!bg-muted !text-muted-foreground',
          closeButton: '!border-border !bg-background !text-muted-foreground',
          success: '!border-up/30',
          error: '!border-destructive/30',
          icon: '',
        },
      }}
    />
  )
}
