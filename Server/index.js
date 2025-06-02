const express = require('express');
const connectDB = require('./db/config');
const route = require('./controllers/route');
const bodyParser = require('body-parser');
const cors = require('cors');
const { initializeLeadSchema } = require('./model/schema/lead');

require('dotenv').config();

// Import and register models BEFORE using them
require('./model/schema/user');
require('./model/schema/contact');
require('./model/schema/lead');
require('./model/schema/meeting');

const app = express();
const port = 5001;

// Middleware
app.use(bodyParser.json());
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:4000'],
    credentials: true,
}));

app.get('/', (req, res) => {
    res.send('Welcome to my world...');
});

// Connect to MongoDB and initialize schema before starting server
(async () => {
    try {
        console.log(' Connecting to database...');
        await connectDB();
        console.log(' MongoDB connected.');

        console.log(' Initializing lead schema...');
        await initializeLeadSchema();
        console.log(' Lead schema initialized.');

        // Mount routes after initialization
        app.use('/api', route);

        app.listen(port, () => {
            const protocol = (process.env.HTTPS === "true" || process.env.NODE_ENV === 'production') ? 'https' : 'http';
            console.log(` Server listening at ${protocol}://127.0.0.1:${port}/`);
        });
    } catch (err) {
        console.error(' Startup failed:', err);
    }
})();
