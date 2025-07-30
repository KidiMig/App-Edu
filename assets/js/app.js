/**
 * app.js - Point d'entrée principal de l'application EduLearning+ MVC avec IA Universelle
 * Initialise l'application une fois que le DOM est chargé
 */

// Configuration globale de l'application
const APP_CONFIG = {
    name: 'EduLearning+',
    version: '1.0.0',
    debug: true, // Mettre à false en production
    theme: 'light',
    language: 'fr',
    storage: {
        prefix: 'edulearning_',
        version: '1.0'
    },
    features: {
        developerMode: false,
        analytics: false,
        notifications: true,
        autoSave: true,
        universalAI: true // 🧠 NOUVELLE FONCTIONNALITÉ IA
    }
};

// Instance globale de l'application
let app = null;

/**
 * Initialiser l'application avec IA
 */
function initializeApp() {
    try {
        console.log(`🚀 Initialisation de ${APP_CONFIG.name} v${APP_CONFIG.version} avec IA Universelle`);
        
        // Vérifier la compatibilité du navigateur
        if (!checkBrowserCompatibility()) {
            showBrowserCompatibilityError();
            return;
        }
        
        // Configurer l'environnement
        setupEnvironment();
        
        // 🧠 Créer l'instance AMÉLIORÉE de l'application (avec IA)
        app = new EnhancedAppController(); // Au lieu de AppController
        
        // Configurer les fonctionnalités optionnelles
        setupOptionalFeatures();
        
        // Gérer les événements de cycle de vie
        setupLifecycleEvents();
        
        // Easter egg Konami Code
        setupKonamiCode();
        
        // 🧠 Message spécial IA
        setTimeout(() => {
            if (APP_CONFIG.features.universalAI) {
                console.log('🧠 IA Pédagogique Universelle activée');
                showNotification('🧠 IA Universelle prête ! Cliquez sur le bouton IA pour commencer.', 'success');
            }
        }, 2000);
        
        console.log('✅ Application avec IA initialisée avec succès');
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
        showInitializationError(error);
    }
}

/**
 * Vérifier la compatibilité du navigateur (mise à jour pour l'IA)
 */
function checkBrowserCompatibility() {
    const requiredFeatures = [
        'localStorage',
        'sessionStorage',
        'fetch',
        'Promise',
        'Map',
        'Set',
        'addEventListener',
        'speechSynthesis' // 🧠 Nouveau pour l'IA vocale
    ];
    
    for (const feature of requiredFeatures) {
        if (!(feature in window)) {
            console.error(`Fonctionnalité manquante: ${feature}`);
            return false;
        }
    }
    
    // Vérifier les API modernes pour l'IA
    if (!window.EventTarget || !window.CustomEvent) {
        console.error('API d\'événements non supportées');
        return false;
    }
    
    return true;
}

/**
 * Configurer l'environnement (mis à jour pour l'IA)
 */
function setupEnvironment() {
    // Configuration du mode debug
    if (APP_CONFIG.debug) {
        window.DEBUG = true;
        console.log('🔧 Mode debug activé');
    }
    
    // 🧠 Variables globales pour l'IA
    if (APP_CONFIG.features.universalAI) {
        window.AI_ENABLED = true;
        console.log('🧠 IA Universelle activée');
    }
    
    // Configuration globale des erreurs
    window.onerror = (message, source, lineno, colno, error) => {
        console.error('Erreur globale:', { message, source, lineno, colno, error });
        if (app) {
            app.handleError(error || new Error(message), 'global');
        }
        return false;
    };
    
    // Configuration des promesses rejetées
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Promesse rejetée non gérée:', event.reason);
        if (app) {
            app.handleError(event.reason, 'promise');
        }
    });
    
    // Configuration des styles CSS personnalisés si nécessaire
    applyTheme(APP_CONFIG.theme);
}

/**
 * Configurer les fonctionnalités optionnelles (mis à jour pour l'IA)
 */
function setupOptionalFeatures() {
    // Mode développeur
    if (APP_CONFIG.features.developerMode) {
        app.enableDeveloperMode();
    }
    
    // 🧠 Fonctionnalités IA
    if (APP_CONFIG.features.universalAI && app.universalPedagogyController) {
        console.log('🧠 Configuration des fonctionnalités IA...');
        // L'IA est déjà intégrée dans EnhancedAppController
    }
    
    // Vérification des mises à jour
    if (APP_CONFIG.features.autoUpdate) {
        setTimeout(() => {
            app.checkForUpdates();
        }, 5000);
    }
    
    // Sauvegarde automatique
    if (APP_CONFIG.features.autoSave) {
        setupAutoSave();
    }
    
    // Analytics (en production)
    if (APP_CONFIG.features.analytics && !APP_CONFIG.debug) {
        setupAnalytics();
    }
}

