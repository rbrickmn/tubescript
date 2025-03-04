import axios from 'axios';

// The specific video ID from your debug info
const videoId = 'OcoG-WafCKQ';

async function testDirectAPI() {
  console.log(`Testing direct API call with video ID: ${videoId}`);
  
  try {
    // Call our test endpoint directly
    console.log('Calling test endpoint...');
    const response = await axios.get(`http://localhost:3000/api/test-transcript/${videoId}`);
    
    console.log('API Response:', JSON.stringify(response.data, null, 2));
    
    // Now try the regular endpoint
    console.log('\nCalling regular transcript endpoint...');
    const regularResponse = await axios.get(`http://localhost:3000/api/transcript?videoId=${videoId}`);
    
    console.log('Regular API Response Status:', regularResponse.status);
    console.log('Regular API Response Success:', regularResponse.data.success);
    console.log('Regular API Response Transcript Length:', 
      regularResponse.data.transcript ? regularResponse.data.transcript.length : 0);
    
    if (regularResponse.data.transcript && regularResponse.data.transcript.length > 0) {
      console.log('First few entries:');
      console.log(JSON.stringify(regularResponse.data.transcript.slice(0, 3), null, 2));
    }
  } catch (error) {
    console.error('Error in API call:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testDirectAPI(); 