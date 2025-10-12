// app/(dashboard)/dashboard/feed/page.tsx
import { NewsletterFeed } from '@/components/dashboard/newsletter-feed'

export default function FeedPage() {
  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Feed</h1>
        <p className="text-gray-600 mt-2">
          Your personalized newsletter articles
        </p>
      </div>
      
      <NewsletterFeed />
    </div>
  )
}