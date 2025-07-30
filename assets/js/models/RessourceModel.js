/**
 * ResourceModel - Gère les ressources éducatives créées
 */
class ResourceModel extends BaseModel {
    constructor() {
        super();
        this.initializeDefaultData();
    }

    /**
     * Initialiser les données par défaut
     */
    initializeDefaultData() {
        if (Object.keys(this.data).length === 0) {
            this.data = {
                resources: [
                    {
                        id: 'chasse-aux-inferences',
                        title: 'La Chasse aux Inférences',
                        subject: 'Français',
                        level: 'CM2',
                        format: 'interactive',
                        icon: '🕵️',
                        createdAt: '2024-03-15T10:00:00Z',
                        updatedAt: '2024-03-15T10:00:00Z',
                        stats: {
                            students: 28,
                            successRate: 87,
                            averageTime: 135, // en minutes
                            completions: 25
                        },
                        files: [
                            { type: 'html', name: 'chasse-aux-inferences.html', size: 2.1 },
                            { type: 'pdf', name: 'chasse-aux-inferences.pdf', size: 1.8 },
                            { type: 'scorm', name: 'chasse-aux-inferences.zip', size: 3.2 }
                        ],
                        settings: {
                            isPublic: false,
                            allowDownload: true,
                            trackProgress: true
                        }
                    },
                    {
                        id: 'fractions-magiques',
                        title: 'Les Fractions Magiques',
                        subject: 'Mathématiques',
                        level: 'CM1',
                        format: 'canva',
                        icon: '🔢',
                        createdAt: '2024-03-12T14:30:00Z',
                        updatedAt: '2024-03-12T14:30:00Z',
                        stats: {
                            students: 25,
                            successRate: 78,
                            averageTime: 95,
                            completions: 22
                        },
                        files: [
                            { type: 'html', name: 'fractions-magiques.html', size: 1.9 },
                            { type: 'pdf', name: 'fractions-magiques.pdf', size: 1.5 }
                        ],
                        settings: {
                            isPublic: true,
                            allowDownload: true,
                            trackProgress: true
                        }
                    },
                    {
                        id: 'cycle-eau',
                        title: 'Le Cycle de l\'Eau',
                        subject: 'Sciences',
                        level: 'CE2',
                        format: 'genially',
                        icon: '🌍',
                        createdAt: '2024-03-08T09:15:00Z',
                        updatedAt: '2024-03-08T09:15:00Z',
                        stats: {
                            students: 22,
                            successRate: 91,
                            averageTime: 110,
                            completions: 20
                        },
                        files: [
                            { type: 'html', name: 'cycle-eau.html', size: 2.5 },
                            { type: 'pdf', name: 'cycle-eau.pdf', size: 2.0 },
                            { type: 'scorm', name: 'cycle-eau.zip', size: 4.1 }
                        ],
                        settings: {
                            isPublic: false,
                            allowDownload: false,
                            trackProgress: true
                        }
                    }
                ],
                categories: [
                    { id: 'francais', name: 'Français', color: '#667eea' },
                    { id: 'mathematiques', name: 'Mathématiques', color: '#28a745' },
                    { id: 'sciences', name: 'Sciences', color: '#ff6b6b' },
                    { id: 'histoire', name: 'Histoire', color: '#ffc107' },
                    { id: 'geographie', name: 'Géographie', color: '#17a2b8' }
                ],
                templates: [
                    { id: 'interactive', name: 'Interactif Gamifié', icon: '🎮' },
                    { id: 'genially', name: 'Style Genially', icon: '🎭' },
                    { id: 'canva', name: 'Style Canva', icon: '🎨' },
                    { id: 'elearning', name: 'E-Learning SCORM', icon: '🎓' }
                ]
            };
            this.saveToStorage();
        }
    }

    /**
     * Règles de validation pour les ressources
     */
    getValidationRules() {
        return {
            title: {
                required: true,
                type: 'string',
                message: 'Le titre est requis'
            },
            subject: {
                required: true,
                type: 'string',
                message: 'La matière est requise'
            },
            level: {
                required: true,
                type: 'string',
                message: 'Le niveau est requis'
            },
            format: {
                required: true,
                type: 'string',
                message: 'Le format est requis'
            }
        };
    }

    /**
     * Obtenir toutes les ressources
     */
    getAllResources() {
        return this.getData('resources') || [];
    }

    /**
     * Obtenir une ressource par ID
     */
    getResourceById(id) {
        const resources = this.getAllResources();
        return resources.find(resource => resource.id === id);
    }

    /**
     * Créer une nouvelle ressource
     */
    createResource(resourceData) {
        const validation = this.validate(resourceData);
        if (!validation.isValid) {
            throw new Error('Données de ressource invalides: ' + 
                validation.errors.map(e => e.message).join(', '));
        }

        const newResource = {
            id: this.generateId(),
            ...resourceData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            stats: {
                students: 0,
                successRate: 0,
                averageTime: 0,
                completions: 0
            },
            files: [],
            settings: {
                isPublic: false,
                allowDownload: true,
                trackProgress: true
            }
        };

        const resources = this.getAllResources();
        resources.push(newResource);
        this.setData('resources', resources);
        
        this.notifyObservers('resourceCreated', newResource);
        return newResource;
    }

