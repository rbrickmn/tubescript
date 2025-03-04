# YouTube Transcript Generator

A beautiful, modern web application that allows users to paste a YouTube URL and view the video alongside its transcript. Users can click on specific lines in the transcript to jump to that exact moment in the video.

![YouTube Transcript Generator Logo](./src/assets/logo.svg)

## Features

- Paste any YouTube URL to load the video and its transcript
- Clean, modern UI with a video player on the left and transcript on the right
- Click on any line in the transcript to jump to that timestamp in the video
- Dark mode support that automatically adapts to system preferences
- Export transcript functionality to save the content as a text file
- Copy transcript to clipboard with a single click
- Fully responsive design with optimized mobile experience
- Mobile-friendly UI with space-saving icon-only buttons
- Custom logo and branding

## Technologies Used

- React 19
- Vite
- Tailwind CSS v4
- Express.js (for the backend API)
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

4. In a separate terminal, start the backend server:
   ```
   node server.js
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## Usage

1. Paste a YouTube URL in the input field (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)
2. Click "Generate Transcript"
3. The video will appear on the left side of the screen
4. The transcript will appear on the right side with timestamps
5. Click on any line in the transcript to jump to that point in the video
6. Use the export button to download the transcript as a text file
7. Use the copy button to quickly copy the entire transcript to your clipboard
8. The app automatically adapts to your system's light/dark mode preference

## Deployment

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

### Backend Deployment

The application requires a backend server to fetch YouTube transcripts. Make sure to deploy the Express server (`server.js`) alongside your frontend application.

For services like Vercel or Netlify, you may need to set up serverless functions to handle the backend API requests.

## License

MIT

## Acknowledgments

- Thanks to the creators of the YouTube Transcript API
- Tailwind CSS for the beautiful styling
- React and Vite for the excellent development experience
