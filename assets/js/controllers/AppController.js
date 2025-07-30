/**
 * AppController - Contrôleur principal de l'application
 * Gère la navigation, l'initialisation et la coordination entre les autres contrôleurs
 */
class AppController {
    constructor() {
        this.models = {};
        this.views = {};
        this.controllers = {};
        this.currentRoute = 'dashboard';
        this.eventBus = new EventBus();
        this.notificationService = new NotificationService();
        
        this.init();
    }

    /**
     * Initialiser l'application
     */
    async init() {
        try {
            // Initialiser les modèles
            this.initModels();
            
            // Initialiser les vues
            this.initViews();
            
            // Initialiser les contrôleurs
            this.initControllers();
            
            // Configurer la navigation
            this.setupNavigation();
            
            // Configurer les événements globaux
            this.setupGlobalEvents();
            
            // Naviguer vers la route par défaut
            this.navigate(this.getInitialRoute());
            
            console.log('🚀 EduLearning+ MVC - Application initialisée');
            
        } catch (error) {
            console.error('Erreur lors de l\'initialisation:', error);
            this.notificationService.error('Erreur lors du chargement de l\'application');
        }
    }

    /**
     * Initialiser les modèles
     */
    initModels() {
        this.models = {
            user: new UserModel(),
            resource: new ResourceModel(),
            student: new StudentModel()
        };

        // Observer les changements de modèles
        Object.values(this.models).forEach(model => {
            model.addObserver((event, data) => {
                this.eventBus.emit(`model:${event}`, data);
            });
        });
    }

    /**
     * Initialiser les vues
     */
    initViews() {
        this.views = {
            dashboard: new DashboardView('content'),
            upload: new UploadView('content'),
            students: new StudentsView('content'),
            library: new LibraryView('content'),
            settings: new SettingsView('content')
        };
    }

    /**
     * Initialiser les contrôleurs
     */
    initControllers() {
        this.controllers = {
            dashboard: new DashboardController(this.models, this.views.dashboard, this.eventBus),
            upload: new UploadController(this.models, this.views.upload, this.eventBus),
            students: new StudentsController(this.models, this.views.students, this.eventBus),
            library: new LibraryController(this.models, this.views.library, this.eventBus),
            settings: new SettingsController(this.models, this.views.settings, this.eventBus)
        };
    }

    /**
     * Configurer la navigation
     */
    setupNavigation() {
        const navigationItems = [
            { id: 'upload', icon: '📁', text: 'Créer une Ressource', route: 'upload' },
            { id: 'dashboard', icon: '📊', text: 'Tableau de Bord', route: 'dashboard' },
            { id: 'students', icon: '👥', text: 'Mes Élèves', route: 'students' },
            { id: 'library', icon: '📚', text: 'Ma Bibliothèque', route: 'library' },
            { id: 'settings', icon: '⚙️', text: 'Paramètres', route: 'settings' }
        ];

        const navigationContainer = document.getElementById('navigation');
        if (navigationContainer) {
            const navHTML = navigationItems.map(item => `
                <div class="nav-item" data-route="${item.route}">
                    <span class="nav-item-icon">${item.icon}</span>
                    <span>${item.text}</span>
                </div>
            `).join('');
            
            navigationContainer.innerHTML = navHTML;
            
            // Ajouter les événements de navigation
            navigationContainer.addEventListener('click', (e) => {
                const navItem = e.target.closest('.nav-item');
                if (navItem) {
                    const route = navItem.getAttribute('data-route');
                    this.navigate(route);
                }
            });
        }
    }

    /**
     * Configurer les événements globaux
     */
    setupGlobalEvents() {
        // Raccourcis clavier
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + D pour dashboard
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                this.navigate('dashboard');
            }
            
