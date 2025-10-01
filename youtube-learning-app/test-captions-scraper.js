async function testCaptionsScraper() {
  console.log('Testing youtube-captions-scraper library...');
  
  try {
    const { getSubtitles } = require('youtube-captions-scraper');
    
    const videoId = 'dQw4w9WgXcQ'; // Rick Astley
    console.log(`Fetching captions for video: ${videoId}`);
    
    const captions = await getSubtitles({
      videoID: videoId,
      lang: 'en'
    });
    
    console.log('SUCCESS!');
    console.log('Number of caption segments:', captions.length);
    if (captions.length > 0) {
      console.log('First 3 segments:');
      captions.slice(0, 3).forEach((caption, i) => {
        console.log(`${i + 1}. "${caption.text}" (${caption.start}s, ${caption.dur}s)`);
      });
    }
    
  } catch (error) {
    console.log('FAILED:', error.message);
    console.log('Full error:', error);
  }
}

testCaptionsScraper();