(() => {
    'use strict';

    const code = 'AZZPRONOS';
    const config = { affiliateLink: '#', telegramLink: '#', discordLink: '#', xLink: '#' };
    const startSection = document.querySelector('.tutorial-hero');
    const flowSection = document.querySelector('.tutorial-flow');
    const finishSection = document.querySelector('.tutorial-finish');
    const startButton = document.querySelector('[data-start-tutorial]');
    const progressCurrent = document.querySelector('.tutorial-progress-current');
    const progressTotal = document.querySelector('.tutorial-progress-total');
    const progressFill = document.querySelector('.progress-bar-fill');
    const stepNumber = document.querySelector('.tutorial-step-number');
    const stepStatus = document.querySelector('.tutorial-step-status');
    const stepKicker = document.querySelector('.tutorial-step-kicker');
    const stepTitle = document.querySelector('.tutorial-step-title');
    const stepText = document.querySelector('.tutorial-step-text');
    const stepActions = document.querySelector('.tutorial-step-actions');
    const stepImage = document.querySelector('.tutorial-step-image');
    const stepCaption = document.querySelector('.tutorial-step-caption');
    const prevButton = document.querySelector('.tutorial-step-prev');
    const nextButton = document.querySelector('.tutorial-step-next');
    let activeStep = 0;

    const steps = [
        {
            slug: 'vpn',
            kicker: '01 — ACTIVE TON VPN',
            title: 'Avant de commencer, vérifie ton accès Shuffle.',
            text: 'Avant de commencer ton inscription, assure-toi que ton accès à Shuffle est compatible avec ta localisation.',
            imageLabel: 'VPN / accès réseau',
            imageSrc: 'assets/tutorial-step-1-vpn.webp',
            caption: 'Passe à l’étape suivante quand ton accès Shuffle est confirmé.',
            tasks: [
                'Ouvre l’App Store (iOS) ou Google Play (Android).',
                'Recherche Lapplication "FREE VPN".',
                'Télécharge et installe l’application VPN recommandée.',
                'Ouvre l’application et connecte‑toi au serveur en Norvège ou au Canada.',
                'Vérifie que le VPN affiche l’état connecté avant de poursuivre.'
            ],
            tip: 'Connecte‑toi à un serveur en Norvège ou au Canada pour de meilleures compatibilités.',
            actions: [
                { type: 'button', label: 'J’AI ACTIVÉ MON VPN →', action: 'next', style: 'tutorial-primary-button' }
            ]
        },
        {
            slug: 'account',
            kicker: '02 — CRÉE TON COMPTE SHUFFLE',
            title: 'Clique sur le bouton ci-dessous pour accéder à Shuffle et créer ton compte.',
            text: 'Ton compte Shuffle doit être créé depuis notre lien officiel pour que le code AZZPRONOS soit bien lié.',
            imageLabel: 'Créer un compte Shuffle',
            imageSrc: 'assets/tutorial-step-2-account.png',
            caption: 'Clique sur CRÉER MON COMPTE puis reviens ici pour passer à l’étape suivante.',
            tasks: [
                'Clique sur le bouton « OUVRIR SHUFFLE » pour ouvrir Shuffle dans un nouvel onglet.',
                'Appuie sur « Créer un compte » ou « S’inscrire » selon l’interface.',
                'Renseigne une adresse email valide et choisis un mot de passe sûr.',
                'Valide la création du compte (vérifie ta boîte email si nécessaire).',
                'Si Shuffle demande une vérification, suis les instructions affichées.'
            ],
            actions: [
                { type: 'link', label: 'OUVRIR SHUFFLE →', linkKey: 'affiliateLink', style: 'tutorial-primary-button', external: true },
                { type: 'button', label: 'J’AI CRÉÉ MON COMPTE →', action: 'next', style: 'tutorial-secondary-button' }
            ]
        },
        {
            slug: 'code',
            kicker: '03 — ENTRE LE CODE AZZPRONOS',
            title: 'Copie le code et colle-le pendant ton inscription.',
            text: 'Entre le code AZZPRONOS pendant ton inscription pour être correctement affilié et profiter de l’offre.',
            imageLabel: 'Code AZZPRONOS',
            imageSrc: 'assets/tutorial-step-3-code.png',
            caption: 'Utilise le bouton COPIER pour accélérer l’inscription.',
            tasks: [
                'Localise le champ « Code promo » ou « Code de parrainage » pendant l’inscription.',
                'Clique sur « 📋 COPIER LE CODE » pour copier AZZPRONOS dans le presse‑papier.',
                'Colle le code dans le champ prévu et confirme avant de valider l’inscription.',
                'Vérifie que le libellé du bonus apparaisse (si disponible) avant de poursuivre.'
            ],
            actions: [
                { type: 'copy', label: '📋 COPIER LE CODE', style: 'tutorial-primary-button' },
                { type: 'button', label: 'J’AI ENTRÉ LE CODE →', action: 'next', style: 'tutorial-secondary-button' }
            ]
        },
        {
            slug: 'deposit',
            kicker: '04 — EFFECTUE TON PREMIER DÉPÔT',
            title: 'Profite de l’offre disponible et fais ton dépôt.',
            text: '30 € OFFERTS. Effectue ton premier dépôt sur Shuffle pour déclencher l’avantage en lien avec AZZPRONOS.',
            imageLabel: 'Dépôt et bonus',
            imageSrc: 'assets/tutorial-step-4-deposit.png',
            caption: 'Le dépôt active ton bonus et te permet d’entrer dans le classement.',
            tasks: [
                'Accède à la section « Dépôt » dans l’application Shuffle.',
                'Choisis ton moyen de paiement sécurisé (carte, portefeuille, etc.).',
                'Saisis le montant souhaité pour ton premier dépôt.',
                'Vérifie les informations de paiement puis confirme la transaction.',
                'Attends la confirmation du dépôt avant de poursuivre.'
            ],
            actions: [
                { type: 'link', label: 'EFFECTUER MON DÉPÔT', linkKey: 'affiliateLink', style: 'tutorial-primary-button', external: true },
                { type: 'button', label: 'MON DÉPÔT EST FAIT →', action: 'next', style: 'tutorial-secondary-button' }
            ]
        },
        {
            slug: 'bonus',
            kicker: '05 — ACTIVE TON BONUS',
            title: 'Vérifie que ton bonus AZZPRONOS est bien actif.',
            text: 'Assure-toi que le code AZZPRONOS est appliqué et que tu profites bien de l’offre de bienvenue.',
            imageLabel: 'Activation du bonus',
            imageSrc: 'assets/tutorial-step-5-bonus.webp',
            caption: 'Vérifie les conditions réelles de l’offre Shuffle avant de continuer.',
            tasks: [
                'Ouvre ton compte puis va dans la rubrique « Bonus » ou « Offres ».',
                'Vérifie que le code AZZPRONOS est bien affiché comme actif.',
                'Si le bonus n’apparaît pas, reviens à l’étape d’inscription et vérifie le code.',
                'Consulte les conditions du bonus sur Shuffle avant d’effectuer des mises.'
            ],
            actions: [
                { type: 'button', label: 'J’AI ACTIVÉ MON BONUS →', action: 'next', style: 'tutorial-primary-button' }
            ]
        },
        {
            slug: 'ranking',
            kicker: '06 — GRIMPE DANS LE CLASSEMENT',
            title: 'Utilise ton compte et ton code pour monter dans le classement.',
            text: 'Utilise ton compte avec le code AZZPRONOS et commence à faire monter ton wager pour grimper dans le classement.',
            imageLabel: 'Top 10 / classement',
            imageSrc: 'assets/tutorial-step-6-ranking.png',
            caption: 'Le Top 10 partage 3 000 € chaque mois entre les meilleurs joueurs.',
            tasks: [
                'Consulte la page « Classement » pour connaître les règles et seuils.',
                'Prends connaissance du wager requis pour être éligible aux récompenses.',
                'Fais des sessions de jeu régulières pour accumuler du wager.',
                'Surveille ta position sur la page classement pour suivre ta progression.'
            ],
            actions: [
                { type: 'link', label: 'VOIR LE CLASSEMENT', href: '/#leaderboard', style: 'tutorial-primary-button' },
                { type: 'button', label: 'J’AI COMPRIS →', action: 'next', style: 'tutorial-secondary-button' }
            ]
        },
        {
            slug: 'community',
            kicker: '07 — REJOINS LA COMMUNAUTÉ',
            title: 'Reste connecté avec la communauté AZZPRONOS.',
            text: 'Rejoins le Telegram officiel et découvre où trouver de l’aide si tu en as besoin.',
            imageLabel: 'Communauté AZZPRONOS',
            imageSrc: 'assets/tutorial-step-7-community.png',
            caption: 'Le support et les annonces se font en priorité sur Telegram.',
            tasks: [
                'Ouvre Telegram et recherche le lien officiel fourni dans ce guide.',
                'Rejoins le canal pour recevoir les annonces et les offres.',
                'Si nécessaire, active les notifications pour ne rien manquer.',
                'Pose tes questions dans le canal ou contacte le support si besoin.'
            ],
            actions: [
                { type: 'link', label: 'REJOINDRE TELEGRAM', linkKey: 'telegramLink', style: 'tutorial-primary-button', external: true },
                { type: 'button', label: 'TERMINER LE PARCOURS →', action: 'finish', style: 'tutorial-secondary-button' }
            ]
        }
    ];

    const stepCount = steps.length;
    progressTotal.textContent = String(stepCount);

    function showSection(section) {
        startSection.classList.toggle('hidden', section !== 'start');
        flowSection.classList.toggle('hidden', section !== 'flow');
        finishSection.classList.toggle('hidden', section !== 'finish');
    }

    function getLinkHref(action) {
        if (action.href) {
            return action.href;
        }
        if (action.linkKey) {
            return config[action.linkKey] || '#';
        }
        return '#';
    }

    function renderStep(index) {
        activeStep = Math.max(0, Math.min(index, stepCount - 1));
        const step = steps[activeStep];
        stepNumber.textContent = `ÉTAPE ${String(activeStep + 1).padStart(2, '0')} / ${String(stepCount).padStart(2, '0')}`;
        progressCurrent.textContent = String(activeStep + 1);
        progressFill.style.width = `${((activeStep + 1) / stepCount) * 100}%`;
        stepKicker.textContent = step.kicker;
        stepTitle.innerHTML = step.title;
        stepText.textContent = step.text;
        stepImage.dataset.label = step.imageLabel;
        const img = stepImage.querySelector('.tutorial-step-image-img');
        if (img) {
            img.src = step.imageSrc || '';
            img.alt = step.imageLabel || 'Illustration de l’étape';
        }
        stepCaption.textContent = step.caption;
        // render tasks (numbered action cards)
        const tasksContainer = document.querySelector('.tutorial-step-tasks');
        const tipContainer = document.querySelector('.tutorial-step-tip');
        tasksContainer.innerHTML = '';
        tipContainer.innerHTML = '';
        if (Array.isArray(step.tasks) && step.tasks.length) {
            const list = document.createElement('div');
            list.className = 'tutorial-task-list';
            step.tasks.forEach((t, i) => {
                const card = document.createElement('div');
                card.className = 'tutorial-task-card';
                card.innerHTML = `<div class="task-number">${String(i+1).padStart(2,'0')}</div><div class="task-body">${t}</div>`;
                list.appendChild(card);
            });
            tasksContainer.appendChild(list);
        }
        if (step.tip) {
            const tip = document.createElement('div');
            tip.className = 'tutorial-tip-box';
            tip.innerHTML = `<strong>💡 À retenir</strong><p>${step.tip}</p>`;
            tipContainer.appendChild(tip);
        }
        stepStatus.textContent = activeStep === stepCount - 1 ? 'DERNIÈRE ÉTAPE' : 'EN COURS';
        prevButton.disabled = activeStep === 0;
        nextButton.innerHTML = activeStep === stepCount - 1 ? 'TERMINER <b>→</b>' : 'SUIVANT <b>→</b>';
        stepActions.innerHTML = '';

        step.actions.forEach((action) => {
            let element;
            if (action.type === 'link') {
                element = document.createElement('a');
                element.href = getLinkHref(action);
                element.target = action.external ? '_blank' : '_self';
                element.rel = action.external ? 'noreferrer noopener' : undefined;
            } else {
                element = document.createElement('button');
                element.type = 'button';
                if (action.action === 'next') {
                    element.addEventListener('click', goNext);
                } else if (action.action === 'finish') {
                    element.addEventListener('click', showFinalScreen);
                } else if (action.type === 'copy') {
                    element.addEventListener('click', () => {
                        copyCode(element);
                    });
                }
            }
            element.className = action.style || 'tutorial-primary-button';
            element.textContent = action.label;
            stepActions.appendChild(element);
        });

        if (stepActions.querySelector('button[type="button"]')?.dataset?.copy === 'true') {
            // nothing
        }
    }

    function goNext() {
        if (activeStep < stepCount - 1) {
            animateStep(() => renderStep(activeStep + 1));
        } else {
            showFinalScreen();
        }
    }

    function showFinalScreen() {
        showSection('finish');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function animateStep(render) {
        const card = document.querySelector('.tutorial-step-card');
        card.classList.add('is-transitioning');
        setTimeout(() => {
            render();
            card.classList.remove('is-transitioning');
        }, 180);
    }

    function copyCode(button) {
        const copyText = async () => {
            try {
                await navigator.clipboard.writeText(code);
            } catch (error) {
                const field = document.createElement('textarea');
                field.value = code;
                field.setAttribute('readonly', '');
                field.style.position = 'fixed';
                field.style.opacity = '0';
                document.body.append(field);
                field.select();
                document.execCommand('copy');
                field.remove();
            }
        };

        copyText().then(() => {
            if (button) {
                button.textContent = '✓ CODE COPIÉ';
                button.disabled = true;
                setTimeout(() => {
                    button.textContent = '📋 COPIER LE CODE';
                    button.disabled = false;
                }, 2200);
            }
        });
    }

    function hydrateLinks() {
        fetch('/api/config')
            .then((response) => (response.ok ? response.json() : Promise.reject(new Error('Configuration indisponible'))))
            .then((data) => {
                config.affiliateLink = data.affiliateLink || config.affiliateLink;
                config.telegramLink = data.telegramLink || config.telegramLink;
                config.discordLink = data.discordLink || config.discordLink;
                config.xLink = data.xLink || config.xLink;
                document.querySelectorAll('[data-link-key]').forEach((link) => {
                    const key = link.dataset.linkKey;
                    link.href = config[key] || '#';
                });
                document.querySelectorAll('.aff-link').forEach((link) => { link.href = config.affiliateLink; });
                document.querySelectorAll('.telegram-link').forEach((link) => { link.href = config.telegramLink; });
            })
            .catch(() => {
                document.querySelectorAll('.aff-link').forEach((link) => { link.href = config.affiliateLink; });
                document.querySelectorAll('.telegram-link').forEach((link) => { link.href = config.telegramLink; });
            });
    }

    function attachEvents() {
        startButton.addEventListener('click', () => {
            showSection('flow');
            renderStep(0);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        prevButton.addEventListener('click', () => animateStep(() => renderStep(activeStep - 1)));
        nextButton.addEventListener('click', goNext);
    }

    document.addEventListener('DOMContentLoaded', () => {
        showSection('start');
        attachEvents();
        renderStep(0);
        hydrateLinks();
    });
})();
