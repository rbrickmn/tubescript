// Development server for testing serverless functions locally
import { createServer } from 'vite';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startDevServer() {
  const app = express();
  const port = process.env.PORT || 3000;

  // Add CORS middleware
  app.use(cors());

  // Create Vite server in middleware mode
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  // Set up API routes by dynamically loading serverless functions
  const apiDir = path.join(__dirname, 'api');
  const apiFiles = fs.readdirSync(apiDir).filter(file => file.endsWith('.js'));

  console.log('Setting up API routes:');
  for (const file of apiFiles) {
    const routeName = file.replace('.js', '');
    const routePath = `/api/${routeName}`;
    
    console.log(`- ${routePath} -> ${file}`);
    
    // Create a route handler that dynamically imports and calls the serverless function
    app.all(routePath, async (req, res) => {
      try {
        // Clear require cache in development to allow for hot reloading
        const modulePath = path.join(apiDir, file);
        const moduleUrl = `file://${modulePath}`;
        
        // Dynamic import the handler
        const { default: handler } = await import(`${moduleUrl}?t=${Date.now()}`);
        
        // Call the handler
        await handler(req, res);
      } catch (error) {
        console.error(`Error in ${routePath}:`, error);
        res.status(500).json({ 
          success: false, 
          message: `Server error: ${error.message}` 
        });
      }
    });
  }

  // Use Vite's connect instance as middleware
  app.use(vite.middlewares);

  // Start the server
  app.listen(port, () => {
    console.log(`Development server running at http://localhost:${port}`);
    console.log(`API endpoints available at http://localhost:${port}/api/*`);
  });
}

startDevServer().catch(err => {
  console.error('Failed to start development server:', err);
  process.exit(1);
}); 