import React from 'react';
import ReactDOM from 'react-dom/client';
import './theme/variables.css';
import './index.css'; // Global styles
import App from './App'; // Main app component
import { defineCustomElements as ionicPwaElements } from '@ionic/pwa-elements/loader';
import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader';

// Load custom elements for Ionic PWA and SQLite
ionicPwaElements(window);
jeepSqlite(window);

// Create the root element
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
