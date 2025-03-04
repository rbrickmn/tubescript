import axios from 'axios';

// Function to fetch transcript from YouTube
export async function fetchTranscript(videoId) {
  try {
    console.log('Fetching transcript for videoId:', videoId);
    
    // Using our local server API endpoint
    const response = await axios.get(`/api/transcript?videoId=${videoId}`, {
      // Add a timeout to prevent hanging requests
      timeout: 30000,
      // Ensure we're getting JSON
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log('Raw API response:', response);
    
    if (response.data && response.data.success) {
      // Check if transcript array is present and has items
      if (Array.isArray(response.data.transcript) && response.data.transcript.length > 0) {
        console.log(`Transcript received with ${response.data.transcript.length} entries`);
        return {
          success: true,
          transcript: response.data.transcript
        };
      } else {
        console.error('API returned success: true but transcript is empty or invalid', response.data);
        throw new Error('Transcript data is invalid or empty');
      }
    } else {
      console.error('API returned success: false', response.data);
      throw new Error(response.data.message || 'No transcript found');
    }
  } catch (error) {
    console.error('Error fetching transcript:', error);
    
    // Provide more detailed error information
    let errorMessage = 'Failed to fetch transcript';
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error request:', error.request);
      errorMessage = 'No response from server';
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
} 