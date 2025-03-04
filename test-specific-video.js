import { YoutubeTranscript } from 'youtube-transcript';

// The specific video ID from your debug info
const videoId = 'OcoG-WafCKQ';

async function testSpecificVideo() {
  console.log(`Testing transcript API with specific video ID: ${videoId}`);
  
  try {
    console.log('Attempting to fetch transcript...');
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    
    if (transcript && transcript.length > 0) {
      console.log(`Success! Found ${transcript.length} transcript entries.`);
      console.log('First few entries:');
      console.log(JSON.stringify(transcript.slice(0, 3), null, 2));
    } else {
      console.log('No transcript found for this video.');
    }
  } catch (error) {
    console.error('Error fetching transcript:', error);
    console.error('Error details:', error.message);
  }
}

testSpecificVideo(); 