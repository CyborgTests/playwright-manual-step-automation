import React, { Fragment, useEffect } from 'react';
import Footer from './Footer';
import Header from './Header';
import TestControlPanel from './TestControlPanel';
// import OpenDocumentPIP from './OpenDocumentPIP';
import { TestStoreProvider } from '../store/TestStore';

// Add TypeScript interface for Document PiP
declare global {
  interface Window {
    documentPictureInPicture: {
      requestWindow(options: { width: string; height: string }): Promise<Window>;
    };
  }
}

export default function App() {
  return (
    <TestStoreProvider>
      <Header />
      <TestControlPanel />
      <Footer />
      {/* <OpenDocumentPIP /> */}
    </TestStoreProvider>
  );
} 