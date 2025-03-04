import { useEffect, useState } from "react";
import YouTube from "react-youtube";

function YouTubePlayer({ videoId, setPlayerRef }) {
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  const opts = {
    height: "100%",
    width: "100%",
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 0,
      modestbranding: 1,
      rel: 0,
    },
  };

  const onReady = (event) => {
    // Store the player reference so we can control it later
    setPlayerRef(event.target);
    setIsPlayerReady(true);
  };

  // Reset player reference when videoId changes
  useEffect(() => {
    setIsPlayerReady(false);
    return () => setPlayerRef(null);
  }, [videoId, setPlayerRef]);

  return (
    <div className="aspect-video w-full rounded-lg overflow-hidden bg-zinc-900 shadow-inner" style={{ minHeight: '400px' }}>
      {videoId ? (
        <div className="relative w-full h-full">
          <div className={`w-full h-full transition-opacity duration-300 ${isPlayerReady ? 'opacity-100' : 'opacity-0'}`}>
            <YouTube
              videoId={videoId}
              opts={opts}
              onReady={onReady}
              className="w-full h-full"
            />
          </div>
          
          {/* Loading overlay */}
          <div className={`absolute inset-0 flex items-center justify-center bg-zinc-900 dark:bg-gray-900 transition-opacity duration-500 ${isPlayerReady ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-zinc-300 dark:text-gray-300 text-sm font-medium">Loading video player...</p>
            </div>
          </div>
          
          <div className="absolute inset-0 pointer-events-none border border-zinc-700 rounded-lg"></div>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 dark:text-gray-500 p-8">
          <svg className="w-20 h-20 mb-6 text-zinc-500 dark:text-gray-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
          </svg>
          <p className="text-center font-medium text-lg">Enter a YouTube URL to display the video</p>
          <p className="text-sm text-zinc-500 dark:text-gray-400 mt-2 text-center">The video will appear here once you submit a valid YouTube URL</p>
        </div>
      )}
    </div>
  );
}

export default YouTubePlayer; 