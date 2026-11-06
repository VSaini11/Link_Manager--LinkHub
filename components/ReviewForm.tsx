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
    
    if (formData.rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating between 1 and 5.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
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
      <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
        <CheckCircle className="h-14 w-14 text-emerald-500 mx-auto" />
        <h3 className="text-xl font-heading font-bold text-slate-900">Thank You!</h3>
        <p className="text-slate-600 text-sm max-w-sm mx-auto">
          Your review has been submitted successfully. It will be published after brief moderation.
        </p>
        <Button 
          onClick={() => setIsSubmitted(false)} 
          variant="outline"
          className="border-slate-300 text-slate-700 hover:bg-slate-100"
        >
          Write Another Review
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left">
      {/* Personal Information */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Name *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Your full name"
            className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-indigo-500/20"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="your@email.com"
            className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-indigo-500/20"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="company" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Company (Optional)</Label>
        <Input
          id="company"
          name="company"
          value={formData.company}
          onChange={handleInputChange}
          placeholder="Your company or project"
          className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-indigo-500/20"
        />
      </div>

      {/* Rating */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Rating *</Label>
        <div className="flex items-center gap-1.5 pt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingClick(star)}
              className="p-1 hover:scale-110 transition-transform focus:outline-none"
            >
              <Star
                className={`h-7 w-7 ${
                  star <= formData.rating
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-300 hover:text-amber-300'
                }`}
              />
            </button>
          ))}
          {formData.rating > 0 && (
            <span className="ml-3 text-xs font-semibold text-slate-600">
              {formData.rating} of 5 stars
            </span>
          )}
        </div>
      </div>

      {/* Review Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Review Title *</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Summarize your experience"
          maxLength={200}
          className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-indigo-500/20"
          required
        />
      </div>

      {/* Review Content */}
      <div className="space-y-1.5">
        <Label htmlFor="content" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Your Review *</Label>
        <Textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleInputChange}
          placeholder="What do you think of LinkHub? How does it help your workflows?"
          rows={4}
          maxLength={1000}
          className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-indigo-500/20"
          required
        />
      </div>

      {/* Terms */}
      <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 p-3 rounded-xl">
        <p>
          By submitting, you agree that your review may be displayed publicly. Your email is kept private and never shown.
        </p>
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        disabled={isSubmitting} 
        className="w-full bg-indigo-600 text-white hover:bg-indigo-700 font-semibold py-3 rounded-xl shadow-md shadow-indigo-600/20 transition-all active:scale-[0.98]"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Review'
        )}
      </Button>
    </form>
  );
}
