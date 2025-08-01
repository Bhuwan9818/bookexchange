// backend/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const Request = require('../models/Request'); 
const Book = require('../models/Book');  


// --- PROFILE ROUTE ---

// @route   GET /api/user/profile
// @desc    Get the logged-in user's own profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .select('-password')
            .populate( 'username');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/user/profile
// @desc    Update the logged-in user's profile information
router.put('/profile', auth, async (req, res) => {
    const { username, phone, city, state } = req.body;
    const profileFields = {};
    if (username) profileFields.username = username;
    if (phone) profileFields.phone = phone;
    if (city) profileFields.city = city;
    if (state) profileFields.state = state;
    try {
        let user = await User.findByIdAndUpdate(
            req.userId,
            { $set: profileFields },
            { new: true }
        ).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error("Profile Update Error:", err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;