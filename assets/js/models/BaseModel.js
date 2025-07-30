/**
 * BaseModel - Classe de base pour tous les modèles
 * Gère les opérations CRUD de base et les événements
 */
class BaseModel {
    constructor() {
        this.data = {};
        this.observers = [];
        this.storageKey = this.constructor.name.toLowerCase();
        this.loadFromStorage();
    }

    /**
     * Ajouter un observateur pour les changements de données
     */
    addObserver(callback) {
        this.observers.push(callback);
    }

    /**
     * Supprimer un observateur
     */
    removeObserver(callback) {
        this.observers = this.observers.filter(obs => obs !== callback);
    }

    /**
     * Notifier tous les observateurs d'un changement
     */
    notifyObservers(event, data) {
        this.observers.forEach(observer => {
            try {
                observer(event, data);
            } catch (error) {
                console.error('Erreur dans l\'observateur:', error);
            }
        });
    }

    /**
     * Définir des données et notifier les observateurs
     */
    setData(key, value) {
        const oldValue = this.data[key];
        this.data[key] = value;
        
        if (oldValue !== value) {
            this.saveToStorage();
            this.notifyObservers('dataChanged', { key, value, oldValue });
        }
        
        return this;
    }

    /**
     * Obtenir une donnée
     */
    getData(key) {
        return key ? this.data[key] : this.data;
    }

    /**
     * Mettre à jour plusieurs données à la fois
     */
    updateData(newData) {
        const oldData = { ...this.data };
        this.data = { ...this.data, ...newData };
        this.saveToStorage();
        this.notifyObservers('dataUpdated', { newData, oldData });
        return this;
    }

    /**
     * Supprimer une donnée
     */
    removeData(key) {
        const value = this.data[key];
        delete this.data[key];
        this.saveToStorage();
        this.notifyObservers('dataRemoved', { key, value });
        return this;
    }

    /**
     * Réinitialiser toutes les données
     */
    resetData() {
        const oldData = { ...this.data };
        this.data = {};
        this.saveToStorage();
        this.notifyObservers('dataReset', { oldData });
        return this;
    }

    /**
     * Valider les données selon les règles définies
     */
    validate(data = this.data) {
        const errors = [];
        const rules = this.getValidationRules();

        Object.keys(rules).forEach(field => {
            const rule = rules[field];
            const value = data[field];

            // Champ requis
            if (rule.required && (!value || value.toString().trim() === '')) {
                errors.push({
                    field,
                    message: rule.message || `Le champ ${field} est requis`
                });
            }

            // Validation par type
            if (value && rule.type) {
                if (!this.validateType(value, rule.type)) {
                    errors.push({
                        field,
                        message: rule.typeMessage || `Le champ ${field} doit être de type ${rule.type}`
                    });
                }
            }

            // Validation personnalisée
            if (value && rule.validator) {
                const customError = rule.validator(value);
                if (customError) {
                    errors.push({
                        field,
                        message: customError
                    });
                }
            }
        });

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Valider un type de donnée
     */
    validateType(value, type) {
        switch (type) {
            case 'email':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            case 'number':
                return !isNaN(value) && isFinite(value);
            case 'string':
                return typeof value === 'string';
            case 'boolean':
                return typeof value === 'boolean';
            case 'array':
                return Array.isArray(value);
            case 'object':
                return typeof value === 'object' && value !== null;
            default:
                return true;
        }
    }

    /**
     * Règles de validation à implémenter dans les classes filles
     */
    getValidationRules() {
        return {};
    }

    /**
     * Sauvegarder dans le localStorage
     */
    saveToStorage() {
        try {
            const dataToSave = {
                data: this.data,
                timestamp: Date.now(),
                version: this.getVersion()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(dataToSave));
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    }

    /**
     * Charger depuis le localStorage
     */
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                
                // Vérifier la version pour la migration si nécessaire
                if (this.shouldMigrate(parsed.version)) {
                    this.data = this.migrateData(parsed.data, parsed.version);
                } else {
                    this.data = parsed.data || {};
                }
            }
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            this.data = {};
        }
    }

    /**
     * Version du modèle (pour les migrations)
     */
    getVersion() {
        return '1.0.0';
    }

    /**
     * Vérifier si une migration est nécessaire
     */
    shouldMigrate(storedVersion) {
        return storedVersion && storedVersion !== this.getVersion();
    }

    /**
     * Migrer les données d'une ancienne version
     */
    migrateData(data, fromVersion) {
        console.log(`Migration des données de ${fromVersion} vers ${this.getVersion()}`);
        return data; // À implémenter dans les classes filles si nécessaire
    }

    /**
     * Exporter les données
     */
    export() {
        return {
            model: this.constructor.name,
            version: this.getVersion(),
            timestamp: Date.now(),
            data: this.data
        };
    }

    /**
     * Importer des données
     */
    import(exportedData) {
        if (exportedData.model === this.constructor.name) {
            if (this.shouldMigrate(exportedData.version)) {
                this.data = this.migrateData(exportedData.data, exportedData.version);
            } else {
                this.data = exportedData.data;
            }
            this.saveToStorage();
            this.notifyObservers('dataImported', exportedData);
            return true;
        }
        return false;
    }

    /**
     * Obtenir les statistiques du modèle
     */
    getStats() {
        return {
            dataCount: Object.keys(this.data).length,
            observersCount: this.observers.length,
            lastModified: this.data._lastModified || null,
            storageSize: this.getStorageSize()
        };
    }

    /**
     * Obtenir la taille en mémoire
     */
    getStorageSize() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? stored.length : 0;
        } catch {
            return 0;
        }
    }

    /**
     * Nettoyer les données et les observateurs
     */
    destroy() {
        this.observers = [];
        this.data = {};
        this.notifyObservers('modelDestroyed');
    }
}