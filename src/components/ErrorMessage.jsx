import React from 'react';

function ErrorMessage({ message, type, onRetry }) {
  // Determine error type if not explicitly provided
  const errorType = type || (
    message?.toLowerCase().includes('transcript not found') || 
    message?.toLowerCase().includes('no transcript found') || 
    message?.toLowerCase().includes('disabled on this video') || 
    message?.toLowerCase().includes('transcripts are disabled') 
      ? 'transcript_not_found'
      : message?.toLowerCase().includes('network') || 
        message?.toLowerCase().includes('api') || 
        message?.toLowerCase().includes('server')
        ? 'api_error'
        : 'general_error'
  );

  const isTranscriptNotFound = errorType === 'transcript_not_found';
  const isApiError = errorType === 'api_error';
  const isTranscriptDisabled = message?.toLowerCase().includes('disabled on this video') || 
                              message?.toLowerCase().includes('transcripts are disabled');

  if (!message) return null;

  return (
    <div className="w-full p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mt-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400 dark:text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
            {isTranscriptNotFound && !isTranscriptDisabled && 'No Transcript Available'}
            {isTranscriptDisabled && 'Transcripts Disabled by Creator'}
            {isApiError && 'Service Temporarily Unavailable'}
            {!isTranscriptNotFound && !isApiError && !isTranscriptDisabled && 'Error'}
          </h3>
          <div className="mt-2 text-sm text-red-700 dark:text-red-300">
            {message}
          </div>
        
          {isTranscriptDisabled && (
            <div className="ml-7 text-sm">
              <p className="mb-2">The content creator has disabled transcripts for this video. Unfortunately, we cannot generate a transcript when:</p>
              <ul className="list-disc ml-5 space-y-1">
                <li>The video owner has disabled captions/transcripts</li>
                <li>The video is age-restricted or private</li>
                <li>The video is a livestream</li>
              </ul>
              
              <p className="mt-2">Please try a different video that has captions available.</p>
            </div>
          )}
          
          {isTranscriptNotFound && !isTranscriptDisabled && (
            <div className="ml-7 text-sm">
              <p className="mb-2">We couldn't find a transcript for this video. This might be because:</p>
              <ul className="list-disc ml-5 space-y-1">
                <li>The video doesn't have captions</li>
                <li>The captions are in a format we can't process</li>
                <li>The video ID might be incorrect</li>
              </ul>
              
              <p className="mt-2">Try a different video that has captions available.</p>
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
          
          {!isApiError && !isTranscriptNotFound && !isTranscriptDisabled && (
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
    </div>
  );
}

export default ErrorMessage; 