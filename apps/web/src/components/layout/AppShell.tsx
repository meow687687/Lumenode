import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { DashboardView } from '../dashboard/DashboardView';
import { ExploreView } from '../explore/ExploreView';
import { PracticeView } from '../practice/PracticeView';
import { LessonRenderer } from '../lesson/LessonRenderer';
import { DSAVisualizer } from '../visualizers/DSAVisualizer';
import { MemorySimulator } from '../visualizers/MemorySimulator';
import { SQLPlayground } from '../laboratories/SQLPlayground';
import { CodePlayground } from '../laboratories/CodePlayground';
import { LESSONS } from '../../data/lessons';
import { useProgress } from '../../context/ProgressContext';
import { ActiveTab } from '../../types';

export const AppShell: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const { activeLessonId, setActiveLessonId } = useProgress();

  const currentLesson = LESSONS.find(l => l.id === activeLessonId) || LESSONS[0];

  const handleSelectLesson = (lessonId: string) => {
    setActiveLessonId(lessonId);
    setActiveTab('lesson');
  };

  const handleNavigateLesson = (direction: 'prev' | 'next') => {
    const currentIndex = LESSONS.findIndex(l => l.id === activeLessonId);
    if (direction === 'prev' && currentIndex > 0) {
      setActiveLessonId(LESSONS[currentIndex - 1].id);
    } else if (direction === 'next' && currentIndex < LESSONS.length - 1) {
      setActiveLessonId(LESSONS[currentIndex + 1].id);
    }
  };

  const handleOpenPlaygroundWithCode = (code: string, language: string) => {
    setActiveTab('code-lab');
  };

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-slate-100 flex flex-col font-sans">
      <Header
        onToggleSidebar={() => setSidebarOpen(prev => !prev)}
        activeTab={activeTab}
        onNavigateTab={tab => setActiveTab(tab)}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeTab={activeTab}
          onNavigateTab={tab => setActiveTab(tab)}
          onSelectLesson={handleSelectLesson}
        />

        <main className="flex-1 overflow-y-auto bg-[#0A0F1D] p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              onSelectLesson={handleSelectLesson}
              onNavigateTab={tab => setActiveTab(tab)}
            />
          )}

          {activeTab === 'explore' && (
            <ExploreView onSelectLesson={handleSelectLesson} />
          )}

          {activeTab === 'practice' && <PracticeView />}

          {activeTab === 'lesson' && (
            <LessonRenderer
              lesson={currentLesson}
              onNavigateLesson={handleNavigateLesson}
              onOpenPlaygroundWithCode={handleOpenPlaygroundWithCode}
            />
          )}

          {activeTab === 'dsa-lab' && (
            <div className="max-w-5xl mx-auto py-6">
              <DSAVisualizer />
            </div>
          )}

          {activeTab === 'memory-lab' && (
            <div className="max-w-5xl mx-auto py-6">
              <MemorySimulator />
            </div>
          )}

          {activeTab === 'sql-lab' && (
            <div className="max-w-5xl mx-auto py-6">
              <SQLPlayground />
            </div>
          )}

          {activeTab === 'code-lab' && (
            <div className="max-w-5xl mx-auto py-6">
              <CodePlayground />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
