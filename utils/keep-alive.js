const http = require('http');

function keepAlive() {
    const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        
        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>LoL Support Bot</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            background: #1a1a1a; 
            color: #fff; 
            padding: 20px; 
            text-align: center;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: #2a2a2a; 
            padding: 30px; 
            border-radius: 10px;
        }
        .status { color: #00ff88; font-weight: bold; }
        .feature { 
            background: #333; 
            margin: 10px 0; 
            padding: 15px; 
            border-radius: 5px; 
            border-left: 4px solid #00ff88;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 League of Legends Support Bot</h1>
        <p class="status">✅ Bot is running and monitoring supportive gameplay!</p>
        
        <h3>Features:</h3>
        <div class="feature">
            <strong>🎯 /optin Command:</strong> Register your LoL summoner name for tracking
        </div>
        <div class="feature">
            <strong>📊 Supportive Stats:</strong> Vision Score, Wards, Healing, CC Score
        </div>
        <div class="feature">
            <strong>🎉 Auto Rewards:</strong> Voice messages and roles for high performers
        </div>
        <div class="feature">
            <strong>🔄 Continuous Monitoring:</strong> Checks stats every 30 minutes
        </div>
        
        <p><em>Last checked: ${new Date().toLocaleString()}</em></p>
    </div>
</body>
</html>`;
        
        res.end(html);
    });

    const port = process.env.PORT || 5000;
    
    server.listen(port, '0.0.0.0', () => {
        console.log(`🌐 Keep-alive server running on port ${port}`);
        console.log(`📡 Bot status page: http://localhost:${port}`);
    });

    // Keep the server alive with periodic requests
    setInterval(() => {
        const options = {
            hostname: 'localhost',
            port: port,
            path: '/',
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            // Do nothing, just keep alive
        });

        req.on('error', (err) => {
            // Ignore errors
        });

        req.end();
    }, 5 * 60 * 1000); // Every 5 minutes
}

module.exports = keepAlive;
