// src/main.jsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/colors.css'
import './styles/global.css'
import './index.css' 

console.log('[main] booting...') // smoke test: you should see this in DevTools

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

