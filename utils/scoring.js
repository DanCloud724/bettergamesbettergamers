/**
 * Calculate supportive score based on League of Legends match statistics
 * Uses weighted scoring system to emphasize different aspects of supportive play
 */

function calculateSupportiveScore(matchStats) {
    if (!matchStats || matchStats.length === 0) {
        return 0;
    }
    
    let totalScore = 0;
    let totalMatches = matchStats.length;
    
    for (const stats of matchStats) {
        let matchScore = 0;
        
        // Vision Score (high weight - 30% of total)
        // Vision score typically ranges from 10-80 in most games
        const visionComponent = Math.min(stats.visionScore / 2, 40) * 0.3;
        matchScore += visionComponent;
        
        // Wards Placed (medium weight - 20% of total)
        // Good ward placement: 10-30 wards per game
        const wardsComponent = Math.min(stats.wardsPlaced * 2, 40) * 0.2;
        matchScore += wardsComponent;
        
        // Healing Done (medium weight - 20% of total)
        // Normalize healing by game duration (per minute)
        const gameDurationMinutes = stats.gameDuration / 60;
        const healingPerMinute = stats.totalHeal / gameDurationMinutes;
        const healingComponent = Math.min(healingPerMinute / 100, 40) * 0.2;
        matchScore += healingComponent;
        
        // Crowd Control Score (medium weight - 15% of total)
        // CC time in seconds, normalize per minute
        const ccPerMinute = stats.totalTimeCCDealt / gameDurationMinutes;
        const ccComponent = Math.min(ccPerMinute * 2, 30) * 0.15;
        matchScore += ccComponent;
        
        // Assists relative to deaths (10% of total)
        const assistDeathRatio = stats.deaths > 0 ? stats.assists / stats.deaths : stats.assists;
        const assistComponent = Math.min(assistDeathRatio * 5, 20) * 0.1;
        matchScore += assistComponent;
        
        // Bonus for teammate healing and shielding (5% of total)
        const teammateHealingPerMinute = stats.totalHealsOnTeammates / gameDurationMinutes;
        const shieldingPerMinute = stats.totalDamageShieldedOnTeammates / gameDurationMinutes;
        const teammateProtectionComponent = Math.min((teammateHealingPerMinute + shieldingPerMinute) / 50, 10) * 0.05;
        matchScore += teammateProtectionComponent;
        
        // Win bonus (small boost for winning games)
        if (stats.win) {
            matchScore *= 1.1; // 10% bonus for wins
        }
        
        // Role-based bonus (support role gets small boost)
        if (stats.individualPosition === 'UTILITY' || stats.teamPosition === 'UTILITY') {
            matchScore *= 1.05; // 5% bonus for playing support role
        }
        
        totalScore += matchScore;
        
        console.log(`📊 Match ${stats.matchId}: Score = ${matchScore.toFixed(2)} (Vision: ${visionComponent.toFixed(1)}, Wards: ${wardsComponent.toFixed(1)}, Healing: ${healingComponent.toFixed(1)}, CC: ${ccComponent.toFixed(1)})`);
    }
    
    // Calculate average score across all matches
    const averageScore = totalScore / totalMatches;
    
    console.log(`📈 Average supportive score across ${totalMatches} matches: ${averageScore.toFixed(2)}`);
    
    return averageScore;
}

function getScoreBreakdown(matchStats) {
    if (!matchStats || matchStats.length === 0) {
        return null;
    }
    
    const breakdown = {
        totalMatches: matchStats.length,
        averageVisionScore: 0,
        averageWardsPlaced: 0,
        averageHealing: 0,
        averageCCTime: 0,
        winRate: 0,
        supportGamesPlayed: 0
    };
    
    let totalVision = 0;
    let totalWards = 0;
    let totalHealing = 0;
    let totalCC = 0;
    let wins = 0;
    let supportGames = 0;
    
    for (const stats of matchStats) {
        totalVision += stats.visionScore;
        totalWards += stats.wardsPlaced;
        totalHealing += stats.totalHeal;
        totalCC += stats.totalTimeCCDealt;
        
        if (stats.win) wins++;
        if (stats.individualPosition === 'UTILITY' || stats.teamPosition === 'UTILITY') {
            supportGames++;
        }
    }
    
    breakdown.averageVisionScore = totalVision / matchStats.length;
    breakdown.averageWardsPlaced = totalWards / matchStats.length;
    breakdown.averageHealing = totalHealing / matchStats.length;
    breakdown.averageCCTime = totalCC / matchStats.length;
    breakdown.winRate = (wins / matchStats.length) * 100;
    breakdown.supportGamesPlayed = supportGames;
    
    return breakdown;
}

module.exports = {
    calculateSupportiveScore,
    getScoreBreakdown
};
