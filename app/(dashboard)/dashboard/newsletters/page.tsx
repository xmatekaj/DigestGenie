// app/(dashboard)/dashboard/newsletters/page.tsx
import { SystemEmailDashboard } from '@/components/email/system-email-dashboard'
import { NewsletterDashboard } from '@/components/newsletters/newsletter-dashboard'

export default function NewslettersPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Newsletters</h1>
        <p className="text-gray-600 mt-2">
          Manage your newsletter subscriptions and system email
        </p>
      </div>

      {/* System Email Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Newsletter Email</h2>
        <SystemEmailDashboard />
      </div>

      {/* Newsletter Management Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Browse & Subscribe</h2>
        <NewsletterDashboard />
      </div>
    </div>
  )
}