const axios = require('axios');
const { calculateSupportiveScore } = require('../utils/scoring');

// Mock data generation functions
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

function generateMockMatchData(puuid) {
    return {
        metadata: {
            matchId: `mock_match_${Date.now()}_${Math.random().toString(36).substring(7)}`
        },
        info: {
            gameCreation: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
            gameDuration: Math.floor(Math.random() * 1800) + 1200,
            participants: [{
                puuid,
                championName: ['Lulu', 'Soraka', 'Nami', 'Janna', 'Sona'][Math.floor(Math.random() * 5)],
                win: Math.random() > 0.5,
                visionScore: Math.floor(Math.random() * 40) + 20,
                wardsPlaced: Math.floor(Math.random() * 15) + 8,
                wardsKilled: Math.floor(Math.random() * 5) + 1,
                totalHeal: Math.floor(Math.random() * 5000) + 2000,
                totalTimeCCDealt: Math.floor(Math.random() * 100) + 50,
                assists: Math.floor(Math.random() * 15) + 5,
                deaths: Math.floor(Math.random() * 5) + 1,
                totalDamageShieldedOnTeammates: Math.floor(Math.random() * 3000) + 1000,
                totalHealsOnTeammates: Math.floor(Math.random() * 4000) + 1500,
                individualPosition: 'SUPPORT',
                teamPosition: 'SUPPORT'
            }]
        }
    };
}

// Commented out original Riot API implementation
/*
const RIOT_API_KEY = process.env.RIOT_API_KEY;
const SUPPORTIVE_SCORE_THRESHOLD = parseFloat(process.env.SUPPORTIVE_SCORE_THRESHOLD) || 100;

const REGIONAL_ENDPOINTS = {
    'na1': 'americas',
    'br1': 'americas',
    'la1': 'americas',
    'la2': 'americas',
    'euw1': 'europe',
    'eun1': 'europe',
    'tr1': 'europe',
    'ru': 'europe',
    'kr': 'asia',
    'jp1': 'asia',
    'oc1': 'sea'
};
*/

async function validateSummoner(summonerName, region) {
    console.log(`🔍 Validating summoner ${summonerName} in ${region} (Mock Mode)`);    
    return generateMockSummonerData(summonerName, region);
}

async function getMatchHistory(puuid, region, count = 5) {
    console.log(`📋 Generating ${count} mock matches`);
    const matches = [];
    for (let i = 0; i < count; i++) {
        matches.push(generateMockMatchData(puuid));
    }
    return matches;
}

function extractSupportiveStats(matchData, puuid) {
    const participant = matchData.info.participants.find(p => p.puuid === puuid);
    if (!participant) return null;
    
    return {
        matchId: matchData.metadata.matchId,
        gameCreation: matchData.info.gameCreation,
        gameDuration: matchData.info.gameDuration,
        champion: participant.championName,
        win: participant.win,
        visionScore: participant.visionScore || 0,
        wardsPlaced: participant.wardsPlaced || 0,
        wardsKilled: participant.wardsKilled || 0,
        totalHeal: participant.totalHeal || 0,
        totalTimeCCDealt: participant.totalTimeCCDealt || 0,
        assists: participant.assists || 0,
        deaths: participant.deaths || 0,
        totalDamageShieldedOnTeammates: participant.totalDamageShieldedOnTeammates || 0,
        totalHealsOnTeammates: participant.totalHealsOnTeammates || 0,
        individualPosition: participant.individualPosition,
        teamPosition: participant.teamPosition
    };
}

async function checkSupportiveStats(discordId, summonerName, region, client) {
    try {
        console.log(`🔍 Checking supportive stats for ${summonerName} (${region}) - Mock Mode`);
        
        const summonerData = await validateSummoner(summonerName, region);
        if (!summonerData) {
            console.log(`❌ Summoner ${summonerName} not found`);
            return null;
        }
        
        const matches = await getMatchHistory(summonerData.puuid, region, 5);
        if (matches.length === 0) {
            console.log(`📊 No matches generated`);
            return null;
        }
        
        const allStats = matches.map(match => extractSupportiveStats(match, summonerData.puuid))
            .filter(stats => stats !== null);
        
        if (allStats.length === 0) {
            console.log(`📊 No valid match data generated`);
            return null;
        }
        
        const supportiveScore = calculateSupportiveScore(allStats);
        console.log(`📊 ${summonerName} mock supportive score: ${supportiveScore.toFixed(2)}`);
        
        return {
            summonerName,
            totalScore: supportiveScore,
            matchCount: allStats.length,
            breakdown: {
                visionScore: allStats.reduce((sum, match) => sum + match.visionScore, 0) / allStats.length,
                wardsPlaced: allStats.reduce((sum, match) => sum + match.wardsPlaced, 0) / allStats.length,
                healingDone: allStats.reduce((sum, match) => sum + match.totalHeal, 0) / allStats.length,
                ccScore: allStats.reduce((sum, match) => sum + match.totalTimeCCDealt, 0) / allStats.length,
                assistRatio: allStats.reduce((sum, match) => sum + match.assists, 0) / allStats.length,
                protection: allStats.reduce((sum, match) => sum + match.totalDamageShieldedOnTeammates, 0) / allStats.length
            }
        };
    } catch (error) {
        console.error(`❌ Error in mock stats generation for ${summonerName}:`, error);
        throw error;
    }
}

module.exports = {
    validateSummoner,
    getMatchHistory,
    checkSupportiveStats
};
