/**
 * UserModel - Gère les données de l'utilisateur/enseignant
 */
class UserModel extends BaseModel {
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
                profile: {
                    firstName: 'Marie',
                    lastName: 'Dubois',
                    email: 'marie.dubois@ecole.fr',
                    school: 'École Élémentaire Jules Ferry',
                    subject: 'Enseignant polyvalent',
                    level: 'CM2',
                    avatar: null
                },
                preferences: {
                    theme: 'light',
                    language: 'fr',
                    notifications: {
                        email: true,
                        browser: false,
                        difficulty: true,
                        achievements: true
                    },
                    accessibility: {
                        highContrast: false,
                        largeText: false,
                        reducedMotion: false
                    }
                },
                settings: {
                    autoSave: true,
                    dataAnonymization: true,
                    backupFrequency: 'daily'
                },
                stats: {
                    resourcesCreated: 0,
                    totalStudents: 0,
                    totalSessions: 0,
                    joinDate: new Date().toISOString()
                }
            };
            this.saveToStorage();
        }
    }

    /**
     * Règles de validation pour les données utilisateur
     */
    getValidationRules() {
        return {
            'profile.firstName': {
                required: true,
                type: 'string',
                message: 'Le prénom est requis'
            },
            'profile.lastName': {
                required: true,
                type: 'string',
                message: 'Le nom est requis'
            },
            'profile.email': {
                required: true,
                type: 'email',
                message: 'Un email valide est requis'
            },
            'profile.school': {
                required: true,
                type: 'string',
                message: 'L\'établissement est requis'
            }
        };
    }

    /**
     * Obtenir le profil complet
     */
    getProfile() {
        return this.getData('profile');
    }

    /**
     * Mettre à jour le profil
     */
    updateProfile(profileData) {
        const validation = this.validate({
            'profile.firstName': profileData.firstName,
            'profile.lastName': profileData.lastName,
            'profile.email': profileData.email,
            'profile.school': profileData.school
        });

        if (!validation.isValid) {
            throw new Error('Données de profil invalides: ' + 
                validation.errors.map(e => e.message).join(', '));
        }

        const currentProfile = this.getProfile();
        const updatedProfile = { ...currentProfile, ...profileData };
        
        this.setData('profile', updatedProfile);
        this.notifyObservers('profileUpdated', updatedProfile);
        
        return updatedProfile;
    }

    /**
     * Obtenir les préférences
     */
    getPreferences() {
        return this.getData('preferences');
    }

    /**
     * Mettre à jour les préférences
     