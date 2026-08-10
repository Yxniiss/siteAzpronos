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

    let lastSuccessfulFetch = Date.now();

    // Helper: Format Currency
    const formatCurrency = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(v) || 0);

    // Dynamic Countdown Logic
    function updateCountdown() {
        const now = new Date();
        // Fin du mois actuel
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        const diff = endOfMonth - now;

        if (diff <= 0) {
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('mins').textContent = '00';
            document.getElementById('secs').textContent = '00';
            return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = d.toString().padStart(2, '0');
        document.getElementById('hours').textContent = h.toString().padStart(2, '0');
        document.getElementById('mins').textContent = m.toString().padStart(2, '0');
        document.getElementById('secs').textContent = s.toString().padStart(2, '0');
    }

    // Dynamic Last Update Logic
    function updateLastUpdateTime() {
        const now = Date.now();
        const diffSeconds = Math.floor((now - lastSuccessfulFetch) / 1000);
        const indicator = document.getElementById('live-indicator-text');
        if (indicator) {
            indicator.textContent = `En direct · actualisé il y a ${diffSeconds} secondes`;
        }
    }

    // Copy to Clipboard
    window.copyCode = () => {
        navigator.clipboard.writeText(CONFIG.bonusCode).then(() => {
            const btns = document.querySelectorAll('.btn-copy, .btn-copy-small, .btn-copy-mini, .neon-code-card button');
            btns.forEach(b => {
                const originalText = b.textContent;
                
                b.textContent = '✓ COPIÉ !';
                b.classList.add('copied');
                
                setTimeout(() => {
                    b.textContent = originalText;
                    b.classList.remove('copied');
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
            
            // Gestion dynamique des réseaux sociaux optionnels
            const discordCard = document.getElementById('link-discord');
            if (discordCard && data.discordLink) {
                discordCard.href = data.discordLink;
                discordCard.style.display = 'flex';
            }
            
            const xCard = document.getElementById('link-x');
            if (xCard && data.xLink) {
                xCard.href = data.xLink;
                xCard.style.display = 'flex';
            }
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
                const totalWager = document.getElementById('total-wager');
                const totalUsers = document.getElementById('total-users');
                if (totalWager) totalWager.textContent = formatCurrency(total);
                if (totalUsers) totalUsers.textContent = data.length + '+';
            }
        } catch (err) { console.error('Stats error:', err); }
    }

    // Fetch Leaderboard
    async function fetchLeaderboard() {
        const tbody = document.getElementById('leaderboard-body');
        const podiumContainer = document.getElementById('leaderboard-podium');
        try {
            const res = await fetch(`${API_BASE}/api/leaderboard`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            
            lastSuccessfulFetch = Date.now();
            if (document.getElementById('active-players-count')) {
                document.getElementById('active-players-count').textContent = data.length || 0;
            }

            if (!data || data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" class="center">Aucun joueur ce mois-ci.</td></tr>';
                return;
            }

            const sorted = [...data].sort((a, b) => (parseFloat(b.weightedWager) || 0) - (parseFloat(a.weightedWager) || 0)).slice(0, 20);

            // Update Podium (Top 3)
            const top3 = sorted.slice(0, 3);
            const podiumOrder = [1, 0, 2]; // 2nd, 1st, 3rd for visual podium
            podiumContainer.innerHTML = podiumOrder.map(idx => {
                const p = top3[idx];
                if (!p) return '';
                const rank = idx + 1;
                const medals = ['🥇', '🥈', '🥉'];
                return `
                    <div class="podium-item p-${rank} reveal-element stagger-${rank}">
                        <div class="podium-rank">${medals[idx]}</div>
                        <div class="podium-player neon-pulse">
                            <span class="p-name">${p.username}</span>
                            <span class="p-wager">${formatCurrency(p.weightedWager)}</span>
                        </div>
                        <div class="podium-base">${rank}</div>
                    </div>
                `;
            }).join('');

            // Update Table
            tbody.innerHTML = sorted.map((p, i) => {
                const rank = i + 1;
                let rankDisplay = `#${rank}`;
                if (rank === 1) rankDisplay = '🥇';
                if (rank === 2) rankDisplay = '🥈';
                if (rank === 3) rankDisplay = '🥉';

                let reward = '-';
                if (rank === 1) reward = '1 500 €';
                else if (rank >= 2 && rank <= 5) reward = '250 €';
                else if (rank >= 6 && rank <= 10) reward = '100 €';

                return `
                    <tr class="reveal-element">
                        <td class="rank-cell"><span class="rank-badge r-${rank}">${rankDisplay}</span></td>
                        <td class="player-name">${p.username}</td>
                        <td class="align-right"><span class="wager-amount">${formatCurrency(p.weightedWager)}</span></td>
                        <td class="align-right"><span class="neon-purple-text" style="font-weight: 900;">${reward}</span></td>
                    </tr>
                `;
            }).join('');

            // Trigger animations
            setTimeout(() => {
                document.querySelectorAll('.reveal-element').forEach(el => {
                    if (el.getBoundingClientRect().top < window.innerHeight) {
                        el.classList.add('reveal-visible');
                    }
                });
            }, 100);

        } catch (err) {
            console.error('Leaderboard error:', err);
            tbody.innerHTML = '<tr><td colspan="4" class="center">🔄 Données momentanément indisponibles</td></tr>';
        }
    }

    // Fetch News
    async function fetchNews() {
        const container = document.getElementById('news-container');
        if (!container) return;

        try {
            // Utilisation d'un service public pour convertir le flux RSS en JSON
            const rssUrl = encodeURIComponent('https://dwh.lequipe.fr/api/edito/rss?path=/Football/');
            const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`);
            const data = await res.json();

            if (data.status === 'ok') {
                container.innerHTML = data.items.slice(0, 5).map(item => {
                    const date = new Date(item.pubDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
                    
                    return `
                        <a href="${item.link}" target="_blank" class="news-card-horizontal reveal-element">
                            <div class="news-icon-wrapper">⚽</div>
                            <div class="news-info">
                                <span class="news-date-pill">${date}</span>
                                <h3 class="news-title-compact">${item.title}</h3>
                            </div>
                            <div class="news-arrow">→</div>
                        </a>
                    `;
                }).join('');

                // Trigger animations for new items
                setTimeout(() => {
                    container.querySelectorAll('.reveal-element').forEach(el => el.classList.add('reveal-visible'));
                }, 100);
            }
        } catch (err) {
            console.error('News fetch error:', err);
            container.innerHTML = '<p class="center" style="grid-column: 1/-1;">Impossible de charger les actualités pour le moment.</p>';
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
            p.style.background = i % 2 === 0 ? 'var(--neon-purple)' : 'var(--neon-green)';
            p.style.boxShadow = `0 0 10px ${i % 2 === 0 ? 'var(--neon-purple)' : 'var(--neon-green)'}`;
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

        document.querySelectorAll('section, .b-card, .reward-box, .t-step, .promo-container, .stat-card, .spectacular-promo, .reveal-element').forEach(el => {
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
    fetchNews();
    
    // Init Timers
    updateCountdown();
    setInterval(updateCountdown, 1000);
    setInterval(updateLastUpdateTime, 1000);

    // Floating CTA Delay
    setTimeout(() => {
        const floatingCta = document.getElementById('floating-cta');
        if (floatingCta) floatingCta.classList.add('visible');
    }, 5000);

    // Mobile Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.classList.remove('no-scroll');
            });
        });
    }

    // Auto Refresh
    setInterval(() => {
        fetchStats();
        fetchLeaderboard();
    }, 60000);

    // AZZPRONOS floating promo behavior
    (function initAzzPromo(){
        const promo = document.getElementById('azzpromo-float');
        if (!promo) return;

        const dismissed = localStorage.getItem('azzpromoDismissed');
        if (dismissed === '1') {
            promo.style.display = 'none';
            return;
        }

        // show with small delay for UX
        setTimeout(() => { promo.classList.add('visible'); promo.style.opacity = '1'; }, 1200);

        const closeBtn = promo.querySelector('.promo-close');
        if (closeBtn) closeBtn.addEventListener('click', () => {
            promo.style.transition = 'opacity .28s ease, transform .28s ease';
            promo.style.opacity = '0';
            promo.style.transform = 'translateY(8px)';
            setTimeout(() => { promo.style.display = 'none'; }, 300);
            localStorage.setItem('azzpromoDismissed', '1');
        });

        const copyBtn = promo.querySelector('.promo-copy');
        if (copyBtn) copyBtn.addEventListener('click', (e) => {
            const codeEl = promo.querySelector('.code-value');
            const codeText = (codeEl && codeEl.textContent) ? codeEl.textContent.trim() : (CONFIG.bonusCode || 'AZZPRONOS');
            navigator.clipboard.writeText(codeText).then(() => {
                const btn = e.currentTarget;
                const old = btn.textContent;
                btn.textContent = '✓ COPIÉ !';
                btn.classList.add('copied');
                setTimeout(() => { btn.textContent = old; btn.classList.remove('copied'); }, 2000);
            }).catch(() => { alert('Copie : ' + codeText); });
        });

        const cta = promo.querySelector('.promo-button');
        if (cta) cta.addEventListener('click', () => { localStorage.setItem('azzpromoDismissed', '1'); });
    })();
});
