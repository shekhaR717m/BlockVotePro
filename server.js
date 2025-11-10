const next = require('next');
const express = require('express');
// --- DO NOT REQUIRE routes/voter, company, or candidate HERE ---
const bodyParser = require('body-parser');
const { mongoose, connectDB } = require('./config/database');
const exp = express();
const path = require('path');

require('dotenv').config({ path: __dirname + '/.env' });

mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const startServer = async () => {
  try {
    // 1. Connect to the database FIRST
    await connectDB();
    console.log('MongoDB connection established. Loading routes...');

    // --- MOVED REQUIRES HERE ---
    // Now that we are connected, we can safely load the models.
    const voter = require('./routes/voter');
    const company = require('./routes/company');
    const candidate = require('./routes/candidate');

    // 2. Prepare the Next.js app
    await app.prepare();
    console.log('Next.js app prepared.');

    // 3. Set up Express middleware
    exp.use(
      bodyParser.urlencoded({
        extended: true,
      })
    );
    exp.use(bodyParser.json());

    // 4. Set up your API routes
    exp.use('/company', company);
    exp.use('/voter', voter);
    exp.use('/candidate', candidate);

    // 5. Let Next.js handle all other page routes
    exp.all('*', (req, res) => {
      return handle(req, res);
    });

    // 6. Start the server
    exp.listen(3000, (err) => {
      if (err) throw err;
      console.log('> Ready on http://localhost:3000');
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

// --- Run the async function to start the server ---
startServer();