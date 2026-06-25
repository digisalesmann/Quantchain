import { Activity, FileText, Shield, User } from 'lucide-react'

export const ACCOUNT_NAV = [
  { href: '/account/profile', label: 'Profile', icon: User },
  { href: '/account/security', label: 'Security', icon: Shield },
  { href: '/account/activity', label: 'Activity', icon: Activity },
  { href: '/account/statements', label: 'Statements', icon: FileText }
]
