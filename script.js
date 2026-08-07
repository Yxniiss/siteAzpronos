document.addEventListener('DOMContentLoaded', () => {
    // Auto-détection de l'adresse du serveur
    const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3000' 
        : '';

    // UI State
    const CONFIG = {
        bonusCode: 'AZZPRONOS',
        onlinePlayers: 42
    };

    // Helper: Format Currency
    const formatCurrency = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(v) || 0);

    // Copy to Clipboard
    window.copyCode = () => {
        navigator.clipboard.writeText(CONFIG.bonusCode).then(() => {
            const btns = document.querySelectorAll('.btn-copy, .btn-copy-small');
            btns.forEach(b => {
                const originalText = b.textContent;
                b.textContent = 'COPIÉ !';
                b.style.background = '#10b981';
                b.style.color = 'white';
                setTimeout(() => {
                    b.textContent = originalText;
                    b.style.background = '';
                    b.style.color = '';
                }, 2000);
            });
        });
    };

    // Fetch Config
    async function fetchConfig() {
        try {
            const res = await fetch(`${API_BASE}/api/config`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            document.querySelectorAll('.aff-link').forEach(l => l.href = data.affiliateLink);
            document.querySelectorAll('.telegram-link').forEach(l => l.href = data.telegramLink);
        } catch (err) { console.error('Config error:', err); }
    }

    // Fetch Stats
    async function fetchStats() {
        try {
            const res = await fetch(`${API_BASE}/api/stats`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                const total = data.reduce((s, u) => s + (parseFloat(u.wagerAmount) || 0), 0);
                document.getElementById('total-wager').textContent = formatCurrency(total);
                document.getElementById('total-users').textContent = data.length + '+';
            }
        } catch (err) { console.error('Stats error:', err); }
    }

    // Fetch Leaderboard
    async function fetchLeaderboard() {
        const tbody = document.getElementById('leaderboard-body');
        try {
            const res = await fetch(`${API_BASE}/api/leaderboard`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();

            if (!data || data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3" class="center">Aucun joueur ce mois-ci.</td></tr>';
                return;
            }

            const sorted = [...data].sort((a, b) => (parseFloat(b.weightedWager) || 0) - (parseFloat(a.weightedWager) || 0)).slice(0, 20);

            tbody.innerHTML = sorted.map((p, i) => {
                const rank = i + 1;
                let rankDisplay = `#${rank}`;
                if (rank === 1) rankDisplay = '🥇';
                if (rank === 2) rankDisplay = '🥈';
                if (rank === 3) rankDisplay = '🥉';

                return `
                    <tr class="reveal-element">
                        <td class="rank-cell"><span class="rank-badge r-${rank}">${rankDisplay}</span></td>
                        <td class="player-name">${p.username}</td>
                        <td class="align-right"><span class="wager-amount">${formatCurrency(p.weightedWager)}</span></td>
                    </tr>
                `;
            }).join('');

            // Trigger animations for new rows
            setTimeout(() => {
                document.querySelectorAll('#leaderboard-body .reveal-element').forEach(el => el.classList.add('reveal-visible'));
            }, 100);

        } catch (err) {
            console.error('Leaderboard error:', err);
            tbody.innerHTML = '<tr><td colspan="3" class="center">Erreur de chargement.</td></tr>';
        }
    }

    // UI Interaction: Floating Bar Visibility
    window.addEventListener('scroll', () => {
        const bar = document.querySelector('.floating-code-bar');
        if (window.scrollY > 400) {
            bar.classList.add('visible');
        } else {
            bar.classList.remove('visible');
        }
    });

    // Particle Simulation (Casino chips/stars)
    function initParticles() {
        const container = document.getElementById('particles');
        if (!container) return;
        
        const count = 25;
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            const size = Math.random() * 5 + 2;
            p.style.width = size + 'px';
            p.style.height = size + 'px';
            p.style.left = Math.random() * 100 + '%';
            p.style.top = Math.random() * 100 + '%';
            p.style.animation = `float-particle ${Math.random() * 10 + 10}s linear infinite`;
            p.style.animationDelay = `-${Math.random() * 20}s`;
            p.style.opacity = Math.random() * 0.4;
            p.style.background = i % 2 === 0 ? 'var(--neon-violet)' : 'var(--neon-blue)';
            p.style.boxShadow = `0 0 10px ${i % 2 === 0 ? 'var(--neon-violet)' : 'var(--neon-blue)'}`;
            container.appendChild(p);
        }
    }

    // Scroll Observer for dynamism
    function initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('section, .b-card, .reward-box, .t-step, .promo-container').forEach(el => {
            el.classList.add('reveal-element');
            observer.observe(el);
        });
    }

    // Initial Load
    initParticles();
    initScrollAnimations();
    fetchConfig();
    fetchStats();
    fetchLeaderboard();

    // Auto Refresh
    setInterval(() => {
        fetchStats();
        fetchLeaderboard();
    }, 60000);
});
