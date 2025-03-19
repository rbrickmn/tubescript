module.exports = function handler(req, res) {
  const timestamp = new Date().toISOString();
  const environment = {
    nodeEnv: process.env.NODE_ENV || 'unknown',
    vercelEnv: process.env.VERCEL_ENV || 'not on Vercel',
    vercelRegion: process.env.VERCEL_REGION || 'unknown',
    isVercel: Boolean(process.env.VERCEL || process.env.VERCEL_ENV || process.env.VERCEL_URL)
  };

  console.log(`Health check at ${timestamp}`, environment);

  res.status(200).json({ 
    status: 'ok',
    message: 'YouTube Transcript Generator API is running',
    timestamp,
    environment
  });
} 