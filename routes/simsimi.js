const express = require('express');
const router = express.Router();
const db = require('../database');

// Ask endpoint
router.get('/ask', async (req, res) => {
    try {
        const { question } = req.query;
        
        if (!question || question.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Question parameter is required'
            });
        }

        const response = await db.ask(question.trim());
        
        res.json({
            success: true,
            question: question.trim(),
            ...response
        });
    } catch (error) {
        console.error('Ask error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Teach endpoint
router.post('/teach', async (req, res) => {
    try {
        const { question, answer } = req.body;
        
        if (!question || question.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Question is required'
            });
        }
        
        if (!answer || answer.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Answer is required'
            });
        }

        const result = await db.teach(question.trim(), answer.trim());
        
        res.json({
            success: true,
            message: `Successfully ${result.action} response`,
            question: question.trim(),
            answer: answer.trim(),
            id: result.id,
            learn_count: result.learn_count
        });
    } catch (error) {
        console.error('Teach error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Additional endpoints for debugging/management
router.get('/responses', async (req, res) => {
    try {
        const responses = await db.getAllResponses();
        res.json({
            success: true,
            count: responses.length,
            responses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

router.get('/search', async (req, res) => {
    try {
        const { keyword } = req.query;
        
        if (!keyword) {
            return res.status(400).json({
                success: false,
                error: 'Keyword parameter is required'
            });
        }

        const results = await db.searchResponses(keyword);
        
        res.json({
            success: true,
            count: results.length,
            keyword,
            results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

module.exports = router;