import { useEffect } from "react";
import YouTube from "react-youtube";

function YouTubePlayer({ videoId, setPlayerRef }) {
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
  };

  // Reset player reference when videoId changes
  useEffect(() => {
    return () => setPlayerRef(null);
  }, [videoId, setPlayerRef]);

  return (
    <div className="aspect-video w-full rounded-lg overflow-hidden bg-zinc-100">
      {videoId ? (
        <YouTube
          videoId={videoId}
          opts={opts}
          onReady={onReady}
          className="w-full h-full"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-zinc-500">
          <p>Enter a YouTube URL to display the video</p>
        </div>
      )}
    </div>
  );
}

export default YouTubePlayer; 