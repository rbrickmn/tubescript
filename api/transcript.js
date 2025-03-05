import { YoutubeTranscript } from 'youtube-transcript';
import fetch from 'node-fetch';

// Fallback function to get transcript if the youtube-transcript package fails
async function fetchTranscriptFallback(videoId) {
  console.log(`Attempting fallback transcript fetch for video ID: ${videoId}`);
  
  try {
    // First, get the video page to extract necessary tokens
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const videoPageResponse = await fetch(videoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
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
    
    // Fetch the actual transcript data
    const transcriptResponse = await fetch(captionUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
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

export default async function handler(req, res) {
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

    // Set a timeout for the entire operation
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Operation timed out')), 8000);
    });

    // Try to fetch transcript with timeout
    try {
      const transcriptPromise = YoutubeTranscript.fetchTranscript(videoId, {
        lang: 'en',
        country: 'US'
      });

      const transcript = await Promise.race([transcriptPromise, timeoutPromise]);

      if (!transcript || transcript.length === 0) {
        throw new Error('No transcript found for this video');
      }

      // Format the transcript data
      const formattedTranscript = transcript.map(item => ({
        text: item.text,
        start: item.offset * 1000,
        duration: item.duration * 1000
      }));

      return res.status(200).json({ success: true, transcript: formattedTranscript });
    } catch (error) {
      console.error(`Primary method failed for video ID ${videoId}:`, error);
      
      // Try fallback method with timeout
      try {
        const fallbackPromise = fetchTranscriptFallback(videoId);
        const fallbackTranscript = await Promise.race([fallbackPromise, timeoutPromise]);
        
        if (fallbackTranscript && fallbackTranscript.length > 0) {
          return res.status(200).json({ success: true, transcript: fallbackTranscript });
        }
      } catch (fallbackError) {
        console.error(`Fallback method failed for video ID ${videoId}:`, fallbackError);
      }
    }

    // If we get here, both methods failed
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch transcript. The video might not have captions available or the service is temporarily unavailable.'
    });

  } catch (error) {
    console.error('General error in transcript API:', error);
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while fetching the transcript.'
    });
  }
} 