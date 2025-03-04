import express from 'express';
import cors from 'cors';
import { YoutubeTranscript } from 'youtube-transcript';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createServer() {
  const app = express();
  const port = process.env.PORT || 3000;

  // Add CORS middleware
  app.use(cors());

  // API endpoint to get YouTube transcript - MUST be defined BEFORE Vite middleware
  app.get('/api/transcript', async (req, res) => {
    try {
      const { videoId } = req.query;
      console.log('Received request for transcript with videoId:', videoId);

      if (!videoId) {
        console.log('No videoId provided');
        return res.status(400).json({ success: false, message: 'Video ID is required' });
      }

      console.log('Fetching transcript from YouTube API...');
      try {
        // Use the youtube-transcript package with explicit error handling
        console.log('Calling YoutubeTranscript.fetchTranscript with videoId:', videoId);
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        
        console.log('Transcript fetch result:', 
          transcript ? `Found ${transcript.length} entries, first entry: ${JSON.stringify(transcript[0])}` : 'No transcript found');

        if (!transcript || transcript.length === 0) {
          return res.status(404).json({ success: false, message: 'No transcript found for this video' });
        }

        // Format the transcript data to match our expected format
        console.log('Formatting transcript data...');
        console.log('Sample transcript item:', JSON.stringify(transcript[0]));
        
        const formattedTranscript = transcript.map(item => ({
          text: item.text,
          start: item.offset * 1000, // Convert from fractional seconds to seconds
          duration: item.duration * 1000 // Convert from fractional seconds to seconds
        }));

        console.log('Formatted sample:', JSON.stringify(formattedTranscript[0]));
        console.log('Sending successful response with transcript data');
        return res.json({ success: true, transcript: formattedTranscript });
      } catch (transcriptError) {
        console.error('Error in YouTube transcript API:', transcriptError);
        console.error('Error stack:', transcriptError.stack);
        return res.status(500).json({ 
          success: false, 
          message: `Transcript API error: ${transcriptError.message}` 
        });
      }
    } catch (error) {
      console.error('General error in transcript endpoint:', error);
      console.error('Error stack:', error.stack);
      return res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to fetch transcript' 
      });
    }
  });

  // Add a test endpoint that directly returns the transcript - MUST be defined BEFORE Vite middleware
  app.get('/api/test-transcript/:videoId', async (req, res) => {
    try {
      const { videoId } = req.params;
      console.log('Test endpoint called with videoId:', videoId);
      
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      
      return res.json({
        success: true,
        videoId,
        transcriptLength: transcript ? transcript.length : 0,
        sampleEntries: transcript ? transcript.slice(0, 5) : []
      });
    } catch (error) {
      console.error('Error in test endpoint:', error);
      return res.json({
        success: false,
        error: error.message,
        stack: error.stack
      });
    }
  });

  // Serve the test-api.html file - MUST be defined BEFORE Vite middleware
  app.get('/test-api', (req, res) => {
    res.sendFile(path.join(__dirname, 'test-api.html'));
  });

  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  // Use Vite's connect instance as middleware - this should be AFTER our API routes
  app.use(vite.middlewares);

  // Start the server
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Test API page available at http://localhost:${port}/test-api`);
    console.log(`Direct test endpoint: http://localhost:${port}/api/test-transcript/dQw4w9WgXcQ`);
  });
}

createServer(); 