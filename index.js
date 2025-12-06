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
        const { email, password } = req.body;
        console.log("Login attempt:", email);

        // Find user with matching email and password
        const user = await Login.findOne({ email, password });

        if (user) {
            console.log("Login successful for:", email);
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
            console.log("Login failed for:", email);
            res.status(401).json({ 
                success: false, 
                message: "Invalid email or password" 
            });
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

// ===== PRODUCT ROUTES (These were in your original but not being used) =====
// If you need these, you'll need to create a Product model
// Leaving them commented out for now

/*
// GET all products
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json([]);
    }
});

// POST add new product
app.post('/products', async (req, res) => {
    try {
        const productData = req.body;
        console.log("Product data received:", productData);
        
        const newProduct = new Product(productData);
        await newProduct.save();
        
        console.log("Product saved successfully to MongoDB");
        res.status(200).json({ 
            success: true, 
            message: "Product added successfully!" 
        });
    } catch (error) {
        console.error("Error saving product:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Error saving product" 
        });
    }
});
*/

// ===== ORDER ROUTES (These were in your original but not being used) =====
// If you need these, you'll need to create an Order model
// Leaving them commented out for now

/*
// GET all orders
app.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find();
        res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json([]);
    }
});

// POST create new order
app.post('/orders', async (req, res) => {
    try {
        const orderData = req.body;
        console.log("Order data received:", orderData);
        
        const newOrder = new Order(orderData);
        await newOrder.save();
        
        console.log("Order saved successfully to MongoDB");
        res.status(200).json({ 
            success: true, 
            message: "Order placed successfully!" 
        });
    } catch (error) {
        console.error("Error saving order:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Error saving order" 
        });
    }
});
*/

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