/**
 * Configurer les événements de cycle de vie
 */
function setupLifecycleEvents() {
    // Gestion de la visibilité de la page
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            console.log('📱 Application mise en arrière-plan');
            if (app && APP_CONFIG.features.autoSave) {
                // Sauvegarder avant la mise en arrière-plan
                saveApplicationState();
            }
        } else {
            console.log('📱 Application remise au premier plan');
        }
    });
    
    // Gestion de la fermeture de l'application
    window.addEventListener('beforeunload', (event) => {
        if (app) {
            // Sauvegarder l'état avant la fermeture
            saveApplicationState();
            
            // Message de confirmation si des données non sauvegardées existent
            const hasUnsavedData = checkForUnsavedData();
            if (hasUnsavedData) {
                event.preventDefault();
                event.returnValue = 'Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir quitter ?';
                return event.returnValue;
            }
        }
    });
    
    // Gestion du redimensionnement de la fenêtre
    window.addEventListener('resize', debounce(() => {
        if (app) {
            app.eventBus.emit('window:resize', {
                width: window.innerWidth,
                height: window.innerHeight
            });
        }
    }, 250));
    
    // Gestion de la connexion réseau
    window.addEventListener('online', () => {
        console.log('🌐 Connexion réseau rétablie');
        if (app) {
            app.eventBus.emit('network:online');
            showNotification('Connexion rétablie', 'success');
        }
    });
    
    window.addEventListener('offline', () => {
        console.log('🌐 Connexion réseau perdue');
        if (app) {
            app.eventBus.emit('network:offline');
            showNotification('Connexion réseau perdue - Mode hors ligne', 'warning');
        }
    });
}

/**
 * Configurer le code Konami pour les easter eggs (mis à jour pour l'IA)
 */
function setupKonamiCode() {
    let konamiCode = [];
    const sequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA
    
    document.addEventListener('keydown', (e) => {
        konamiCode.push(e.keyCode);
        konamiCode = konamiCode.slice(-sequence.length);
        
        if (konamiCode.join(',') === sequence.join(',')) {
            activateEasterEgg();
        }
    });
}

/**
 * Activer l'easter egg (mis à jour pour l'IA)
 */
function activateEasterEgg() {
    console.log('🎉 KONAMI CODE ACTIVÉ !');
    
    if (app) {
        showNotification('🎉 EASTER EGG ACTIVÉ ! 🧠 Mode IA Développeur Débloqué ! 🕵️', 'success');
        app.enableDeveloperMode();
        
        // 🧠 Activer les fonctionnalités IA avancées
        if (app.universalPedagogyController) {
            console.log('🧠 Fonctionnalités IA développeur activées');
            app.universalPedagogyController.debugMode = true;
        }
        
        // Effet visuel temporaire
        document.body.style.background = 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #f7b733, #5f27cd, #667eea)';
        document.body.style.backgroundSize = '300% 300%';
        document.body.style.animation = 'rainbow 3s ease infinite';
        
        setTimeout(() => {
            document.body.style.background = '';
            document.body.style.animation = '';
        }, 5000);
    }
}

/**
 * Fonction utilitaire pour afficher des notifications
 */
function showNotification(message, type = 'info', duration = 4000) {
    const notification = document.createElement('div');
    notification.className = `toast ${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.5s ease;
        max-width: 300px;
        cursor: pointer;
    `;
    
    if (type === 'success') {
        notification.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
    } else if (type === 'warning') {
        notification.style.background = 'linear-gradient(135deg, #ffc107, #fd7e14)';
    } else if (type === 'error') {
        notification.style.background = 'linear-gradient(135deg, #dc3545, #fd7e14)';
    }
    
    document.body.appendChild(notification);
    
    // Auto-suppression
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, duration);
    
    // Fermeture au clic
    notification.addEventListener('click', () => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    });
}

/**
 * Appliquer un thème
 */
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

/**
 * Configurer la sauvegarde automatique
 */
function setupAutoSave() {
    setInterval(() => {
        if (app) {
            saveApplicationState();
        }
    }, 30000); // Sauvegarde toutes les 30 secondes
}

/**
 * Sauvegarder l'état de l'application
 */
function saveApplicationState() {
    if (!app) return;
    
    try {
        const state = {
            timestamp: Date.now(),
            currentRoute: app.currentRoute,
            version: APP_CONFIG.version,
            aiEnabled: APP_CONFIG.features.universalAI // 🧠 État IA
        };
        
        localStorage.setItem(APP_CONFIG.storage.prefix + 'app_state', JSON.stringify(state));
        console.log('💾 État de l\'application sauvegardé');
        
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
    }
}

