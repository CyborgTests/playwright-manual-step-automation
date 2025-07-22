import React from 'react';
import ReactDOM from 'react-dom/client';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <button onClick={() => {
      console.log('clicked');
    }}>
      Click me
    </button>
  </React.StrictMode>
);
