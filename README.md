# YouTube Transcript Generator

A beautiful, cozy, and minimal web application that allows users to paste a YouTube URL and view the video alongside its transcript. Users can click on specific lines in the transcript to jump to that exact moment in the video.

## Features

- Paste any YouTube URL to load the video and its transcript
- Clean, minimal UI with a video player on the left and transcript on the right
- Click on any line in the transcript to jump to that timestamp in the video
- Responsive design that works on both desktop and mobile devices

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

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Usage

1. Paste a YouTube URL in the input field (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)
2. Click "Generate Transcript"
3. The video will appear on the left side of the screen
4. The transcript will appear on the right side with timestamps
5. Click on any line in the transcript to jump to that point in the video

## License

MIT

## Acknowledgments

- Thanks to the creators of the YouTube Transcript API
- Tailwind CSS for the beautiful styling
- React and Vite for the excellent development experience
