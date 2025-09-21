// app/admin/categories/page.tsx - Fixed version
'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff,
  Tag,
  BookOpen,
  BarChart3,
  Globe,
  Zap,
  Code,
  Cpu,
  Briefcase,
  TrendingUp,
  Heart,
  Camera,
  Music,
  Gamepad2,
  Plane,
  ShoppingBag
} from 'lucide-react';

// Available icons for categories
const AVAILABLE_ICONS = [
  { name: 'Zap', icon: Zap, label: 'Technology' },
  { name: 'Code', icon: Code, label: 'Programming' },
  { name: 'Cpu', icon: Cpu, label: 'Electronics' },
  { name: 'Briefcase', icon: Briefcase, label: 'Business' },
  { name: 'TrendingUp', icon: TrendingUp, label: 'Startup' },
  { name: 'Globe', icon: Globe, label: 'Global' },
  { name: 'BookOpen', icon: BookOpen, label: 'Education' },
  { name: 'Heart', icon: Heart, label: 'Health' },
  { name: 'Camera', icon: Camera, label: 'Photography' },
  { name: 'Music', icon: Music, label: 'Music' },
  { name: 'Gamepad2', icon: Gamepad2, label: 'Gaming' },
  { name: 'Plane', icon: Plane, label: 'Travel' },
  { name: 'ShoppingBag', icon: ShoppingBag, label: 'Shopping' },
];

// Color gradients for categories
const COLOR_GRADIENTS = [
  { name: 'Blue to Cyan', value: 'from-blue-500 to-cyan-500', preview: 'bg-gradient-to-r from-blue-500 to-cyan-500' },
  { name: 'Green to Emerald', value: 'from-green-500 to-emerald-500', preview: 'bg-gradient-to-r from-green-500 to-emerald-500' },
  { name: 'Purple to Violet', value: 'from-purple-500 to-violet-500', preview: 'bg-gradient-to-r from-purple-500 to-violet-500' },
  { name: 'Orange to Red', value: 'from-orange-500 to-red-500', preview: 'bg-gradient-to-r from-orange-500 to-red-500' },
  { name: 'Pink to Rose', value: 'from-pink-500 to-rose-500', preview: 'bg-gradient-to-r from-pink-500 to-rose-500' },
  { name: 'Indigo to Blue', value: 'from-indigo-500 to-blue-500', preview: 'bg-gradient-to-r from-indigo-500 to-blue-500' },
  { name: 'Yellow to Orange', value: 'from-yellow-500 to-orange-500', preview: 'bg-gradient-to-r from-yellow-500 to-orange-500' },
  { name: 'Emerald to Teal', value: 'from-emerald-500 to-teal-500', preview: 'bg-gradient-to-r from-emerald-500 to-teal-500' },
];

interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  icon: string;
  colorGradient: string;
  isActive: boolean;
  sortOrder: number;
  articleCount: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'Globe',
    colorGradient: 'from-blue-500 to-cyan-500',
    isActive: true
  });

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        console.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Get icon component by name
  const getIconComponent = (iconName: string) => {
    const iconData = AVAILABLE_ICONS.find(icon => icon.name === iconName);
    return iconData ? iconData.icon : Globe;
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Basic validation
    if (!formData.name.trim()) {
      alert('Category name is required');
      return;
    }

    try {
      let response;
      if (editingCategory) {
        // Update existing category
        response = await fetch(`/api/admin/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      } else {
        // Create new category
        response = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      }

      if (response.ok) {
        const updatedCategory = await response.json();
        
        if (editingCategory) {
          setCategories(categories.map(cat => 
            cat.id === editingCategory.id ? updatedCategory : cat
          ));
        } else {
          setCategories([...categories, updatedCategory]);
        }
        
        handleCloseModal();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save category');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category');
    }
  };

  // Handle opening edit modal
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      icon: category.icon,
      colorGradient: category.colorGradient,
      isActive: category.isActive
    });
    setIsEditModalOpen(true);
  };

  // Handle opening new category modal
  const handleNew = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      icon: 'Globe',
      colorGradient: 'from-blue-500 to-cyan-500',
      isActive: true
    });
    setIsEditModalOpen(true);
  };

  // Handle closing modal
  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingCategory(null);
  };

  // Handle delete category
  const handleDelete = async (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/admin/categories/${categoryId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setCategories(categories.filter(cat => cat.id !== categoryId));
        } else {
          const error = await response.json();
          alert(error.error || 'Failed to delete category');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category');
      }
    }
  };

  // Handle toggle active status
  const handleToggleActive = async (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return;

    const updatedFormData = {
      name: category.name,
      description: category.description,
      icon: category.icon,
      colorGradient: category.colorGradient,
      isActive: !category.isActive
    };

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFormData),
      });

      if (response.ok) {
        const updatedCategory = await response.json();
        setCategories(categories.map(cat => 
          cat.id === categoryId ? updatedCategory : cat
        ));
      } else {
        console.error('Failed to update category status');
      }
    } catch (error) {
      console.error('Error updating category status:', error);
    }
  };

  // Calculate stats
  const stats = {
    totalCategories: categories.length,
    activeCategories: categories.filter(cat => cat.isActive).length,
    totalArticles: categories.reduce((sum, cat) => sum + cat.articleCount, 0),
    averageArticlesPerCategory: categories.length > 0 ? Math.round(categories.reduce((sum, cat) => sum + cat.articleCount, 0) / categories.length) : 0
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories Management</h1>
          <p className="text-gray-600">Manage newsletter categories for the landing page</p>
        </div>
        <button
          onClick={handleNew}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Tag className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Categories</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCategories}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Categories</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeCategories}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Articles</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalArticles}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg per Category</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageArticlesPerCategory}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Categories</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Articles
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
              {categories.map((category) => {
                const IconComponent = getIconComponent(category.icon);
                return (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${category.colorGradient} flex items-center justify-center mr-4`}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{category.name}</div>
                          <div className="text-sm text-gray-500">{category.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {category.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{category.articleCount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(category.id)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          category.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {category.isActive ? (
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {categories.length === 0 && (
            <div className="text-center py-12">
              <Tag className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No categories</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new category.</p>
              <div className="mt-6">
                <button
                  onClick={handleNew}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Category
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
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Technology, Programming"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief description of this category"
                />
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Category Icon
                </label>
                <div className="grid grid-cols-6 gap-3">
                  {AVAILABLE_ICONS.map((iconOption) => {
                    const IconComponent = iconOption.icon;
                    return (
                      <button
                        key={iconOption.name}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: iconOption.name })}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          formData.icon === iconOption.name
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <IconComponent className="w-6 h-6 mx-auto" />
                        <div className="text-xs mt-1 text-center">{iconOption.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Gradient */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Color Gradient
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {COLOR_GRADIENTS.map((gradient) => (
                    <button
                      key={gradient.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, colorGradient: gradient.value })}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        formData.colorGradient === gradient.value
                          ? 'border-blue-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-full h-8 rounded ${gradient.preview} mb-2`}></div>
                      <div className="text-xs text-center">{gradient.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Preview
                </label>
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${formData.colorGradient} flex items-center justify-center mr-4`}>
                    {React.createElement(getIconComponent(formData.icon), { className: "w-6 h-6 text-white" })}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{formData.name || 'Category Name'}</div>
                    <div className="text-sm text-gray-500">{formData.description || 'Category description'}</div>
                  </div>
                </div>
              </div>

              {/* Active Status */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Category is active and visible to users</span>
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}