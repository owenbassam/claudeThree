const { YoutubeTranscript } = require('youtube-transcript');

async function testTranscript() {
  const testVideos = [
    'dQw4w9WgXcQ', // Rick Astley - Never Gonna Give You Up (has captions)
    'jNQXAC9IVRw', // "Me at the zoo" first YouTube video (probably has captions)
    'fNk_zzaMoSs', // 3Blue1Brown vector video
  ];

  for (const videoId of testVideos) {
    try {
      console.log(`\n=== Testing video: ${videoId} ===`);
      
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      
      console.log('SUCCESS!');
      console.log('Number of segments:', transcript.length);
      if (transcript.length > 0) {
        console.log('First 3 segments:');
        transcript.slice(0, 3).forEach((segment, i) => {
          console.log(`${i + 1}. "${segment.text}" (${segment.offset}ms, ${segment.duration}ms)`);
        });
      }
      
    } catch (error) {
      console.log('FAILED:', error.message);
    }
  }
}

testTranscript();