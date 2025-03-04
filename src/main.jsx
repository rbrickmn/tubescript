import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { checkApiHealth } from './utils/apiHealth'

// API Health Check wrapper component
function AppWithHealthCheck() {
  const [apiStatus, setApiStatus] = useState({
    checked: false,
    healthy: true,
    message: null
  });

  useEffect(() => {
    const checkHealth = async () => {
      try {
        // Only perform health check in production
        if (import.meta.env.PROD) {
          const isHealthy = await checkApiHealth();
          setApiStatus({
            checked: true,
            healthy: isHealthy,
            message: isHealthy ? null : "API service may be experiencing issues. If transcript generation fails, please try again later."
          });
        } else {
          // In development, assume API is healthy
          setApiStatus({
            checked: true,
            healthy: true,
            message: null
          });
        }
      } catch (error) {
        console.error('Health check error:', error);
        // Only show warning in production
        if (import.meta.env.PROD) {
          setApiStatus({
            checked: true,
            healthy: false,
            message: "Could not verify API service. If transcript generation fails, please try again later."
          });
        }
      }
    };

    checkHealth();
  }, []);

  return (
    <>
      {apiStatus.checked && !apiStatus.healthy && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 p-2 text-center text-sm z-50">
          ⚠️ {apiStatus.message}
        </div>
      )}
      <App />
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppWithHealthCheck />
  </StrictMode>,
)
