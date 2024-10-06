const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require("../models/user")
const Postmodel = require("../models/postmodel");
require('dotenv').config();
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.json());
const router = express.Router();

app.use(cookieParser());
// Register
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body; // Destructure fields
    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        // Generate JWT token
        // const token = jwt.sign({ email: newUser.email, username: newUser.username }, process.env.SECERT_KEY, { expiresIn: '1h' });
        
        res.status(201).json({ message: 'User created successfully' })
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    console.log("Login attempt:", req.body); // Log the incoming request
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Login SucessFull' });
        }

        // Generate JWT token
        const token = jwt.sign({ email: user.email, username: user.username }, process.env.SECERT_KEY, { expiresIn: '1h' });
        console.log('Generated Token:', token); // Log the generated token

        // Set cookie and send response
        return res.cookie('token', token, { httpOnly: true, secure: false }) // Set secure to false for local dev
                   .status(200)
                   .json({ message: 'Login successful' });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;
