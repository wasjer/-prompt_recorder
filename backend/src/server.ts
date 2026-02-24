import express from 'express';
import cors from 'cors';
import path from 'path';
import promptsRouter from './routes/prompts';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes (must be before static files)
app.use('/api/prompts', promptsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from frontend dist (in production)
// In development, frontend runs on separate port
if (process.env.NODE_ENV === 'production') {
  const frontendDist = path.join(__dirname, '../../frontend/dist');
  const fs = require('fs');
  if (fs.existsSync(frontendDist)) {
    console.log(`📁 Serving frontend from: ${frontendDist}`);
    app.use(express.static(frontendDist));
    
    // Serve index.html for all non-API routes (SPA routing)
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(frontendDist, 'index.html'));
      }
    });
  } else {
    console.warn(`⚠️  Frontend dist directory not found: ${frontendDist}`);
  }
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const port = typeof PORT === 'string' ? parseInt(PORT, 10) : PORT;
app.listen(port, 'localhost', () => {
  console.log(`🚀 Prompt Recorder Backend running on http://localhost:${port}`);
  console.log(`📊 API available at http://localhost:${port}/api/prompts`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`💡 Frontend should run separately on http://localhost:3000`);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  const db = require('./db/database').getDatabase();
  db.close();
  process.exit(0);
});
