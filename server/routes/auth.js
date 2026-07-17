/**
 * routes/auth.js
 * 
 * This file handles authentication-related endpoints.
 * 
 * IMPORTANT SECURITY NOTE: This is a basic implementation for development purposes.
 * In production, you should:
 * - Hash passwords using bcrypt or similar (never store plain text!)
 * - Use JWT (JSON Web Tokens) or sessions for authentication
 * - Implement proper password validation
 * - Add rate limiting to prevent brute force attacks
 * - Use HTTPS only
 * 
 * Endpoints defined here:
 * - POST /api/auth/register - Register a new user
 * - POST /api/auth/login - Login an existing user
 * - POST /api/auth/logout - Logout a user (client-side token removal)
 */
const express = require('express');
const { ulid } = require("ulid");
const bcrypt = require("bcrypt");
const router = express.Router();
const { get, run, query } = require('../database');

async function TryGenID(db, maxAttempts)
{
    for(let attempts = 0; attempts < maxAttempts; ++attempts) {
        let newID = ulid();
        
        const checkExisting = await get(db, "SELECT * FROM users WHERE id = ?", [newID]);

        if(!checkExisting)
            return newID;
    }

    throw new Error(`Could not generate unique ID within ${maxAttempts} attempts`);
}


router.post('/register', async (req, res) => {
    try {
        if(!req.db)
            return res.status(400).json({error: "Invalid database"});

        if(!req.body)
            return res.status(400).json({error: "Empty request body"});

        const {name, password, authority} = req.body;

        if(!name || !password)
            return res.status(400).json({ error: "Name and password are required"});

        const existingUser = await get(req.db, "SELECT * FROM users WHERE name = ?", [name]);
        if (existingUser)
            return res.status(409).json({ error: 'Username already exists' });

        const userID = await TryGenID(req.db, 3);
        const hashedPassword = await bcrypt.hash(password, 10);
        await run(req.db, 'INSERT INTO users (id, name, password, authority) VALUES (?, ?, ?, ?)', [userID, name, hashedPassword, (authority || "user")]);

        const outUser = await get(req.db, 'SELECT id, name FROM users WHERE id = ?', [userID]);
        console.log("New user added:", outUser);

        return res.status(201).json(outUser);
    }
    catch (err) {
        console.error("Error registering user: ", err);
        res.status(500).json({ error: "Failed to register user" });
    }
});

//TODO: IMPLEMENT TOKENS
router.post('/login', async (req, res) => {
    try {
        if(!req.db)
            return res.status(400).json({error: "Invalid database"});

        if(!req.body)
            return res.status(400).json({error: "Empty request body"});

        const {name, password} = req.body;

        const userInfo = await get(req.db, "SELECT id, name, password FROM users WHERE name = ?", [name]);
        
        if(!userInfo || !(await bcrypt.compare(password, userInfo.password)))
            return res.status(401).json({error: "Invalid username or password"});

        const outUser = {id: userInfo.id, name: userInfo.name};
        return res.status(200).json(outUser);
    }
    catch (err) {
        console.error("Error logging in user: ", err);
        res.status(500).json({ error: "Failed to login user"});
    }
});

router.post('/logout', async(req, res) => {
    return res.json({message: "Logged out successfully"});
});

//TODO: ADD DELETE USER
module.exports = router;