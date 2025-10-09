// app/(dashboard)/saved/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bookmark,
  Folder,
  Plus,
  Search,
  Trash2,
  Edit,
  ExternalLink,
  Mail,
  Clock,
  Tag,
  FolderPlus,
  X,
} from 'lucide-react';

interface SavedArticle {
  id: string;
  article: {
    id: string;
    subject: string;
    aiGeneratedTitle?: string;
    aiSummary?: string;
    url?: string;
    newsletter: {
      name: string;
      logoUrl?: string;
    };
    publishedAt: string;
  };
  notes?: string;
  tags: string[];
  folder?: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
  savedAt: string;
}

interface SavedFolder {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  articleCount?: number;
}

export default function SavedPage() {
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
  const [folders, setFolders] = useState<SavedFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<SavedArticle | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [editingNotes, setEditingNotes] = useState('');
  const [editingTags, setEditingTags] = useState('');
  const [newFolder, setNewFolder] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: 'folder',
  });

  useEffect(() => {
    fetchSavedArticles();
    fetchFolders();
  }, []);

  const fetchSavedArticles = async () => {
    try {
      const response = await fetch('/api/saved-articles');
      if (response.ok) {
        const data = await response.json();
        setSavedArticles(data);
      }
    } catch (error) {
      console.error('Error fetching saved articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async () => {
    try {
      const response = await fetch('/api/saved-folders');
      if (response.ok) {
        const data = await response.json();
        setFolders(data);
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const handleUnsave = async (articleId: string) => {
    if (!confirm('Remove this article from saved?')) return;

    try {
      const response = await fetch(`/api/articles/${articleId}/save`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSavedArticles(prev => prev.filter(a => a.article.id !== articleId));
      }
    } catch (error) {
      console.error('Error removing saved article:', error);
    }
  };

  const handleEditArticle = (article: SavedArticle) => {
    setSelectedArticle(article);
    setEditingNotes(article.notes || '');
    setEditingTags(article.tags.join(', '));
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedArticle) return;

    try {
      const response = await fetch(`/api/saved-articles/${selectedArticle.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: editingNotes,
          tags: editingTags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });

      if (response.ok) {
        await fetchSavedArticles();
        setIsEditDialogOpen(false);
        setSelectedArticle(null);
      }
    } catch (error) {
      console.error('Error updating saved article:', error);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolder.name) {
      alert('Folder name is required');
      return;
    }

    try {
      const response = await fetch('/api/saved-folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFolder),
      });

      if (response.ok) {
        await fetchFolders();
        setIsFolderDialogOpen(false);
        setNewFolder({
          name: '',
          description: '',
          color: '#3B82F6',
          icon: 'folder',
        });
      }
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleMoveToFolder = async (articleId: string, folderId: string | null) => {
    try {
      const response = await fetch(`/api/saved-articles/${articleId}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId }),
      });

      if (response.ok) {
        await fetchSavedArticles();
      }
    } catch (error) {
      console.error('Error moving article:', error);
    }
  };

  const filteredArticles = savedArticles.filter((savedArticle) => {
    const matchesSearch = !searchTerm || (
      savedArticle.article.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      savedArticle.article.aiGeneratedTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      savedArticle.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      savedArticle.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const matchesFolder =
      selectedFolder === 'all' ||
      (selectedFolder === 'none' && !savedArticle.folder) ||
      savedArticle.folder?.id === selectedFolder;

    return matchesSearch && matchesFolder;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Bookmark className="w-12 h-12 animate-pulse text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading saved articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Articles</h1>
        <p className="text-gray-600">
          {savedArticles.length} articles saved for later
        </p>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search saved articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={selectedFolder} onValueChange={setSelectedFolder}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Folders</SelectItem>
              <SelectItem value="none">No Folder</SelectItem>
              {folders.map((folder) => (
                <SelectItem key={folder.id} value={folder.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: folder.color }}
                    />
                    {folder.name}
                    {folder.articleCount && folder.articleCount > 0 && (
                      <span className="text-gray-400">({folder.articleCount})</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => setIsFolderDialogOpen(true)}>
            <FolderPlus className="w-4 h-4 mr-2" />
            New Folder
          </Button>
        </div>
      </div>

      {/* Folders Quick Access */}
      {folders.length > 0 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            variant={selectedFolder === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFolder('all')}
          >
            All Articles
          </Button>
          {folders.map((folder) => (
            <Button
              key={folder.id}
              variant={selectedFolder === folder.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFolder(folder.id)}
              className="whitespace-nowrap"
            >
              <div
                className="w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: folder.color }}
              />
              {folder.name}
              {folder.articleCount && folder.articleCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {folder.articleCount}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      )}

      {/* Articles List */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Bookmark className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No matching articles' : 'No saved articles yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm
              ? 'Try adjusting your search or filters'
              : 'Articles you save will appear here'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((savedArticle) => (
            <Card key={savedArticle.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {savedArticle.article.newsletter.logoUrl ? (
                      <img
                        src={savedArticle.article.newsletter.logoUrl}
                        alt={savedArticle.article.newsletter.name}
                        className="w-5 h-5 rounded flex-shrink-0"
                      />
                    ) : (
                      <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                    <span className="text-xs font-medium text-gray-600 truncate">
                      {savedArticle.article.newsletter.name}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={() => handleUnsave(savedArticle.article.id)}
                  >
                    <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-600" />
                  </Button>
                </div>

                <h3 className="text-base font-semibold text-gray-900 line-clamp-2 mb-2">
                  {savedArticle.article.aiGeneratedTitle || savedArticle.article.subject}
                </h3>

                {savedArticle.article.aiSummary && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {savedArticle.article.aiSummary}
                  </p>
                )}
              </CardHeader>

              <CardContent>
                {savedArticle.notes && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {savedArticle.notes}
                    </p>
                  </div>
                )}

                {savedArticle.folder && (
                  <div className="flex items-center gap-1 mb-3">
                    <Folder className="w-3 h-3" style={{ color: savedArticle.folder.color }} />
                    <span className="text-xs text-gray-600">{savedArticle.folder.name}</span>
                  </div>
                )}

                {savedArticle.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {savedArticle.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                  <Clock className="w-3 h-3" />
                  Saved {formatDate(savedArticle.savedAt)}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditArticle(savedArticle)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  {savedArticle.article.url && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={savedArticle.article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Article Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Saved Article</DialogTitle>
            <DialogDescription>
              Add notes and tags to organize this article
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Notes
              </label>
              <Textarea
                placeholder="Add your notes here..."
                value={editingNotes}
                onChange={(e) => setEditingNotes(e.target.value)}
                rows={4}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Tags (comma-separated)
              </label>
              <Input
                placeholder="e.g., important, read later, tech"
                value={editingTags}
                onChange={(e) => setEditingTags(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Folder
              </label>
              <Select
                value={selectedArticle?.folder?.id || 'none'}
                onValueChange={(value) =>
                  selectedArticle &&
                  handleMoveToFolder(
                    selectedArticle.id,
                    value === 'none' ? null : value
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Folder</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Folder Dialog */}
      <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Organize your saved articles into folders
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Folder Name *
              </label>
              <Input
                placeholder="e.g., Important, Read Later"
                value={newFolder.name}
                onChange={(e) =>
                  setNewFolder({ ...newFolder, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Description
              </label>
              <Input
                placeholder="Optional description"
                value={newFolder.description}
                onChange={(e) =>
                  setNewFolder({ ...newFolder, description: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Color
              </label>
              <div className="flex gap-2">
                {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'].map(
                  (color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        newFolder.color === color
                          ? 'border-gray-900'
                          : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewFolder({ ...newFolder, color })}
                    />
                  )
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFolderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>Create Folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}