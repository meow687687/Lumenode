import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Cpu, 
  Layers, 
  Award, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  X 
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ONBOARDING_STEPS = [
  {
    icon: <Sparkles className="w-8 h-8 text-blue-400" />,
    badge: 'Welcome to Lumenode',
    title: 'Explore. Understand. Build.',
    description:
      'Lumenode is an open-source, interactive computer science learning platform that bridges theoretical explanations and hands-on systems programming through real code execution, interactive memory maps, and step-by-step laboratories.',
  },
  {
    icon: <Layers className="w-8 h-8 text-cyan-400" />,
    badge: 'Curriculum Architecture',
    title: 'Concept-First, Language-Independent',
    description:
      'In traditional learning, concepts are often conflated with language syntax. In Lumenode, foundational computer science concepts (like pointers, trees, and relational queries) are modeled independently, allowing you to compare implementations in C, C++, Python, and more.',
  },
  {
    icon: <Cpu className="w-8 h-8 text-emerald-400" />,
    badge: 'Interactive Laboratories',
    title: 'Visual Simulations & In-Browser Engines',
    description:
      'Step through algorithm operations with time-traveling controls, inspect 64-bit virtual memory addresses and stack activation records, execute relational queries against genuine SQLite WASM, and run Python via Pyodide without leaving your browser.',
  },
  {
    icon: <Award className="w-8 h-8 text-amber-400" />,
    badge: 'Competency Mastery',
    title: 'Spaced Repetition, Zero Cramming',
    description:
      'Progress is tracked through an evidence-based competency state machine. When you demonstrate mastery, your achievement is permanently honored while spaced-repetition intervals help you retain knowledge long-term.',
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-violet-400" />,
    badge: 'Local-First Privacy',
    title: 'Your Progress Stays With You',
    description:
      'Lumenode requires no account, collects no personal data, and stores all progress, bookmarks, and mastery records locally in your browser. You can export or restore a complete JSON backup at any time.',
  },
];

export const ONBOARDING_STORAGE_KEY = 'lumenode_onboarding_dismissed';

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    } catch {
      // LocalStorage access fail-safe
    }
    onClose();
  };

  const step = ONBOARDING_STEPS[currentStep];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div 
        className="relative w-full max-w-lg bg-[#111827] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between overflow-hidden"
      >
        {/* Subtle decorative background gradient */}
        <div className="absolute -right-20 -top-20 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header & Close Button */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <span className="px-2.5 py-1 text-[11px] font-mono font-semibold rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
            {step.badge}
          </span>
          <button
            onClick={handleComplete}
            aria-label="Skip Tour"
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Content */}
        <div className="py-6 space-y-4">
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl w-max">
            {step.icon}
          </div>

          <h2 id="onboarding-title" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {step.title}
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Progress Dots & Action Buttons */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-1.5" aria-label={`Step ${currentStep + 1} of ${ONBOARDING_STEPS.length}`}>
            {ONBOARDING_STEPS.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentStep
                    ? 'w-6 bg-blue-500'
                    : 'w-2 bg-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center space-x-2">
            {currentStep < ONBOARDING_STEPS.length - 1 ? (
              <>
                <button
                  onClick={handleComplete}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
                >
                  Skip Tour
                </button>
                <button
                  onClick={handleNext}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-lg shadow-blue-600/20"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <button
                onClick={handleComplete}
                className="flex items-center space-x-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-lg shadow-emerald-600/20"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Start Learning</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
