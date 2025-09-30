// components/newsletters/newsletter-dashboard.tsx - Main newsletter dashboard
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Search, Plus, Settings, Star, TrendingUp, Mail, Sparkles, Filter } from 'lucide-react'

interface Newsletter {
  id: string
  name: string
  description?: string
  senderEmail?: string
  senderDomain?: string
  websiteUrl?: string
  logoUrl?: string
  frequency?: string
  isPredefined: boolean
  isSubscribed?: boolean
  subscription?: {
    id: string
    customCategory?: string
    aiEnabled: boolean
    displayPreference: any
  }
}

export function NewsletterDashboard() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [subscribedNewsletters, setSubscribedNewsletters] = useState<Newsletter[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('browse')
  const [isAddNewsletterOpen, setIsAddNewsletterOpen] = useState(false)

  // New newsletter form state
  const [newNewsletter, setNewNewsletter] = useState({
    name: '',
    description: '',
    senderEmail: '',
    websiteUrl: '',
    frequency: 'weekly'
  })

  useEffect(() => {
    fetchNewsletters()
    fetchSubscribedNewsletters()
  }, [])

  const fetchNewsletters = async () => {
    try {
      const response = await fetch('/api/newsletters?type=predefined')
      if (response.ok) {
        const data = await response.json()
        setNewsletters(data.newsletters)
      }
    } catch (error) {
      console.error('Error fetching newsletters:', error)
    }
  }

  const fetchSubscribedNewsletters = async () => {
    try {
      const response = await fetch('/api/newsletters?subscribed=true')
      if (response.ok) {
        const data = await response.json()
        setSubscribedNewsletters(data.newsletters.filter((n: Newsletter) => n.isSubscribed))
      }
    } catch (error) {
      console.error('Error fetching subscribed newsletters:', error)
    }
  }

  const handleSubscribe = async (newsletterId: string, options = {}) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/newsletters/${newsletterId}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aiEnabled: true,
          aiSummaryEnabled: true,
          aiCategorizationEnabled: true,
          displayPreference: { type: 'full', showImages: true },
          ...options
        })
      })

      if (response.ok) {
        await fetchNewsletters()
        await fetchSubscribedNewsletters()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to subscribe')
      }
    } catch (error) {
      console.error('Error subscribing:', error)
      alert('Failed to subscribe to newsletter')
    } finally {
      setLoading(false)
    }
  }

  const handleUnsubscribe = async (newsletterId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/newsletters/${newsletterId}/subscribe`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchNewsletters()
        await fetchSubscribedNewsletters()
      }
    } catch (error) {
      console.error('Error unsubscribing:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNewsletter = async () => {
    if (!newNewsletter.name || !newNewsletter.senderEmail) {
      alert('Please fill in required fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/newsletters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNewsletter)
      })

      if (response.ok) {
        setIsAddNewsletterOpen(false)
        setNewNewsletter({
          name: '',
          description: '',
          senderEmail: '',
          websiteUrl: '',
          frequency: 'weekly'
        })
        await fetchNewsletters()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create newsletter')
      }
    } catch (error) {
      console.error('Error creating newsletter:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredNewsletters = newsletters.filter(newsletter =>
    newsletter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    newsletter.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (

<div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Newsletter Dashboard</h1>
          <p className="text-gray-600">Manage your newsletter subscriptions and discover new content</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddNewsletterOpen} onOpenChange={setIsAddNewsletterOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Newsletter
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Newsletter</DialogTitle>
                <DialogDescription>
                  Add a newsletter that's not in our directory
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Newsletter Name *</Label>
                  <Input
                    id="name"
                    value={newNewsletter.name}
                    onChange={(e) => setNewNewsletter({...newNewsletter, name: e.target.value})}
                    placeholder="e.g. Tech Weekly"
                  />
                </div>
                <div>
                  <Label htmlFor="senderEmail">Sender Email *</Label>
                  <Input
                    id="senderEmail"
                    type="email"
                    value={newNewsletter.senderEmail}
                    onChange={(e) => setNewNewsletter({...newNewsletter, senderEmail: e.target.value})}
                    placeholder="newsletter@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newNewsletter.description}
                    onChange={(e) => setNewNewsletter({...newNewsletter, description: e.target.value})}
                    placeholder="What's this newsletter about?"
                  />
                </div>
                <div>
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    value={newNewsletter.websiteUrl}
                    onChange={(e) => setNewNewsletter({...newNewsletter, websiteUrl: e.target.value})}
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select value={newNewsletter.frequency} onValueChange={(value) => setNewNewsletter({...newNewsletter, frequency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="secondary" onClick={() => setIsAddNewsletterOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateNewsletter} disabled={loading}>
                  {loading ? 'Creating...' : 'Create Newsletter'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse Newsletters</TabsTrigger>
          <TabsTrigger value="subscribed">My Subscriptions</TabsTrigger>
          <TabsTrigger value="articles">Latest Articles</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search newsletters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="secondary">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNewsletters.map((newsletter) => (
              <NewsletterCard
                key={newsletter.id}
                newsletter={newsletter}
                onSubscribe={handleSubscribe}
                loading={loading}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="subscribed" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Your Subscriptions</h2>
              <p className="text-gray-600">
                {subscribedNewsletters.length} active subscriptions
              </p>
            </div>
            <Button variant="secondary" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Manage All
            </Button>
          </div>

          {subscribedNewsletters.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No subscriptions yet</h3>
                <p className="text-gray-600 mb-4">
                  Start by browsing and subscribing to newsletters that interest you
                </p>
                <Button onClick={() => setActiveTab('browse')}>
                  Browse Newsletters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subscribedNewsletters.map((newsletter) => (
                <SubscribedNewsletterCard
                  key={newsletter.id}
                  newsletter={newsletter}
                  onUnsubscribe={handleUnsubscribe}
                  loading={loading}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="articles" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Latest Articles</h2>
              <p className="text-gray-600">Recent content from your subscriptions</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">
                <Sparkles className="h-4 w-4 mr-2" />
                AI Summary
              </Button>
              <Button variant="secondary" size="sm">
                Mark All Read
              </Button>
            </div>
          </div>

          <ArticlesList />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Newsletter Card Component for browsing
function NewsletterCard({ newsletter, onSubscribe, loading }: {
  newsletter: Newsletter
  onSubscribe: (id: string) => void
  loading: boolean
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {newsletter.logoUrl ? (
              <img
                src={newsletter.logoUrl}
                alt={newsletter.name}
                className="w-10 h-10 rounded-lg object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {newsletter.name.charAt(0)}
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{newsletter.name}</CardTitle>
              <p className="text-sm text-gray-500">{newsletter.frequency}</p>
            </div>
          </div>
          {newsletter.isPredefined && (
            <Badge variant="secondary">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4 line-clamp-3">
          {newsletter.description || 'No description available'}
        </CardDescription>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <TrendingUp className="h-4 w-4" />
            <span>Popular</span>
          </div>
          
          <Button 
            onClick={() => onSubscribe(newsletter.id)}
            disabled={loading || newsletter.isSubscribed}
            size="sm"
          >
            {newsletter.isSubscribed ? 'Subscribed' : 'Subscribe'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Subscribed Newsletter Card Component
function SubscribedNewsletterCard({ newsletter, onUnsubscribe, loading }: {
  newsletter: Newsletter
  onUnsubscribe: (id: string) => void
  loading: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {newsletter.logoUrl ? (
              <img
                src={newsletter.logoUrl}
                alt={newsletter.name}
                className="w-8 h-8 rounded object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                {newsletter.name.charAt(0)}
              </div>
            )}
            <div>
              <CardTitle className="text-base">{newsletter.name}</CardTitle>
              {newsletter.subscription?.customCategory && (
                <Badge variant="secondary" className="text-xs">
                  {newsletter.subscription.customCategory}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <span className={`flex items-center gap-1 ${newsletter.subscription?.aiEnabled ? 'text-green-600' : 'text-gray-400'}`}>
              <Sparkles className="h-3 w-3" />
              AI {newsletter.subscription?.aiEnabled ? 'On' : 'Off'}
            </span>
            <span className="text-gray-500">{newsletter.frequency}</span>
          </div>
          
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">
              <Settings className="h-3 w-3" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="secondary" size="sm" disabled={loading}>
                  Unsubscribe
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Unsubscribe from {newsletter.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You'll stop receiving articles from this newsletter. You can always resubscribe later.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onUnsubscribe(newsletter.id)}>
                    Unsubscribe
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Articles List Component (placeholder for now)
function ArticlesList() {
  return (
    <Card>
      <CardContent className="text-center py-8">
        <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No articles yet</h3>
        <p className="text-gray-600">
          Articles will appear here once you subscribe to newsletters and we start processing them
        </p>
      </CardContent>
    </Card>
  )
}