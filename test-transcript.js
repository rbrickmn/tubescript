import { YoutubeTranscript } from 'youtube-transcript';

// Test with a known video that should have transcripts
const testVideoId = 'dQw4w9WgXcQ'; // Rick Astley - Never Gonna Give You Up

async function testTranscriptAPI() {
  console.log(`Testing transcript API with video ID: ${testVideoId}`);
  
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(testVideoId);
    
    if (transcript && transcript.length > 0) {
      console.log(`Success! Found ${transcript.length} transcript entries.`);
      console.log('First few entries:');
      console.log(transcript.slice(0, 3));
    } else {
      console.log('No transcript found for this video.');
    }
  } catch (error) {
    console.error('Error fetching transcript:', error);
  }
}

testTranscriptAPI(); 