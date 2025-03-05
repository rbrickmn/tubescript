/**
 * API utility functions for fetching transcript data
 */

// More robust API base URL detection
const API_BASE_URL = (() => {
  // In development mode on localhost, use the full URL
  if (import.meta.env.DEV && window.location.hostname === 'localhost') {
    return 'http://localhost:3000/api';
  }
  
  // In all other cases (Vercel, production, preview deployments), use relative path
  // This works because the API is part of the same deployment
  return '/api';
})();

console.log(`API base URL configured as: ${API_BASE_URL}`);

/**
 * Extract YouTube video ID from various URL formats
 * @param {string} url - YouTube URL
 * @returns {string|null} - Video ID or null if invalid
 */
export function extractVideoId(url) {
  if (!url) return null;
  
  // Handle various YouTube URL formats
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/i,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^/?]+)/i,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^/?]+)/i,
    /^([a-zA-Z0-9_-]{11})$/  // Direct video ID (11 characters)
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Fetch transcript for a YouTube video
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Object>} - Transcript data or error
 */
export async function fetchTranscript(videoId) {
  if (!videoId) {
    throw new Error('Video ID is required');
  }

  try {
    // Add a timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // Reduce timeout to 15 seconds
    
    const apiUrl = `${API_BASE_URL}/transcript?videoId=${videoId}`;
    console.log(`Fetching transcript from: ${apiUrl}`);
    
    // Single fetch attempt with proper error handling
    const response = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    // Clear the timeout
    clearTimeout(timeoutId);
    
    const data = await response.json();

    if (!response.ok) {
      console.error(`API error: ${response.status} - ${data.message || 'Unknown error'}`);
      
      // Handle specific error cases
      if (response.status === 404) {
        throw new Error(data.message || 'Transcript not found. The video may not have captions available.');
      } else if (response.status === 429) {
        throw new Error('Too many requests. Please try again later.');
      } else if (response.status >= 500) {
        throw new Error('Server error. Our transcript service is currently experiencing issues.');
      } else {
        throw new Error(data.message || 'Failed to fetch transcript');
      }
    }

    if (!data.success) {
      console.error(`API returned success: false - ${data.message || 'Unknown error'}`);
      throw new Error(data.message || 'Failed to fetch transcript');
    }

    return data.transcript;
  } catch (error) {
    // Handle specific error types
    if (error.name === 'AbortError') {
      console.error('Request timed out:', error);
      throw new Error('Request timed out. The server might be experiencing high load or connectivity issues.');
    }
    
    // Check if it's a network error
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      console.error('Network error:', error);
      throw new Error('Network error. Please check your internet connection and try again.');
    }
    
    // Re-throw the error with the message we've already set
    console.error('Fetch transcript error:', error);
    throw error;
  }
} 