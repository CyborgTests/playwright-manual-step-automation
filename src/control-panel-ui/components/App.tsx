import { HeroUIProvider } from '@heroui/system';
import React from 'react';
import { Toaster } from 'react-hot-toast';
import { TestStoreProvider, useTestStore } from '../store/TestStore';
import Footer from './Footer';
import JiraTicket from './JiraTicket';
import TestControlPanel from './TestControlPanel';

function AppContent() {
  const { state } = useTestStore();

  return (
    <div className="relative flex flex-col h-screen bg-background">
      {state.createJiraTicket ? <JiraTicket /> : <TestControlPanel />}
      <Footer />
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#000000',
            color: '#fff',
          },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <TestStoreProvider>
      <HeroUIProvider>
        <AppContent />
      </HeroUIProvider>
    </TestStoreProvider>
  );
}
