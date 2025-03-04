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

      if (!videoId) {
        return res.status(400).json({ success: false, message: 'Video ID is required' });
      }

      try {
        // Use the youtube-transcript package with explicit error handling
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);

        if (!transcript || transcript.length === 0) {
          return res.status(404).json({ success: false, message: 'No transcript found for this video' });
        }

        // Format the transcript data to match our expected format
        const formattedTranscript = transcript.map(item => ({
          text: item.text,
          start: item.offset * 1000, // Convert from seconds to milliseconds
          duration: item.duration * 1000 // Convert from seconds to milliseconds
        }));

        return res.json({ success: true, transcript: formattedTranscript });
      } catch (transcriptError) {
        return res.status(500).json({ 
          success: false, 
          message: `Transcript API error: ${transcriptError.message}` 
        });
      }
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to fetch transcript' 
      });
    }
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
  });
}

createServer(); 