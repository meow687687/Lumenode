import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ProgressProvider } from './context/ProgressContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppShell } from './components/layout/AppShell';
import { DashboardView } from './components/dashboard/DashboardView';
import { AlertCircle, Loader2 } from 'lucide-react';

// Code-split heavy views for initial load performance
const ExploreView = lazy(() => import('./components/explore/ExploreView').then(m => ({ default: m.ExploreView })));
const LessonRoutePage = lazy(() => import('./components/lesson/LessonRoutePage').then(m => ({ default: m.LessonRoutePage })));
const LabRoutePage = lazy(() => import('./components/laboratories/LabRoutePage').then(m => ({ default: m.LabRoutePage })));
const ConceptView = lazy(() => import('./components/concept/ConceptView').then(m => ({ default: m.ConceptView })));
const PracticeView = lazy(() => import('./components/practice/PracticeView').then(m => ({ default: m.PracticeView })));
const GlossaryView = lazy(() => import('./components/glossary/GlossaryView').then(m => ({ default: m.GlossaryView })));

export const RouteLoadingFallback: React.FC = () => (
  <div 
    className="flex items-center justify-center py-24 space-x-3 text-slate-400"
    role="status"
    aria-label="Loading content"
  >
    <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
    <span className="text-xs font-mono">Loading educational module...</span>
  </div>
);

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
    <ThemeProvider>
      <ProgressProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<DashboardView />} />
            <Route
              path="explore"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <ExploreView />
                </Suspense>
              }
            />
            <Route
              path="languages"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <ExploreView />
                </Suspense>
              }
            />
            <Route
              path="subjects"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <ExploreView />
                </Suspense>
              }
            />
            <Route
              path="concepts/:id"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <ConceptView />
                </Suspense>
              }
            />
            <Route
              path="lessons/:id"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <LessonRoutePage />
                </Suspense>
              }
            />
            <Route
              path="labs/:id"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <LabRoutePage />
                </Suspense>
              }
            />
            <Route
              path="practice"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <PracticeView />
                </Suspense>
              }
            />
            <Route
              path="glossary"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <GlossaryView />
                </Suspense>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ProgressProvider>
  </ThemeProvider>
);
};

export default App;
