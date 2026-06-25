import React from 'react'
import { ChevronRight, Image as ImageIcon, MapPin, Mail, Phone, Smile, User, Cake, type LucideIcon } from 'lucide-react'
import { requireSessionUserId } from '../../../lib/session'
import prisma from '../../../lib/prisma'
import GlassIcon from '../../../components/ui/GlassIcon'
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/Avatar'
import EditFieldDialog from '../../../components/account/EditFieldDialog'

export default async function AccountProfilePage() {
  const userId = await requireSessionUserId()
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { profile: true } })
  if (!user) return null

  const p = user.profile
  const initials = (p?.fullName || user.email).slice(0, 1).toUpperCase()
  const addressPreview = [p?.addressLine1, p?.addressLine2, p?.city, p?.state].filter(Boolean).join(', ')
  const dob = p?.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : ''

  return (
    <div className="py-10">
      <div className="flex flex-col items-center text-center">
        <EditFieldDialog
          userId={userId}
          title="Profile photo"
          description="Paste a link to an image to use as your avatar."
          fields={[{ key: 'avatarUrl', label: 'Image URL', value: p?.avatarUrl || '', placeholder: 'https://…' }]}
          trigger={
            <button className="group relative">
              <Avatar className="h-20 w-20">
                {p?.avatarUrl && <AvatarImage src={p.avatarUrl} alt="" />}
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-muted-foreground transition-colors group-hover:text-foreground">
                <GlassIcon icon={ImageIcon} size={12} />
              </span>
            </button>
          }
        />
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">{p?.fullName || user.email}</h1>
      </div>

      <div className="mt-10 divide-y divide-border border-y border-border">
        <EditFieldDialog
          userId={userId}
          title="Phone number"
          fields={[{ key: 'phone', label: 'Phone number', value: p?.phone || '', type: 'tel', placeholder: '+1 555 000 0000' }]}
          trigger={<ProfileRow icon={Phone} label="Phone Number" value={p?.phone || 'Add phone number'} />}
        />
        <EditFieldDialog
          userId={userId}
          title="Legal name"
          fields={[{ key: 'fullName', label: 'Legal name', value: p?.fullName || '', placeholder: 'As shown on your ID' }]}
          trigger={<ProfileRow icon={User} label="Legal Name" value={p?.fullName || 'Add legal name'} />}
        />
        <EditFieldDialog
          userId={userId}
          title="Display name"
          fields={[{ key: 'displayName', label: 'Display name', value: p?.displayName || '', placeholder: 'How others see you' }]}
          trigger={<ProfileRow icon={Smile} label="Display Name" value={p?.displayName || 'Add display name'} />}
        />
        <EditFieldDialog
          userId={userId}
          title="Residential address"
          description="Please enter as it's shown on your ID."
          fields={[
            { key: 'addressLine1', label: 'Address', value: p?.addressLine1 || '' },
            { key: 'addressLine2', label: 'Address 2', value: p?.addressLine2 || '' },
            { key: 'city', label: 'City', value: p?.city || '' },
            { key: 'state', label: 'State', value: p?.state || '' },
            { key: 'postalCode', label: 'Postal code', value: p?.postalCode || '' },
            { key: 'country', label: 'Country', value: p?.country || '' }
          ]}
          trigger={<ProfileRow icon={MapPin} label="Residential Address" value={addressPreview || 'Add address'} />}
        />
        <ProfileRow icon={Mail} label="Email Address" value={user.email} static />
        <EditFieldDialog
          userId={userId}
          title="Date of birth"
          fields={[{ key: 'dateOfBirth', label: 'Date of birth', value: p?.dateOfBirth ? new Date(p.dateOfBirth).toISOString().slice(0, 10) : '', type: 'date' }]}
          trigger={<ProfileRow icon={Cake} label="Date of birth" value={dob || 'Add date of birth'} />}
        />
      </div>
    </div>
  )
}

function ProfileRow({
  icon,
  label,
  value,
  static: isStatic
}: {
  icon: LucideIcon
  label: string
  value: string
  static?: boolean
}) {
  const content = (
    <>
      <span className="flex min-w-0 items-center gap-3">
        <GlassIcon icon={icon} size={15} />
        <span className="min-w-0 text-left">
          <span className="block text-sm font-semibold">{label}</span>
          <span className="block truncate text-sm text-muted-foreground">{value}</span>
        </span>
      </span>
      {!isStatic && <GlassIcon icon={ChevronRight} size={13} className="shrink-0" />}
    </>
  )

  if (isStatic) {
    return <div className="flex items-center justify-between gap-3 py-4">{content}</div>
  }

  return <button className="flex w-full items-center justify-between gap-3 py-4 text-left transition-colors hover:bg-accent/50">{content}</button>
}
