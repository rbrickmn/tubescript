import React from 'react';

function ErrorMessage({ message, errorType, onRetry }) {
  // Use the errorType prop if available, otherwise infer from message
  const isApiError = errorType === 'api_error' || (
    message && (
      message.includes('Network error') || 
      message.includes('Failed to fetch') ||
      message.includes('Server error') ||
      message.includes('service is currently experiencing issues')
    )
  );

  const isTranscriptNotFound = errorType === 'transcript_not_found' || (
    message && (
      message.toLowerCase().includes('no transcript found') ||
      message.toLowerCase().includes('transcript not available') ||
      message.toLowerCase().includes('may not have captions available')
    )
  );

  return (
    <div className="my-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 transition-all duration-300">
      <div className="flex flex-col">
        <div className="flex items-center mb-2">
          <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
          </svg>
          <span className="font-medium">
            {isTranscriptNotFound ? 'Transcript Not Available' : 'Error'}
            {!isTranscriptNotFound && `: ${message}`}
          </span>
        </div>
        
        {isTranscriptNotFound && (
          <div className="ml-7 text-sm">
            <p className="mb-2">This video doesn't have an available transcript. This could be because:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>The video owner hasn't added captions or subtitles</li>
              <li>The captions are embedded in the video and not available as a separate transcript</li>
              <li>The video is in a language not supported by the transcript API</li>
              <li>The video is too recent and captions haven't been processed yet</li>
            </ul>
            
            <p className="mt-2">Try another video that has captions available. Many educational videos, tutorials, and official content typically have captions.</p>
          </div>
        )}
        
        {isApiError && !isTranscriptNotFound && (
          <div className="ml-7 text-sm">
            <p className="mb-2">We're having trouble connecting to our transcript service. This might be due to:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Temporary service disruption</li>
              <li>Network connectivity problems</li>
              <li>High server load</li>
            </ul>
            
            <p className="mt-2">Please try again in a few moments. If the problem persists, the service might be down for maintenance.</p>
            
            {onRetry && (
              <button 
                onClick={onRetry}
                className="mt-3 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Try Again
              </button>
            )}
          </div>
        )}
        
        {!isApiError && !isTranscriptNotFound && (
          <div className="ml-7 text-sm">
            <p className="mb-2">Something unexpected happened. Please try:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Checking that the YouTube URL is correct</li>
              <li>Refreshing the page and trying again</li>
              <li>Using a different browser</li>
            </ul>
            
            {onRetry && (
              <button 
                onClick={onRetry}
                className="mt-3 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Try Again
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ErrorMessage; 