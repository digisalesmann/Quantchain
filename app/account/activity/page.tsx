import React from 'react'
import Link from 'next/link'
import { requireSessionUserId } from '../../../lib/session'
import prisma from '../../../lib/prisma'
import { Table, THead, TBody, TR, TH, TD } from '../../../components/ui/Table'
import ActiveSessionsTable from '../../../components/account/ActiveSessionsTable'
import ConfirmedDevicesTable, { type DeviceGroup } from '../../../components/account/ConfirmedDevicesTable'
import { lookupLocations } from '../../../lib/geoip'
import { cn, formatRelativeTime } from '../../../lib/utils'

const TABS: { key: string; label: string }[] = [
  { key: 'sessions', label: 'Active sessions' },
  { key: 'devices', label: 'Confirmed devices' },
  { key: 'log', label: 'Account activity' }
]

export default async function AccountActivityPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const userId = await requireSessionUserId()
  const { tab } = await searchParams
  const active = TABS.some((t) => t.key === tab) ? tab! : 'sessions'

  const allSessions = await prisma.session.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })

  return (
    <div className="py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Activity</h1>

      <div className="mt-6 flex gap-6 border-b border-border sm:justify-between sm:gap-0">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/account/activity?tab=${t.key}`}
            className={cn(
              '-mb-px border-b-2 pb-3 text-sm font-semibold transition-colors',
              active === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="py-8">
        {active === 'sessions' && (
          <>
            <h2 className="text-lg font-semibold tracking-tight">Active sessions</h2>
            <p className="mt-1 text-sm text-muted-foreground">These sessions are currently signed in to your account.</p>
            <div className="mt-6">
              <ActiveSessionsTable
                userId={userId}
                initialSessions={allSessions
                  .filter((s) => !s.revoked && s.expiresAt.getTime() > Date.now())
                  .map((s) => ({ id: s.id, device: s.device, ip: s.ip, createdAt: s.createdAt.toISOString() }))}
              />
            </div>
          </>
        )}

        {active === 'devices' && <DevicesTab userId={userId} sessions={allSessions} />}

        {active === 'log' && <ActivityLogTab sessions={allSessions} />}
      </div>
    </div>
  )
}

async function DevicesTab({
  userId,
  sessions
}: {
  userId: string
  sessions: { id: string; device: string | null; ip: string | null; createdAt: Date; lastSeenAt: Date }[]
}) {
  const groups = new Map<string, DeviceGroup>()
  for (const s of sessions) {
    const key = `${s.device || 'unknown'}|${s.ip || 'unknown'}`
    const existing = groups.get(key)
    if (!existing) {
      groups.set(key, {
        key,
        device: s.device,
        ip: s.ip,
        firstSeenAt: s.createdAt.toISOString(),
        lastSeenAt: s.lastSeenAt.toISOString(),
        sessionIds: [s.id]
      })
    } else {
      existing.sessionIds.push(s.id)
      if (s.createdAt.getTime() < new Date(existing.firstSeenAt).getTime()) existing.firstSeenAt = s.createdAt.toISOString()
      if (s.lastSeenAt.getTime() > new Date(existing.lastSeenAt).getTime()) existing.lastSeenAt = s.lastSeenAt.toISOString()
    }
  }
  const devices = Array.from(groups.values()).sort((a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime())

  return (
    <>
      <h2 className="text-lg font-semibold tracking-tight">Confirmed devices</h2>
      <p className="mt-1 text-sm text-muted-foreground">These devices have signed in to your account before.</p>
      <div className="mt-6">
        <ConfirmedDevicesTable userId={userId} initialDevices={devices} />
      </div>
    </>
  )
}

async function ActivityLogTab({ sessions }: { sessions: { id: string; ip: string | null; createdAt: Date }[] }) {
  const locations = await lookupLocations(sessions.map((s) => s.ip))

  return (
    <>
      <h2 className="text-lg font-semibold tracking-tight">Account activity</h2>
      <p className="mt-1 text-sm text-muted-foreground">Recent activity on your account.</p>
      <div className="mt-6">
        <Table>
          <THead>
            <TR>
              <TH>Action</TH>
              <TH>IP address</TH>
              <TH>Location</TH>
              <TH align="right">When</TH>
            </TR>
          </THead>
          <TBody>
            {sessions.map((s) => (
              <TR key={s.id}>
                <TD>Sign in complete</TD>
                <TD className="text-muted-foreground">{s.ip || '—'}</TD>
                <TD className="text-muted-foreground">{(s.ip && locations[s.ip]) || '—'}</TD>
                <TD align="right" className="text-muted-foreground">{formatRelativeTime(s.createdAt.toISOString())}</TD>
              </TR>
            ))}
            {sessions.length === 0 && (
              <TR>
                <TD colSpan={4} align="center" className="py-8 text-muted-foreground">No activity yet</TD>
              </TR>
            )}
          </TBody>
        </Table>
      </div>
    </>
  )
}
