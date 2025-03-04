import React, { useState, useEffect } from 'react';

function TranscriptViewer({ transcript, onTimeClick, loading, isReady }) {
  // Add state for dropdown and copy notification
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [copyStatus, setCopyStatus] = useState('idle'); // 'idle', 'success', 'error'
  
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

  // Copy transcript to clipboard with improved error handling
  const copyToClipboard = () => {
    if (!transcript || transcript.length === 0) return;
    
    const formattedText = transcript.map(item => 
      `[${formatTime(item.start)}] ${cleanText(item.text)}`
    ).join('\n\n');
    
    // Use the newer Clipboard API with fallback
    if (navigator.clipboard) {
      navigator.clipboard.writeText(formattedText)
        .then(() => {
          setCopyStatus('success');
          setShowCopyNotification(true);
          setTimeout(() => {
            setShowCopyNotification(false);
            setTimeout(() => setCopyStatus('idle'), 300); // Reset after fade out
          }, 2000);
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
          setCopyStatus('error');
          setShowCopyNotification(true);
          setTimeout(() => {
            setShowCopyNotification(false);
            setTimeout(() => setCopyStatus('idle'), 300);
          }, 2000);
        });
    } else {
      // Fallback for browsers that don't support clipboard API
      try {
        const textArea = document.createElement('textarea');
        textArea.value = formattedText;
        textArea.style.position = 'fixed';  // Avoid scrolling to bottom
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        if (successful) {
          setCopyStatus('success');
        } else {
          setCopyStatus('error');
        }
        
        document.body.removeChild(textArea);
        setShowCopyNotification(true);
        setTimeout(() => {
          setShowCopyNotification(false);
          setTimeout(() => setCopyStatus('idle'), 300);
        }, 2000);
      } catch (err) {
        console.error('Fallback: Failed to copy', err);
        setCopyStatus('error');
        setShowCopyNotification(true);
        setTimeout(() => {
          setShowCopyNotification(false);
          setTimeout(() => setCopyStatus('idle'), 300);
        }, 2000);
      }
    }
  };

  // Export transcript as a file
  const exportTranscript = (format) => {
    if (!transcript || transcript.length === 0) return;
    
    let content = '';
    let mimeType = 'text/plain';
    let fileName = 'transcript';
    
    // Generate content based on format
    switch (format) {
      case 'txt':
        content = transcript.map(item => 
          `[${formatTime(item.start)}] ${cleanText(item.text)}`
        ).join('\n\n');
        mimeType = 'text/plain';
        fileName = 'transcript.txt';
        break;
        
      case 'csv':
        content = 'Timestamp,Text\n';
        content += transcript.map(item => 
          `"${formatTime(item.start)}","${cleanText(item.text).replace(/"/g, '""')}"`
        ).join('\n');
        mimeType = 'text/csv';
        fileName = 'transcript.csv';
        break;
        
      case 'json':
        content = JSON.stringify(
          transcript.map(item => ({
            timestamp: formatTime(item.start),
            milliseconds: item.start,
            text: cleanText(item.text)
          })), 
          null, 2
        );
        mimeType = 'application/json';
        fileName = 'transcript.json';
        break;
        
      default:
        return;
    }
    
    // Create a blob with the content
    const blob = new Blob([content], { type: mimeType });
    
    // Create a download link and trigger the download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setShowExportOptions(false);
    }, 100);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only close if clicking outside the dropdown
      if (showExportOptions && !event.target.closest('.export-dropdown')) {
        setShowExportOptions(false);
      }
    };
    
    if (showExportOptions) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showExportOptions]);

  // Generate skeleton items for loading state
  const renderSkeletonItems = () => {
    // Create a variable number of skeleton items based on transcript length or a default value
    const itemCount = transcript && transcript.length > 0 ? Math.min(transcript.length, 12) : 8;
    
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
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-3xl font-semibold flex-shrink-0 flex items-center dark:text-white">
          <svg className="w-7 h-7 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          Transcript
        </h2>
        <div className="flex items-center space-x-2">
          {/* Copy button */}
          <button 
            onClick={copyToClipboard}
            className={`flex items-center px-3 py-2 ${
              copyStatus === 'success' 
                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
                : copyStatus === 'error'
                  ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            } rounded-lg transition-all duration-100 ease-in-out text-sm font-medium cursor-pointer`}
            title="Copy transcript to clipboard"
          >
            <svg className="w-4 h-4 mr-1 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
            </svg>
            <span className="hidden sm:inline">Copy</span>
          </button>
          
          {/* Copy notification */}
          <div className={`fixed top-4 right-4 ${
            copyStatus === 'success' 
              ? 'bg-green-100 dark:bg-green-900 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200' 
              : 'bg-red-100 dark:bg-red-900 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
          } border px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300 ${
            showCopyNotification ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}>
            <div className="flex items-center">
              {copyStatus === 'success' ? (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Copied to clipboard!
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Failed to copy to clipboard
                </>
              )}
            </div>
          </div>
          
          {/* Export button */}
          <div className="relative export-dropdown">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowExportOptions(!showExportOptions);
              }}
              className="flex items-center px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-all duration-100 ease-in-out text-sm font-medium cursor-pointer"
            >
              <svg className="w-4 h-4 mr-1 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              <span className="hidden sm:inline">Export</span>
              <svg className="w-4 h-4 ml-0 sm:ml-1 hidden sm:inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            
            {showExportOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10 overflow-hidden animate-fadeIn">
                <div className="py-2">
                  <h3 className="px-4 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Export Format
                  </h3>
                  <ul>
                    <li>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          exportTranscript('txt');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-800 dark:text-gray-200 text-sm transition-colors flex items-center group cursor-pointer"
                      >
                        <svg className="w-4 h-4 mr-2 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        <span className="group-hover:translate-x-1 transition-transform duration-150">Text (.txt)</span>
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          exportTranscript('csv');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-800 dark:text-gray-200 text-sm transition-colors flex items-center group cursor-pointer"
                      >
                        <svg className="w-4 h-4 mr-2 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                        <span className="group-hover:translate-x-1 transition-transform duration-150">CSV (.csv)</span>
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          exportTranscript('json');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-800 dark:text-gray-200 text-sm transition-colors flex items-center group cursor-pointer"
                      >
                        <svg className="w-4 h-4 mr-2 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                        </svg>
                        <span className="group-hover:translate-x-1 transition-transform duration-150">JSON (.json)</span>
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-1 space-y-1">
        {!isReady ? renderSkeletonItems() : (
          transcript.map((item, index) => (
            <div 
              key={`${index}-${item.start}`}
              className="flex p-3 hover:bg-zinc-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors cursor-pointer group"
              onClick={() => onTimeClick(item.start)}
            >
              <button 
                className="flex items-center justify-center px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded mr-3 text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors group-hover:scale-105 transform duration-150 whitespace-nowrap"
                onClick={(e) => {
                  e.stopPropagation();
                  onTimeClick(item.start);
                }}
              >
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 5v14l11-7z"></path>
                </svg>
                {formatTime(item.start)}
              </button>
              <p className="text-zinc-800 dark:text-gray-200 leading-relaxed">{cleanText(item.text)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TranscriptViewer; 