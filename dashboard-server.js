require('dotenv').config();
const express = require('express');
const path = require('path');
const { validateSummoner, checkSupportiveStats } = require('./services/riot');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Serve the dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Mock data for development when API is unavailable
const DEMO_MODE = process.env.DEMO_MODE === 'true' || !process.env.RIOT_API_KEY || process.env.RIOT_API_KEY.length < 40;

function generateMockSummonerData(summonerName, region) {
    return {
        id: `mock_${summonerName.toLowerCase()}`,
        accountId: `mock_acc_${summonerName.toLowerCase()}`,
        puuid: `mock_puuid_${summonerName.toLowerCase()}_${region}`,
        name: summonerName,
        profileIconId: Math.floor(Math.random() * 50) + 1,
        revisionDate: Date.now(),
        summonerLevel: Math.floor(Math.random() * 200) + 30
    };
}

function generateMockStats(summonerName) {
    // Generate realistic supportive stats
    const visionScore = Math.floor(Math.random() * 40) + 20;
    const wardsPlaced = Math.floor(Math.random() * 15) + 8;
    const healingDone = Math.floor(Math.random() * 5000) + 2000;
    const ccScore = Math.floor(Math.random() * 20) + 5;
    const assistRatio = (Math.random() * 3 + 1).toFixed(1);
    const protection = Math.floor(Math.random() * 1500) + 500;
    
    const totalScore = Math.floor(
        (visionScore * 0.3) + 
        (wardsPlaced * 0.2) + 
        (healingDone / 100 * 0.2) + 
        (ccScore * 0.15) + 
        (parseFloat(assistRatio) * 10 * 0.1) + 
        (protection / 100 * 0.05)
    );
    
    return {
        totalScore,
        matchCount: 5,
        breakdown: {
            visionScore,
            wardsPlaced,
            healingDone,
            ccScore,
            assistRatio,
            protection
        }
    };
}

// API Routes
app.post('/api/validate-summoner', async (req, res) => {
    try {
        const { summonerName, region } = req.body;
        
        if (!summonerName || !region) {
            return res.status(400).json({ error: 'Summoner name and region are required' });
        }
        
        console.log(`🔍 Validating summoner: ${summonerName} in ${region}`);
        
        if (DEMO_MODE) {
            console.log(`🎮 Demo mode: generating mock data for ${summonerName}`);
            const mockData = generateMockSummonerData(summonerName, region);
            res.json(mockData);
            return;
        }
        
        const summonerData = await validateSummoner(summonerName, region);
        
        if (!summonerData) {
            return res.status(404).json({ error: 'Summoner not found. Please check the name and region.' });
        }
        
        console.log(`✅ Found summoner: ${summonerData.name}`);
        res.json(summonerData);
        
    } catch (error) {
        console.error('❌ Error validating summoner:', error.message);
        
        if (error.response?.status === 403) {
            res.status(403).json({ 
                error: 'API key issue. Development keys only work from registered IP address.' 
            });
        } else if (error.response?.status === 401) {
            console.log('🎮 API key expired, switching to demo mode...');
            const mockData = generateMockSummonerData(req.body.summonerName, req.body.region);
            res.json(mockData);
        } else if (error.response?.status === 429) {
            res.status(429).json({ 
                error: 'Rate limit exceeded. Please wait a moment and try again.' 
            });
        } else {
            res.status(500).json({ 
                error: 'Failed to validate summoner. Please try again.' 
            });
        }
    }
});

app.post('/api/player-stats', async (req, res) => {
    try {
        const { summonerName, region } = req.body;
        
        if (!summonerName || !region) {
            return res.status(400).json({ error: 'Summoner name and region are required' });
        }
        
        console.log(`📊 Fetching stats for: ${summonerName} in ${region}`);
        
        if (DEMO_MODE) {
            console.log(`🎮 Demo mode: generating mock stats for ${summonerName}`);
            const mockStats = generateMockStats(summonerName);
            res.json(mockStats);
            return;
        }
        
        // Removed Discord client dependency for Netlify deployment
        const statsResult = await checkSupportiveStats(null, summonerName, region, null);
        
        if (!statsResult) {
            return res.status(404).json({ error: 'No recent matches found or unable to calculate stats' });
        }
        
        console.log(`✅ Stats calculated for ${summonerName}: ${statsResult.totalScore} points`);
        res.json(statsResult);
        
    } catch (error) {
        console.error('❌ Error fetching player stats:', error.message);
        
        if (error.response?.status === 403) {
            res.status(403).json({ 
                error: 'API key issue. Development keys only work from registered IP address.' 
            });
        } else if (error.response?.status === 401) {
            console.log('🎮 API key expired, generating mock stats...');
            const mockStats = generateMockStats(req.body.summonerName);
            res.json(mockStats);
        } else if (error.response?.status === 429) {
            res.status(429).json({ 
                error: 'Rate limit exceeded. Please wait a moment and try again.' 
            });
        } else {
            res.status(500).json({ 
                error: 'Failed to fetch stats. Please try again.' 
            });
        }
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        apiKey: process.env.RIOT_API_KEY ? 'configured' : 'missing',
        demoMode: DEMO_MODE
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Dashboard server running on port ${PORT}`);
    console.log(`📊 Open http://localhost:${PORT} to view the dashboard`);
    console.log(`🔑 API Key configured: ${process.env.RIOT_API_KEY ? 'Yes' : 'No'}`);
});

module.exports = app;