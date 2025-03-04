function TranscriptViewer({ transcript, onTimeClick, loading }) {
  // Format time from milliseconds to MM:SS format
  const formatTime = (timeInMilliseconds) => {
    const totalSeconds = Math.floor(timeInMilliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Clean text from HTML entities and other issues
  const cleanText = (text) => {
    if (!text) return '';
    return text
      .replace(/&amp;#39;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-zinc-600">Loading transcript...</p>
      </div>
    );
  }

  if (!transcript || transcript.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-600">
        <p>No transcript available yet.</p>
        <p className="text-sm mt-2">Enter a YouTube URL to generate a transcript.</p>
      </div>
    );
  }

  console.log('Rendering transcript with', transcript.length, 'entries');
  console.log('First entry:', transcript[0]);

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-semibold mb-4 flex-shrink-0">Transcript</h2>
      <div className="overflow-y-auto flex-1 pr-1">
        <div className="space-y-3">
          {transcript.map((item, index) => (
            <div 
              key={index} 
              className="flex hover:bg-zinc-50 p-2 rounded-lg transition-colors cursor-pointer"
              onClick={() => onTimeClick(item.start)}
            >
              <span className="text-xs text-zinc-400 w-12 pt-1 shrink-0 font-mono">
                {formatTime(item.start)}
              </span>
              <p className="text-zinc-800">
                {cleanText(item.text)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TranscriptViewer; 