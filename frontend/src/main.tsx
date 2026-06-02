import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Intercepta todas as requisições HTTP para injetar o tenant ID do MVP
const originalFetch = window.fetch;
window.fetch = function (input, init) {
  const customInit = init || {};
  const customHeaders = new Headers(customInit.headers || {});
  if (!customHeaders.has('x-tenant-id')) {
    customHeaders.append('x-tenant-id', 'c8d06faf-fdf0-4c77-9555-4b7a64223ff1');
  }
  customInit.headers = customHeaders;
  return originalFetch(input, customInit);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
