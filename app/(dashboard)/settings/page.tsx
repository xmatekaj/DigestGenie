// app/dashboard/settings/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, Plus, Settings, TrendingUp } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="border-b pb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Feed
          </h1>
        </div>
      </div>
    </div>
  )
}