import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import apiRoutes from './routes/api/index.js';
import errorHandler from './middleware/errorHandler.js';
// import pool from './config/db.js'; // Uncomment when you want to use a real database

// Load environment variables
dotenv.config();

const app = express();

// --- Middleware ---
// Enable CORS
app.use(cors());

// Body parser middleware to handle JSON and URL-encoded data
app.use(bodyParser.json({ limit: '50mb' })); // Increased limit for base64 images/videos
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// --- API Routes ---
// Direct all '/api' requests to the API router
app.use('/api', apiRoutes);

// --- Static File Serving for Production ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production') {
  // Serve the static files from the React app build directory
  app.use(express.static(path.join(__dirname, '../frontend')));

  // For any other request, serve the index.html file
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'index.html'));
  });
}

// --- Error Handling ---
// Use the custom error handler middleware
app.use(errorHandler);

// --- Start Server ---
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  // Test DB connection on start (optional)
  // pool.query('SELECT 1').then(() => console.log('MySQL connected...')).catch(err => console.error('MySQL connection error:', err));
});
