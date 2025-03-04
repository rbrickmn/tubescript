export default function handler(req, res) {
  res.status(200).json({ 
    status: 'ok',
    message: 'YouTube Transcript Generator API is running',
    timestamp: new Date().toISOString()
  });
} 