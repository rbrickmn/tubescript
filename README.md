# YouTube Transcript Generator

A beautiful, modern web application that allows users to paste a YouTube URL and view the video alongside its transcript. Users can click on specific lines in the transcript to jump to that exact moment in the video.

![YouTube Transcript Generator Logo](./src/assets/logo.svg)

## Features

- Paste any YouTube URL to load the video and its transcript
- Clean, modern UI with a video player on the left and transcript on the right
- Click on any line in the transcript to jump to that timestamp in the video
- Dark mode support that automatically adapts to system preferences
- Export transcript functionality to save the content as TXT, CSV, or JSON formats
- Copy transcript to clipboard with a single click and visual feedback
- Robust error handling with helpful user feedback
- API health checking to ensure service availability
- Fully responsive design with optimized mobile experience
- Mobile-friendly UI with space-saving icon-only buttons
- Custom logo and branding

## Technologies Used

- React 19
- Vite
- Tailwind CSS v4
- Vercel Serverless Functions (for the backend API)
- YouTube API (via react-youtube)
- YouTube Transcript API

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/youtube-transcript-generator.git
   cd youtube-transcript-generator
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## Usage

1. Paste a YouTube URL in the input field (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)
2. Click "Generate Transcript"
3. The video will appear on the left side of the screen
4. The transcript will appear on the right side with timestamps
5. Click on any line in the transcript to jump to that point in the video
6. Use the export button to download the transcript in your preferred format (TXT, CSV, or JSON)
7. Use the copy button to quickly copy the entire transcript to your clipboard
8. The app automatically adapts to your system's light/dark mode preference

## Error Handling

The application includes comprehensive error handling:

- **URL Validation**: Validates YouTube URLs and provides clear feedback for invalid inputs
- **API Availability**: Checks API health on startup and provides warnings if the service is unavailable
- **Transcript Not Found**: Provides detailed explanations when a transcript isn't available for a video
- **Network Issues**: Detects and reports network connectivity problems
- **Server Errors**: Gracefully handles server-side errors with user-friendly messages
- **Retry Functionality**: Allows users to retry failed operations with a single click

## Deployment

### Vercel Deployment (Recommended)

This application is optimized for deployment on Vercel:

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Vercel will automatically detect the Vite configuration
4. The API endpoints will be handled by the serverless functions in the `/api` directory

No additional configuration is needed as the project includes a `vercel.json` file that handles routing.

### API Architecture

The application uses Vercel Serverless Functions for the backend:

- `/api/transcript.js`: Handles transcript fetching from YouTube videos
- `/api/health.js`: Provides a health check endpoint for monitoring

The frontend automatically detects whether it's running in development or production mode and adjusts API endpoints accordingly.

### Manual Deployment

To build the application for production:

```
npm run build
```

This will create a production-ready build in the `dist` directory. You can then deploy this to your preferred hosting service.

For a simple deployment, you can use:

```
npm run preview
```

This will serve the production build locally for testing.

## Troubleshooting

If you encounter issues with the application:

1. **API Unavailable**: Check your internet connection and verify that the API endpoints are accessible
2. **Transcript Not Found**: Not all YouTube videos have available transcripts. Try with videos that are known to have captions
3. **Deployment Issues**: Ensure that the `vercel.json` configuration is properly set up for routing API requests
4. **CORS Errors**: If deploying to a custom environment, ensure CORS headers are properly configured

## License

MIT

## Acknowledgments

- Thanks to the creators of the YouTube Transcript API
- Tailwind CSS for the beautiful styling
- React and Vite for the excellent development experience
- Vercel for the seamless deployment experience
