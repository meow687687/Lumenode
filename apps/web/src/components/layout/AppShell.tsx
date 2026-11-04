import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { GlobalSearchModal } from '../navigation/GlobalSearchModal';
import { OnboardingModal, ONBOARDING_STORAGE_KEY } from '../onboarding/OnboardingModal';
import { FeedbackModal } from '../feedback/FeedbackModal';

export const AppShell: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  // Auto-launch onboarding tour for first-time visitors
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (!dismissed) {
        setTourOpen(true);
      }
    } catch {
      // Ignore localStorage access issues
    }
  }, []);

  // Global keyboard shortcuts for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
        return;
      }

      // Quick / shortcut when not inside an input, textarea, or contentEditable
      if (e.key === '/' && !searchOpen && !tourOpen) {
        const target = e.target as HTMLElement | null;
        const isInputField =
          target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable);

        if (!isInputField) {
          e.preventDefault();
          setSearchOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, tourOpen]);

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-slate-100 flex flex-col font-sans">
      <Header 
        onToggleSidebar={() => setSidebarOpen(prev => !prev)} 
        onOpenSearch={() => setSearchOpen(true)}
        onOpenTour={() => setTourOpen(true)}
        onOpenFeedback={() => setFeedbackOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpenTour={() => setTourOpen(true)}
          onOpenFeedback={() => setFeedbackOpen(true)}
        />

        <main className="flex-1 overflow-y-auto bg-[#0A0F1D] p-4 sm:p-6 lg:p-8" id="main-content">
          <Outlet />
        </main>
      </div>

      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      <OnboardingModal
        isOpen={tourOpen}
        onClose={() => setTourOpen(false)}
      />

      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />
    </div>
  );
};
