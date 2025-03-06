# YouTube Transcript Generator

A serverless application that fetches and displays YouTube video transcripts. Built with React and deployed on Vercel.

## Features

- Extract transcripts from YouTube videos
- Display transcripts with timestamps
- Search within transcripts
- Copy transcript to clipboard
- Serverless architecture for easy deployment

## Development

### Prerequisites

- Node.js 18+ and npm

### Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

This will start a development server that:
- Serves the React frontend
- Handles API requests through the serverless functions in the `api` directory

### Development Scripts

- `npm run dev` - Start the development server with API support
- `npm run dev:vite` - Start only the Vite development server (frontend only)
- `npm run build` - Build the project for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint

## Deployment

This project is designed to be deployed on Vercel. The `vercel.json` file contains the necessary configuration.

### Deploy to Vercel

1. Push your code to a Git repository
2. Connect the repository to Vercel
3. Vercel will automatically detect the configuration and deploy the project

## Project Structure

- `/api` - Serverless API functions
  - `transcript.js` - Fetches YouTube transcripts
  - `health.js` - Health check endpoint
- `/src` - Frontend React application
  - `/components` - React components
  - `/utils` - Utility functions
  - `App.jsx` - Main application component
  - `main.jsx` - Application entry point

## How It Works

1. The frontend makes requests to the `/api/transcript` endpoint with a YouTube video ID
2. The serverless function fetches the transcript using multiple methods:
   - First tries the `youtube-transcript` package
   - Falls back to `youtube-transcript-api` if the first method fails
   - Has a custom fallback implementation as a last resort
3. The transcript is returned to the frontend and displayed to the user

## Troubleshooting

If you encounter issues with the transcript API:

1. Check that the video has captions available
2. Verify that the video ID is correct
3. Check the browser console and network tab for errors
4. Check the Vercel function logs for server-side errors

## License

MIT

## Acknowledgments

- Thanks to the creators of the YouTube Transcript API
- Tailwind CSS for the beautiful styling
- React and Vite for the excellent development experience
- Vercel for the seamless deployment experience
