import axios from 'axios';

/**
 * Fetches the transcript for a YouTube video
 * @param {string} videoId - The YouTube video ID
 * @returns {Promise<Object>} - Object containing success status and transcript data or error
 */
export const fetchTranscript = async (videoId) => {
  try {
    // Add a timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await fetch(`/api/transcript?videoId=${videoId}`, {
      signal: controller.signal
    });
    
    // Clear the timeout
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      // Try to parse the error message from the response
      try {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.message || `Server error: ${response.status}`
        };
      } catch (e) {
        // If we can't parse the JSON, use the status text
        return {
          success: false,
          error: `Server error: ${response.status} ${response.statusText}`
        };
      }
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    // Handle specific error types
    if (error.name === 'AbortError') {
      return {
        success: false,
        error: 'Request timed out. The server might be experiencing high load or connectivity issues.'
      };
    }
    
    if (error.message && error.message.includes('Failed to fetch')) {
      return {
        success: false,
        error: 'Unable to connect to the server. Please check your internet connection or try again later.'
      };
    }
    
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}; 