/**
 * BaseView - Classe de base pour toutes les vues
 * Gère le rendu, les événements et la communication avec les contrôleurs
 */
class BaseView {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.eventHandlers = new Map();
        this.isVisible = false;
        this.data = {};
        this.template = '';
    }

    /**
     * Rendre la vue
     */
    render(data = {}) {
        this.data = { ...this.data, ...data };
        
        if (!this.container) {
            console.error('Container non trouvé pour la vue');
            return;
        }

        const content = this.generateHTML();
        this.container.innerHTML = content;
        
        this.bindEvents();
        this.afterRender();
        this.isVisible = true;
        
        return this;
    }

    /**
     * Générer le HTML de la vue (à implémenter dans les classes filles)
     */
    generateHTML() {
        return this.template || '<div>Vue non implémentée</div>';
    }

    /**
     * Méthode appelée après le rendu
     */
    afterRender() {
        // À implémenter dans les classes filles si nécessaire
    }

    /**
     * Lier les événements de la vue
     */
    bindEvents() {
        // Nettoyer les anciens événements
        this.unbindEvents();

        // Lier les nouveaux événements
        this.eventHandlers.forEach((handler, selector) => {
            const elements = this.container.querySelectorAll(selector);
            elements.forEach(element => {
                const eventType = handler.event || 'click';
                element.addEventListener(eventType, handler.callback);
            });
        });
    }

    /**
     * Délier les événements
     */
    unbindEvents() {
        this.eventHandlers.forEach((handler, selector) => {
            const elements = this.container.querySelectorAll(selector);
            elements.forEach(element => {
                const eventType = handler.event || 'click';
                element.removeEventListener(eventType, handler.callback);
            });
        });
    }

    /**
     * Ajouter un gestionnaire d'événement
     */
    addEventHandler(selector, callback, eventType = 'click') {
        this.eventHandlers.set(selector, {
            event: eventType,
            callback: callback.bind(this)
        });
        return this;
    }

    /**
     * Supprimer un gestionnaire d'événement
     */
    removeEventHandler(selector) {
        this.eventHandlers.delete(selector);
        return this;
    }

    /**
     * Afficher la vue
     */
    show() {
        if (this.container) {
            this.container.style.display = 'block';
            this.container.classList.add('active');
            this.isVisible = true;
            this.onShow();
        }
        return this;
    }

    /**
     * Masquer la vue
     */
    hide() {
        if (this.container) {
            this.container.style.display = 'none';
            this.container.classList.remove('active');
            this.isVisible = false;
            this.onHide();
        }
        return this;
    }

    /**
     * Méthode appelée lors de l'affichage
     */
    onShow() {
        // À implémenter dans les classes filles si nécessaire
    }

    /**
     * Méthode appelée lors du masquage
     */
    onHide() {
        // À implémenter dans les classes filles si nécessaire
    }

    /**
     * Mettre à jour une partie de la vue
     */
    update(selector, content) {
        const element = this.container.querySelector(selector);
        if (element) {
            element.innerHTML = content;
        }
        return this;
    }

    /**
     * Mettre à jour les données et re-rendre si nécessaire
     */
    updateData(newData, rerender = false) {
        this.data = { ...this.data, ...newData };
        if (rerender && this.isVisible) {
            this.render(this.data);
        }
        return this;
    }

    /**
     * Obtenir un élément par sélecteur
     */
    find(selector) {
        return this.container ? this.container.querySelector(selector) : null;
    }

    /**
     * Obtenir tous les éléments par sélecteur
     */
    findAll(selector) {
        return this.container ? this.container.querySelectorAll(selector) : [];
    }

    /**
     * Créer un élément HTML
     */
    createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else {
                element.setAttribute(key, value);
            }
        });
        
        if (content) {
            element.innerHTML = content;
        }
        
        return element;
    }

    /**
     * Créer un modal
     */
    createModal(title, content, actions = []) {
        const modalHTML = `
            <div class="modal show">
                <div class="modal-content">
                    <button class="close-btn" data-action="close-modal">×</button>
                    <div class="modal-header">
                        <h2>${title}</h2>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    ${actions.length > 0 ? `
                        <div class="modal-actions">
                            ${actions.map(action => `
                                <button class="btn ${action.class || ''}" data-action="${action.action}">
                                    ${action.text}
                                </button>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        const modalContainer = document.getElementById('modals-container') || document.body;
        const modalElement = this.createElement('div', { innerHTML: modalHTML });
        modalContainer.appendChild(modalElement.firstElementChild);
        
        // Gestion des événements du modal
        const modal = modalContainer.lastElementChild;
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.getAttribute('data-action') === 'close-modal') {
                this.closeModal(modal);
            }
        });
        
        return modal;
    }

    /**
     * Fermer un modal
     */
    closeModal(modal) {
        if (modal && modal.parentNode) {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        }
    }

    /**
     * Afficher une notification toast
     */
    showToast(message, type = 'info', duration = 4000) {
        const toast = this.createElement('div', {
            className: `toast ${type}`,
            innerHTML: message
        });
        
        const toastContainer = document.getElementById('toast-container') || document.body;
        toastContainer.appendChild(toast);
        
        // Auto-suppression
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }
        }, duration);
        
        // Fermeture au clic
        toast.addEventListener('click', () => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        });
        
        return toast;
    }

    /**
     * Afficher un loader
     */
    showLoader(message = 'Chargement...') {
        const loader = this.createElement('div', {
            className: 'loading-overlay',
            innerHTML: `
                <div>
                    <div class="loading-spinner"></div>
                    ${message}
                </div>
            `
        });
        
        document.body.appendChild(loader);
        return loader;
    }

    /**
     * Masquer le loader
     */
    hideLoader(loader) {
        if (loader && loader.parentNode) {
            loader.parentNode.removeChild(loader);
        }
    }

    /**
     * Formater une date
     */
    formatDate(dateString, format = 'short') {
        const date = new Date(dateString);
        
        if (format === 'short') {
            return date.toLocaleDateString('fr-FR');
        } else if (format === 'long') {
            return date.toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } else if (format === 'time') {
            return date.toLocaleTimeString('fr-FR');
        } else if (format === 'datetime') {
            return date.toLocaleString('fr-FR');
        }
        
        return dateString;
    }

    /**
     * Formater une durée en minutes
     */
    formatDuration(minutes) {
        if (minutes < 60) {
            return `${minutes}min`;
        } else {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            return `${hours}h${remainingMinutes > 0 ? remainingMinutes.toString().padStart(2, '0') : ''}`;
        }
    }

    /**
     * Formater un pourcentage
     */
    formatPercentage(value, decimals = 0) {
        return `${value.toFixed(decimals)}%`;
    }

    /**
     * Échapper le HTML pour éviter les injections XSS
     */
    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Tronquer un texte
     */
    truncateText(text, maxLength = 100) {
        if (text.length <= maxLength) {
            return text;
        }
        return text.substr(0, maxLength) + '...';
    }

    /**
     * Générer des initiales à partir d'un nom
     */
    generateInitials(firstName, lastName) {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }

    /**
     * Valider un formulaire
     */
    validateForm(formElement) {
        const errors = [];
        const formData = new FormData(formElement);
        
        // Validation des champs requis
        const requiredFields = formElement.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                errors.push({
                    field: field.name,
                    message: `Le champ ${field.labels?.[0]?.textContent || field.name} est requis`
                });
            }
        });
        
        // Validation des emails
        const emailFields = formElement.querySelectorAll('[type="email"]');
        emailFields.forEach(field => {
            if (field.value && !this.isValidEmail(field.value)) {
                errors.push({
                    field: field.name,
                    message: 'Format d\'email invalide'
                });
            }
        });
        
        return {
            isValid: errors.length === 0,
            errors,
            data: Object.fromEntries(formData)
        };
    }

    /**
     * Valider un email
     */
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    /**
     * Animer un élément
     */
    animate(element, animation, duration = 300) {
        return new Promise(resolve => {
            element.style.animation = `${animation} ${duration}ms ease`;
            setTimeout(() => {
                element.style.animation = '';
                resolve();
            }, duration);
        });
    }

    /**
     * Nettoyer la vue
     */
    destroy() {
        this.unbindEvents();
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.eventHandlers.clear();
        this.data = {};
        this.isVisible = false;
    }
}