const express = require('express');
const router = express.Router();
const db = require('../database.js');

// Default responses if not taught
const DEFAULT_RESPONSES = [
    "I don't know how to answer that yet. Please teach me!",
    "That's interesting! What should I say to that?",
    "I'm still learning! Can you teach me how to respond to that?",
    "Hmm, I haven't learned that one. Want to teach me?",
    "I don't have a response for that. Use the teach function to help me learn!"
];

// Get random default response
function getRandomDefaultResponse() {
    return DEFAULT_RESPONSES[Math.floor(Math.random() * DEFAULT_RESPONSES.length)];
}

// Ask endpoint
router.post('/ask', async (req, res) => {
    try {
        const { question } = req.body;
        
        if (!question || question.trim() === '') {
            return res.status(400).json({ 
                error: 'Question is required',
                example: { "question": "hello" }
            });
        }

        const cleanQuestion = question.trim().toLowerCase();
        const response = await db.getResponse(cleanQuestion);
        
        if (response) {
            res.json({
                status: 'success',
                question: cleanQuestion,
                answer: response.answer,
                source: 'database',
                teach_count: response.teach_count,
                first_taught: response.created_at,
                last_taught: response.last_taught
            });
        } else {
            res.json({
                status: 'not_found',
                question: cleanQuestion,
                answer: getRandomDefaultResponse(),
                source: 'default',
                message: 'This response is not in my database yet. Please teach me!'
            });
        }
    } catch (error) {
        console.error('Ask error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Teach endpoint
router.post('/teach', async (req, res) => {
    try {
        const { question, answer } = req.body;
        
        if (!question || question.trim() === '') {
            return res.status(400).json({ error: 'Question is required' });
        }
        
        if (!answer || answer.trim() === '') {
            return res.status(400).json({ error: 'Answer is required' });
        }

        const result = await db.teachResponse(question.trim(), answer.trim());
        
        res.json({
            status: 'success',
            message: result.updated ? 'Response updated successfully!' : 'Response learned successfully!',
            data: {
                id: result.id,
                question: question.trim().toLowerCase(),
                answer: answer.trim(),
                teach_count: result.teach_count,
                action: result.updated ? 'updated' : 'created'
            }
        });
    } catch (error) {
        console.error('Teach error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all responses
router.get('/responses', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const responses = await db.getAllResponses(limit);
        
        res.json({
            status: 'success',
            count: responses.length,
            responses: responses
        });
    } catch (error) {
        console.error('Get responses error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = await db.getStats();
        res.json({
            status: 'success',
            statistics: stats
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Search responses
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.trim() === '') {
            return res.status(400).json({ error: 'Search term is required' });
        }

        const results = await db.searchResponses(q.trim());
        
        res.json({
            status: 'success',
            search_term: q,
            count: results.length,
            results: results
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;