/**
 * Vérifier s'il y a des données non sauvegardées
 */
function checkForUnsavedData() {
    // En production, vérifier si des modifications sont en attente
    return false; // Placeholder
}

/**
 * Configurer les analytics (production uniquement)
 */
function setupAnalytics() {
    // Configuration Google Analytics, Mixpanel, etc.
    console.log('📊 Analytics configurées');
}

/**
 * Afficher une erreur de compatibilité navigateur
 */
function showBrowserCompatibilityError() {
    const errorHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea, #764ba2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Arial, sans-serif;
            color: white;
            z-index: 10000;
        ">
            <div style="
                background: rgba(255, 255, 255, 0.1);
                padding: 40px;
                border-radius: 20px;
                text-align: center;
                max-width: 500px;
                backdrop-filter: blur(10px);
            ">
                <h1 style="font-size: 2em; margin-bottom: 20px;">⚠️ Navigateur Non Compatible</h1>
                <p style="font-size: 1.2em; margin-bottom: 20px;">
                    Votre navigateur ne supporte pas toutes les fonctionnalités requises pour EduLearning+ avec IA.
                </p>
                <p style="margin-bottom: 30px;">
                    Veuillez mettre à jour votre navigateur ou utiliser une version récente de:
                </p>
                <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 30px;">
                    <div>Chrome 90+</div>
                    <div>Firefox 88+</div>
                    <div>Safari 14+</div>
                    <div>Edge 90+</div>
                </div>
                <button onclick="window.location.reload()" style="
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    border: 2px solid white;
                    padding: 12px 25px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                ">
                    Réessayer
                </button>
            </div>
        </div>
    `;
    
    document.body.innerHTML = errorHTML;
}

/**
 * Afficher une erreur d'initialisation
 */
function showInitializationError(error) {
    const errorHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #dc3545, #fd7e14);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Arial, sans-serif;
            color: white;
            z-index: 10000;
        ">
            <div style="
                background: rgba(255, 255, 255, 0.1);
                padding: 40px;
                border-radius: 20px;
                text-align: center;
                max-width: 500px;
                backdrop-filter: blur(10px);
            ">
                <h1 style="font-size: 2em; margin-bottom: 20px;">❌ Erreur d'Initialisation</h1>
                <p style="font-size: 1.2em; margin-bottom: 20px;">
                    Une erreur s'est produite lors du chargement de l'application avec IA.
                </p>
                <details style="margin-bottom: 30px; text-align: left;">
                    <summary style="cursor: pointer; margin-bottom: 10px;">Détails techniques</summary>
                    <pre style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; overflow: auto; font-size: 12px;">
${error.message}
${error.stack || ''}
                    </pre>
                </details>
                <button onclick="window.location.reload()" style="
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    border: 2px solid white;
                    padding: 12px 25px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                    margin-right: 10px;
                ">
                    Recharger
                </button>
                <button onclick="localStorage.clear(); window.location.reload()" style="
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                    border: 2px solid white;
                    padding: 12px 25px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                ">
                    Réinitialiser et Recharger
                </button>
            </div>
        </div>
    `;
    
    document.body.innerHTML = errorHTML;
}

/**
 * Fonction utilitaire de debounce
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Utilitaires de développement (disponibles en mode debug)
 */
if (APP_CONFIG.debug) {
    window.APP_UTILS = {
        config: APP_CONFIG,
        getApp: () => app,
        saveState: saveApplicationState,
        applyTheme,
        activateEasterEgg,
        // 🧠 Nouveaux utilitaires IA
        getAIController: () => app?.universalPedagogyController,
        testAI: () => app?.universalPedagogyController?.demonstrateCapabilities(),
        logs: {
            models: () => app ? Object.keys(app.models) : [],
            views: () => app ? Object.keys(app.views) : [],
            controllers: () => app ? Object.keys(app.controllers) : [],
            events: () => app ? app.eventBus.getStats() : {},
            performance: () => app ? app.getPerformanceStats() : {},
            ai: () => app?.universalPedagogyController?.getStatistics() || 'IA non disponible'
        }
    };
}

/**
 * Point d'entrée principal - Attendre que le DOM soit chargé
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // Le DOM est déjà chargé
    initializeApp();
}

/**
 * Export pour les modules (si utilisé dans un contexte ES6)
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        APP_CONFIG,
        initializeApp,
        getApp: () => app
    };
}

/**
 * Service Worker pour le cache (optionnel, en production)
 */
if ('serviceWorker' in navigator && !APP_CONFIG.debug) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

console.log(`📚 ${APP_CONFIG.name} v${APP_CONFIG.version} avec IA Universelle - Prêt à démarrer`);
