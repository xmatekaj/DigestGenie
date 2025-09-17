// components/dashboard/dashboard-stats.tsx - Dashboard statistics
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Mail, BookOpen, Sparkles, Clock } from 'lucide-react'

interface DashboardStatsData {
  totalSubscriptions: number
  unreadArticles: number
  thisWeekArticles: number
  aiSummariesGenerated: number
  systemEmailGenerated: boolean
  processingStatus: 'active' | 'pending' | 'inactive'
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [subscriptionsRes, articlesRes, systemEmailRes] = await Promise.all([
        fetch('/api/user/subscriptions/stats'),
        fetch('/api/user/articles/stats'),
        fetch('/api/user/system-email')
      ])

      const [subscriptionsData, articlesData, systemEmailData] = await Promise.all([
        subscriptionsRes.ok ? subscriptionsRes.json() : { totalSubscriptions: 0 },
        articlesRes.ok ? articlesRes.json() : { unreadArticles: 0, thisWeekArticles: 0, aiSummariesGenerated: 0 },
        systemEmailRes.ok ? systemEmailRes.json() : { systemEmail: null, processingStatus: 'inactive' }
      ])

      setStats({
        totalSubscriptions: subscriptionsData.totalSubscriptions || 0,
        unreadArticles: articlesData.unreadArticles || 0,
        thisWeekArticles: articlesData.thisWeekArticles || 0,
        aiSummariesGenerated: articlesData.aiSummariesGenerated || 0,
        systemEmailGenerated: !!systemEmailData.systemEmail,
        processingStatus: systemEmailData.processingStatus || 'inactive'
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Subscriptions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
          <Mail className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalSubscriptions}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalSubscriptions === 0 
              ? 'No subscriptions yet' 
              : `${stats.totalSubscriptions} newsletter${stats.totalSubscriptions > 1 ? 's' : ''} active`
            }
          </p>
        </CardContent>
      </Card>

      {/* Unread Articles */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unread Articles</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.unreadArticles}</div>
          <p className="text-xs text-muted-foreground">
            {stats.unreadArticles === 0 
              ? 'All caught up!' 
              : 'Ready to read'
            }
          </p>
        </CardContent>
      </Card>

      {/* This Week's Articles */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Week</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.thisWeekArticles}</div>
          <p className="text-xs text-muted-foreground">
            {stats.thisWeekArticles} new articles processed
          </p>
        </CardContent>
      </Card>

      {/* AI Processing Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">AI Processing</CardTitle>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            <Badge 
              variant={stats.systemEmailGenerated ? 
                (stats.processingStatus === 'active' ? 'default' : 'secondary') 
                : 'outline'
              }
              className="text-xs"
            >
              {!stats.systemEmailGenerated ? 'Setup Required' :
               stats.processingStatus === 'active' ? 'Active' :
               stats.processingStatus === 'pending' ? 'Pending' : 'Inactive'
              }
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.aiSummariesGenerated}</div>
          <p className="text-xs text-muted-foreground">
            {stats.systemEmailGenerated 
              ? 'AI summaries generated'
              : 'Generate system email to start'
            }
          </p>
        </CardContent>
      </Card>
    </div>
  )
}