
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './globals.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

import { ProjectProvider } from './context/ProjectContext';
import { ThemeProvider } from './context/ThemeContext';

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ProjectProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ProjectProvider>
  </React.StrictMode>
);
