import React, { Fragment } from 'react';
import ReactDOM from 'react-dom/client';
import Layout from './components/Layout';
import App from './components/App';
import { Analytics } from './components/Analytics';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Analytics />
    <Layout>
      <App />
    </Layout>
  </React.StrictMode>
);
