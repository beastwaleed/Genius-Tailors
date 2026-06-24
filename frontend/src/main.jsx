import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem',
              background: '#0A0A0A',
              color: '#FDFBF7',
              borderRadius: '6px',
              padding: '12px 16px',
              boxShadow: '0 8px 40px rgba(10,10,10,0.18)',
            },
            success: {
              iconTheme: { primary: '#C9A96E', secondary: '#0A0A0A' },
            },
            error: {
              iconTheme: { primary: '#C0392B', secondary: '#FDFBF7' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
