import React, { useState } from 'react';
import { 
  MessageSquarePlus, 
  X, 
  Send, 
  CheckCircle, 
  Star, 
  AlertTriangle, 
  Lightbulb, 
  BookOpen, 
  Eye, 
  Copy,
  Check
} from 'lucide-react';
import { FeedbackCategory, FeedbackSubmission } from '@lumenode/shared-types';

export const FEEDBACK_STORAGE_KEY = 'lumenode_feedback_submissions';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLessonId?: string;
  initialConceptId?: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  initialLessonId,
  initialConceptId,
}) => {
  const [category, setCategory] = useState<FeedbackCategory>('improvement');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const categories: { id: FeedbackCategory; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'lesson_clarity',
      label: 'Rate Clarity',
      icon: <Star className="w-4 h-4 text-amber-400" />,
      desc: 'How clearly was this concept explained?',
    },
    {
      id: 'improvement',
      label: 'Suggestion',
      icon: <Lightbulb className="w-4 h-4 text-blue-400" />,
      desc: 'Ideas for visualizers, tools, or explanations',
    },
    {
      id: 'problem',
      label: 'Report Problem',
      icon: <AlertTriangle className="w-4 h-4 text-rose-400" />,
      desc: 'Bugs, broken code, or interface glitches',
    },
    {
      id: 'educational_error',
      label: 'Educational Error',
      icon: <BookOpen className="w-4 h-4 text-emerald-400" />,
      desc: 'Inaccurate CS definitions or faulty code examples',
    },
    {
      id: 'accessibility',
      label: 'Accessibility',
      icon: <Eye className="w-4 h-4 text-purple-400" />,
      desc: 'Keyboard, screen-reader, or contrast issues',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim().length < 3) return;

    const submission: FeedbackSubmission = {
      id: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      submittedAt: Date.now(),
      category,
      lessonId: initialLessonId,
      conceptId: initialConceptId,
      rating: category === 'lesson_clarity' ? rating : undefined,
      comment: comment.trim(),
      userEmail: email.trim() || undefined,
      deviceInfo: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        viewport: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : undefined,
      },
    };

    // Save to local storage queue
    try {
      const existingRaw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
      const existing: FeedbackSubmission[] = existingRaw ? JSON.parse(existingRaw) : [];
      existing.push(submission);
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(existing));
    } catch (err) {
      console.warn('Could not save feedback to localStorage:', err);
    }

    setSubmitted(true);
  };

  const handleCopyJson = () => {
    const feedbackData = {
      category,
      rating: category === 'lesson_clarity' ? rating : undefined,
      comment,
      email: email || undefined,
      lessonId: initialLessonId,
      conceptId: initialConceptId,
      timestamp: new Date().toISOString(),
    };
    navigator.clipboard.writeText(JSON.stringify(feedbackData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setComment('');
    setEmail('');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-title"
    >
      <div className="relative w-full max-w-lg bg-[#0F172A] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 id="feedback-title" className="text-base font-semibold text-slate-100">
                Beta Feedback & Suggestions
              </h2>
              <p className="text-xs text-slate-400">
                Help us make computer science transparent and accessible
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
            aria-label="Close feedback modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Thank You for Your Feedback!</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Your feedback has been recorded in your local-first feedback queue. We review all beta inputs to refine explanations, visualizers, and accessibility.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={handleCopyJson}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied JSON!' : 'Copy Feedback JSON'}</span>
              </button>
              <button
                onClick={handleResetAndClose}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                What would you like to share?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col items-start gap-1 ${
                      category === cat.id
                        ? 'bg-blue-600/15 border-blue-500 text-blue-200'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-medium text-xs">
                      {cat.icon}
                      <span>{cat.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Clarity Rating (Only if rating clarity) */}
            {category === 'lesson_clarity' && (
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-xs text-slate-300 block">Pedagogical Clarity Rating</span>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-1 rounded transition hover:scale-110 ${
                        star <= rating ? 'text-amber-400' : 'text-slate-600'
                      }`}
                      aria-label={`${star} star rating`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                  <span className="text-xs font-mono text-slate-400 ml-2">
                    {rating === 5 ? 'Crystal clear' : rating === 1 ? 'Confusing' : `${rating} / 5`}
                  </span>
                </div>
              </div>
            )}

            {/* Comments Field */}
            <div>
              <label htmlFor="feedback-comment" className="block text-xs font-medium text-slate-300 mb-1.5">
                Your Comments & Details <span className="text-rose-400">*</span>
              </label>
              <textarea
                id="feedback-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                required
                minLength={3}
                placeholder="What was confusing, inspiring, or broken? Specific details help our educational team improve."
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Optional Email */}
            <div>
              <label htmlFor="feedback-email" className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address <span className="text-slate-500 font-normal">(Optional — only if you want a follow-up)</span>
              </label>
              <input
                id="feedback-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@university.edu"
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Privacy note & Submit button */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-500">
                Local-first. No tracking cookies or passwords collected.
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={comment.trim().length < 3}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Feedback</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
