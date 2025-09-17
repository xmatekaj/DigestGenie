import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NewsletterFeed } from '@/components/dashboard/newsletter-feed'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { QuickActions } from '@/components/dashboard/quick-actions'
import {
  Sparkles,
  TrendingUp,
  Clock,
  Star,
  Zap,
  Gift,
} from 'lucide-react'

export default async function DashboardPage() {
  const session = await getServerSession()

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 flex items-center">
            Welcome back, {session.user?.name?.split(' ')[0]}! 
            <Sparkles className="w-8 h-8 ml-3 text-magic-500 animate-genie-sparkle" />
          </h1>
          <p className="text-gray-600 mt-2">
            Your genie has been busy organizing your newsletters. Here's your magical digest ✨
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button className="bg-gradient-to-r from-genie-500 to-magic-500 hover:from-genie-600 hover:to-magic-600">
            <Gift className="w-4 h-4 mr-2" />
            Grant New Wish
          </Button>
        </div>
      </div>

      {/* Magic Stats */}
      <StatsCards />

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Newsletter Feed */}
        <div className="lg:col-span-3">
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-genie-50 to-magic-50 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center text-xl">
                    <Zap className="w-5 h-5 mr-2 text-genie-600" />
                    Today's Magic Digest
                  </CardTitle>
                  <CardDescription>
                    Personalized newsletter insights, magically curated for you
                  </CardDescription>
                </div>
                <Badge className="bg-magic-100 text-magic-700">
                  <Star className="w-3 h-3 mr-1" />
                  12 New
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <NewsletterFeed />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Magic Level */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-genie-600" />
                Your Magic Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Reading Efficiency</span>
                    <span className="font-medium text-genie-600">94%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-genie-500 to-magic-500 h-2 rounded-full w-11/12"></div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="mb-1">✨ <strong>2.3 hours</strong> saved this week</p>
                  <p className="mb-1">📧 <strong>47 newsletters</strong> organized</p>
                  <p>🎯 <strong>89% relevance</strong> score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Clock className="w-5 h-5 mr-2 text-genie-600" />
                Recent Magic
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-genie-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">AI Summary created</p>
                    <p className="text-gray-500">TechCrunch Newsletter</p>
                    <p className="text-xs text-gray-400">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-magic-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Article saved to Treasure</p>
                    <p className="text-gray-500">Morning Brew</p>
                    <p className="text-xs text-gray-400">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">New category created</p>
                    <p className="text-gray-500">AI & Tech</p>
                    <p className="text-xs text-gray-400">1 hour ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upgrade Prompt (Hidden by default) */}
          <Card className="border-0 shadow-md bg-gradient-to-br from-magic-50 to-genie-50">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-magic-500 to-genie-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">
                  Unlock More Magic ✨
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get AI thumbnails, advanced filtering, and unlimited wishes with Pro Magic.
                </p>
                <Button className="bg-gradient-to-r from-magic-500 to-genie-500 hover:from-magic-600 hover:to-genie-600 w-full">
                  Upgrade Genie Powers
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}