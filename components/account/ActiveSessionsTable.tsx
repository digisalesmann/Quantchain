'use client'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { Table, THead, TBody, TR, TH, TD } from '../ui/Table'
import { formatRelativeTime } from '../../lib/utils'

export type SessionRow = { id: string; device: string | null; ip: string | null; createdAt: string }

export default function ActiveSessionsTable({ userId, initialSessions }: { userId: string; initialSessions: SessionRow[] }) {
  const [sessions, setSessions] = useState(initialSessions)

  async function signOut(id: string) {
    const res = await fetch('/api/auth/sessions/revoke', { method: 'POST', body: JSON.stringify({ userId, sessionId: id }) })
    if (!res.ok) {
      toast.error('Could not sign out session')
      return
    }
    setSessions((prev) => prev.filter((s) => s.id !== id))
    toast.success('Signed out')
  }

  return (
    <Table>
      <THead>
        <TR>
          <TH>Signed in</TH>
          <TH>Platform</TH>
          <TH>IP address</TH>
          <TH align="right">Status</TH>
        </TR>
      </THead>
      <TBody>
        {sessions.map((s) => (
          <TR key={s.id}>
            <TD>{formatRelativeTime(s.createdAt)}</TD>
            <TD className="text-muted-foreground">{(s.device || 'Unknown device').replace(' device', '')}</TD>
            <TD className="text-muted-foreground">{s.ip || '—'}</TD>
            <TD align="right">
              <button onClick={() => signOut(s.id)} className="text-sm font-medium text-primary hover:underline">
                Sign out
              </button>
            </TD>
          </TR>
        ))}
        {sessions.length === 0 && (
          <TR>
            <TD colSpan={4} align="center" className="py-8 text-muted-foreground">No active sessions</TD>
          </TR>
        )}
      </TBody>
    </Table>
  )
}
