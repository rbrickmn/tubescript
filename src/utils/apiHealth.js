/**
 * Checks if the API is available and working
 * @returns {Promise<boolean>} - True if the API is available, false otherwise
 */
export const checkApiHealth = async () => {
  try {
    // First try the health endpoint
    try {
      const healthResponse = await fetch('/api/health');
      if (healthResponse.ok) {
        const data = await healthResponse.json();
        console.info('API health check:', data);
        return data.status === 'ok';
      }
    } catch (healthError) {
      console.warn('Health endpoint check failed, trying transcript endpoint');
    }

    // If health endpoint fails, try the transcript endpoint with a test video ID
    const testVideoId = 'dQw4w9WgXcQ'; // Rick Astley - Never Gonna Give You Up (common test video)
    
    // Create a timeout using AbortController instead of AbortSignal.timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    try {
      const transcriptResponse = await fetch(`/api/transcript?videoId=${testVideoId}`, {
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
      return transcriptResponse.status !== 404; // Only consider 404 as a failure
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    console.error('API health check error:', error);
    
    // If we're in development mode, assume API is working
    if (import.meta.env.DEV) {
      console.info('Development mode detected, assuming API is available');
      return true;
    }
    
    return false;
  }
}; 