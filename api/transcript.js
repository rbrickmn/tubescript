import { YoutubeTranscript } from 'youtube-transcript';

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

    try {
      // Use the youtube-transcript package with explicit error handling
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);

      if (!transcript || transcript.length === 0) {
        console.log(`No transcript found for video ID: ${videoId}`);
        return res.status(404).json({ 
          success: false, 
          message: 'No transcript found for this video. The video may not have captions available.' 
        });
      }

      // Format the transcript data to match our expected format
      const formattedTranscript = transcript.map(item => ({
        text: item.text,
        start: item.offset * 1000, // Convert from seconds to milliseconds
        duration: item.duration * 1000 // Convert from seconds to milliseconds
      }));

      console.log(`Successfully retrieved transcript for video ID: ${videoId} (${formattedTranscript.length} entries)`);
      return res.status(200).json({ success: true, transcript: formattedTranscript });
    } catch (transcriptError) {
      console.error(`Transcript API error for video ID ${videoId}:`, transcriptError);
      
      // Check for specific error types
      if (transcriptError.message && transcriptError.message.includes('Could not find any transcript')) {
        return res.status(404).json({ 
          success: false, 
          message: 'No transcript found for this video. The video may not have captions available.' 
        });
      }
      
      // Check for network errors
      if (transcriptError.message && transcriptError.message.includes('network')) {
        return res.status(503).json({ 
          success: false, 
          message: 'Network error while fetching transcript. Please try again later.' 
        });
      }
      
      return res.status(500).json({ 
        success: false, 
        message: `Transcript API error: ${transcriptError.message}` 
      });
    }
  } catch (error) {
    console.error('General error in transcript API:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch transcript' 
    });
  }
} 