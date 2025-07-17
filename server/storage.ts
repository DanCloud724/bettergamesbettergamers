import { eq, desc, sum, avg, count, max } from 'drizzle-orm';
import { db } from './db';
import { users, matchStats, guildScores, type User, type InsertUser, type MatchStats, type InsertMatchStats, type GuildScore } from '../shared/schema';

export interface IStorage {
  // User management
  getUser(discordId: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUser(discordId: string, updates: Partial<User>): Promise<User>;
  deleteUser(discordId: string): Promise<void>;
  
  // Match stats
  saveMatchStats(stats: InsertMatchStats): Promise<MatchStats>;
  getUserMatchStats(userId: number, limit?: number): Promise<MatchStats[]>;
  getGuildMatchStats(guildId: string, limit?: number): Promise<MatchStats[]>;
  
  // Guild scores
  updateGuildScore(guildId: string, guildName: string): Promise<GuildScore>;
  getGuildScore(guildId: string): Promise<GuildScore | undefined>;
  getTopGuilds(limit?: number): Promise<GuildScore[]>;
  
  // Analytics
  getUserTotalScore(discordId: string): Promise<number>;
  getGuildMemberStats(guildId: string): Promise<Array<{user: User, totalScore: number, matchCount: number}>>;
}

export class DatabaseStorage implements IStorage {
  async getUser(discordId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.discordId, discordId));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.discordUsername, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        registeredAt: new Date(),
        lastUpdated: new Date(),
      })
      .returning();
    return user;
  }

  async updateUser(discordId: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...updates,
        lastUpdated: new Date(),
      })
      .where(eq(users.discordId, discordId))
      .returning();
    return user;
  }

  async deleteUser(discordId: string): Promise<void> {
    await db.delete(users).where(eq(users.discordId, discordId));
  }

  async saveMatchStats(stats: InsertMatchStats): Promise<MatchStats> {
    const [matchStat] = await db
      .insert(matchStats)
      .values({
        ...stats,
        createdAt: new Date(),
      })
      .returning();
    return matchStat;
  }

  async getUserMatchStats(userId: number, limit: number = 20): Promise<MatchStats[]> {
    return await db
      .select()
      .from(matchStats)
      .where(eq(matchStats.userId, userId))
      .orderBy(desc(matchStats.createdAt))
      .limit(limit);
  }

  async getGuildMatchStats(guildId: string, limit: number = 100): Promise<MatchStats[]> {
    return await db
      .select({
        id: matchStats.id,
        userId: matchStats.userId,
        matchId: matchStats.matchId,
        summonerName: matchStats.summonerName,
        region: matchStats.region,
        gameMode: matchStats.gameMode,
        gameDuration: matchStats.gameDuration,
        visionScore: matchStats.visionScore,
        wardsPlaced: matchStats.wardsPlaced,
        wardsDestroyed: matchStats.wardsDestroyed,
        controlWardsPlaced: matchStats.controlWardsPlaced,
        totalHealingDone: matchStats.totalHealingDone,
        totalDamageShielded: matchStats.totalDamageShielded,
        totalUnitsHealed: matchStats.totalUnitsHealed,
        totalTimeCrowdControlDealt: matchStats.totalTimeCrowdControlDealt,
        timeCCingOthers: matchStats.timeCCingOthers,
        kills: matchStats.kills,
        deaths: matchStats.deaths,
        assists: matchStats.assists,
        supportiveScore: matchStats.supportiveScore,
        visionScorePoints: matchStats.visionScorePoints,
        wardsPoints: matchStats.wardsPoints,
        healingPoints: matchStats.healingPoints,
        ccPoints: matchStats.ccPoints,
        assistRatioPoints: matchStats.assistRatioPoints,
        protectionPoints: matchStats.protectionPoints,
        createdAt: matchStats.createdAt,
      })
      .from(matchStats)
      .innerJoin(users, eq(matchStats.userId, users.id))
      .where(eq(users.guildId, guildId))
      .orderBy(desc(matchStats.createdAt))
      .limit(limit);
  }

  async updateGuildScore(guildId: string, guildName: string): Promise<GuildScore> {
    // Calculate guild statistics
    const guildStats = await db
      .select({
        totalScore: sum(matchStats.supportiveScore),
        avgScore: avg(matchStats.supportiveScore),
        totalMatches: count(matchStats.id),
        activeMembers: count(users.id),
        topScore: max(matchStats.supportiveScore),
      })
      .from(users)
      .leftJoin(matchStats, eq(users.id, matchStats.userId))
      .where(eq(users.guildId, guildId))
      .groupBy(users.guildId);

    const stats = guildStats[0] || {
      totalScore: '0',
      avgScore: '0',
      totalMatches: 0,
      activeMembers: 0,
      topScore: '0',
    };

    // Get top scorer info
    const topScorer = await db
      .select({
        discordId: users.discordId,
        username: users.discordUsername,
        score: matchStats.supportiveScore,
      })
      .from(users)
      .innerJoin(matchStats, eq(users.id, matchStats.userId))
      .where(eq(users.guildId, guildId))
      .orderBy(desc(matchStats.supportiveScore))
      .limit(1);

    const topScorerInfo = topScorer[0];

    // Update or insert guild score
    const [guildScore] = await db
      .insert(guildScores)
      .values({
        guildId,
        guildName,
        totalSupportiveScore: stats.totalScore || '0',
        averageSupportiveScore: stats.avgScore || '0',
        totalMatches: stats.totalMatches || 0,
        activeMembers: stats.activeMembers || 0,
        topScorerDiscordId: topScorerInfo?.discordId,
        topScorerName: topScorerInfo?.username,
        topScore: topScorerInfo?.score || '0',
        lastUpdated: new Date(),
        createdAt: new Date(),
      })
      .onConflictDoUpdate({
        target: guildScores.guildId,
        set: {
          guildName,
          totalSupportiveScore: stats.totalScore || '0',
          averageSupportiveScore: stats.avgScore || '0',
          totalMatches: stats.totalMatches || 0,
          activeMembers: stats.activeMembers || 0,
          topScorerDiscordId: topScorerInfo?.discordId,
          topScorerName: topScorerInfo?.username,
          topScore: topScorerInfo?.score || '0',
          lastUpdated: new Date(),
        },
      })
      .returning();

    return guildScore;
  }

  async getGuildScore(guildId: string): Promise<GuildScore | undefined> {
    const [guild] = await db.select().from(guildScores).where(eq(guildScores.guildId, guildId));
    return guild || undefined;
  }

  async getTopGuilds(limit: number = 10): Promise<GuildScore[]> {
    return await db
      .select()
      .from(guildScores)
      .orderBy(desc(guildScores.totalSupportiveScore))
      .limit(limit);
  }

  async getUserTotalScore(discordId: string): Promise<number> {
    const user = await this.getUser(discordId);
    if (!user) return 0;

    const [result] = await db
      .select({ totalScore: sum(matchStats.supportiveScore) })
      .from(matchStats)
      .where(eq(matchStats.userId, user.id));

    return parseFloat(result?.totalScore || '0');
  }

  async getGuildMemberStats(guildId: string): Promise<Array<{user: User, totalScore: number, matchCount: number}>> {
    const results = await db
      .select({
        user: users,
        totalScore: sum(matchStats.supportiveScore),
        matchCount: count(matchStats.id),
      })
      .from(users)
      .leftJoin(matchStats, eq(users.id, matchStats.userId))
      .where(eq(users.guildId, guildId))
      .groupBy(users.id);

    return results.map(result => ({
      user: result.user,
      totalScore: parseFloat(result.totalScore || '0'),
      matchCount: result.matchCount || 0,
    }));
  }
}

export const storage = new DatabaseStorage();