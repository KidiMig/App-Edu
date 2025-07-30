/**
 * EventBus - Système de communication par événements
 * Permet la communication découplée entre les différents composants MVC
 */
class EventBus {
    constructor() {
        this.events = new Map();
        this.onceEvents = new Set();
        this.debugMode = false;
    }

    /**
     * Écouter un événement
     */
    on(eventName, callback, context = null) {
        if (typeof callback !== 'function') {
            throw new Error('Le callback doit être une fonction');
        }

        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }

        const listener = {
            callback: context ? callback.bind(context) : callback,
            context,
            id: this.generateId()
        };

        this.events.get(eventName).push(listener);

        if (this.debugMode) {
            console.log(`📡 EventBus: Listener ajouté pour "${eventName}"`);
        }

        return listener.id;
    }

    /**
     * Écouter un événement une seule fois
     */
    once(eventName, callback, context = null) {
        const listenerId = this.on(eventName, (...args) => {
            callback.apply(context, args);
            this.off(eventName, listenerId);
        }, context);

        this.onceEvents.add(listenerId);
        return listenerId;
    }

    /**
     * Arrêter d'écouter un événement
     */
    off(eventName, listenerIdOrCallback = null) {
        if (!this.events.has(eventName)) {
            return false;
        }

        const listeners = this.events.get(eventName);

        if (listenerIdOrCallback === null) {
            // Supprimer tous les listeners pour cet événement
            this.events.delete(eventName);
            if (this.debugMode) {
                console.log(`📡 EventBus: Tous les listeners supprimés pour "${eventName}"`);
            }
            return true;
        }

        let indexToRemove = -1;

        if (typeof listenerIdOrCallback === 'string') {
            // Recherche par ID
            indexToRemove = listeners.findIndex(listener => listener.id === listenerIdOrCallback);
        } else if (typeof listenerIdOrCallback === 'function') {
            // Recherche par fonction callback
            indexToRemove = listeners.findIndex(listener => listener.callback === listenerIdOrCallback);
        }

        if (indexToRemove !== -1) {
            const removedListener = listeners.splice(indexToRemove, 1)[0];
            this.onceEvents.delete(removedListener.id);

            if (listeners.length === 0) {
                this.events.delete(eventName);
            }

            if (this.debugMode) {
                console.log(`📡 EventBus: Listener supprimé pour "${eventName}"`);
            }
            return true;
        }

        return false;
    }

    /**
     * Émettre un événement
     */
    emit(eventName, data = null) {
        if (this.debugMode) {
            console.log(`📡 EventBus: Émission de "${eventName}"`, data);
        }

        if (!this.events.has(eventName)) {
            if (this.debugMode) {
                console.log(`📡 EventBus: Aucun listener pour "${eventName}"`);
            }
            return 0;
        }

        const listeners = [...this.events.get(eventName)]; // Copie pour éviter les modifications concurrentes
        let executedCount = 0;

        listeners.forEach(listener => {
            try {
                listener.callback(data, {
                    eventName,
                    timestamp: Date.now(),
                    listenerId: listener.id
                });
                executedCount++;
            } catch (error) {
                console.error(`Erreur dans le listener "${eventName}":`, error);
                this.emit('error', {
                    originalEvent: eventName,
                    error,
                    listenerId: listener.id
                });
            }
        });

        return executedCount;
    }

    /**
     * Émettre un événement de manière asynchrone
     */
    async emitAsync(eventName, data = null) {
        if (this.debugMode) {
            console.log(`📡 EventBus: Émission asynchrone de "${eventName}"`, data);
        }

        if (!this.events.has(eventName)) {
            return 0;
        }

        const listeners = [...this.events.get(eventName)];
        const promises = [];

        listeners.forEach(listener => {
            const promise = new Promise((resolve) => {
                try {
                    const result = listener.callback(data, {
                        eventName,
                        timestamp: Date.now(),
                        listenerId: listener.id
                    });

                    // Si le résultat est une promesse, l'attendre
                    if (result instanceof Promise) {
                        result.then(resolve).catch((error) => {
                            console.error(`Erreur dans le listener asynchrone "${eventName}":`, error);
                            this.emit('error', {
                                originalEvent: eventName,
                                error,
                                listenerId: listener.id
                            });
                            resolve();
                        });
                    } else {
                        resolve();
                    }
                } catch (error) {
                    console.error(`Erreur dans le listener "${eventName}":`, error);
                    this.emit('error', {
                        originalEvent: eventName,
                        error,
                        listenerId: listener.id
                    });
                    resolve();
                }
            });

            promises.push(promise);
        });

        await Promise.all(promises);
        return listeners.length;
    }

    /**
     * Vérifier si un événement a des listeners
     */
    hasListeners(eventName) {
        return this.events.has(eventName) && this.events.get(eventName).length > 0;
    }

    /**
     * Obtenir le nombre de listeners pour un événement
     */
    getListenerCount(eventName = null) {
        if (eventName) {
            return this.events.has(eventName) ? this.events.get(eventName).length : 0;
        }

        // Compter tous les listeners
        let total = 0;
        this.events.forEach(listeners => {
            total += listeners.length;
        });
        return total;
    }

    /**
     * Obtenir la liste des événements écoutés
     */
    getEventNames() {
        return Array.from(this.events.keys());
    }

    /**
     * Créer un namespace pour les événements
     */
    namespace(prefix) {
        return {
            on: (eventName, callback, context) => {
                return this.on(`${prefix}:${eventName}`, callback, context);
            },
            once: (eventName, callback, context) => {
                return this.once(`${prefix}:${eventName}`, callback, context);
            },
            off: (eventName, listenerIdOrCallback) => {
                return this.off(`${prefix}:${eventName}`, listenerIdOrCallback);
            },
            emit: (eventName, data) => {
                return this.emit(`${prefix}:${eventName}`, data);
            },
            emitAsync: (eventName, data) => {
                return this.emitAsync(`${prefix}:${eventName}`, data);
            }
        };
    }

    /**
     * Middleware pour traiter les événements
     */
    addMiddleware(middleware) {
        if (typeof middleware !== 'function') {
            throw new Error('Le middleware doit être une fonction');
        }

        const originalEmit = this.emit.bind(this);
        this.emit = (eventName, data) => {
            const processedData = middleware(eventName, data);
            return originalEmit(eventName, processedData);
        };
    }

    /**
     * Débouncer un événement
     */
    debounce(eventName, delay = 300) {
        let timeoutId = null;
        let pendingData = null;

        return {
            emit: (data) => {
                pendingData = data;
                
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }

                timeoutId = setTimeout(() => {
                    this.emit(eventName, pendingData);
                    timeoutId = null;
                    pendingData = null;
                }, delay);
            },
            cancel: () => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                    timeoutId = null;
                    pendingData = null;
                }
            }
        };
    }

    /**
     * Throttler un événement
     */
    throttle(eventName, delay = 300) {
        let lastEmission = 0;
        let timeoutId = null;

        return {
            emit: (data) => {
                const now = Date.now();

                if (now - lastEmission >= delay) {
                    this.emit(eventName, data);
                    lastEmission = now;
                } else if (!timeoutId) {
                    timeoutId = setTimeout(() => {
                        this.emit(eventName, data);
                        lastEmission = Date.now();
                        timeoutId = null;
                    }, delay - (now - lastEmission));
                }
            }
        };
    }

    /**
     * Créer une chaîne d'événements
     */
    chain(...eventNames) {
        return {
            emit: (data) => {
                return eventNames.reduce((promise, eventName) => {
                    return promise.then(() => this.emitAsync(eventName, data));
                }, Promise.resolve());
            }
        };
    }

    /**
     * Attendre qu'un événement soit émis
     */
    waitFor(eventName, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                this.off(eventName, listenerId);
                reject(new Error(`Timeout: événement "${eventName}" non reçu après ${timeout}ms`));
            }, timeout);

            const listenerId = this.once(eventName, (data) => {
                clearTimeout(timeoutId);
                resolve(data);
            });
        });
    }

    /**
     * Supprimer tous les listeners
     */
    removeAllListeners() {
        this.events.clear();
        this.onceEvents.clear();
        
        if (this.debugMode) {
            console.log('📡 EventBus: Tous les listeners supprimés');
        }
    }

    /**
     * Activer/désactiver le mode debug
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
        console.log(`📡 EventBus: Mode debug ${enabled ? 'activé' : 'désactivé'}`);
    }

    /**
     * Obtenir les statistiques de l'EventBus
     */
    getStats() {
        const stats = {
            totalEvents: this.events.size,
            totalListeners: this.getListenerCount(),
            onceListeners: this.onceEvents.size,
            events: {}
        };

        this.events.forEach((listeners, eventName) => {
            stats.events[eventName] = {
                listenerCount: listeners.length,
                listeners: listeners.map(l => ({
                    id: l.id,
                    hasContext: l.context !== null
                }))
            };
        });

        return stats;
    }

    /**
     * Générer un ID unique pour les listeners
     */
    generateId() {
        return 'listener_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Cloner l'EventBus (pour les tests)
     */
    clone() {
        const cloned = new EventBus();
        cloned.debugMode = this.debugMode;
        
        this.events.forEach((listeners, eventName) => {
            cloned.events.set(eventName, [...listeners]);
        });
        
        return cloned;
    }
}