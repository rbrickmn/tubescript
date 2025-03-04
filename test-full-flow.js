import { YoutubeTranscript } from 'youtube-transcript';

// Helper function to extract video ID from YouTube URL
function extractVideoId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Test URLs
const testUrls = [
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Rick Astley - Never Gonna Give You Up
  'https://www.youtube.com/watch?v=OcoG-WafCKQ', // The URL from your screenshot
];

// Test full flow
async function testFullFlow() {
  for (const url of testUrls) {
    console.log(`\nTesting URL: ${url}`);
    
    // Extract video ID
    const videoId = extractVideoId(url);
    console.log(`Extracted ID: ${videoId}`);
    
    if (!videoId) {
      console.log('Failed to extract video ID');
      continue;
    }
    
    // Fetch transcript
    try {
      console.log('Fetching transcript...');
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      
      if (transcript && transcript.length > 0) {
        console.log(`Success! Found ${transcript.length} transcript entries.`);
        console.log('First few entries:');
        console.log(transcript.slice(0, 3));
      } else {
        console.log('No transcript found for this video.');
      }
    } catch (error) {
      console.error('Error fetching transcript:', error.message);
    }
    
    console.log('---');
  }
}

testFullFlow(); 