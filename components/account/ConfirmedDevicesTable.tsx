'use client'
import React, { useState } from 'react'
import { toast } from 'sonner'
import Button from '../ui/Button'
import { Table, THead, TBody, TR, TH, TD } from '../ui/Table'
import { formatRelativeTime } from '../../lib/utils'

export type DeviceGroup = { key: string; device: string | null; ip: string | null; firstSeenAt: string; lastSeenAt: string; sessionIds: string[] }

export default function ConfirmedDevicesTable({ userId, initialDevices }: { userId: string; initialDevices: DeviceGroup[] }) {
  const [devices, setDevices] = useState(initialDevices)

  async function remove(sessionIds: string[]) {
    const res = await fetch('/api/auth/sessions/revoke-many', { method: 'POST', body: JSON.stringify({ userId, sessionIds }) })
    if (!res.ok) {
      toast.error('Could not remove device')
      return
    }
    setDevices((prev) => prev.filter((d) => d.sessionIds !== sessionIds))
    toast.success('Device removed')
  }

  async function removeAll() {
    const res = await fetch('/api/auth/sessions/revoke-many', { method: 'POST', body: JSON.stringify({ userId }) })
    if (!res.ok) {
      toast.error('Could not remove devices')
      return
    }
    setDevices([])
    toast.success('All devices removed')
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button variant="subtle" size="sm" onClick={removeAll} disabled={devices.length === 0}>
          Remove all devices
        </Button>
      </div>
      <Table>
        <THead>
          <TR>
            <TH>Signed in</TH>
            <TH>Platform</TH>
            <TH>IP address</TH>
            <TH>Last seen</TH>
            <TH align="right">Access</TH>
          </TR>
        </THead>
        <TBody>
          {devices.map((d) => (
            <TR key={d.key}>
              <TD>{formatRelativeTime(d.firstSeenAt)}</TD>
              <TD className="text-muted-foreground">{(d.device || 'Unknown device').replace(' device', '')}</TD>
              <TD className="text-muted-foreground">{d.ip || '—'}</TD>
              <TD className="text-muted-foreground">{formatRelativeTime(d.lastSeenAt)}</TD>
              <TD align="right">
                <button onClick={() => remove(d.sessionIds)} className="text-sm font-medium text-primary hover:underline">
                  Remove
                </button>
              </TD>
            </TR>
          ))}
          {devices.length === 0 && (
            <TR>
              <TD colSpan={5} align="center" className="py-8 text-muted-foreground">No devices on record</TD>
            </TR>
          )}
        </TBody>
      </Table>
    </div>
  )
}
