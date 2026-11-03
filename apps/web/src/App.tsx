import React from 'react';
import { ProgressProvider } from './context/ProgressContext';
import { AppShell } from './components/layout/AppShell';

export const App: React.FC = () => {
  return (
    <ProgressProvider>
      <AppShell />
    </ProgressProvider>
  );
};

export default App;
