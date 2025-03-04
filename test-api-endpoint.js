import axios from 'axios';

// Use a known video ID
const videoId = 'OcoG-WafCKQ';

async function testApiEndpoint() {
  try {
    console.log(`Testing API endpoint for video ID: ${videoId}`);
    const response = await axios.get(`http://localhost:3000/api/transcript?videoId=${videoId}`);
    
    console.log('API Response Status:', response.status);
    console.log('API Response Success:', response.data.success);
    console.log('Transcript length:', response.data.transcript.length);
    
    console.log('First few entries:');
    for (let i = 0; i < Math.min(5, response.data.transcript.length); i++) {
      console.log(`Entry ${i}:`, JSON.stringify(response.data.transcript[i], null, 2));
    }
    
    // Check for entries with non-zero timestamps
    const nonZeroEntries = response.data.transcript.filter(item => item.start > 0);
    console.log(`\nEntries with non-zero timestamps: ${nonZeroEntries.length}`);
    if (nonZeroEntries.length > 0) {
      console.log('Sample non-zero timestamp entry:', JSON.stringify(nonZeroEntries[0], null, 2));
    }
  } catch (error) {
    console.error('Error testing API endpoint:', error.message);
    if (error.response) {
      console.error('Error response data:', error.response.data);
    }
  }
}

testApiEndpoint(); 