/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReviewFormData {
  name: string;
  email: string;
  company: string;
  rating: number;
  title: string;
  content: string;
}

export default function ReviewForm() {
  const [formData, setFormData] = useState<ReviewFormData>({
    name: '',
    email: '',
    company: '',
    rating: 0,
    title: '',
    content: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form
      if (!formData.name || !formData.email || !formData.rating || !formData.title || !formData.content) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      if (formData.rating < 1 || formData.rating > 5) {
        toast({
          title: "Invalid Rating",
          description: "Please select a rating between 1 and 5 stars.",
          variant: "destructive",
        });
        return;
      }

      // Submit to API
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }
      
      setIsSubmitted(true);
      toast({
        title: "Review Submitted!",
        description: "Thank you for your feedback. Your review will be published after moderation.",
      });

    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "There was an error submitting your review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="text-center p-8 bg-slate-800 border-slate-700">
        <CardContent className="space-y-4">
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto" />
          <h3 className="text-xl font-semibold text-white">Thank You!</h3>
          <p className="text-slate-300">
            Your review has been submitted successfully. It will be published after our moderation process.
          </p>
          <Button 
            onClick={() => setIsSubmitted(false)} 
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500"
          >
            Write Another Review
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white">Name *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Your full name"
            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-500"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="your@email.com"
            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-500"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="company" className="text-white">Company (Optional)</Label>
        <Input
          id="company"
          name="company"
          value={formData.company}
          onChange={handleInputChange}
          placeholder="Your company or organization"
          className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-500"
        />
      </div>

      {/* Rating */}
      <div className="space-y-2">
        <Label className="text-white">Rating *</Label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingClick(star)}
              className="p-1 hover:scale-110 transition-transform"
            >
              <Star
                className={`h-8 w-8 ${
                  star <= formData.rating
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-slate-400 hover:text-yellow-300'
                }`}
              />
            </button>
          ))}
          {formData.rating > 0 && (
            <span className="ml-2 text-sm text-slate-400">
              {formData.rating} out of 5 stars
            </span>
          )}
        </div>
      </div>

      {/* Review Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-white">Review Title *</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Summarize your experience"
          maxLength={200}
          className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-500"
          required
        />
        <p className="text-xs text-slate-400">
          {formData.title.length}/200 characters
        </p>
      </div>

      {/* Review Content */}
      <div className="space-y-2">
        <Label htmlFor="content" className="text-white">Your Review *</Label>
        <Textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleInputChange}
          placeholder="Share your experience with LinkHub. What did you like? How did it help your business?"
          rows={5}
          maxLength={1000}
          className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-500"
          required
        />
        <p className="text-xs text-slate-400">
          {formData.content.length}/1000 characters
        </p>
      </div>

      {/* Terms */}
      <div className="text-xs text-slate-400 bg-slate-700 border border-slate-600 p-3 rounded-lg">
        <p>
          By submitting this review, you agree that your feedback may be published on our website. 
          We reserve the right to moderate reviews for inappropriate content. Your email will not be displayed publicly.
        </p>
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        disabled={isSubmitting} 
        className="w-full bg-white text-purple-900 hover:bg-purple-50 font-semibold"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Submitting Review...
          </>
        ) : (
          'Submit Review'
        )}
      </Button>
    </form>
  );
}
