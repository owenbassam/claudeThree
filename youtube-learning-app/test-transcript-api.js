async function testTranscriptApi() {
  console.log('Testing youtube-transcript-api library...');
  
  try {
    const TranscriptApiClient = require('youtube-transcript-api');
    const client = new TranscriptApiClient();
    
    console.log('Waiting for client to initialize...');
    await client.ready;
    console.log('Client initialized!');
    
    const videoId = 'dQw4w9WgXcQ'; // Rick Astley
    console.log(`Fetching transcript for video: ${videoId}`);
    
    const result = await client.getTranscript(videoId);
    
    console.log('SUCCESS!');
    console.log('Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.log('FAILED:', error.message);
    console.log('Full error:', error);
  }
}

testTranscriptApi();