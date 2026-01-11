const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const simsimiRoutes = require('./routes/simsimi');
const path = require('path');  // Add this line

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// NEW: Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api', simsimiRoutes);

// Welcome route - now serves the frontend HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Documentation route
app.get('/api-docs', (req, res) => {
    res.json({
        message: 'SimSimi API Documentation',
        version: '1.0.0',
        endpoints: {
            ask: 'GET /api/ask?question=YOUR_QUESTION',
            teach: 'POST /api/teach',
            responses: 'GET /api/responses',
            search: 'GET /api/search?keyword=SEARCH_TERM'
        }
    });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'API endpoint not found'
    });
});

// For all other routes, serve the frontend (for client-side routing)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Something went wrong!'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`SimSimi API is running on port ${PORT}`);
    console.log(`Frontend: http://localhost:${PORT}`);
    console.log(`API Base URL: http://localhost:${PORT}/api`);
});