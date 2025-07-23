import React from 'react';
import Footer from './Footer';
import Header from './Header';
import TestControlPanel from './TestControlPanel';
import { TestStoreProvider } from '../store/TestStore';
import { HeroUIProvider } from "@heroui/system";

export default function App() {
  return (
    <TestStoreProvider>
      <HeroUIProvider>
        <div className="relative flex flex-col h-screen bg-background">
          <Header />
          <TestControlPanel />
          <Footer />
        </div>
      </HeroUIProvider>
    </TestStoreProvider>
  );
} 