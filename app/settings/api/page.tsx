import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { requireSessionUserId } from '../../../lib/session'
import prisma from '../../../lib/prisma'
import GlassIcon from '../../../components/ui/GlassIcon'
import ApiKeysClient from '../../../components/settings/ApiKeysClient'

export default async function ApiKeysPage() {
  const userId = await requireSessionUserId()

  const keys = await prisma.apiKey.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, scopes: true, revoked: true, createdAt: true }
  })

  return (
    <div className="py-10">
      <Link href="/settings" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <GlassIcon icon={ArrowLeft} size={13} /> Settings
      </Link>

      <h1 className="text-2xl font-semibold tracking-tight">API keys</h1>
      <p className="mt-1 max-w-xl text-sm text-muted-foreground">
        Create keys for programmatic access. Each key and secret is shown only once at creation — store it somewhere safe.
      </p>

      <ApiKeysClient
        userId={userId}
        initialKeys={keys.map((k) => ({ id: k.id, name: k.name, scopes: k.scopes, revoked: k.revoked, createdAt: k.createdAt.toISOString() }))}
      />
    </div>
  )
}
