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
        // In production, check API health but don't block rendering
        if (import.meta.env.PROD || window.location.hostname !== 'localhost') {
          console.log('Production environment detected, checking API health...');
          
          // Set a timeout to ensure we don't wait too long for the health check
          const healthCheckTimeout = setTimeout(() => {
            console.log('Health check timeout reached, assuming API is available');
            setApiStatus({
              checked: true,
              healthy: true,
              message: null
            });
          }, 5000); // 5 second timeout
          
          try {
            const isHealthy = await checkApiHealth();
            clearTimeout(healthCheckTimeout);
            
            setApiStatus({
              checked: true,
              healthy: isHealthy,
              message: isHealthy ? null : "API service may be experiencing issues. If transcript generation fails, please try again later."
            });
          } catch (error) {
            clearTimeout(healthCheckTimeout);
            console.error('Health check error:', error);
            
            // Don't show a warning unless we're sure there's an issue
            setApiStatus({
              checked: true,
              healthy: true, // Assume healthy to avoid false negatives
              message: null
            });
          }
        } else {
          // In development, assume API is healthy
          console.log('Development environment detected, assuming API is healthy');
          setApiStatus({
            checked: true,
            healthy: true,
            message: null
          });
        }
      } catch (error) {
        console.error('Health check wrapper error:', error);
        // Only show warning if we're confident there's an issue
        setApiStatus({
          checked: true,
          healthy: true, // Default to assuming it's healthy
          message: null
        });
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
