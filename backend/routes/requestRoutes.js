const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Book = require('../models/Book');
const auth = require('../middleware/authMiddleware');

// POST /api/requests
router.post('/', auth, async (req, res) => {
    const { bookId } = req.body;
    try {
        const book = await Book.findById(bookId);
        if (!book) return res.status(404).json({ message: 'Book not found' });
        if (book.userId.toString() === req.userId) return res.status(400).json({ message: 'You cannot request your own book' });
        const existingRequest = await Request.findOne({ bookId, requesterId: req.userId });
        if (existingRequest) return res.status(400).json({ message: 'You have already requested this book' });
        const request = new Request({ bookId, requesterId: req.userId, ownerId: book.userId });
        await request.save();
        res.status(201).json(request);
    } catch (err) { 
        console.error(err.message);
        res.status(500).send('Server Error'); 
    }
});

// GET /api/requests
router.get('/', auth, async (req, res) => {
    try {
        const requests = await Request.find({ $or: [{ requesterId: req.userId }, { ownerId: req.userId }] })
        .sort({ createdAt: -1 }) // -1 means descending order (newest first)    
        .populate('bookId', 'title')
            .populate('requesterId', '_id username') 
            .populate('ownerId', '_id username');     
        res.json(requests);
    } catch (err) { 
        console.error(err.message);
        res.status(500).send('Server Error'); 
    }
});

// PUT /api/requests/:id
router.put('/:id', auth, async (req, res) => {
    const { status } = req.body;
    try {
        let request = await Request.findById(req.params.id);
        if (!request) return res.status(404).json({ message: 'Request not found' });
        if (request.ownerId.toString() !== req.userId) return res.status(403).json({ message: 'User not authorized' });
        request.status = status;
        await request.save();
        res.json(request);
    } catch (err) { 
        console.error(err.message);
        res.status(500).send('Server Error'); 
    }
});


module.exports = router;