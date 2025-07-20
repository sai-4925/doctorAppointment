// config/db.js
const mongoose = require('mongoose');
const { ServerApiVersion } = require('mongodb');
const connectDB = async () => {
    try {
        // Retrieve MONGO_URI from environment variables
        const mongoUri = process.env.MONGO_URI;

        if (!mongoUri) {
            console.error("Error: MONGO_URI is not defined in .env file!");
            process.exit(1); // Exit if URI is missing
        }

        // Mongoose connect call
        const conn = await mongoose.connect(mongoUri, {
            useNewUrlParser: true,      // Deprecated in Mongoose 6, but good to include for compatibility
            useUnifiedTopology: true,   // Deprecated in Mongoose 6, but good to include for compatibility
            // serverApi: ServerApiVersion.v1 // If your Atlas requires it, but often handled by URI
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB; // Export the function