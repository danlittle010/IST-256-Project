const express = require('express');
const path = require('path');
const connectDB = require('./config/database');
const app = express();
const port = 80;

// Connect to MongoDB
connectDB();

// Import models
const User = require('./models/User');
const Login = require('./models/Login');

// Import article routes
const articlesRoutes = require('./articlesRoutes');
const submissionsRoutes = require('./submissionsRoutes');

// Middleware - MUST come before routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (CSS, client-side JS, HTML files, etc.)
app.use(express.static(__dirname));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'Signup.html'));
});

// Use article routes with /api/articles prefix
app.use('/api/articles', articlesRoutes);
app.use('/api/submissions', submissionsRoutes);

// ===== USER ROUTES (using MongoDB) =====

// POST route to handle signup
app.post('/signup', async (req, res) => {
    try {
        const userData = req.body;
        console.log("Data received:", userData);

        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: "User with this email already exists" 
            });
        }

        // Create new user
        const newUser = new User(userData);
        await newUser.save();

        console.log("User saved successfully to MongoDB");
        res.status(200).json({ 
            success: true, 
            message: "Sign up successful!" 
        });
    } catch (error) {
        console.error("Error saving user:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Error saving data" 
        });
    }
});

// POST route to handle login
app.post('/login', async (req, res) => {
    try {
        const { email, password, loginType } = req.body;
        console.log("Login attempt:", email, "Type:", loginType);

        if (loginType === 'author') {
            // Author/Admin login - check Login collection
            const user = await Login.findOne({ email, password });

            if (user) {
                console.log("Author login successful for:", email);
                res.status(200).json({ 
                    success: true, 
                    message: "Login successful!",
                    user: {
                        email: user.email,
                        name: user.name || user.email,
                        role: user.role
                    }
                });
            } else {
                console.log("Author login failed for:", email);
                res.status(401).json({ 
                    success: false, 
                    message: "Invalid email or password" 
                });
            }
        } else {
            // Regular user login - check User collection (subscribers)
            const user = await User.findOne({ email });

            if (user) {
                console.log("User login successful for:", email);
                res.status(200).json({ 
                    success: true, 
                    message: "Welcome back!",
                    user: {
                        email: user.email,
                        name: user.userName,
                        role: 'user'
                    }
                });
            } else {
                console.log("User login failed for:", email);
                res.status(401).json({ 
                    success: false, 
                    message: "Email not found. Please subscribe first." 
                });
            }
        }
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error during login" 
        });
    }
});

// GET route to retrieve all users
app.get('/users', async (req, res) => {
    try {
        const users = await User.find().sort({ timestamp: -1 });
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching users" 
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log('Articles system initialized');
    console.log('Submissions system initialized');
    console.log('MongoDB integration active');
});