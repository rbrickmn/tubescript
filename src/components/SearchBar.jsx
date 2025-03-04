import { useState } from "react";
import { extractVideoId } from '../utils/api';

function SearchBar({ onSubmit, isLoading }) {
  const [url, setUrl] = useState("");
  const [isValidUrl, setIsValidUrl] = useState(true);
  const [validationMessage, setValidationMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Use the improved extractVideoId function
    const videoId = extractVideoId(url);
    
    if (!videoId) {
      setIsValidUrl(false);
      setValidationMessage("Please enter a valid YouTube URL or video ID");
      return;
    }
    
    setIsValidUrl(true);
    setValidationMessage("");
    onSubmit(videoId);
  };

  // Clear validation errors when URL changes
  const handleUrlChange = (e) => {
    setUrl(e.target.value);
    if (!e.target.value.trim()) {
      setIsValidUrl(true);
      setValidationMessage("");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-zinc-100 dark:border-gray-700">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="w-5 h-5 text-red-500"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
            </svg>
          </div>
          <input
            type="text"
            value={url}
            onChange={handleUrlChange}
            placeholder="Paste YouTube URL here (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)"
            className={`w-full pl-10 px-4 py-3 rounded-lg border ${
              !isValidUrl && url.trim()
                ? "border-red-300 dark:border-red-700 focus:ring-red-500"
                : "border-zinc-200 dark:border-gray-600 focus:ring-blue-500"
            } bg-zinc-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-all dark:text-white dark:placeholder-gray-400`}
            disabled={isLoading}
            aria-invalid={!isValidUrl && url.trim() ? "true" : "false"}
          />
          {!isValidUrl && url.trim() && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400 absolute">
              {validationMessage}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="hidden sm:inline">Processing...</span>
            </span>
          ) : (
            <span className="flex items-center">
              <svg
                className="w-5 h-5 sm:mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
              <span className="hidden sm:inline">Generate Transcript</span>
            </span>
          )}
        </button>
      </form>
    </div>
  );
}

export default SearchBar;