            // Ctrl/Cmd + U pour upload
            if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
                e.preventDefault();
                this.navigate('upload');
            }
            
            // Échap pour fermer les modals
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Gestion des erreurs globales
        window.addEventListener('error', (e) => {
            console.error('Erreur globale:', e.error);
            this.notificationService.error('Une erreur inattendue s\'est produite');
        });

        // Événements de l'EventBus
        this.eventBus.on('navigate', (route) => {
            this.navigate(route);
        });

        this.eventBus.on('notification', (data) => {
            this.notificationService.show(data.message, data.type);
        });

        // Gestion de la fermeture de l'application
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }

    /**
     * Navigator vers une route
     */
    navigate(route) {
        if (!this.controllers[route]) {
            console.warn(`Route "${route}" non trouvée`);
            return;
        }

        // Masquer la vue actuelle
        if (this.views[this.currentRoute]) {
            this.views[this.currentRoute].hide();
        }

        // Désactiver le contrôleur actuel
        if (this.controllers[this.currentRoute]) {
            this.controllers[this.currentRoute].deactivate();
        }

        // Activer le nouveau contrôleur
        this.controllers[route].activate();

        // Afficher la nouvelle vue
        this.views[route].show();

        // Mettre à jour la navigation
        this.updateNavigation(route);

        // Mettre à jour la route courante
        this.currentRoute = route;

        // Mettre à jour l'URL (optionnel)
        this.updateURL(route);

        // Émettre l'événement de navigation
        this.eventBus.emit('routeChanged', { from: this.currentRoute, to: route });
    }

    /**
     * Mettre à jour la navigation visuelle
     */
    updateNavigation(activeRoute) {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-route') === activeRoute) {
                item.classList.add('active');
            }
        });
    }

    /**
     * Mettre à jour l'URL (sans rechargement)
     */
    updateURL(route) {
        if (history.pushState) {
            const url = `${window.location.origin}${window.location.pathname}#${route}`;
            history.pushState({ route }, '', url);
        }
    }

    /**
     * Obtenir la route initiale depuis l'URL
     */
    getInitialRoute() {
        const hash = window.location.hash.substring(1);
        return this.controllers[hash] ? hash : 'dashboard';
    }

    /**
     * Fermer tous les modals ouverts
     */
    closeAllModals() {
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            modal.classList.remove('show');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        });
    }

    /**
     * Obtenir les données globales de l'application
     */
    getGlobalData() {
        return {
            user: this.models.user.getData(),
            resources: this.models.resource.getGlobalStats(),
            students: this.models.student.getGlobalStats(),
            currentRoute: this.currentRoute
        };
    }

    /**
     * Exporter toutes les données (RGPD)
     */
    exportAllData() {
        return {
            exportDate: new Date().toISOString(),
            application: 'EduLearning+',
            version: '1.0.0',
            data: {
                user: this.models.user.export(),
                resources: this.models.resource.export(),
                students: this.models.student.export()
            }
        };
    }

    /**
     * Importer des données
     */
    async importData(importData) {
        try {
            if (importData.application !== 'EduLearning+') {
                throw new Error('Format d\'import incompatible');
            }

            const loader = this.views[this.currentRoute].showLoader('Import en cours...');

            // Importer chaque modèle
            if (importData.data.user) {
                this.models.user.import(importData.data.user);
            }
            if (importData.data.resources) {
                this.models.resource.import(importData.data.resources);
            }
            if (importData.data.students) {
                this.models.student.import(importData.data.students);
            }

            // Rafraîchir les vues
            Object.values(this.controllers).forEach(controller => {
                if (controller.isActive) {
                    controller.refresh();
                }
            });

            this.views[this.currentRoute].hideLoader(loader);
            this.notificationService.success('Données importées avec succès');

        } catch (error) {
            console.error('Erreur lors de l\'import:', error);
            this.notificationService.error('Erreur lors de l\'import des données');
        }
    }

    /**
     * Réinitialiser l'application
     */
    reset() {
        const confirmed = confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données ?');
        if (confirmed) {
            Object.values(this.models).forEach(model => {
                model.resetData();
            });
            
            this.navigate('dashboard');
            this.notificationService.success('Application réinitialisée');
        }
    }

    /**
     * Obtenir les statistiques de performance
     */
    getPerformanceStats() {
        return {
            modelsCount: Object.keys(this.models).length,
            viewsCount: Object.keys(this.views).length,
            controllersCount: Object.keys(this.controllers).length,
            eventListeners: this.eventBus.getListenerCount(),
            memoryUsage: this.getMemoryUsage(),
            uptime: Date.now() - this.startTime
        };
    }

    /**
     * Estimer l'utilisation mémoire
     */
    getMemoryUsage() {
        let totalSize = 0;
        
        Object.values(this.models).forEach(model => {
            totalSize += model.getStorageSize();
        });
        
        return {
            models: totalSize,
            estimated: `${(totalSize / 1024).toFixed(2)} KB`
        };
    }

    /**
     * Activer le mode développeur
     */
    enableDeveloperMode() {
        window.eduApp = this;
        window.eduModels = this.models;
        window.eduViews = this.views;
        window.eduControllers = this.controllers;
        
        console.log('🔧 Mode développeur activé');
        console.log('Variables globales disponibles: eduApp, eduModels, eduViews, eduControllers');
        
        this.notificationService.info('Mode développeur activé');
    }

    /**
     * Gérer les mises à jour de l'application
     */
    checkForUpdates() {
        // En production, ceci ferait appel à une API
        console.log('Vérification des mises à jour...');
        
        // Simulation
        setTimeout(() => {
            const hasUpdate = Math.random() > 0.8; // 20% de chance
            
            if (hasUpdate) {
                this.notificationService.info('Une mise à jour est disponible', {
                    actions: [
                        {
                            text: 'Mettre à jour',
                            callback: () => this.performUpdate()
                        },
                        {
                            text: 'Plus tard',
                            callback: () => {}
                        }
                    ]
                });
            }
        }, 2000);
    }

    /**
     * Effectuer une mise à jour
     */
    performUpdate() {
        const loader = this.views[this.currentRoute].showLoader('Mise à jour en cours...');
        
        // Simulation de mise à jour
        setTimeout(() => {
            this.views[this.currentRoute].hideLoader(loader);
            this.notificationService.success('Application mise à jour avec succès');
            
            // En production, on pourrait recharger l'application ici
            // window.location.reload();
        }, 3000);
    }

    /**
     * Gérer les erreurs de l'application
     */
    handleError(error, context = '') {
        console.error(`Erreur${context ? ` dans ${context}` : ''}:`, error);
        
        // Log pour les analytics en production
        this.logError(error, context);
        
        // Afficher une notification à l'utilisateur
        this.notificationService.error('Une erreur s\'est produite. L\'équipe technique a été notifiée.');
    }

    /**
     * Logger une erreur (pour analytics)
     */
    logError(error, context) {
        const errorData = {
            message: error.message,
            stack: error.stack,
            context,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            user: this.models.user.getData('profile')?.email || 'anonymous'
        };
        
        // En production, envoyer à un service d'analytics
        console.log('Error logged:', errorData);
    }

    /**
     * Nettoyer les ressources lors de la fermeture
     */
    cleanup() {
        // Sauvegarder les données importantes
        Object.values(this.models).forEach(model => {
            model.saveToStorage();
        });
        
        // Nettoyer les contrôleurs
        Object.values(this.controllers).forEach(controller => {
            if (controller.cleanup) {
                controller.cleanup();
            }
        });
        
        // Nettoyer les vues
        Object.values(this.views).forEach(view => {
            view.destroy();
        });
        
        // Nettoyer l'EventBus
        this.eventBus.removeAllListeners();
        
        console.log('🧹 Nettoyage terminé');
    }

    /**
     * Obtenir des informations de debug
     */
    getDebugInfo() {
        return {
            version: '1.0.0',
            currentRoute: this.currentRoute,
            models: Object.keys(this.models),
            views: Object.keys(this.views),
            controllers: Object.keys(this.controllers),
            performance: this.getPerformanceStats(),
            globalData: this.getGlobalData()
        };
    }
}