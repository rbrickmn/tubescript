/**
 * API utility functions for fetching transcript data
 */

const API_BASE_URL = import.meta.env.PROD 
  ? '/api' 
  : 'http://localhost:3000/api';

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
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await fetch(`${API_BASE_URL}/transcript?videoId=${videoId}`, {
      signal: controller.signal
    });
    
    // Clear the timeout
    clearTimeout(timeoutId);
    
    const data = await response.json();

    if (!response.ok) {
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
      throw new Error(data.message || 'Failed to fetch transcript');
    }

    return data.transcript;
  } catch (error) {
    // Handle specific error types
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. The server might be experiencing high load or connectivity issues.');
    }
    
    // Check if it's a network error
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error. Please check your internet connection and try again.');
    }
    
    // Re-throw the error with the message we've already set
    throw error;
  }
} 