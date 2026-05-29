import type { Metadata } from 'next'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

export const metadata: Metadata = { title: 'Users – Admin' }

type UserRole = 'owner' | 'customer' | 'admin' | 'staff'

const users: {
  id: string
  name: string
  email: string
  role: UserRole
  status: 'active' | 'suspended'
  verified: boolean
  joined: string
  lastSeen: string
}[] = [
  { id: '1', name: 'Juan Dela Cruz', email: 'juan@primecuts.ph', role: 'owner', status: 'active', verified: true, joined: 'Jan 12, 2025', lastSeen: '2 hr ago' },
  { id: '2', name: 'Maria Santos', email: 'maria@glowstudio.ph', role: 'owner', status: 'active', verified: true, joined: 'Feb 3, 2025', lastSeen: '5 hr ago' },
  { id: '3', name: 'Pedro Reyes', email: 'pedro.reyes@gmail.com', role: 'customer', status: 'active', verified: true, joined: 'Mar 1, 2025', lastSeen: '1 day ago' },
  { id: '4', name: 'Ana Lim', email: 'ana@nailbar.ph', role: 'owner', status: 'active', verified: true, joined: 'Mar 5, 2025', lastSeen: '3 hr ago' },
  { id: '5', name: 'Carlo Mendoza', email: 'carlo@freshfade.ph', role: 'owner', status: 'suspended', verified: true, joined: 'Mar 22, 2025', lastSeen: '2 wk ago' },
  { id: '6', name: 'Luisa Garcia', email: 'luisa.garcia@email.com', role: 'customer', status: 'active', verified: false, joined: 'Apr 10, 2025', lastSeen: 'Never' },
  { id: '7', name: 'Ben Torres', email: 'ben.torres@email.com', role: 'customer', status: 'active', verified: true, joined: 'Apr 22, 2025', lastSeen: '3 days ago' },
  { id: '8', name: 'Admin User', email: 'admin@slotify.ph', role: 'admin', status: 'active', verified: true, joined: 'Jan 1, 2025', lastSeen: 'Just now' },
  { id: '9', name: 'Sofia Cruz', email: 'sofia@zenspa.ph', role: 'owner', status: 'active', verified: true, joined: 'Apr 1, 2025', lastSeen: '6 hr ago' },
  { id: '10', name: 'Rico Navarro', email: 'rico.navarro@email.com', role: 'staff', status: 'active', verified: true, joined: 'Apr 28, 2025', lastSeen: '1 day ago' },
]

const roleBadge: Record<UserRole, { label: string; variant: 'danger' | 'info' | 'default' | 'warning' }> = {
  admin: { label: 'Admin', variant: 'danger' },
  owner: { label: 'Owner', variant: 'info' },
  customer: { label: 'Customer', variant: 'default' },
  staff: { label: 'Staff', variant: 'warning' },
}

export default function AdminUsersPage() {
  const total = users.length
  const active = users.filter((u) => u.status === 'active').length
  const unverified = users.filter((u) => !u.verified).length

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        <p className="text-sm text-slate-500 mt-1">{total} total &middot; {active} active &middot; {unverified} unverified</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: total, color: 'text-slate-900' },
          { label: 'Owners', value: users.filter((u) => u.role === 'owner').length, color: 'text-blue-600' },
          { label: 'Customers', value: users.filter((u) => u.role === 'customer').length, color: 'text-slate-700' },
          { label: 'Unverified', value: unverified, color: 'text-amber-600' },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['User', 'Role', 'Status', 'Verified', 'Joined', 'Last Seen', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((user) => {
                const role = roleBadge[user.role]
                return (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 text-xs font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={role.variant}>{role.label}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={user.status === 'active' ? 'success' : 'danger'}>
                        {user.status === 'active' ? 'Active' : 'Suspended'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {user.verified ? (
                        <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{user.joined}</td>
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{user.lastSeen}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">View</button>
                        <button className="text-xs text-red-500 hover:text-red-700 font-medium">
                          {user.status === 'active' ? 'Suspend' : 'Restore'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
