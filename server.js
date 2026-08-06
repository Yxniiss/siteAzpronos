const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const cors = require('cors');
const https = require('https');
require('dotenv').config();

const app = express();
app.use(cors());

// Agent pour ignorer les erreurs de certificat (nécessaire si l'accès est filtré par l'ANJ)
const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});

const PORT = process.env.PORT || 3000;
const AFFILIATE_ID = process.env.AFFILIATE_ID;

// In-memory cache
let cache = {
    leaderboard: null,
    stats: null,
    lastUpdate: 0,
    currentUpdatePromise: null // Pour que tout le monde attende la même mise à jour
};

const CACHE_DURATION = 60000;

// Helper: Mask username
// JeanDupont -> Jea*****ont
// A -> Use***A (per Shuffle doc example)
function maskUsername(username) {
    if (!username) return 'Anonymous';
    if (username.length <= 1) return `Use***${username}`;
    if (username.length <= 3) return `${username}***`;
    
    const firstThree = username.substring(0, 3);
    const lastThree = username.substring(username.length - 3);
    return `${firstThree}*****${lastThree}`;
}

// Fetch data from Shuffle API
async function fetchShuffleData(type) {
    if (!AFFILIATE_ID || AFFILIATE_ID === 'YOUR_SHUFFLE_AFFILIATE_ID') {
        console.error('Missing AFFILIATE_ID in .env');
        return null;
    }

    // Période définie dans le .env
    const startTime = process.env.START_TIME || 1722470400; 
    const endTime = process.env.END_TIME || 1725148799; 
    const url = `https://affiliate.shuffle.com/${type}/${AFFILIATE_ID}?startTime=${startTime}&endTime=${endTime}`;
    
    try {
        console.log(`Calling Shuffle API: ${url}`);
        const response = await fetch(url, {
            timeout: 10000,
            agent: httpsAgent // Utilisation de l'agent qui ignore l'erreur SSL
        });

        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error(`Shuffle API returned non-JSON: ${text.substring(0, 100)}`);
            return cache[type] || [];
        }

        if (!response.ok) {
            console.error(`Shuffle API Error (${response.status}):`, data);
            if (data.message === 'TOO_MANY_REQUEST') {
                return cache[type] || [];
            }
            if (data.message === 'REFEREES_NOT_FOUND') {
                return [];
            }
            return cache[type] || [];
        }

        console.log(`Successfully fetched ${type}`);
        // Log de debug pour voir la structure des données d'un joueur qui a misé
        if (Array.isArray(data)) {
            const playerWithWager = data.find(p => p.weightedWagerAmount > 0 || p.wagerAmount > 0 || p.lifetimeWagered > 0);
            if (playerWithWager) {
                console.log(`Structure d'un joueur avec wager :`, JSON.stringify(playerWithWager));
            }
        }

        // Mask usernames and normalize fields
        if (Array.isArray(data)) {
            return data.map(item => ({
                ...item,
                username: maskUsername(item.username),
                // Normalisation ultra-sécurisée avec tous les noms possibles
                wagerAmount: item.wagerAmount ?? item.wager ?? item.lifetimeWagered ?? item.wager_amount ?? 0,
                weightedWager: item.weightedWagerAmount ?? item.weightedWager ?? item.weighted_wager ?? 0
            }));
        }

        return data;
    } catch (error) {
        console.error(`Network Error fetching ${type}:`, error.message);
        return cache[type] || [];
    }
}

// Update cache logic
async function updateCache() {
    // Si une mise à jour est déjà en cours, on attend qu'elle finisse
    if (cache.currentUpdatePromise) {
        return cache.currentUpdatePromise;
    }

    const now = Date.now();
    if (now - cache.lastUpdate < CACHE_DURATION) {
        return;
    }

    // On crée la promesse de mise à jour
    cache.currentUpdatePromise = (async () => {
        console.log('--- Refreshing Shuffle data (Global Lock Active) ---');
        try {
            const wagerData = await fetchShuffleData('wager');
            
            console.log('Waiting 31s before fetching stats...');
            await new Promise(resolve => setTimeout(resolve, 31000));
            
            const statsData = await fetchShuffleData('stats');

            // Correction : On n'utilise que wagerData pour le classement car statsData n'est pas filtré par Shuffle
            if (wagerData !== null) {
                cache.leaderboard = wagerData;
            }
            if (statsData !== null) {
                cache.stats = statsData;
            }
            
            cache.lastUpdate = Date.now();
            console.log(`--- Refresh Finished: ${wagerData?.length || 0} players found ---`);
        } catch (err) {
            console.error('Update cache error:', err);
        } finally {
            cache.currentUpdatePromise = null;
        }
    })();

    return cache.currentUpdatePromise;
}

// Routes
app.get('/api/leaderboard', async (req, res) => {
    console.log('GET /api/leaderboard');
    await updateCache();
    res.json(cache.leaderboard || []);
});

app.get('/api/stats', async (req, res) => {
    console.log('GET /api/stats');
    await updateCache();
    res.json(cache.stats || []);
});

app.get('/api/config', (req, res) => {
    console.log('GET /api/config');
    res.json({
        affiliateLink: process.env.AFFILIATE_LINK || '#',
        telegramLink: process.env.TELEGRAM_LINK || '#'
    });
});

// Static files AFTER API routes
app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
