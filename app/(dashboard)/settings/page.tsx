// app/(dashboard)/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Mail,
  Bell,
  Brain,
  Eye,
  Palette,
  Shield,
  Key,
  Copy,
  Check,
  RefreshCw,
  Save,
  AlertCircle,
} from 'lucide-react';
import { useSession } from 'next-auth/react';

interface UserPreferences {
  globalAiEnabled: boolean;
  aiSummaryLength: 'short' | 'medium' | 'long';
  aiInterestThreshold: number;
  digestFrequency: 'daily' | 'weekly' | 'never';
  digestTime: string;
  digestTimezone: string;
  digestEnabled: boolean;
  defaultView: 'cards' | 'list' | 'compact';
  articlesPerPage: number;
  showReadArticles: boolean;
  darkMode: boolean;
  compactMode: boolean;
  defaultSort: 'newest' | 'oldest' | 'interest';
  groupByNewsletter: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [systemEmail, setSystemEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    globalAiEnabled: true,
    aiSummaryLength: 'medium',
    aiInterestThreshold: 0.5,
    digestFrequency: 'daily',
    digestTime: '08:00',
    digestTimezone: 'UTC',
    digestEnabled: true,
    defaultView: 'cards',
    articlesPerPage: 20,
    showReadArticles: false,
    darkMode: false,
    compactMode: false,
    defaultSort: 'newest',
    groupByNewsletter: false,
    emailNotifications: true,
    pushNotifications: false,
  });

  useEffect(() => {
    fetchPreferences();
    fetchSystemEmail();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/user/preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemEmail = async () => {
    try {
      const response = await fetch('/api/user/system-email');
      if (response.ok) {
        const data = await response.json();
        setSystemEmail(data.systemEmail);
      }
    } catch (error) {
      console.error('Error fetching system email:', error);
    }
  };

  const generateSystemEmail = async () => {
    try {
      const response = await fetch('/api/user/system-email', {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        setSystemEmail(data.systemEmail);
      }
    } catch (error) {
      console.error('Error generating system email:', error);
    }
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(systemEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="w-4 h-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Brain className="w-4 h-4 mr-2" />
            AI
          </TabsTrigger>
          <TabsTrigger value="display">
            <Eye className="w-4 h-4 mr-2" />
            Display
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Your account details and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input value={session?.user?.email || ''} disabled />
                <p className="text-sm text-gray-500">
                  Your email address is managed through your authentication provider
                </p>
              </div>

              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input value={session?.user?.name || ''} disabled />
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-500">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button variant="outline">
                    <Shield className="w-4 h-4 mr-2" />
                    Setup 2FA
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Tab */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>
                Setup your unique email for receiving newsletters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">
                      How Email Forwarding Works
                    </h4>
                    <p className="text-sm text-blue-800">
                      Forward your newsletters to your unique system email below. We'll
                      automatically process them and add them to your feed.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Your System Email</Label>
                {systemEmail ? (
                  <div className="flex gap-2">
                    <Input value={systemEmail} readOnly className="font-mono" />
                    <Button
                      variant="outline"
                      onClick={copyToClipboard}
                      className="flex-shrink-0"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button onClick={generateSystemEmail}>
                    <Key className="w-4 h-4 mr-2" />
                    Generate System Email
                  </Button>
                )}
                <p className="text-sm text-gray-500">
                  Use this email address to forward newsletters for processing
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Email Digest Settings</h4>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Email Digest</Label>
                    <p className="text-sm text-gray-500">
                      Receive a daily or weekly summary of your articles
                    </p>
                  </div>
                  <Switch
                    checked={preferences.digestEnabled}
                    onCheckedChange={(checked) =>
                      updatePreference('digestEnabled', checked)
                    }
                  />
                </div>

                {preferences.digestEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label>Frequency</Label>
                      <Select
                        value={preferences.digestFrequency}
                        onValueChange={(value: any) =>
                          updatePreference('digestFrequency', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Delivery Time</Label>
                      <Input
                        type="time"
                        value={preferences.digestTime}
                        onChange={(e) =>
                          updatePreference('digestTime', e.target.value)
                        }
                      />
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Tab */}
        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>AI Features</CardTitle>
              <CardDescription>
                Configure how AI processes and enhances your newsletters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable AI Features</Label>
                  <p className="text-sm text-gray-500">
                    Use AI for summaries, categorization, and interest scoring
                  </p>
                </div>
                <Switch
                  checked={preferences.globalAiEnabled}
                  onCheckedChange={(checked) =>
                    updatePreference('globalAiEnabled', checked)
                  }
                />
              </div>

              {preferences.globalAiEnabled && (
                <>
                  <Separator />

                  <div className="space-y-2">
                    <Label>Summary Length</Label>
                    <Select
                      value={preferences.aiSummaryLength}
                      onValueChange={(value: any) =>
                        updatePreference('aiSummaryLength', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">Short (1-2 sentences)</SelectItem>
                        <SelectItem value="medium">Medium (3-4 sentences)</SelectItem>
                        <SelectItem value="long">Long (5+ sentences)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Interest Threshold</Label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={preferences.aiInterestThreshold}
                        onChange={(e) =>
                          updatePreference(
                            'aiInterestThreshold',
                            parseFloat(e.target.value)
                          )
                        }
                        className="flex-1"
                      />
                      <span className="text-sm font-medium w-12 text-right">
                        {Math.round(preferences.aiInterestThreshold * 100)}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Only show articles with interest score above this threshold
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Display Tab */}
        <TabsContent value="display">
          <Card>
            <CardHeader>
              <CardTitle>Display Preferences</CardTitle>
              <CardDescription>
                Customize how your feed and articles are displayed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Default View</Label>
                <Select
                  value={preferences.defaultView}
                  onValueChange={(value: any) => updatePreference('defaultView', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cards">Cards</SelectItem>
                    <SelectItem value="list">List</SelectItem>
                    <SelectItem value="compact">Compact</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Default Sort Order</Label>
                <Select
                  value={preferences.defaultSort}
                  onValueChange={(value: any) => updatePreference('defaultSort', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="interest">Most Interesting</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Articles Per Page</Label>
                <Select
                  value={preferences.articlesPerPage.toString()}
                  onValueChange={(value) =>
                    updatePreference('articlesPerPage', parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Read Articles</Label>
                  <p className="text-sm text-gray-500">
                    Display articles you've already read in your feed
                  </p>
                </div>
                <Switch
                  checked={preferences.showReadArticles}
                  onCheckedChange={(checked) =>
                    updatePreference('showReadArticles', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Group by Newsletter</Label>
                  <p className="text-sm text-gray-500">
                    Group articles by their source newsletter
                  </p>
                </div>
                <Switch
                  checked={preferences.groupByNewsletter}
                  onCheckedChange={(checked) =>
                    updatePreference('groupByNewsletter', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-gray-500">Use dark color scheme</p>
                </div>
                <Switch
                  checked={preferences.darkMode}
                  onCheckedChange={(checked) => updatePreference('darkMode', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Compact Mode</Label>
                  <p className="text-sm text-gray-500">
                    Reduce spacing for more content on screen
                  </p>
                </div>
                <Switch
                  checked={preferences.compactMode}
                  onCheckedChange={(checked) =>
                    updatePreference('compactMode', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Control how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) =>
                    updatePreference('emailNotifications', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Receive browser push notifications
                  </p>
                </div>
                <Switch
                  checked={preferences.pushNotifications}
                  onCheckedChange={(checked) =>
                    updatePreference('pushNotifications', checked)
                  }
                />
              </div>

              <Separator />

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-medium text-amber-900 mb-2">
                  Notification Types
                </h4>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• New articles from subscribed newsletters</li>
                  <li>• High-interest articles (AI-scored above threshold)</li>
                  <li>• Daily or weekly digest summaries</li>
                  <li>• System updates and announcements</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end mt-6">
        <Button onClick={savePreferences} disabled={saving} size="lg">
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save All Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}