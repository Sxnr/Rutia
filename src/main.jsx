import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './client/ui/App.jsx'
import './index.css'
import { RouteProvider } from './client/state/store.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouteProvider>
      <App />
    </RouteProvider>
  </React.StrictMode>,
)
