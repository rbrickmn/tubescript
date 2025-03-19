// CommonJS style require - more compatible with Vercel
const { YoutubeTranscript } = require('youtube-transcript');
const fetch = require('node-fetch');

// Helper function to detect if we're running on Vercel
function isRunningOnVercel() {
  return Boolean(process.env.VERCEL || process.env.VERCEL_ENV || process.env.VERCEL_URL);
}

// Helper function to use our proxy instead of direct YouTube fetch
async function proxyFetch(url) {
  // In Vercel environment, use the YouTube proxy
  if (isRunningOnVercel()) {
    // For Vercel, use relative URL to avoid issues with domains
    // Using just a relative path for simplicity and reliability
    const proxyUrl = `/api/youtube-proxy?url=${encodeURIComponent(url)}`;
    
    console.log(`Using proxy for YouTube request: ${proxyUrl}`);
    return fetch(proxyUrl);
  } else {
    // In development, fetch directly
    console.log(`Direct fetch in development: ${url}`);
    return fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
  }
}

// Fallback function to get transcript if the youtube-transcript package fails
async function fetchTranscriptFallback(videoId) {
  console.log(`Attempting fallback transcript fetch for video ID: ${videoId}`);
  
  try {
    // First, get the video page to extract necessary tokens
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const videoPageResponse = await proxyFetch(videoUrl);
    
    if (!videoPageResponse.ok) {
      throw new Error(`Failed to fetch video page: ${videoPageResponse.status}`);
    }
    
    const videoPageText = await videoPageResponse.text();
    
    // Try to get the transcript list URL
    const timedTextUrlMatch = videoPageText.match(/"playerCaptionsTracklistRenderer":\s*{(.*?)}/s);
    if (!timedTextUrlMatch) {
      throw new Error('Could not find transcript data in video page');
    }
    
    // Check if captions are available
    if (videoPageText.includes('"captionTracks":[]') || !videoPageText.includes('"captionTracks"')) {
      throw new Error('No captions available for this video');
    }
    
    // Extract the caption track URL
    const captionTrackMatch = videoPageText.match(/"captionTracks":\s*\[\s*{(.*?)}\s*\]/s);
    if (!captionTrackMatch) {
      throw new Error('Could not find caption tracks in video page');
    }
    
    const baseUrlMatch = captionTrackMatch[1].match(/"baseUrl":\s*"(.*?)"/);
    if (!baseUrlMatch) {
      throw new Error('Could not find caption URL in video page');
    }
    
    let captionUrl = baseUrlMatch[1].replace(/\\u0026/g, '&');
    
    // Add format=json3 to get JSON format
    if (!captionUrl.includes('format=')) {
      captionUrl += '&fmt=json3';
    }
    
    console.log(`Fetching captions from URL: ${captionUrl}`);
    
    // Fetch the actual transcript data using our proxy
    const transcriptResponse = await proxyFetch(captionUrl);
    
    if (!transcriptResponse.ok) {
      throw new Error(`Failed to fetch transcript data: ${transcriptResponse.status}`);
    }
    
    const transcriptData = await transcriptResponse.json();
    
    if (!transcriptData.events || transcriptData.events.length === 0) {
      throw new Error('No transcript events found in response');
    }
    
    // Format the transcript data
    const formattedTranscript = transcriptData.events
      .filter(event => event.segs && event.segs.length > 0)
      .map(event => {
        const text = event.segs.map(seg => seg.utf8).join(' ').trim();
        return {
          text,
          start: event.tStartMs,
          duration: (event.dDurationMs || 0)
        };
      })
      .filter(item => item.text); // Remove empty entries
    
    console.log(`Fallback method successfully retrieved ${formattedTranscript.length} transcript entries`);
    return formattedTranscript;
  } catch (error) {
    console.error('Fallback transcript fetch error:', error);
    throw error;
  }
}

// Custom wrapper for the YoutubeTranscript package that uses our proxy
async function fetchTranscriptWithProxy(videoId) {
  // In a Vercel environment, we need to modify the internals of the package
  // to use our proxy instead of direct YouTube requests
  if (isRunningOnVercel()) {
    // Use the fallback method directly since it's already using our proxy
    return fetchTranscriptFallback(videoId);
  } else {
    // In development, use the package normally
    return YoutubeTranscript.fetchTranscript(videoId, {
      lang: 'en',
      country: 'US'
    });
  }
}

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { videoId } = req.query;

    if (!videoId) {
      return res.status(400).json({ success: false, message: 'Video ID is required' });
    }

    // Log the request for debugging
    console.log(`Processing transcript request for video ID: ${videoId}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'unknown'}`);
    console.log(`Vercel environment: ${process.env.VERCEL_ENV || 'not on Vercel'}`);
    console.log(`Running on Vercel: ${isRunningOnVercel()}`);

    let transcript = null;
    let error = null;

    // First try with the youtube-transcript package or our proxy wrapper
    try {
      // Add more detailed logging
      console.log(`Attempting to fetch transcript for video ID: ${videoId}`);
      
      // Use our custom wrapper function
      transcript = await fetchTranscriptWithProxy(videoId);

      if (!transcript || transcript.length === 0) {
        console.log(`No transcript found for video ID: ${videoId}`);
        throw new Error('No transcript found for this video');
      }

      // Format the transcript data to match our expected format
      const formattedTranscript = transcript.map(item => ({
        text: item.text,
        start: item.offset ? item.offset * 1000 : item.start, // Convert from seconds to milliseconds if needed
        duration: item.duration ? item.duration * 1000 : item.duration // Convert from seconds to milliseconds if needed
      }));

      console.log(`Successfully retrieved transcript for video ID: ${videoId} (${formattedTranscript.length} entries)`);
      return res.status(200).json({ success: true, transcript: formattedTranscript });
    } catch (transcriptError) {
      console.error(`Primary method failed for video ID ${videoId}:`, transcriptError);
      console.error(`Error name: ${transcriptError.name}, Error message: ${transcriptError.message}`);
      error = transcriptError;
      
      // Don't return an error yet, try the fallback method
    }

    // If the primary method failed, try the fallback method
    if (!transcript) {
      try {
        console.log(`Primary method failed, trying fallback method for video ID: ${videoId}`);
        const fallbackTranscript = await fetchTranscriptFallback(videoId);
        
        if (fallbackTranscript && fallbackTranscript.length > 0) {
          console.log(`Fallback method succeeded for video ID: ${videoId} (${fallbackTranscript.length} entries)`);
          return res.status(200).json({ success: true, transcript: fallbackTranscript });
        } else {
          throw new Error('Fallback method returned empty transcript');
        }
      } catch (fallbackError) {
        console.error(`Fallback method failed for video ID ${videoId}:`, fallbackError);
        
        // If both methods failed, return the original error
        if (error && error.message && error.message.includes('disabled on this video')) {
          // This might be a false positive when deployed on Vercel
          return res.status(503).json({ 
            success: false, 
            message: 'Unable to access video transcripts. This may be a temporary issue with our service.' 
          });
        }
        
        if (error && error.message && error.message.includes('Could not find any transcript')) {
          return res.status(404).json({ 
            success: false, 
            message: 'No transcript found for this video. The video may not have captions available.' 
          });
        }
        
        // Generic error message
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to fetch transcript using multiple methods. Please try again later.' 
        });
      }
    }
  } catch (error) {
    console.error('General error in transcript API:', error);
    console.error(`Error name: ${error.name}, Error message: ${error.message}`);
    console.error(`Error stack: ${error.stack}`);
    
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch transcript' 
    });
  }
} 