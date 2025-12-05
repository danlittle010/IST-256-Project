const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 80;

// Import article routes
const articlesRoutes = require('./articlesRoutes');
const submissionsRoutes = require('./submissionsRoutes'); // NEW

// Middleware - MUST come before routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (CSS, client-side JS, HTML files, etc.)
app.use(express.static(__dirname));

// Define data paths for different JSON files
const userDataPath = path.join(__dirname, 'userData.json');
const loginDataPath = path.join(__dirname, 'Login.JSON');
const productsDataPath = path.join(__dirname, 'products.json');
const ordersDataPath = path.join(__dirname, 'orders.json');
const articlesDataPath = path.join(__dirname, 'articles.json');
const submissionsDataPath = path.join(__dirname, 'submissions.json'); // NEW

// Initialize articles.json if it doesn't exist
if (!fs.existsSync(articlesDataPath)) {
    fs.writeFileSync(articlesDataPath, '[]', 'utf8');
    console.log('Created articles.json file');
}

// Initialize submissions.json if it doesn't exist - NEW
if (!fs.existsSync(submissionsDataPath)) {
    fs.writeFileSync(submissionsDataPath, '[]', 'utf8');
    console.log('Created submissions.json file');
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'Signup.html'));
});

// Use article routes with /api/articles prefix
app.use('/api/articles', articlesRoutes);
app.use('/api/submissions', submissionsRoutes); // NEW

// ===== USER ROUTES (using userData.json) =====

// POST route to handle signup
app.post('/signup', (req, res) => {
    const userData = req.body;
    console.log("Data received:", userData);

    // Read existing data
    fs.readFile(userDataPath, 'utf8', (err, data) => {
        let users = [];

        // If file exists and has content, parse it
        if (!err && data) {
            try {
                users = JSON.parse(data);
            } catch (parseErr) {
                console.error("Error parsing JSON:", parseErr);
                users = [];
            }
        }

        // Add new user to array
        users.push(userData);

        // Write updated data back to file
        fs.writeFile(userDataPath, JSON.stringify(users, null, 2), 'utf8', (writeErr) => {
            if (writeErr) {
                console.error("Error writing file:", writeErr);
                return res.status(500).json({ 
                    success: false, 
                    message: "Error saving data" 
                });
            }

            console.log("Data saved successfully to userData.json");
            res.status(200).json({ 
                success: true, 
                message: "Sign up successful!" 
            });
        });
    });
});

// POST route to handle login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    console.log("Login attempt:", email);

    // Read existing data from Login.JSON
    fs.readFile(loginDataPath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading file:", err);
            return res.status(500).json({ 
                success: false, 
                message: "Error reading user data" 
            });
        }

        let users = [];
        
        try {
            const parsedData = JSON.parse(data);
            // Handle both array format and {users: []} format
            users = Array.isArray(parsedData) ? parsedData : (parsedData.users || []);
        } catch (parseErr) {
            console.error("Error parsing JSON:", parseErr);
            return res.status(500).json({ 
                success: false, 
                message: "Error processing user data" 
            });
        }

        // Find user with matching email and password
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            console.log("Login successful for:", email);
            res.status(200).json({ 
                success: true, 
                message: "Login successful!",
                user: {
                    email: user.email,
                    name: user.name || user.email
                }
            });
        } else {
            console.log("Login failed for:", email);
            res.status(401).json({ 
                success: false, 
                message: "Invalid email or password" 
            });
        }
    });
});

// GET route to retrieve all users
app.get('/users', (req, res) => {
    fs.readFile(userDataPath, 'utf8', (err, data) => {
        if (err) {
            return res.status(200).json([]);
        }

        try {
            const users = JSON.parse(data);
            res.status(200).json(users);
        } catch (parseErr) {
            res.status(200).json([]);
        }
    });
});

// ===== PRODUCT ROUTES (using products.json) =====

// GET all products
app.get('/products', (req, res) => {
    fs.readFile(productsDataPath, 'utf8', (err, data) => {
        if (err) {
            return res.status(200).json([]);
        }
        
        try {
            const products = JSON.parse(data);
            res.status(200).json(products);
        } catch (parseErr) {
            res.status(200).json([]);
        }
    });
});

// POST add new product
app.post('/products', (req, res) => {
    const productData = req.body;
    console.log("Product data received:", productData);
    
    fs.readFile(productsDataPath, 'utf8', (err, data) => {
        let products = [];
        
        if (!err && data) {
            try {
                products = JSON.parse(data);
            } catch (parseErr) {
                console.error("Error parsing products JSON:", parseErr);
                products = [];
            }
        }
        
        products.push(productData);
        
        fs.writeFile(productsDataPath, JSON.stringify(products, null, 2), 'utf8', (writeErr) => {
            if (writeErr) {
                console.error("Error writing products file:", writeErr);
                return res.status(500).json({ 
                    success: false, 
                    message: "Error saving product" 
                });
            }
            
            console.log("Product saved successfully to products.json");
            res.status(200).json({ 
                success: true, 
                message: "Product added successfully!" 
            });
        });
    });
});

// ===== ORDER ROUTES (using orders.json) =====

// GET all orders
app.get('/orders', (req, res) => {
    fs.readFile(ordersDataPath, 'utf8', (err, data) => {
        if (err) {
            return res.status(200).json([]);
        }
        
        try {
            const orders = JSON.parse(data);
            res.status(200).json(orders);
        } catch (parseErr) {
            res.status(200).json([]);
        }
    });
});

// POST create new order
app.post('/orders', (req, res) => {
    const orderData = req.body;
    console.log("Order data received:", orderData);
    
    fs.readFile(ordersDataPath, 'utf8', (err, data) => {
        let orders = [];
        
        if (!err && data) {
            try {
                orders = JSON.parse(data);
            } catch (parseErr) {
                console.error("Error parsing orders JSON:", parseErr);
                orders = [];
            }
        }
        
        orders.push(orderData);
        
        fs.writeFile(ordersDataPath, JSON.stringify(orders, null, 2), 'utf8', (writeErr) => {
            if (writeErr) {
                console.error("Error writing orders file:", writeErr);
                return res.status(500).json({ 
                    success: false, 
                    message: "Error saving order" 
                });
            }
            
            console.log("Order saved successfully to orders.json");
            res.status(200).json({ 
                success: true, 
                message: "Order placed successfully!" 
            });
        });
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
    });
});

// 404 handler for API routes (removed - not needed)

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log('Articles system initialized');
    console.log('Submissions system initialized'); // NEW
});