    /**
     * Mettre à jour une ressource
     */
    updateResource(id, updateData) {
        const resources = this.getAllResources();
        const index = resources.findIndex(resource => resource.id === id);
        
        if (index === -1) {
            throw new Error('Ressource non trouvée');
        }

        const updatedResource = {
            ...resources[index],
            ...updateData,
            updatedAt: new Date().toISOString()
        };

        resources[index] = updatedResource;
        this.setData('resources', resources);
        
        this.notifyObservers('resourceUpdated', updatedResource);
        return updatedResource;
    }

    /**
     * Supprimer une ressource
     */
    deleteResource(id) {
        const resources = this.getAllResources();
        const index = resources.findIndex(resource => resource.id === id);
        
        if (index === -1) {
            throw new Error('Ressource non trouvée');
        }

        const deletedResource = resources.splice(index, 1)[0];
        this.setData('resources', resources);
        
        this.notifyObservers('resourceDeleted', deletedResource);
        return deletedResource;
    }

    /**
     * Filtrer les ressources
     */
    filterResources(criteria) {
        const resources = this.getAllResources();
        
        return resources.filter(resource => {
            let matches = true;
            
            if (criteria.subject && resource.subject !== criteria.subject) {
                matches = false;
            }
            
            if (criteria.level && resource.level !== criteria.level) {
                matches = false;
            }
            
            if (criteria.format && resource.format !== criteria.format) {
                matches = false;
            }
            
            if (criteria.search) {
                const searchTerm = criteria.search.toLowerCase();
                const searchableText = `${resource.title} ${resource.subject} ${resource.level}`.toLowerCase();
                if (!searchableText.includes(searchTerm)) {
                    matches = false;
                }
            }
            
            return matches;
        });
    }

    /**
     * Trier les ressources
     */
    sortResources(sortBy = 'createdAt', order = 'desc') {
        const resources = [...this.getAllResources()];
        
        return resources.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];
            
            // Gestion des dates
            if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }
            
            // Gestion des statistiques imbriquées
            if (sortBy.includes('.')) {
                const path = sortBy.split('.');
                aValue = path.reduce((obj, key) => obj[key], a);
                bValue = path.reduce((obj, key) => obj[key], b);
            }
            
            if (order === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    }

    /**
     * Obtenir les statistiques globales
     */
    getGlobalStats() {
        const resources = this.getAllResources();
        
        return {
            totalResources: resources.length,
            totalStudents: resources.reduce((sum, r) => sum + r.stats.students, 0),
            averageSuccessRate: resources.reduce((sum, r) => sum + r.stats.successRate, 0) / resources.length || 0,
            totalCompletions: resources.reduce((sum, r) => sum + r.stats.completions, 0),
            bySubject: this.getStatsBySubject(),
            byFormat: this.getStatsByFormat(),
            recentActivity: this.getRecentActivity()
        };
    }

    /**
     * Statistiques par matière
     */
    getStatsBySubject() {
        const resources = this.getAllResources();
        const stats = {};
        
        resources.forEach(resource => {
            if (!stats[resource.subject]) {
                stats[resource.subject] = {
                    count: 0,
                    students: 0,
                    successRate: 0
                };
            }
            
            stats[resource.subject].count++;
            stats[resource.subject].students += resource.stats.students;
            stats[resource.subject].successRate = 
                (stats[resource.subject].successRate + resource.stats.successRate) / 2;
        });
        
        return stats;
    }

    /**
     * Statistiques par format
     */
    getStatsByFormat() {
        const resources = this.getAllResources();
        const stats = {};
        
        resources.forEach(resource => {
            if (!stats[resource.format]) {
                stats[resource.format] = 0;
            }
            stats[resource.format]++;
        });
        
        return stats;
    }

    /**
     * Activité récente
     */
    getRecentActivity(limit = 10) {
        const resources = this.getAllResources();
        
        return resources
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, limit)
            .map(resource => ({
                id: resource.id,
                title: resource.title,
                action: 'updated',
                timestamp: resource.updatedAt
            }));
    }

    /**
     * Dupliquer une ressource
     */
    duplicateResource(id) {
        const originalResource = this.getResourceById(id);
        if (!originalResource) {
            throw new Error('Ressource non trouvée');
        }

        const duplicatedResource = {
            ...originalResource,
            id: this.generateId(),
            title: `${originalResource.title} - Copie`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            stats: {
                students: 0,
                successRate: 0,
                averageTime: 0,
                completions: 0
            }
        };

        const resources = this.getAllResources();
        resources.push(duplicatedResource);
        this.setData('resources', resources);
        
        this.notifyObservers('resourceDuplicated', duplicatedResource);
        return duplicatedResource;
    }

    /**
     * Obtenir les catégories
     */
    getCategories() {
        return this.getData('categories') || [];
    }

    /**
     * Obtenir les templates
     */
    getTemplates() {
        return this.getData('templates') || [];
    }

    /**
     * Générer un ID unique
     */
    generateId() {
        return 'resource_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Exporter une ressource
     */
    exportResource(id) {
        const resource = this.getResourceById(id);
        if (!resource) {
            throw new Error('Ressource non trouvée');
        }

        return {
            ...resource,
            exportedAt: new Date().toISOString(),
            exportType: 'single_resource'
        };
    }

    /**
     * Importer une ressource
     */
    importResource(resourceData) {
        if (resourceData.exportType === 'single_resource') {
            // Générer un nouvel ID pour éviter les conflits
            const importedResource = {
                ...resourceData,
                id: this.generateId(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const resources = this.getAllResources();
            resources.push(importedResource);
            this.setData('resources', resources);
            
            this.notifyObservers('resourceImported', importedResource);
            return importedResource;
        }
        
        throw new Error('Format d\'import invalide');
    }
}