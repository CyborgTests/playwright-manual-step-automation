import React from 'react';
import ReactDOM from 'react-dom/client';
import Layout from './components/Layout';
import App from './components/App';
import { Analytics } from './components/Analytics';
import '../styles/globals.css';

const root = ReactDOM.createRoot(
  document.getElementById('cyborg-app') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Analytics />
    <Layout>
      <App />
    </Layout>
  </React.StrictMode>
);
