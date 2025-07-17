const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/users.json');

async function ensureDataFile() {
    try {
        await fs.access(DATA_FILE);
    } catch (error) {
        // File doesn't exist, create it with empty array
        await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2));
        console.log('📁 Created new users data file');
    }
}

async function getAllUsers() {
    await ensureDataFile();
    
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('❌ Error reading users data:', error);
        return [];
    }
}

async function saveUser(userData) {
    const users = await getAllUsers();
    
    // Check if user already exists
    const existingUserIndex = users.findIndex(user => user.discordId === userData.discordId);
    
    if (existingUserIndex !== -1) {
        // Update existing user
        users[existingUserIndex] = { ...users[existingUserIndex], ...userData };
        console.log(`🔄 Updated existing user: ${userData.discordId}`);
    } else {
        // Add new user
        users.push(userData);
        console.log(`➕ Added new user: ${userData.discordId}`);
    }
    
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2));
        console.log('💾 User data saved successfully');
    } catch (error) {
        console.error('❌ Error saving user data:', error);
        throw error;
    }
}

async function getUser(discordId) {
    const users = await getAllUsers();
    return users.find(user => user.discordId === discordId);
}

async function removeUser(discordId) {
    const users = await getAllUsers();
    const filteredUsers = users.filter(user => user.discordId !== discordId);
    
    if (filteredUsers.length !== users.length) {
        await fs.writeFile(DATA_FILE, JSON.stringify(filteredUsers, null, 2));
        console.log(`🗑️ Removed user: ${discordId}`);
        return true;
    }
    
    return false;
}

module.exports = {
    getAllUsers,
    saveUser,
    getUser,
    removeUser
};
