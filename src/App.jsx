import { useState, useEffect, useRef } from "react";
import YouTubePlayer from "./components/YouTubePlayer";
import TranscriptViewer from "./components/TranscriptViewer";
import SearchBar from "./components/SearchBar";
import { fetchTranscript } from "./utils/api";

function App() {
  const [videoId, setVideoId] = useState("");
  const [transcript, setTranscript] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [playerRef, setPlayerRef] = useState(null);
  const [isTranscriptReady, setIsTranscriptReady] = useState(false);
  const transcriptContainerRef = useRef(null);
  const videoContainerRef = useRef(null);

  const handleVideoSubmit = async (url) => {
    try {
      setLoading(true);
      setError("");
      setIsTranscriptReady(false);
      
      // Extract video ID from YouTube URL
      const extractedVideoId = extractVideoId(url);
      
      if (!extractedVideoId) {
        throw new Error("Invalid YouTube URL");
      }
      
      setVideoId(extractedVideoId);
      
      // Fetch transcript using our API utility
      const result = await fetchTranscript(extractedVideoId);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch transcript");
      }
      
      setTranscript(result.transcript);
      
      // Add a slight delay before showing the transcript for a smoother experience
      setTimeout(() => {
        setIsTranscriptReady(true);
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const seekToTime = (time) => {
    if (playerRef) {
      // Convert milliseconds to seconds for the YouTube player API
      const timeInSeconds = time / 1000;
      playerRef.seekTo(timeInSeconds);
      playerRef.playVideo();
    }
  };

  // Adjust transcript container height to match video container
  useEffect(() => {
    if (videoId && videoContainerRef.current && transcriptContainerRef.current) {
      const adjustHeight = () => {
        const videoHeight = videoContainerRef.current.offsetHeight;
        transcriptContainerRef.current.style.height = `${videoHeight}px`;
      };
      
      // Initial adjustment with a slight delay to ensure video is loaded
      setTimeout(adjustHeight, 500);
      
      // Use MutationObserver to detect changes in the video container
      const resizeObserver = new ResizeObserver(() => {
        adjustHeight();
      });
      
      resizeObserver.observe(videoContainerRef.current);
      
      // Adjust on window resize
      window.addEventListener('resize', adjustHeight);
      
      return () => {
        window.removeEventListener('resize', adjustHeight);
        resizeObserver.disconnect();
      };
    }
  }, [videoId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 text-zinc-900 p-4 md:p-8 flex flex-col">
      <div className="max-w-full mx-auto flex-grow px-4">
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-center mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">YouTube Transcript Generator</h1>
          <p className="text-center text-zinc-600 max-w-2xl mx-auto">Paste a YouTube URL to generate a transcript with clickable timestamps</p>
        </header>
        
        <div className="max-w-3xl mx-auto mb-10">
          <SearchBar onSubmit={handleVideoSubmit} isLoading={loading} />
        </div>
        
        {error && (
          <div className="my-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 max-w-3xl mx-auto">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
              </svg>
              {error}
            </div>
          </div>
        )}
        
        {videoId && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto animate-fadeIn">
            <div 
              className="bg-white rounded-xl shadow-md p-5 border border-zinc-100" 
              ref={videoContainerRef}
            >
              <YouTubePlayer videoId={videoId} setPlayerRef={setPlayerRef} />
            </div>
            
            <div 
              className="bg-white rounded-xl shadow-md p-5 border border-zinc-100 flex flex-col" 
              ref={transcriptContainerRef}
            >
              <TranscriptViewer 
                transcript={transcript} 
                onTimeClick={seekToTime}
                loading={loading}
                isReady={isTranscriptReady}
              />
            </div>
          </div>
        )}
      </div>
      
      <footer className="mt-16 text-center text-zinc-500 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 border-t border-zinc-200">
            <p>© {new Date().getFullYear()} YouTube Transcript Generator. All rights reserved.</p>
            <p className="mt-1">Made with ❤️ for content creators and learners.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper function to extract video ID from YouTube URL
function extractVideoId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default App;
