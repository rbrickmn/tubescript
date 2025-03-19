import fetch from 'node-fetch';

// Cache to store responses and reduce repeated calls to YouTube
const CACHE = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Serverless function to proxy YouTube requests
 * This helps bypass CORS and blocking issues when deployed on Vercel
 */
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ success: false, message: 'URL parameter is required' });
    }

    // Decode the URL if it's encoded
    const decodedUrl = decodeURIComponent(url);

    // Validate that the URL is from YouTube
    if (!decodedUrl.includes('youtube.com') && !decodedUrl.includes('youtu.be')) {
      return res.status(400).json({ success: false, message: 'Only YouTube URLs are supported' });
    }

    // Check cache first
    const cacheKey = decodedUrl;
    const cachedResponse = CACHE.get(cacheKey);
    
    if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_DURATION) {
      console.log(`[YouTube Proxy] Cache hit for: ${decodedUrl}`);
      
      // Set content type based on the cached response
      if (cachedResponse.contentType) {
        res.setHeader('Content-Type', cachedResponse.contentType);
      }
      
      return res.status(200).send(cachedResponse.data);
    }

    console.log(`[YouTube Proxy] Fetching: ${decodedUrl}`);
    
    // Use a more browser-like user agent to avoid being blocked
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    
    const response = await fetch(decodedUrl, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0'
      }
    });

    if (!response.ok) {
      console.error(`[YouTube Proxy] Failed to fetch: ${decodedUrl}, Status: ${response.status}`);
      return res.status(response.status).json({ 
        success: false, 
        message: `Failed to fetch from YouTube: ${response.statusText}` 
      });
    }

    // Get the content type from the response
    const contentType = response.headers.get('content-type');
    
    // Handle different response types
    let responseData;
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
      
      // Cache the response
      CACHE.set(cacheKey, {
        data: responseData,
        contentType,
        timestamp: Date.now()
      });
      
      return res.status(200).json(responseData);
    } else {
      responseData = await response.text();
      
      // Cache the response
      CACHE.set(cacheKey, {
        data: responseData,
        contentType,
        timestamp: Date.now()
      });
      
      // Set the same content type as the original response
      if (contentType) {
        res.setHeader('Content-Type', contentType);
      }
      
      return res.status(200).send(responseData);
    }
  } catch (error) {
    console.error('[YouTube Proxy] Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to proxy request to YouTube'
    });
  }
} 