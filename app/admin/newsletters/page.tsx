// app/admin/newsletters/page.tsx - Admin Newsletter Management
'use client';

import { useState, useEffect } from 'react';
import {
  Mail,
  Plus,
  Settings,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Users,
  Calendar,
  Globe,
  Star,
  TrendingUp,
  Clock,
  ExternalLink
} from 'lucide-react';

interface Newsletter {
  id: string;
  name: string;
  description?: string;
  senderEmail?: string;
  senderDomain?: string;
  websiteUrl?: string;
  logoUrl?: string;
  frequency?: string;
  isPredefined: boolean;
  isActive: boolean;
  subscriberCount: number;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  name: string;
  description: string;
  senderEmail: string;
  senderDomain: string;
  websiteUrl: string;
  logoUrl: string;
  frequency: string;
  isPredefined: boolean;
  isActive: boolean;
}

export default function AdminNewslettersPage() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNewsletter, setEditingNewsletter] = useState<Newsletter | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    senderEmail: '',
    senderDomain: '',
    websiteUrl: '',
    logoUrl: '',
    frequency: 'weekly',
    isPredefined: true,
    isActive: true
  });

  useEffect(() => {
    fetchNewsletters();
  }, []);

  const fetchNewsletters = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/newsletters');
      if (response.ok) {
        const data = await response.json();
        setNewsletters(data);
      } else {
        console.error('Failed to fetch newsletters');
      }
    } catch (error) {
      console.error('Error fetching newsletters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.senderEmail.trim()) {
      alert('Newsletter name and sender email are required');
      return;
    }

    try {
      let response;
      if (editingNewsletter) {
        response = await fetch(`/api/admin/newsletters/${editingNewsletter.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch('/api/admin/newsletters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      if (response.ok) {
        const updatedNewsletter = await response.json();
        
        if (editingNewsletter) {
          setNewsletters(newsletters.map(newsletter => 
            newsletter.id === editingNewsletter.id ? updatedNewsletter : newsletter
          ));
        } else {
          setNewsletters([...newsletters, updatedNewsletter]);
        }
        
        handleCloseModal();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save newsletter');
      }
    } catch (error) {
      console.error('Error saving newsletter:', error);
      alert('Failed to save newsletter');
    }
  };

  const handleEdit = (newsletter: Newsletter) => {
    setEditingNewsletter(newsletter);
    setFormData({
      name: newsletter.name,
      description: newsletter.description || '',
      senderEmail: newsletter.senderEmail || '',
      senderDomain: newsletter.senderDomain || '',
      websiteUrl: newsletter.websiteUrl || '',
      logoUrl: newsletter.logoUrl || '',
      frequency: newsletter.frequency || 'weekly',
      isPredefined: newsletter.isPredefined,
      isActive: newsletter.isActive
    });
    setIsEditModalOpen(true);
  };

  const handleNew = () => {
    setEditingNewsletter(null);
    setFormData({
      name: '',
      description: '',
      senderEmail: '',
      senderDomain: '',
      websiteUrl: '',
      logoUrl: '',
      frequency: 'weekly',
      isPredefined: true,
      isActive: true
    });
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingNewsletter(null);
  };

  const handleDelete = async (newsletterId: string) => {
    if (confirm('Are you sure you want to delete this newsletter? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/admin/newsletters/${newsletterId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setNewsletters(newsletters.filter(newsletter => newsletter.id !== newsletterId));
        } else {
          const error = await response.json();
          alert(error.error || 'Failed to delete newsletter');
        }
      } catch (error) {
        console.error('Error deleting newsletter:', error);
        alert('Failed to delete newsletter');
      }
    }
  };

  const handleToggleActive = async (newsletterId: string) => {
    const newsletter = newsletters.find(n => n.id === newsletterId);
    if (!newsletter) return;

    const updatedFormData = {
      name: newsletter.name,
      description: newsletter.description || '',
      senderEmail: newsletter.senderEmail || '',
      senderDomain: newsletter.senderDomain || '',
      websiteUrl: newsletter.websiteUrl || '',
      logoUrl: newsletter.logoUrl || '',
      frequency: newsletter.frequency || 'weekly',
      isPredefined: newsletter.isPredefined,
      isActive: !newsletter.isActive
    };

    try {
      const response = await fetch(`/api/admin/newsletters/${newsletterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFormData),
      });

      if (response.ok) {
        const updatedNewsletter = await response.json();
        setNewsletters(newsletters.map(n => 
          n.id === newsletterId ? updatedNewsletter : n
        ));
      }
    } catch (error) {
      console.error('Error toggling newsletter status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Newsletter Management</h1>
          <p className="text-gray-600 mt-1">Manage predefined newsletters available to all users</p>
        </div>
        <button
          onClick={handleNew}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Newsletter
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Mail className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Newsletters</p>
              <p className="text-2xl font-bold text-gray-900">{newsletters.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Eye className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {newsletters.filter(n => n.isActive).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Star className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Predefined</p>
              <p className="text-2xl font-bold text-gray-900">
                {newsletters.filter(n => n.isPredefined).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Subscribers</p>
              <p className="text-2xl font-bold text-gray-900">
                {newsletters.reduce((sum, n) => sum + n.subscriberCount, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletters Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Newsletters</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Newsletter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscribers
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {newsletters.map((newsletter) => (
                <tr key={newsletter.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {newsletter.logoUrl ? (
                        <img 
                          src={newsletter.logoUrl} 
                          alt={newsletter.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                          <Mail className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{newsletter.name}</div>
                        <div className="text-sm text-gray-500">{newsletter.senderEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center space-x-2 mb-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="capitalize">{newsletter.frequency}</span>
                      </div>
                      {newsletter.websiteUrl && (
                        <div className="flex items-center space-x-2">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <a 
                            href={newsletter.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {newsletter.subscriberCount}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleActive(newsletter.id)}
                        className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ${
                          newsletter.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {newsletter.isActive ? (
                          <>
                            <Eye className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </button>
                      {newsletter.isPredefined && (
                        <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Star className="w-3 h-3 mr-1" />
                          Predefined
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(newsletter)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(newsletter.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {newsletters.length === 0 && (
            <div className="text-center py-12">
              <Mail className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No newsletters</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding your first newsletter.</p>
              <div className="mt-6">
                <button
                  onClick={handleNew}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Newsletter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit/Create Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingNewsletter ? 'Edit Newsletter' : 'Add New Newsletter'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  ✕
                </button>
              </div>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Newsletter Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Morning Brew"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sender Email *
                  </label>
                  <input
                    type="email"
                    value={formData.senderEmail}
                    onChange={(e) => setFormData({ ...formData, senderEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="crew@morningbrew.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief description of the newsletter content and audience"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://morningbrew.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="irregular">Irregular</option>
                </select>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isPredefined}
                    onChange={(e) => setFormData({ ...formData, isPredefined: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Predefined Newsletter (Available to all users)
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Active
                  </label>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
              >
                {editingNewsletter ? 'Update Newsletter' : 'Add Newsletter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}