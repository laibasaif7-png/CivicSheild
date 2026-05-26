import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // ⬅️ Ye line add karein
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> {/* ⬅️ App ko iske andar wrap karein */}
      <App />
    </BrowserRouter>
  </StrictMode>,
)