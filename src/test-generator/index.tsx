import React from 'react';
import ReactDOM from 'react-dom/client';
import EventRecorderApp from './components/EventRecorderApp';
import { EventRecorderProvider } from './store/EventRecorderStore';
import '../styles/globals.css';

const root = ReactDOM.createRoot(
  document.getElementById('cyborg-app') as HTMLElement
);

root.render(
  <React.StrictMode>
    <EventRecorderProvider>
      <EventRecorderApp />
    </EventRecorderProvider>
  </React.StrictMode>
);
