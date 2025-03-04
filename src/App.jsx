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
  const [debug, setDebug] = useState(null); // For debugging purposes
  const transcriptContainerRef = useRef(null);
  const videoContainerRef = useRef(null);

  const handleVideoSubmit = async (url) => {
    try {
      setLoading(true);
      setError("");
      setDebug(null);
      
      // Extract video ID from YouTube URL
      const extractedVideoId = extractVideoId(url);
      
      if (!extractedVideoId) {
        throw new Error("Invalid YouTube URL");
      }
      
      console.log("Extracted Video ID:", extractedVideoId);
      setVideoId(extractedVideoId);
      
      // Fetch transcript using our API utility
      console.log("Fetching transcript for video ID:", extractedVideoId);
      const result = await fetchTranscript(extractedVideoId);
      console.log("Transcript API response:", result);
      
      // Store debug info
      setDebug({
        videoId: extractedVideoId,
        apiResponse: result
      });
      
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch transcript");
      }
      
      setTranscript(result.transcript);
    } catch (err) {
      setError(err.message);
      console.error("Error:", err);
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
        const videoHeight = videoContainerRef.current.clientHeight;
        transcriptContainerRef.current.style.maxHeight = `${videoHeight}px`;
      };
      
      // Initial adjustment
      adjustHeight();
      
      // Adjust on window resize
      window.addEventListener('resize', adjustHeight);
      
      return () => {
        window.removeEventListener('resize', adjustHeight);
      };
    }
  }, [videoId]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">YouTube Transcript Generator</h1>
          <p className="text-center text-zinc-600">Paste a YouTube URL to get started</p>
        </header>
        
        <SearchBar onSubmit={handleVideoSubmit} isLoading={loading} />
        
        {error && (
          <div className="my-4 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
            {error}
          </div>
        )}
        
        {videoId && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-4" ref={videoContainerRef}>
              <YouTubePlayer videoId={videoId} setPlayerRef={setPlayerRef} />
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-4 lg:self-start overflow-scroll flex flex-col" ref={transcriptContainerRef}>
              <TranscriptViewer 
                transcript={transcript} 
                onTimeClick={seekToTime}
                loading={loading}
              />
            </div>
          </div>
        )}
        
        {/* Debug information - only visible during development */}
        {debug && process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-bold mb-2">Debug Info:</h3>
            <pre className="text-xs overflow-auto max-h-[200px]">
              {JSON.stringify(debug, null, 2)}
            </pre>
          </div>
        )}
      </div>
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
