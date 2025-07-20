const dotenv = require('dotenv');
// Load environment variables
dotenv.config();

const express = require('express');
const connectDB = require('./config/db'); // Assuming you'll have a db.js in config
const userRoutes = require('./routes/UserRoutes'); // Adjust based on your route files
const doctorRoutes = require('./routes/doctorRoutes'); // Adjust as needed
const adminRoutes = require('./routes/adminRoutes'); // Adjust as needed
const cors = require('cors'); // For CORS
const path = require('path'); // For serving static files in production



// Connect to Database (assuming you have a db.js in a config folder)
// You'll need to create config/db.js and put your MongoDB connection logic there.
connectDB();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// CORS Middleware - configure to allow requests from your frontend
// Replace with your frontend URL (e.g., http://localhost:3000 or http://localhost:5173 if using Vite default)
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000', // IMPORTANT: Update this to your frontend URL
    credentials: true
}));

// Define your API routes
app.use('/api/users', userRoutes); // Example: assuming UserRoutes.js exports user-related routes
app.use('/api/doctors', doctorRoutes); // Example: assuming doctorRoutes.js exports doctor-related routes
app.use('/api/admin', adminRoutes); // Example: assuming adminRoutes.js exports admin-related routes

// Serve static files in production (optional for development, but good practice)
// if (process.env.NODE_ENV === 'production') {
//     app.use(express.static(path.join(__dirname, '../frontend/build'))); // Assuming frontend build is in parent folder
//     app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html')));
// } else {
//     app.get('/', (req, res) => res.send('API is running...'));
// }

// Define a basic root route for development
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error handling middleware (optional, but good for production)
// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).send('Something broke!');
// });


const PORT = process.env.PORT || 5000; // Use environment variable or default to 5000

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});