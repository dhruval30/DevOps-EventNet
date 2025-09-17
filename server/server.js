// just checking if jenkins is working
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose'); 
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        console.log('CORS Check - Origin:', origin);
        
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
            console.log('No origin - allowing request');
            return callback(null, true);
        }
        
        // List of allowed origins
        const allowedOrigins = [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:3000'
        ];
        
        if (allowedOrigins.includes(origin)) {
            console.log('Origin allowed:', origin);
            return callback(null, true);
        } else {
            console.log('Origin BLOCKED:', origin);
            return callback(null, false);
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Cache-Control',
        'X-CSRF-Token',
        'Access-Control-Allow-Origin'
    ]
};

// Apply CORS before other middleware
app.use(cors(corsOptions));

// Global Middleware
app.use(express.json());
app.use(cookieParser());

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000 
}).then(() => {
    console.log('MongoDB connected successfully.');
}).catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); 
});

// Add a middleware to log all requests for debugging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - Origin: ${req.get('Origin')}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.json({ 
        message: 'Server is running and CORS is configured.',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Server Error',
        message: err.message
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('CORS enabled for origins:', corsOptions.origin);
});