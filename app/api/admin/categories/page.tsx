import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff,
  Settings,
  Users,
  Mail,
  BarChart3,
  Tag,
  Palette,
  Globe,
  Zap,
  Code,
  Cpu,
  Briefcase,
  TrendingUp,
  BookOpen,
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

// Mock data - in real app this would come from API
const initialCategories = [
  {
    id: '1',
    name: 'Technology',
    description: 'Latest tech news and innovations',
    slug: 'technology',
    icon: 'Zap',
    colorGradient: 'from-blue-500 to-cyan-500',
    isActive: true,
    sortOrder: 1,
    articleCount: 45
  },
  {
    id: '2',
    name: 'Programming',
    description: 'Development, coding, and software engineering',
    slug: 'programming',
    icon: 'Code',
    colorGradient: 'from-green-500 to-emerald-500',
    isActive: true,
    sortOrder: 2,
    articleCount: 32
  },
  {
    id: '3',
    name: 'Electronics',
    description: 'Hardware, circuits, and electronic engineering',
    slug: 'electronics',
    icon: 'Cpu',
    colorGradient: 'from-purple-500 to-violet-500',
    isActive: true,
    sortOrder: 3,
    articleCount: 18
  }
];

const AdminCategoriesPanel = () => {
  const [categories, setCategories] = useState(initialCategories);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'Globe',
    colorGradient: 'from-blue-500 to-cyan-500',
    isActive: true
  });
  const [activeTab, setActiveTab] = useState('categories');

  // Get icon component by name
  const getIconComponent = (iconName) => {
    const iconData = AVAILABLE_ICONS.find(icon => icon.name === iconName);
    return iconData ? iconData.icon : Globe;
  };

  // Handle form submission
  const handleSubmit = () => {
    // Basic validation
    if (!formData.name.trim()) {
      alert('Category name is required');
      return;
    }
    
    if (editingCategory) {
      // Update existing category
      setCategories(categories.map(cat => 
        cat.id === editingCategory.id 
          ? { ...cat, ...formData, slug: formData.name.toLowerCase().replace(/\s+/g, '-') }
          : cat
      ));
    } else {
      // Create new category
      const newCategory = {
        id: Date.now().toString(),
        ...formData,
        slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
        sortOrder: categories.length + 1,
        articleCount: 0
      };
      setCategories([...categories, newCategory]);
    }
    
    handleCloseModal();
  };

  // Handle opening edit modal
  const handleEdit = (category) => {
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
  const handleDelete = (categoryId) => {
    if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      setCategories(categories.filter(cat => cat.id !== categoryId));
    }
  };

  // Handle toggle active status
  const handleToggleActive = (categoryId) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, isActive: !cat.isActive }
        : cat
    ));
  };

  // Stats for dashboard
  const stats = {
    totalCategories: categories.length,
    activeCategories: categories.filter(cat => cat.isActive).length,
    totalArticles: categories.reduce((sum, cat) => sum + cat.articleCount, 0),
    averageArticlesPerCategory: Math.round(categories.reduce((sum, cat) => sum + cat.articleCount, 0) / categories.length)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">DigestGenie Admin</h1>
              <p className="text-gray-600">Manage your newsletter aggregation platform</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">admin@digestgenie.com</span>
              <button className="text-sm text-blue-600 hover:text-blue-800">
                Back to App
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'categories', name: 'Categories', icon: Tag },
              { id: 'users', name: 'Users', icon: Users },
              { id: 'newsletters', name: 'Newsletters', icon: Mail },
              { id: 'analytics', name: 'Analytics', icon: BarChart3 },
              { id: 'settings', name: 'Settings', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        {activeTab === 'categories' && (
          <div className="space-y-6">
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

            {/* Categories Management */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Categories Management</h2>
                  <button
                    onClick={handleNew}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </button>
                </div>
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
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'categories' && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Settings className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management
            </h3>
            <p className="text-gray-500">This section is under development.</p>
          </div>
        )}
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
};

export default AdminCategoriesPanel;