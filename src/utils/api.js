import axios from 'axios';

// Function to fetch transcript from YouTube
export async function fetchTranscript(videoId) {
  try {
    // Using our local server API endpoint
    const response = await axios.get(`/api/transcript?videoId=${videoId}`, {
      // Add a timeout to prevent hanging requests
      timeout: 30000,
      // Ensure we're getting JSON
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.data && response.data.success) {
      // Check if transcript array is present and has items
      if (Array.isArray(response.data.transcript) && response.data.transcript.length > 0) {
        return {
          success: true,
          transcript: response.data.transcript
        };
      } else {
        throw new Error('Transcript data is invalid or empty');
      }
    } else {
      throw new Error(response.data.message || 'No transcript found');
    }
  } catch (error) {
    // Provide more detailed error information
    let errorMessage = 'Failed to fetch transcript';
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = 'No response from server';
    } else {
      // Something happened in setting up the request that triggered an Error
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
} 