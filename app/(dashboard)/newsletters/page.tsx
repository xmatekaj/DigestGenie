// app/(dashboard)/newsletters/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Mail,
  Plus,
  Search,
  Settings,
  TrendingUp,
  CheckCircle,
  XCircle,
  Globe,
  Calendar,
  Users,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

interface Newsletter {
  id: string;
  name: string;
  description?: string;
  senderEmail?: string;
  websiteUrl?: string;
  logoUrl?: string;
  frequency?: string;
  isPredefined: boolean;
  subscriberCount: number;
  category?: string;
  tags?: string[];
  isSubscribed?: boolean;
  subscription?: {
    id: string;
    isActive: boolean;
    aiEnabled: boolean;
  };
}

export default function NewslettersPage() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [subscribedNewsletters, setSubscribedNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('browse');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newNewsletter, setNewNewsletter] = useState({
    name: '',
    senderEmail: '',
    description: '',
    websiteUrl: '',
  });

  useEffect(() => {
    fetchNewsletters();
    fetchSubscriptions();
  }, []);

  const fetchNewsletters = async () => {
    try {
      const response = await fetch('/api/newsletters');
      if (response.ok) {
        const data = await response.json();
        setNewsletters(data);
      }
    } catch (error) {
      console.error('Error fetching newsletters:', error);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/user/subscriptions');
      if (response.ok) {
        const data = await response.json();
        setSubscribedNewsletters(data);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (newsletterId: string) => {
    try {
      const response = await fetch(`/api/newsletters/${newsletterId}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aiEnabled: true,
          aiSummaryEnabled: true,
          aiCategorizationEnabled: true,
        }),
      });

      if (response.ok) {
        await fetchNewsletters();
        await fetchSubscriptions();
      }
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  };

  const handleUnsubscribe = async (newsletterId: string) => {
    if (!confirm('Are you sure you want to unsubscribe from this newsletter?')) {
      return;
    }

    try {
      const response = await fetch(`/api/newsletters/${newsletterId}/subscribe`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchNewsletters();
        await fetchSubscriptions();
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
    }
  };

  const handleAddNewsletter = async () => {
    if (!newNewsletter.name || !newNewsletter.senderEmail) {
      alert('Please fill in required fields');
      return;
    }

    try {
      const response = await fetch('/api/newsletters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNewsletter),
      });

      if (response.ok) {
        setIsAddDialogOpen(false);
        setNewNewsletter({
          name: '',
          senderEmail: '',
          description: '',
          websiteUrl: '',
        });
        await fetchNewsletters();
      }
    } catch (error) {
      console.error('Error adding newsletter:', error);
    }
  };

  const filteredNewsletters = newsletters.filter((newsletter) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      newsletter.name.toLowerCase().includes(searchLower) ||
      newsletter.description?.toLowerCase().includes(searchLower) ||
      newsletter.category?.toLowerCase().includes(searchLower) ||
      newsletter.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });

  const NewsletterCard = ({ newsletter }: { newsletter: Newsletter }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {newsletter.logoUrl ? (
              <img
                src={newsletter.logoUrl}
                alt={newsletter.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{newsletter.name}</CardTitle>
              {newsletter.category && (
                <Badge variant="secondary" className="mt-1">
                  {newsletter.category}
                </Badge>
              )}
            </div>
          </div>
          {newsletter.isPredefined && (
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              <Sparkles className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <CardDescription className="text-sm mb-4 line-clamp-2">
          {newsletter.description || 'No description available'}
        </CardDescription>

        <div className="space-y-2 mb-4">
          {newsletter.frequency && (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              {newsletter.frequency}
            </div>
          )}
          {newsletter.subscriberCount > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-2" />
              {newsletter.subscriberCount.toLocaleString()} subscribers
            </div>
          )}
          {newsletter.websiteUrl && (
            <div className="flex items-center text-sm text-gray-600">
              <Globe className="w-4 h-4 mr-2" />
              <a
                href={newsletter.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Visit website
              </a>
            </div>
          )}
        </div>

        {newsletter.tags && newsletter.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {newsletter.tags.map((tag, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {newsletter.isSubscribed ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleUnsubscribe(newsletter.id)}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Unsubscribe
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/dashboard/newsletters/${newsletter.id}/settings`}>
                <Settings className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <Button
            className="w-full"
            onClick={() => handleSubscribe(newsletter.id)}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Subscribe
          </Button>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Mail className="w-12 h-12 animate-pulse text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading newsletters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Newsletters</h1>
        <p className="text-gray-600">
          Discover and manage your newsletter subscriptions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Subscribed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {subscribedNewsletters.length}
                </p>
              </div>
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">
                  {newsletters.filter(n => n.isPredefined).length}
                </p>
              </div>
              <Sparkles className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Custom</p>
                <p className="text-2xl font-bold text-gray-900">
                  {newsletters.filter(n => !n.isPredefined).length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-6">
          <TabsList>
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="subscribed">
              My Subscriptions ({subscribedNewsletters.length})
            </TabsTrigger>
          </TabsList>

          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Newsletter
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search newsletters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Browse Tab */}
        <TabsContent value="browse">
          {filteredNewsletters.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <Mail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No newsletters found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or add a custom newsletter
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNewsletters.map((newsletter) => (
                <NewsletterCard key={newsletter.id} newsletter={newsletter} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Subscribed Tab */}
        <TabsContent value="subscribed">
          {subscribedNewsletters.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <Mail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No subscriptions yet
              </h3>
              <p className="text-gray-500 mb-6">
                Subscribe to newsletters to start receiving articles
              </p>
              <Button onClick={() => setActiveTab('browse')}>
                Browse Newsletters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subscribedNewsletters.map((newsletter) => (
                <NewsletterCard key={newsletter.id} newsletter={newsletter} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Newsletter Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Newsletter</DialogTitle>
            <DialogDescription>
              Add a newsletter by providing its sender email address
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Newsletter Name *
              </label>
              <Input
                placeholder="e.g., My Tech Newsletter"
                value={newNewsletter.name}
                onChange={(e) =>
                  setNewNewsletter({ ...newNewsletter, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Sender Email *
              </label>
              <Input
                type="email"
                placeholder="newsletter@example.com"
                value={newNewsletter.senderEmail}
                onChange={(e) =>
                  setNewNewsletter({ ...newNewsletter, senderEmail: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Description (Optional)
              </label>
              <Input
                placeholder="Brief description"
                value={newNewsletter.description}
                onChange={(e) =>
                  setNewNewsletter({ ...newNewsletter, description: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Website URL (Optional)
              </label>
              <Input
                type="url"
                placeholder="https://example.com"
                value={newNewsletter.websiteUrl}
                onChange={(e) =>
                  setNewNewsletter({ ...newNewsletter, websiteUrl: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNewsletter}>Add Newsletter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}