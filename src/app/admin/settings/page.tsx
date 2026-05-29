import type { Metadata } from 'next'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export const metadata: Metadata = { title: 'Settings – Admin' }

export default function AdminSettingsPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Configure global Slotify settings and behavior.</p>
      </div>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Platform Name</label>
            <input
              type="text"
              defaultValue="Slotify"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Support Email</label>
            <input
              type="email"
              defaultValue="support@slotify.ph"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Platform URL</label>
            <input
              type="text"
              defaultValue="https://slotify.ph"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div className="flex justify-end pt-1">
            <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
              Save Changes
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-slate-50 p-0">
          {[
            { label: 'New business registration', description: 'Notify admins when a new business registers', enabled: true },
            { label: 'Booking cancellation alerts', description: 'Send alert when a booking is cancelled', enabled: true },
            { label: 'User email verification', description: 'Send verification emails to new users', enabled: true },
            { label: 'Weekly digest', description: 'Weekly platform activity summary to admins', enabled: false },
            { label: 'Low booking activity', description: 'Alert when a business has no bookings in 7 days', enabled: false },
          ].map((item) => (
            <div key={item.label} className="flex items-start justify-between gap-4 px-6 py-4">
              <div>
                <p className="text-sm font-medium text-slate-800">{item.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
              </div>
              <button
                role="switch"
                aria-checked={item.enabled}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                  item.enabled ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                    item.enabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Registration */}
      <Card>
        <CardHeader>
          <CardTitle>Registration</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-slate-50 p-0">
          {[
            { label: 'Allow new business registrations', description: 'When off, no new businesses can sign up', enabled: true },
            { label: 'Require admin approval for new businesses', description: 'Businesses must be manually approved before going live', enabled: false },
            { label: 'Allow customer self-registration', description: 'Customers can create accounts without an invitation', enabled: true },
          ].map((item) => (
            <div key={item.label} className="flex items-start justify-between gap-4 px-6 py-4">
              <div>
                <p className="text-sm font-medium text-slate-800">{item.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
              </div>
              <button
                role="switch"
                aria-checked={item.enabled}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                  item.enabled ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                    item.enabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader className="border-red-100">
          <CardTitle className="text-red-700">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between gap-4 rounded-lg border border-red-100 bg-red-50 p-4">
            <div>
              <p className="text-sm font-medium text-red-800">Maintenance Mode</p>
              <p className="text-xs text-red-600 mt-0.5">Disables the platform for all users. Only admins can access it.</p>
            </div>
            <button className="shrink-0 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 transition-colors">
              Enable
            </button>
          </div>
          <div className="flex items-start justify-between gap-4 rounded-lg border border-red-100 bg-red-50 p-4">
            <div>
              <p className="text-sm font-medium text-red-800">Clear All Demo Data</p>
              <p className="text-xs text-red-600 mt-0.5">Permanently removes all seeded demo businesses, users, and bookings.</p>
            </div>
            <button className="shrink-0 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 transition-colors">
              Purge
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
