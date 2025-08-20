'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { PenTool, Send, X } from 'lucide-react';

const categories = [
  'URL Shortening',
  'Analytics', 
  'Marketing',
  'Tips & Tricks',
  'Industry News',
  'Tutorials'
];

export default function BlogSubmissionPage() {
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    submitterName: '',
    submitterEmail: '',
    category: '',
    tags: ''
  });
  const [tagArray, setTagArray] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      category: value
    }));
  };

  const addTag = () => {
    const tag = formData.tags.trim().toLowerCase();
    if (tag && !tagArray.includes(tag) && tagArray.length < 5) {
      setTagArray(prev => [...prev, tag]);
      setFormData(prev => ({ ...prev, tags: '' }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTagArray(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/blog/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags: tagArray
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData({
          title: '',
          excerpt: '',
          content: '',
          submitterName: '',
          submitterEmail: '',
          category: '',
          tags: ''
        });
        setTagArray([]);
      } else {
        setError(data.error || 'Failed to submit blog post');
      }
    } catch (error) {
      setError('Failed to submit blog post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
        <div className="max-w-2xl mx-auto px-3 sm:px-4">
          <Card className="shadow-lg">
            <CardContent className="text-center p-4 sm:p-8">
              <div className="mb-4 p-3 bg-green-100 rounded-full w-fit mx-auto">
                <Send className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Blog Post Submitted!</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                Thank you for your submission. Our admin team will review your blog post and publish it if approved.
              </p>
              <div className="space-y-3 sm:space-y-4">
                <Button onClick={() => setSuccess(false)} className="w-full">
                  Submit Another Post
                </Button>
                <Button variant="outline" onClick={() => router.push('/blog')} className="w-full">
                  View Blog
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
      <div className="max-w-4xl mx-auto px-3 sm:px-4">
        <Card className="shadow-lg">
          <CardHeader className="text-center p-4 sm:p-6">
            <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
              <PenTool className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold">Submit a Blog Post</CardTitle>
            <CardDescription className="text-base sm:text-lg">
              Share your knowledge with the LinkHub community. All submissions are reviewed before publishing.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="submitterName">Your Name *</Label>
                  <Input
                    id="submitterName"
                    name="submitterName"
                    value={formData.submitterName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="submitterEmail">Your Email *</Label>
                  <Input
                    id="submitterEmail"
                    name="submitterEmail"
                    type="email"
                    value={formData.submitterEmail}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>

              {/* Blog Content */}
              <div className="space-y-2">
                <Label htmlFor="title">Blog Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter an engaging title for your blog post"
                  maxLength={200}
                  required
                />
                <p className="text-xs sm:text-sm text-gray-500">{formData.title.length}/200 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Short Description *</Label>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  placeholder="Write a brief description or excerpt for your blog post"
                  rows={3}
                  maxLength={300}
                  required
                />
                <p className="text-sm text-gray-500">{formData.excerpt.length}/300 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Blog Content *</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Write your full blog post content here. Use clear headings and formatting to make it easy to read."
                  rows={12}
                  required
                />
                <p className="text-sm text-gray-500">
                  Word count: {formData.content.split(' ').filter(word => word.length > 0).length}
                </p>
              </div>

              {/* Category and Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select onValueChange={handleCategoryChange} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (Optional)</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="tags"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="Add a tag and press Enter"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button type="button" onClick={addTag} variant="outline" size="sm">
                      Add
                    </Button>
                  </div>
                  {tagArray.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tagArray.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-gray-500">Tags help readers find your content</p>
                </div>
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="pt-4 border-t">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                  size="lg"
                >
                  {loading ? 'Submitting...' : 'Submit Blog Post for Review'}
                </Button>
                <p className="text-sm text-gray-500 text-center mt-3">
                  Your submission will be reviewed by our team before publishing
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
