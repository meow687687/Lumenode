import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ProgressProvider } from './context/ProgressContext';
import { AppShell } from './components/layout/AppShell';
import { DashboardView } from './components/dashboard/DashboardView';
import { ExploreView } from './components/explore/ExploreView';
import { LessonRoutePage } from './components/lesson/LessonRoutePage';
import { LabRoutePage } from './components/laboratories/LabRoutePage';
import { PracticeView } from './components/practice/PracticeView';
import { GlossaryView } from './components/glossary/GlossaryView';
import { AlertCircle } from 'lucide-react';

export const NotFoundPage: React.FC = () => (
  <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-4">
    <div className="p-3 bg-rose-500/10 text-rose-400 rounded-full w-max mx-auto">
      <AlertCircle className="w-10 h-10" />
    </div>
    <h1 className="text-3xl font-extrabold text-slate-100">404 — Page Not Found</h1>
    <p className="text-sm text-slate-400 leading-relaxed">
      The requested route does not exist on the Lumenode platform.
    </p>
    <div className="pt-4">
      <Link
        to="/"
        className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-600/30"
      >
        <span>Return to Dashboard</span>
      </Link>
    </div>
  </div>
);

export const App: React.FC = () => {
  return (
    <ProgressProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<DashboardView />} />
            <Route path="explore" element={<ExploreView />} />
            <Route path="languages" element={<ExploreView />} />
            <Route path="subjects" element={<ExploreView />} />
            <Route path="lessons/:id" element={<LessonRoutePage />} />
            <Route path="labs/:id" element={<LabRoutePage />} />
            <Route path="practice" element={<PracticeView />} />
            <Route path="glossary" element={<GlossaryView />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ProgressProvider>
  );
};

export default App;
