import React from 'react';
import Footer from './Footer';
import TestControlPanel from './TestControlPanel';
import { TestStoreProvider } from '../store/TestStore';
import { HeroUIProvider } from "@heroui/system";

export default function App() {
  return (
    <TestStoreProvider>
      <HeroUIProvider>
        <div className="relative flex flex-col h-screen bg-background">
          <TestControlPanel />
          <Footer />
        </div>
      </HeroUIProvider>
    </TestStoreProvider>
  );
} 