import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { HelmetProvider } from 'react-helmet-async' // 1. Import HelmetProvider
import { StoreProvider } from './app/components/store'
import App from './app/App'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* 2. Wrap everything inside HelmetProvider */}
    <HelmetProvider>
      <StoreProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </StoreProvider>
    </HelmetProvider>
  </StrictMode>,
)