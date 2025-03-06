// Test file for transcript API
import { YoutubeTranscript } from 'youtube-transcript';

// Test video ID
const videoId = 'qjE8HtgFMhY'; // A video with captions

async function testYoutubeTranscript() {
  try {
    console.log('Testing YoutubeTranscript.fetchTranscript...');
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    console.log(`Success! Found ${transcript.length} transcript entries.`);
    console.log('First entry:', transcript[0]);
  } catch (error) {
    console.error('YoutubeTranscript.fetchTranscript failed:', error);
  }
}

async function testYoutubeTranscriptApi() {
  try {
    console.log('Testing youtube-transcript-api...');
    const { default: ytApi } = await import('youtube-transcript-api');
    const transcript = await ytApi.getSubtitles({
      videoID: videoId,
      lang: 'en'
    });
    console.log(`Success! Found ${transcript.length} transcript entries.`);
    console.log('First entry:', transcript[0]);
  } catch (error) {
    console.error('youtube-transcript-api failed:', error);
  }
}

async function testFallback() {
  try {
    console.log('Testing fallback method...');
    // Import the fetchTranscriptFallback function from transcript.js
    const { default: handler } = await import('./transcript.js');
    // We can't directly test the fallback function as it's not exported
    console.log('Cannot directly test fallback method as it is not exported');
  } catch (error) {
    console.error('Fallback test failed:', error);
  }
}

async function runTests() {
  console.log('Starting tests...');
  await testYoutubeTranscript();
  await testYoutubeTranscriptApi();
  await testFallback();
  console.log('Tests completed.');
}

runTests(); 