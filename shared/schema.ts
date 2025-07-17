import { pgTable, text, integer, timestamp, decimal, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Users table - tracks Discord users and their League summoners
export const users = pgTable('users', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  discordId: text('discord_id').notNull().unique(),
  discordUsername: text('discord_username').notNull(),
  summonerName: text('summoner_name').notNull(),
  region: text('region').notNull(),
  puuid: text('puuid').notNull(),
  guildId: text('guild_id').notNull(), // Discord guild/server ID
  isActive: boolean('is_active').notNull().default(true),
  registeredAt: timestamp('registered_at').notNull().defaultNow(),
  lastUpdated: timestamp('last_updated').notNull().defaultNow(),
});

// Match stats table - stores individual match performance data
export const matchStats = pgTable('match_stats', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  userId: integer('user_id').references(() => users.id).notNull(),
  matchId: text('match_id').notNull().unique(),
  summonerName: text('summoner_name').notNull(),
  region: text('region').notNull(),
  gameMode: text('game_mode'),
  gameDuration: integer('game_duration'), // in seconds
  
  // Core supportive stats
  visionScore: integer('vision_score').notNull().default(0),
  wardsPlaced: integer('wards_placed').notNull().default(0),
  wardsDestroyed: integer('wards_destroyed').notNull().default(0),
  controlWardsPlaced: integer('control_wards_placed').notNull().default(0),
  
  // Healing and protection
  totalHealingDone: integer('total_healing_done').notNull().default(0),
  totalDamageShielded: integer('total_damage_shielded').notNull().default(0),
  totalUnitsHealed: integer('total_units_healed').notNull().default(0),
  
  // Crowd control and engagement
  totalTimeCrowdControlDealt: integer('total_time_crowd_control_dealt').notNull().default(0),
  timeCCingOthers: integer('time_ccing_others').notNull().default(0),
  
  // KDA and team fight stats
  kills: integer('kills').notNull().default(0),
  deaths: integer('deaths').notNull().default(0),
  assists: integer('assists').notNull().default(0),
  
  // Calculated scores
  supportiveScore: decimal('supportive_score', { precision: 10, scale: 2 }).notNull().default('0'),
  visionScorePoints: decimal('vision_score_points', { precision: 10, scale: 2 }).notNull().default('0'),
  wardsPoints: decimal('wards_points', { precision: 10, scale: 2 }).notNull().default('0'),
  healingPoints: decimal('healing_points', { precision: 10, scale: 2 }).notNull().default('0'),
  ccPoints: decimal('cc_points', { precision: 10, scale: 2 }).notNull().default('0'),
  assistRatioPoints: decimal('assist_ratio_points', { precision: 10, scale: 2 }).notNull().default('0'),
  protectionPoints: decimal('protection_points', { precision: 10, scale: 2 }).notNull().default('0'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Guild scores table - aggregated guild performance
export const guildScores = pgTable('guild_scores', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  guildId: text('guild_id').notNull().unique(),
  guildName: text('guild_name').notNull(),
  
  // Aggregate scores
  totalSupportiveScore: decimal('total_supportive_score', { precision: 15, scale: 2 }).notNull().default('0'),
  averageSupportiveScore: decimal('average_supportive_score', { precision: 10, scale: 2 }).notNull().default('0'),
  totalMatches: integer('total_matches').notNull().default(0),
  activeMembers: integer('active_members').notNull().default(0),
  
  // Top performers tracking
  topScorerDiscordId: text('top_scorer_discord_id'),
  topScorerName: text('top_scorer_name'),
  topScore: decimal('top_score', { precision: 10, scale: 2 }).default('0'),
  
  // Rankings
  globalRank: integer('global_rank'),
  lastRankUpdate: timestamp('last_rank_update'),
  
  lastUpdated: timestamp('last_updated').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Type exports for TypeScript
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type MatchStats = typeof matchStats.$inferSelect;
export type InsertMatchStats = typeof matchStats.$inferInsert;
export type GuildScore = typeof guildScores.$inferSelect;
export type InsertGuildScore = typeof guildScores.$inferInsert;