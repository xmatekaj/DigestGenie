'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Mail,
  Clock,
  Star,
  TrendingUp,
  Sparkles,
  Zap,
  Target,
  BookOpen
} from 'lucide-react'

const stats = [
  {
    title: 'Newsletters Organized',
    value: '47',
    change: '+12 this week',
    changeType: 'positive' as const,
    icon: Mail,
    color: 'genie'
  },
  {
    title: 'Time Saved',
    value: '2.3h',
    change: 'This week',
    changeType: 'neutral' as const,
    icon: Clock,
    color: 'magic'
  },
  {
    title: 'Relevance Score',
    value: '94%',
    change: '+3% improvement',
    changeType: 'positive' as const,
    icon: Target,
    color: 'emerald'
  },
  {
    title: 'Articles Read',
    value: '156',
    change: 'vs 340 unread before',
    changeType: 'positive' as const,
    icon: BookOpen,
    color: 'blue'
  }
]

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={stat.title} className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${
              stat.color === 'genie' ? 'from-genie-500 to-genie-600' :
              stat.color === 'magic' ? 'from-magic-500 to-magic-600' :
              stat.color === 'emerald' ? 'from-emerald-500 to-emerald-600' :
              'from-blue-500 to-blue-600'
            }`}>
              <stat.icon className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <div className="text-2xl font-bold text-gray-900">
                {stat.value}
              </div>
              {stat.changeType === 'positive' && (
                <Sparkles className="w-4 h-4 text-magic-500 animate-genie-sparkle" />
              )}
            </div>
            <p className={`text-xs mt-1 ${
              stat.changeType === 'positive' ? 'text-emerald-600' : 
              stat.changeType === 'negative' ? 'text-red-600' : 
              'text-gray-500'
            }`}>
              {stat.changeType === 'positive' && <TrendingUp className="w-3 h-3 inline mr-1" />}
              {stat.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}