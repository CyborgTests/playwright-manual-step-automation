import React from 'react';
import Footer from './Footer';
import TestControlPanel from './TestControlPanel';
import JiraTicket from './JiraTicket';
import { TestStoreProvider, useTestStore } from '../store/TestStore';
import { HeroUIProvider } from "@heroui/system";
import { Toaster } from 'react-hot-toast';

function AppContent() {
  const { state } = useTestStore();

  return (
    <div className="relative flex flex-col min-h-screen bg-background">
      {
        state.createJiraTicket ? <JiraTicket /> : <TestControlPanel />
      }
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