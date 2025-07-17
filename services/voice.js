const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    AudioPlayerStatus,
    VoiceConnectionStatus,
    getVoiceConnection
} = require('@discordjs/voice');
const axios = require('axios');

const CONGRATULATIONS_CHANNEL_ID = process.env.CONGRATULATIONS_CHANNEL_ID;
const SUPPORT_ROLE_NAME = process.env.SUPPORT_ROLE_NAME || 'Support MVP';

async function sendVoiceCongratulations(client, discordId, summonerName, supportiveScore) {
    try {
        // Send text message first
        await sendTextCongratulations(client, discordId, summonerName, supportiveScore);
        
        // Note: Voice message functionality would require additional setup
        // For MVP, we'll focus on text congratulations
        console.log(`🎉 Congratulations sent to ${summonerName} (Score: ${supportiveScore.toFixed(2)})`);
        
    } catch (error) {
        console.error('❌ Error sending congratulations:', error);
        throw error;
    }
}

async function sendTextCongratulations(client, discordId, summonerName, supportiveScore) {
    try {
        // Try to send DM first
        const user = await client.users.fetch(discordId);
        
        const congratsMessage = `🎉 **Congratulations, Support MVP!** 🎉

Hey <@${discordId}>! Your exceptional supportive gameplay as **${summonerName}** has been recognized!

📊 **Your Supportive Score: ${supportiveScore.toFixed(2)}**

You've demonstrated outstanding:
🔍 Vision control and map awareness
🛡️ Team protection and healing
🎯 Crowd control and engagement
💪 Overall supportive impact

Keep up the amazing work supporting your team! 🌟`;

        try {
            await user.send(congratsMessage);
            console.log(`✅ DM sent to ${summonerName}`);
        } catch (dmError) {
            console.log(`⚠️ Could not send DM to ${summonerName}, trying channel message`);
            
            // If DM fails, try to send in congratulations channel
            if (CONGRATULATIONS_CHANNEL_ID) {
                const channel = await client.channels.fetch(CONGRATULATIONS_CHANNEL_ID);
                if (channel) {
                    await channel.send(congratsMessage);
                    console.log(`✅ Channel message sent for ${summonerName}`);
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Error sending text congratulations:', error);
        throw error;
    }
}

async function assignSupportRole(client, discordId) {
    try {
        // This requires the bot to be in a guild and have proper permissions
        // For MVP, we'll log the action but not implement full role assignment
        console.log(`🏷️ Would assign "${SUPPORT_ROLE_NAME}" role to user ${discordId}`);
        
        // Uncomment and modify this section when deployed to specific guild:
        /*
        const guild = client.guilds.cache.first(); // Or get specific guild
        if (!guild) return;
        
        const member = await guild.members.fetch(discordId);
        if (!member) return;
        
        const role = guild.roles.cache.find(r => r.name === SUPPORT_ROLE_NAME);
        if (!role) {
            console.log(`⚠️ Role "${SUPPORT_ROLE_NAME}" not found`);
            return;
        }
        
        if (!member.roles.cache.has(role.id)) {
            await member.roles.add(role);
            console.log(`✅ Assigned "${SUPPORT_ROLE_NAME}" role to ${member.user.tag}`);
        }
        */
        
    } catch (error) {
        console.error('❌ Error assigning support role:', error);
    }
}

// Text-to-speech functionality for future implementation
async function generateVoiceMessage(text) {
    try {
        // This would integrate with a TTS service like Google Cloud TTS
        // For MVP, we'll focus on text messages
        console.log(`🎵 Would generate voice message: "${text}"`);
        return null;
    } catch (error) {
        console.error('❌ Error generating voice message:', error);
        return null;
    }
}

module.exports = {
    sendVoiceCongratulations,
    assignSupportRole,
    generateVoiceMessage
};
