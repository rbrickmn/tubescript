import { YoutubeTranscript } from 'youtube-transcript';

// Use a known video ID
const videoId = 'OcoG-WafCKQ';

async function testTranscriptStructure() {
  try {
    console.log(`Fetching transcript for video ID: ${videoId}`);
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    
    console.log('Transcript length:', transcript.length);
    console.log('First entry structure:', JSON.stringify(transcript[0], null, 2));
    console.log('Sample entries:');
    
    // Log a few entries to see the structure
    for (let i = 0; i < Math.min(5, transcript.length); i++) {
      console.log(`Entry ${i}:`, JSON.stringify(transcript[i], null, 2));
    }
  } catch (error) {
    console.error('Error fetching transcript:', error);
  }
}

testTranscriptStructure(); 