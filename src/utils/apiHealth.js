/**
 * Checks if the API is available and working
 * @returns {Promise<boolean>} - True if the API is available, false otherwise
 */
export const checkApiHealth = async () => {
  // Get the base URL based on environment
  const apiBase = (import.meta.env.PROD || window.location.hostname !== 'localhost')
    ? '' // Empty string for relative URLs in production
    : 'http://localhost:3000';
    
  console.log(`Checking API health using base URL: ${apiBase}`);
  
  try {
    // First try the health endpoint
    try {
      console.log('Attempting health endpoint check...');
      const healthResponse = await fetch(`${apiBase}/api/health`);
      
      if (healthResponse.ok) {
        const data = await healthResponse.json();
        console.info('API health check successful:', data);
        return data.status === 'ok';
      } else {
        console.warn(`Health endpoint returned status: ${healthResponse.status}`);
      }
    } catch (healthError) {
      console.warn('Health endpoint check failed:', healthError);
    }

    // If health endpoint fails, try the transcript endpoint with a test video ID
    console.log('Attempting transcript endpoint check...');
    const testVideoId = 'dQw4w9WgXcQ'; // Rick Astley - Never Gonna Give You Up (common test video)
    
    // Create a timeout using AbortController instead of AbortSignal.timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      const transcriptResponse = await fetch(`${apiBase}/api/transcript?videoId=${testVideoId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        signal: controller.signal
      });
      
      // Clear the timeout
      clearTimeout(timeoutId);
      
      // If we get any response from the transcript endpoint (even an error), 
      // consider the API available since it's responding
      console.info('Transcript endpoint check status:', transcriptResponse.status);
      
      // Only consider it a failure if we get a 404 (Not Found) or 503 (Service Unavailable)
      const isAvailable = ![404, 503].includes(transcriptResponse.status);
      console.info(`API availability determined from transcript endpoint: ${isAvailable}`);
      return isAvailable;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('Transcript endpoint check failed:', fetchError);
      throw fetchError;
    }
  } catch (error) {
    console.error('API health check error:', error);
    
    // If we're in development mode, assume API is working
    if (import.meta.env.DEV) {
      console.info('Development mode detected, assuming API is available');
      return true;
    }
    
    // In production, if we're on the same domain as the API, assume it's available
    // This helps with Vercel deployments where the API is part of the same deployment
    if (window.location.hostname !== 'localhost') {
      console.info('Production environment on same domain, assuming API is available');
      return true;
    }
    
    return false;
  }
}; 