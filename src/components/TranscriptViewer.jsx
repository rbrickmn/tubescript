function TranscriptViewer({ transcript, onTimeClick, loading, isReady }) {
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

  // Generate skeleton items for loading state
  const renderSkeletonItems = () => {
    // Create a variable number of skeleton items based on transcript length
    const itemCount = transcript.length > 0 ? Math.min(transcript.length, 12) : 8;
    
    return Array(itemCount).fill().map((_, index) => (
      <div key={`skeleton-${index}`} className="flex p-3">
        <div className="flex items-center justify-center w-20 h-8 bg-zinc-200 dark:bg-gray-700 animate-shimmer rounded mr-3 shrink-0"></div>
        <div className="flex-1">
          <div className="h-6 bg-zinc-200 dark:bg-gray-700 animate-shimmer rounded w-full"></div>
          {index % 2 === 0 && (
            <div className="h-6 bg-zinc-200 dark:bg-gray-700 animate-shimmer rounded w-3/4 mt-2"></div>
          )}
        </div>
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-6"></div>
        <p className="text-zinc-600 dark:text-gray-300 font-medium text-lg">Loading transcript...</p>
      </div>
    );
  }

  if (!transcript || transcript.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-600 dark:text-gray-400">
        <svg className="w-20 h-20 text-zinc-300 dark:text-gray-600 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <p className="font-medium text-lg">No transcript available yet.</p>
        <p className="text-sm mt-2">Enter a YouTube URL to generate a transcript.</p>
      </div>
    );
  }

  if (!isReady && transcript.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="animate-pulse rounded-full h-16 w-16 bg-blue-100 dark:bg-blue-900 mb-6 flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-500 dark:text-blue-400 animate-pulse-custom" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <p className="text-zinc-600 dark:text-gray-300 font-medium text-lg">Preparing transcript...</p>
        <p className="text-zinc-500 dark:text-gray-400 text-sm mt-2">This will just take a moment</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-3xl font-semibold mb-5 flex-shrink-0 flex items-center dark:text-white">
        <svg className="w-7 h-7 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        Transcript
      </h2>
      <div className="overflow-y-auto flex-1 pr-2">
        <div className="relative">
          {/* Skeleton that fades out */}
          <div className={`space-y-3 absolute inset-0 transition-opacity duration-300 ${isReady ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            {renderSkeletonItems()}
          </div>
          
          {/* Real content that fades in */}
          <div className={`space-y-3 transition-opacity duration-300 ${isReady ? 'opacity-100' : 'opacity-0'}`}>
            {transcript.map((item, index) => (
              <div 
                key={`transcript-${index}`}
                className="flex hover:bg-blue-50 dark:hover:bg-blue-900/30 p-3 rounded-lg transition-all duration-100 ease-in-out transform will-change-transform cursor-pointer group"
                onClick={() => onTimeClick(item.start)}
              >
                <div className="flex items-center justify-center w-20 h-8 bg-zinc-100 dark:bg-gray-700 text-zinc-500 dark:text-gray-400 rounded mr-3 group-hover:bg-blue-100 dark:group-hover:bg-blue-800 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-all duration-100 ease-in-out font-mono text-base shrink-0">
                  {formatTime(item.start)}
                </div>
                <p className="text-zinc-800 dark:text-gray-200 group-hover:text-blue-800 dark:group-hover:text-blue-300 transition-all duration-100 ease-in-out text-lg">
                  {cleanText(item.text)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TranscriptViewer; 