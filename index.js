require('dotenv').config();
const keepAlive = require('./utils/keep-alive');

// Start keep-alive server for Replit/Netlify
keepAlive();

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
