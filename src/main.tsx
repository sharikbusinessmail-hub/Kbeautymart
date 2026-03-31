import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async' 
import App from './app/App'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      {/* Notice how BrowserRouter and StoreProvider are removed from here? 
          They are already safely inside App.tsx! */}
      <App />
    </HelmetProvider>
  </StrictMode>,
)