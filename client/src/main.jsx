import React from 'react';
import ReactDOM from 'react-dom/client';
import { IconContext } from '@phosphor-icons/react';
import App from './App.jsx';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Premium duotone icons app-wide */}
    <IconContext.Provider value={{ weight: 'duotone' }}>
      <App />
    </IconContext.Provider>
  </React.StrictMode>
);
