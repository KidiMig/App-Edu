/**
 * Intégration de l'IA Pédagogique Universelle dans l'application MVC EduLearning+
 * Ce fichier modifie l'AppController existant pour intégrer la nouvelle fonctionnalité
 */

// Extension de l'AppController existant
class EnhancedAppController extends AppController {
    constructor() {
        super();
        
        // Ajouter le contrôleur d'IA universelle
        this.universalPedagogyController = null;
        
        // Intégrer après l'initialisation de base
        this.integrateUniversalPedagogy();
    }

    /**
     * Intégrer l'IA pédagogique universelle
     */
    integrateUniversalPedagogy() {
        console.log('🧠 Intégration de l\'IA Pédagogique Universelle...');
        
        try {
            // Créer le contrôleur d'IA universelle
            this.universalPedagogyController = new UniversalPedagogyController(
                this.models,
                this.views.upload, // Utiliser la vue upload comme base
                this.eventBus
            );
            
            // Ajouter aux contrôleurs existants
            this.controllers.universalPedagogy = this.universalPedagogyController;
            
            // Étendre l'interface utilisateur
            this.enhanceUserInterface();
            
            // Ajouter les nouvelles routes
            this.addUniversalPedagogyRoutes();
            
            // Configurer les événements globaux
            this.setupUniversalPedagogyEvents();
            
            console.log('✅ IA Pédagogique Universelle intégrée avec succès');
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'intégration de l\'IA:', error);
            this.notificationService.error('Erreur lors du chargement de l\'IA pédagogique');
        }
    }

    /**
     * Améliorer l'interface utilisateur
     */
    enhanceUserInterface() {
        // Ajouter le bouton IA Universelle dans la barre de navigation
        this.addUniversalAIButton();
        
        // Améliorer la section d'upload avec l'option IA
        this.enhanceUploadSection();
        
        // Ajouter le panneau d'accessibilité global
        this.addAccessibilityPanel();
        
        // Ajouter les nouveaux formats avec IA
        this.addAIFormats();
    }

    /**
     * Ajouter le bouton IA Universelle
     */
    addUniversalAIButton() {
        const navigationContainer = document.getElementById('navigation');
        if (navigationContainer) {
            // Créer le bouton IA spécial
            const aiButton = document.createElement('div');
            aiButton.className = 'nav-item nav-item-special';
            aiButton.innerHTML = `
                <span class="nav-item-icon">🧠</span>
                <span>IA Universelle</span>
                <span class="beta-badge">BETA</span>
            `;
            aiButton.setAttribute('data-route', 'universal-ai');
            
            // Ajouter les styles spéciaux
            aiButton.style.cssText = `
                background: linear-gradient(135deg, #667eea, #764ba2, #f093fb);
                background-size: 200% 200%;
                animation: gradientShift 3s ease infinite;
                position: relative;
                overflow: hidden;
            `;
            
            // Ajouter l'insigne BETA
            const betaBadge = aiButton.querySelector('.beta-badge');
            betaBadge.style.cssText = `
                position: absolute;
                top: -5px;
                right: -5px;
                background: #ff6b6b;
                color: white;
                font-size: 0.6em;
                padding: 2px 6px;
                border-radius: 10px;
                font-weight: bold;
            `;
            
            // Insérer en première position
            navigationContainer.insertBefore(aiButton, navigationContainer.firstChild);
            
            // Ajouter l'animation CSS
            const style = document.createElement('style');
            style.textContent = `
                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Améliorer la section d'upload
     */
    enhanceUploadSection() {
        // Ajouter l'option de transformation universelle dans les formats
        const formatGrid = document.querySelector('.format-grid');
        if (formatGrid) {
            const universalFormat = document.createElement('div');
            universalFormat.className = 'format-card format-card-ai';
            universalFormat.innerHTML = `
                <div class="format-icon" style="background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">🧠</div>
                <h3>IA Universelle Accessible</h3>
                <p>Transformation automatique avec détection de discipline, accessibilité complète et mini-jeux adaptatifs.</p>
                <div class="ai-features">
                    <span class="feature-badge">📊 Auto-analyse</span>
                    <span class="feature-badge">♿ WCAG AAA</span>
                    <span class="feature-badge">🎮 Mini-jeux</span>
                    <span class="feature-badge">🌍 Multi-disciplinaire</span>
                </div>
            `;
            
            // Styles spéciaux pour la carte IA
            universalFormat.style.cssText = `
                border: 2px solid transparent;
                background: linear-gradient(white, white) padding-box,
                           linear-gradient(135deg, #667eea, #764ba2, #f093fb) border-box;
                position: relative;
            `;
            
            // Ajouter les styles pour les badges de fonctionnalités
            const featureBadges = universalFormat.querySelectorAll('.feature-badge');
            featureBadges.forEach(badge => {
                badge.style.cssText = `
                    display: inline-block;
                    background: rgba(102, 126, 234, 0.1);
                    color: #667eea;
                    padding: 2px 6px;
                    border-radius: 10px;
                    font-size: 0.7em;
                    margin: 2px;
                    border: 1px solid rgba(102, 126, 234, 0.3);
                `;
            });
            
            // Ajouter l'événement de clic
            universalFormat.addEventListener('click', () => {
                this.selectUniversalAIFormat();
            });
            
            // Insérer en première position
            formatGrid.insertBefore(universalFormat, formatGrid.firstChild);
        }
    }

    /**
     * Sélectionner le format IA Universelle
     */
    selectUniversalAIFormat() {
        // Marquer comme sélectionné
        document.querySelectorAll('.format-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelector('.format-card-ai').classList.add('selected');
        
        // Déclencher la logique de sélection
        this.eventBus.emit('format:selected', {
            format: 'universal-ai',
            name: 'IA Universelle Accessible',
            requiresAI: true
        });
        
        // Afficher les options avancées d'IA
        this.showAIAdvancedOptions();
        
        this.notificationService.success('🧠 IA Universelle sélectionnée - Options avancées disponibles');
    }

    /**
     * Afficher les options avancées d'IA
     */
    showAIAdvancedOptions() {
        const advancedOptionsHTML = `
            <div class="ai-advanced-options" style="margin-top: 20px; padding: 20px; background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1)); border-radius: 15px;">
                <h3 style="color: #667eea; margin-bottom: 15px;">🧠 Options IA Avancées</h3>
                
                <div class="options-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                    <div class="option-group">
                        <h4>🎯 Détection Automatique</h4>
                        <label style="display: flex; align-items: center; margin: 8px 0;">
                            <input type="checkbox" checked id="auto-discipline" style="margin-right: 8px;">
                            <span>Détecter la discipline automatiquement</span>
                        </label>
                        <label style="display: flex; align-items: center; margin: 8px 0;">
                            <input type="checkbox" checked id="auto-level" style="margin-right: 8px;">
                            <span>Identifier le niveau scolaire</span>
                        </label>
                        <label style="display: flex; align-items: center; margin: 8px 0;">
                            <input type="checkbox" checked id="auto-objectives" style="margin-right: 8px;">
                            <span>Extraire les objectifs pédagogiques</span>
                        </label>
                    </div>
                    
                    <div class="option-group">
                        <h4>♿ Accessibilité</h4>
                        <label style="display: flex; align-items: center; margin: 8px 0;">
                            <input type="checkbox" checked id="wcag-aaa" style="margin-right: 8px;">
                            <span>Conformité WCAG AAA</span>
                        </label>
                        <label style="display: flex; align-items: center; margin: 8px 0;">
                            <input type="checkbox" checked id="screen-reader" style="margin-right: 8px;">
                            <span>Optimisation lecteur d'écran</span>
                        </label>
                        <label style="display: flex; align-items: center; margin: 8px 0;">
                            <input type="checkbox" id="high-contrast" style="margin-right: 8px;">
                            <span>Mode contraste élevé par défaut</span>
                        </label>
                    </div>
                    
                    <div class="option-group">
                        <h4>🎮 Gamification</h4>
                        <label style="display: flex; align-items: center; margin: 8px 0;">
                            <input type="checkbox" checked id="mini-games" style="margin-right: 8px;">
                            <span>Générer des mini-jeux</span>
                        </label>
                        <label style="display: flex; align-items: center; margin: 8px 0;">
                            <input type="checkbox" checked id="cognitive-breaks" style="margin-right: 8px;">
                            <span>Pauses cognitives automatiques</span>
                        </label>
                        <label style="display: flex; align-items: center; margin: 8px 0;">
                            <input type="checkbox" id="adaptive-difficulty" style="margin-right: 8px;">
                            <span>Difficulté adaptative</span>
                        </label>
                    </div>
                    
                    <div class="option-group">
                        <h4>🔍 Enrichissement</h4>
                        <label style="display: flex; align-items: center; margin: 8px 0;">
                            <input type="checkbox" checked id="auto-glossary" style="margin-right: 8px;">
                            <span>Glossaire automatique</span>
                        </label>
                        <label style="display: flex; align-items: center; margin: 8px 0;">
                            <input type="checkbox" checked id="visual-resources" style="margin-right: 8px;">
                            <span>Recherche de ressources visuelles</span>
                        </label>
                        <label style="display: flex; align-items: center; margin: 8px 0;">
                            <input type="checkbox" id="voice-synthesis" style="margin-right: 8px;">
                            <span>Synthèse vocale intégrée</span>
                        </label>
                    </div>
                </div>
                
                <div style="margin-top: 20px; text-align: center;">
                    <button class="btn-ai-preview" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer; margin: 5px; font-weight: 600;">
                        👁️ Aperçu des Fonctionnalités
                    </button>
                    <button class="btn-ai-demo" style="background: linear-gradient(135deg, #28a745, #20c997); color: white; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer; margin: 5px; font-weight: 600;">
                        🚀 Démonstration Interactive
                    </button>
                </div>
            </div>
        `;
        
        // Insérer après la sélection de format
        const formatSelection = document.getElementById('formatSelection');
        if (formatSelection) {
            const existingOptions = formatSelection.querySelector('.ai-advanced-options');
            if (existingOptions) {
                existingOptions.remove();
            }
            formatSelection.insertAdjacentHTML('beforeend', advancedOptionsHTML);
            
            // Ajouter les événements
            this.setupAIOptionsEvents();
        }
    }

    /**
     * Configurer les événements des options IA
     */
    setupAIOptionsEvents() {
        // Bouton aperçu
        document.querySelector('.btn-ai-preview')?.addEventListener('click', () => {
            this.showAIFeaturePreview();
        });
        
        // Bouton démonstration
        document.querySelector('.btn-ai-demo')?.addEventListener('click', () => {
            this.runAIDemo();
        });
        
        // Événements des checkboxes
        document.querySelectorAll('.ai-advanced-options input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.handleAIOptionChange(e.target.id, e.target.checked);
            });
        });
    }

    /**
     * Afficher l'aperçu des fonctionnalités IA
     */
    showAIFeaturePreview() {
        const previewContent = `
            <h3>👁️ Aperçu des Fonctionnalités IA</h3>
            <div style="text-align: left; max-height: 400px; overflow-y: auto;">
                <div class="feature-preview">
                    <h4>🎯 Analyse Automatique du Document</h4>
                    <ul>
                        <li>✅ Détection automatique de la discipline (Mathématiques, Sciences, Littérature, etc.)</li>
                        <li>✅ Identification du niveau scolaire (Primaire, Collège, Lycée, Supérieur)</li>
                        <li>✅ Classification du type de contenu (Cours, Exercices, Évaluation)</li>
                        <li>✅ Extraction des objectifs pédagogiques</li>
                    </ul>
                </div>
                
                <div class="feature-preview">
                    <h4>♿ Accessibilité Universelle WCAG AAA</h4>
                    <ul>
                        <li>✅ Contraste élevé et mode sombre</li>
                        <li>✅ Navigation 100% clavier</li>
                        <li>✅ Compatibilité lecteurs d'écran (NVDA, JAWS, VoiceOver)</li>
                        <li>✅ Adaptation dyslexie (OpenDyslexic)</li>
                        <li>✅ Tailles de texte ajustables</li>
                        <li>✅ Interface simplifiée</li>
                    </ul>
                </div>
                
                <div class="feature-preview">
                    <h4>🎮 Gamification Adaptative</h4>
                    <ul>
                        <li>✅ Mini-jeux spécifiques à chaque discipline</li>
                        <li>✅ Pauses cognitives automatiques</li>
                        <li>✅ Système de progression et badges</li>
                        <li>✅ Difficulté adaptative selon le niveau</li>
                    </ul>
                </div>
                
                <div class="feature-preview">
                    <h4>🔍 Enrichissement Intelligent</h4>
                    <ul>
                        <li>✅ Glossaire contextuel automatique</li>
                        <li>✅ Recherche de ressources visuelles libres</li>
                        <li>✅ Synthèse vocale disciplinaire</li>
                        <li>✅ Outils spécialisés par matière</li>
                    </ul>
                </div>
                
                <div class="feature-preview">
                    <h4>📄 Export Avancé</h4>
                    <ul>
                        <li>✅ PDF accessible avec fonctionnalités préservées</li>
                        <li>✅ HTML responsive et interactif</li>
                        <li>✅ Package SCORM pour LMS</li>
                        <li>✅ Impression optimisée</li>
                    </ul>
                </div>
            </div>
        `;
        
        this.views.upload.createModal('🔍 Fonctionnalités IA', previewContent, [
            { text: 'Fermer', class: 'btn-primary', action: 'close-modal' }
        ]);
    }

    /**
     * Lancer la démonstration IA
     */
    async runAIDemo() {
        this.notificationService.info('🚀 Lancement de la démonstration IA...');
        
        try {
            // Contenu de démonstration
            const demoContent = `
# Les Fractions - CM1

## Qu'est-ce qu'une fraction ?

Une **fraction** représente une partie d'un tout. Elle s'écrit avec deux nombres séparés par une barre :

- Le **numérateur** (en haut) : nombre de parties prises
- Le **dénominateur** (en bas) : nombre total de parties égales

### Exemple concret

Si on partage une pizza en 8 parts égales et qu'on en mange 3, on a mangé **3/8** de la pizza.

### Exercices

1. **Exercice 1** : Combien représente 2/5 d'un gâteau de 10 parts ?
2. **Exercice 2** : Dessinez 3/4 d'un rectangle.
3. **Exercice 3** : Comparez 1/2 et 3/6.

### Vocabulaire important

- **Numérateur** : nombre du haut dans une fraction
- **Dénominateur** : nombre du bas dans une fraction  
- **Fraction équivalente** : fractions qui représentent la même quantité
            `;
            
            // Démarrer la démonstration avec le contrôleur IA
            if (this.universalPedagogyController) {
                const result = await this.universalPedagogyController.handleUniversalTransformation({
                    content: demoContent,
                    metadata: {
                        title: 'Démonstration IA - Les Fractions',
                        fileName: 'demo-fractions-cm1',
                        type: 'demonstration'
                    }
                });
                
                this.notificationService.success('✨ Démonstration IA terminée avec succès !');
            } else {
                this.notificationService.error('❌ Contrôleur IA non disponible');
            }
            
        } catch (error) {
            console.error('Erreur lors de la démonstration:', error);
            this.notificationService.error('Erreur lors de la démonstration IA');
        }
    }

    /**
     * Gérer les changements d'options IA
     */
    handleAIOptionChange(optionId, enabled) {
        console.log(`Option IA ${optionId}: ${enabled ? 'activée' : 'désactivée'}`);
        
        // Sauvegarder les préférences
        const aiPreferences = JSON.parse(localStorage.getItem('ai-preferences') || '{}');
        aiPreferences[optionId] = enabled;
        localStorage.setItem('ai-preferences', JSON.stringify(aiPreferences));
        
        // Émettre l'événement de changement
        this.eventBus.emit('ai:option-changed', { option: optionId, enabled });
    }

    /**
     * Ajouter le panneau d'accessibilité global
     */
    addAccessibilityPanel() {
        const accessibilityPanelHTML = `
            <div id="global-accessibility-panel" style="position: fixed; top: 70px; right: 20px; z-index: 10000; background: white; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); padding: 15px; min-width: 200px; display: none;">
                <h4 style="margin: 0 0 15px 0; color: #667eea;">♿ Accessibilité</h4>
                <div class="accessibility-controls">
                    <button class="accessibility-toggle" data-feature="high-contrast" style="width: 100%; margin: 5px 0; padding: 8px; border: 1px solid #ddd; border-radius: 5px; background: white; cursor: pointer;">
                        🔆 Contraste élevé
                    </button>
                    <button class="accessibility-toggle" data-feature="dark-mode" style="width: 100%; margin: 5px 0; padding: 8px; border: 1px solid #ddd; border-radius: 5px; background: white; cursor: pointer;">
                        🌙 Mode sombre
                    </button>
                    <button class="accessibility-toggle" data-feature="large-text" style="width: 100%; margin: 5px 0; padding: 8px; border: 1px solid #ddd; border-radius: 5px; background: white; cursor: pointer;">
                        🔍 Texte agrandi
                    </button>
                    <button class="accessibility-toggle" data-feature="dyslexia-friendly" style="width: 100%; margin: 5px 0; padding: 8px; border: 1px solid #ddd; border-radius: 5px; background: white; cursor: pointer;">
                        📖 Police dyslexie
                    </button>
                    <button onclick="this.closest('#global-accessibility-panel').style.display='none'" style="width: 100%; margin: 10px 0 5px 0; padding: 8px; border: none; border-radius: 5px; background: #667eea; color: white; cursor: pointer;">
                        Fermer
                    </button>
                </div>
            </div>
            
            <button id="accessibility-toggle-btn" style="position: fixed; top: 20px; right: 20px; z-index: 9999; background: #667eea; color: white; border: none; border-radius: 50%; width: 50px; height: 50px; cursor: pointer; box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4); font-size: 20px;">
                ♿
            </button>
        `;
        
        document.body.insertAdjacentHTML('beforeend', accessibilityPanelHTML);
        
        // Ajouter les événements
        document.getElementById('accessibility-toggle-btn').addEventListener('click', () => {
            const panel = document.getElementById('global-accessibility-panel');
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        });
        
        document.querySelectorAll('.accessibility-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const feature = e.target.getAttribute('data-feature');
                this.toggleGlobalAccessibility(feature, e.target);
            });
        });
    }

    /**
     * Basculer l'accessibilité globale
     */
    toggleGlobalAccessibility(feature, button) {
        const body = document.body;
        const isActive = body.classList.contains(feature);
        
        if (isActive) {
            body.classList.remove(feature);
            button.style.background = 'white';
            button.style.color = '#333';
        } else {
            body.classList.add(feature);
            button.style.background = '#667eea';
            button.style.color = 'white';
        }
        
        // Sauvegarder la préférence
        const preferences = JSON.parse(localStorage.getItem('global-accessibility') || '{}');
        preferences[feature] = !isActive;
        localStorage.setItem('global-accessibility', JSON.stringify(preferences));
        
        this.notificationService.info(`♿ ${feature} ${!isActive ? 'activé' : 'désactivé'}`);
    }

    /**
     * Ajouter les formats IA
     */
    addAIFormats() {
        const aiFormats = [
            {
                id: 'universal-ai',
                name: 'IA Universelle',
                description: 'Transformation complète avec IA',
                features: ['auto-detection', 'accessibility', 'gamification']
            }
        ];
        
        // Ajouter ces formats au système
        aiFormats.forEach(format => {
            this.eventBus.emit('format:register', format);
        });
    }

    /**
     * Ajouter les routes IA
     */
    addUniversalPedagogyRoutes() {
        // Navigation vers l'IA universelle
        document.querySelector('[data-route="universal-ai"]')?.addEventListener('click', () => {
            this.navigate('upload');
            // Activer le mode IA
            setTimeout(() => {
                this.enableAIMode();
            }, 100);
        });
    }

    /**
     * Configurer les événements IA
     */
    setupUniversalPedagogyEvents() {
        // Écouter les demandes de transformation IA
        this.eventBus.on('ai:transform-request', (data) => {
            this.handleAITransformRequest(data);
        });
        
        // Écouter les changements de format
        this.eventBus.on('format:selected', (data) => {
            if (data.requiresAI) {
                this.enableAIMode();
            }
        });
    }

    /**
     * Gérer les demandes de transformation IA
     */
    async handleAITransformRequest(data) {
        if (this.universalPedagogyController) {
            return await this.universalPedagogyController.handleUniversalTransformation(data);
        } else {
            throw new Error('Contrôleur IA non disponible');
        }
    }

    /**
     * Activer le mode IA
     */
    enableAIMode() {
        document.body.classList.add('ai-mode');
        
        // Ajouter les styles spéciaux pour le mode IA
        const aiStyles = `
            .ai-mode {
                --primary-color: linear-gradient(135deg, #667eea, #764ba2);
            }
            
            .ai-mode .nav-item-special {
                box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
            }
            
            .ai-mode .format-card-ai {
                animation: aiGlow 2s ease-in-out infinite alternate;
            }
            
            @keyframes aiGlow {
                from { box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3); }
                to { box-shadow: 0 10px 30px rgba(102, 126, 234, 0.6); }
            }
        `;
        
        if (!document.getElementById('ai-mode-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'ai-mode-styles';
            styleSheet.textContent = aiStyles;
            document.head.appendChild(styleSheet);
        }
        
        this.notificationService.success('🧠 Mode IA activé - Fonctionnalités avancées disponibles');
    }

    /**
     * Override de la méthode init pour inclure l'IA
     */
    async init() {
        try {
            // Initialisation de base
            await super.init();
            
            // Charger les préférences après un délai
            setTimeout(() => {
                this.loadPreferences();
            }, 1000);
            
            console.log('🧠 Application EduLearning+ avec IA Universelle prête');
            
        } catch (error) {
            console.error('Erreur lors de l\'initialisation complète:', error);
        }
    }

    /**
     * Charger les préférences au démarrage
     */
    loadPreferences() {
        // Charger les préférences d'accessibilité globale
        const globalAccessibility = JSON.parse(localStorage.getItem('global-accessibility') || '{}');
        Object.entries(globalAccessibility).forEach(([feature, enabled]) => {
            if (enabled) {
                document.body.classList.add(feature);
                const button = document.querySelector(`[data-feature="${feature}"]`);
                if (button) {
                    button.style.background = '#667eea';
                    button.style.color = 'white';
                }
            }
        });
        
        // Charger les préférences IA
        const aiPreferences = JSON.parse(localStorage.getItem('ai-preferences') || '{}');
        Object.entries(aiPreferences).forEach(([option, enabled]) => {
            const checkbox = document.getElementById(option);
            if (checkbox) {
                checkbox.checked = enabled;
            }
        });
    }

    /**
     * Override du cleanup pour inclure l'IA
     */
    cleanup() {
        if (this.universalPedagogyController) {
            this.universalPedagogyController.cleanup();
        }
        
        // Nettoyer les éléments ajoutés
        const elementsToRemove = [
            '#global-accessibility-panel',
            '#accessibility-toggle-btn',
            '#ai-mode-styles'
        ];
        
        elementsToRemove.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) element.remove();
        });
        
        super.cleanup();
    }
}

// Remplacer l'AppController par défaut par la version améliorée
window.AppController = EnhancedAppController;

console.log('🚀 IA Pédagogique Universelle - Module d\'intégration chargé');
