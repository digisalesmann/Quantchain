'use client'
import React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-foreground text-background hover:bg-foreground/85',
        subtle: 'bg-muted text-foreground hover:bg-muted/70',
        outline: 'border border-border bg-transparent hover:bg-accent',
        ghost: 'bg-transparent hover:bg-accent rounded-md',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        up: 'bg-up text-up-foreground hover:bg-up/90',
        down: 'bg-down text-down-foreground hover:bg-down/90',
        link: 'text-primary underline-offset-4 hover:underline rounded-none'
      },
      size: {
        sm: 'h-8 px-4 text-xs',
        md: 'h-10 px-5',
        lg: 'h-12 px-7 text-base',
        icon: 'h-9 w-9 rounded-full'
      }
    },
    defaultVariants: { variant: 'primary', size: 'md' }
  }
)

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }

export default function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
