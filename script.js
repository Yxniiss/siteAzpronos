document.addEventListener('DOMContentLoaded', () => {
    // Auto-détection de l'adresse du serveur (Local vs Production)
    const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3000' 
        : '';

    // State
    let config = {
        affiliateLink: '#',
        telegramLink: '#'
    };

    // Formatter
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(value);
    };

    // Update links on the page
    const updateLinks = (data) => {
        config = data;
        document.querySelectorAll('.aff-link').forEach(link => {
            link.href = config.affiliateLink;
        });
        document.querySelectorAll('.telegram-link').forEach(link => {
            link.href = config.telegramLink;
        });
    };

    // Fetch Config
    async function fetchConfig() {
        try {
            const res = await fetch(`${API_BASE}/api/config`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            updateLinks(data);
        } catch (err) {
            console.error('Config error:', err);
        }
    }

    // Fetch Stats (for the quick stats section)
    async function fetchStats() {
        try {
            const res = await fetch(`${API_BASE}/api/stats`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            
            if (Array.isArray(data)) {
                const totalWager = data.reduce((sum, user) => {
                    const amount = parseFloat(user.wagerAmount) || 0;
                    return sum + amount;
                }, 0);
                document.getElementById('total-wager').textContent = formatCurrency(totalWager);
                document.getElementById('total-users').textContent = data.length;
            }
        } catch (err) {
            console.error('Stats error:', err);
        }
    }

    // Fetch Leaderboard
    async function fetchLeaderboard() {
        const tbody = document.getElementById('leaderboard-body');
        
        try {
            const res = await fetch(`${API_BASE}/api/leaderboard`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();

            if (!data || data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3" class="no-data">Aucun participant pour le moment.</td></tr>';
                return;
            }

            // Sort by weightedWager (pondéré) descending
            const sortedData = [...data].sort((a, b) => {
                return (parseFloat(b.weightedWager) || 0) - (parseFloat(a.weightedWager) || 0);
            });

            // Limit to top 20 players
            const top20 = sortedData.slice(0, 20);

            tbody.innerHTML = top20.map((player, index) => {
                const rank = index + 1;
                const rankClass = rank <= 3 ? `rank-${rank}` : '';
                const weighted = parseFloat(player.weightedWager) || 0;
                
                return `
                    <tr>
                        <td><span class="rank ${rankClass}">#${rank}</span></td>
                        <td class="player-name">${player.username}</td>
                        <td class="wager-amount">${formatCurrency(weighted)}</td>
                    </tr>
                `;
            }).join('');

        } catch (err) {
            console.error('Leaderboard error:', err);
            tbody.innerHTML = '<tr><td colspan="3" class="error">Erreur lors de la récupération des données.</td></tr>';
        }
    }

    // Initial Load
    fetchConfig();
    fetchStats();
    fetchLeaderboard();

    // Auto Refresh every 60 seconds
    setInterval(() => {
        fetchStats();
        fetchLeaderboard();
    }, 60000);
});
