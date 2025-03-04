import { useState, useEffect, useRef } from "react";
import YouTubePlayer from "./components/YouTubePlayer";
import TranscriptViewer from "./components/TranscriptViewer";
import SearchBar from "./components/SearchBar";
import { fetchTranscript } from "./utils/api";
import logo from "./assets/logo.svg";

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
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-gray-900 dark:to-gray-800 text-zinc-900 dark:text-gray-100 p-4 md:p-8 flex flex-col">
      <div className="max-w-full mx-auto flex-grow px-4">
        <header className="mb-8 md:mb-10">
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              setVideoId("");
              setTranscript([]);
              setError("");
              setIsTranscriptReady(false);
            }}
            className="block cursor-pointer transition-transform hover:scale-[1.02] focus:outline-none"
            title="Return to home"
          >
            <div className="flex flex-col items-center">
              <img src={logo} alt="YouTube Transcript Generator Logo" className="w-16 h-16 md:w-24 md:h-24 mb-2 md:mb-3 transition-transform hover:scale-105" />
              <h1 className="text-2xl md:text-4xl font-bold text-center mb-2 md:mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Tubescript
              </h1>
            </div>
          </a>
          <p className="text-center text-sm md:text-base text-zinc-600 dark:text-gray-300 max-w-2xl mx-auto">Paste a YouTube URL to generate a transcript with clickable timestamps</p>
        </header>
        
        <div className={`mx-auto mb-10 ${videoId ? 'max-w-[90%]' : 'max-w-3xl'} transition-all duration-300`}>
          <SearchBar onSubmit={handleVideoSubmit} isLoading={loading} />
        </div>
        
        {error && (
          <div className={`my-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 mx-auto ${videoId ? 'max-w-[90%]' : 'max-w-3xl'} transition-all duration-300`}>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
              </svg>
              {error}
            </div>
          </div>
        )}
        
        {videoId && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-[90%] mx-auto animate-fadeIn">
            <div 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border border-zinc-100 dark:border-gray-700" 
              ref={videoContainerRef}
            >
              <YouTubePlayer videoId={videoId} setPlayerRef={setPlayerRef} />
            </div>
            
            <div 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border border-zinc-100 dark:border-gray-700 overflow-hidden flex flex-col will-change-transform" 
              ref={transcriptContainerRef}
              style={{ transform: 'translateZ(0)' }}
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
      
      <footer className="mt-auto pt-8 text-center text-zinc-500 dark:text-gray-400 text-sm">
        <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 border-t border-zinc-200 dark:border-gray-700">
            <p>© {new Date().getFullYear()} Tubescript - YouTube Transcript Generator</p>
            <p className="mt-2 flex items-center justify-center">
              Created by{" "}
              <a 
                href="https://www.github.com/rbrickmn" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium inline-flex items-center ml-1"
              >
                Riley Brickman
                <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </p>
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
