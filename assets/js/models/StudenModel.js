/**
 * StudentModel - Gère les données des étudiants
 */
class StudentModel extends BaseModel {
    constructor() {
        super();
        this.initializeDefaultData();
    }

    /**
     * Obtenir un étudiant par nom complet
     */
    getStudentByName(fullName) {
        const students = this.getAllStudents();
        return students.find(student => 
            `${student.firstName} ${student.lastName}` === fullName
        );
    }

    /**
     * Créer un nouvel étudiant
     */
    createStudent(studentData) {
        const validation = this.validate(studentData);
        if (!validation.isValid) {
            throw new Error('Données d\'étudiant invalides: ' + 
                validation.errors.map(e => e.message).join(', '));
        }

        const newStudent = {
            id: this.generateId(),
            ...studentData,
            avatar: null,
            progress: {
                overall: 0,
                timeSpent: 0,
                sessionsCompleted: 0,
                lastActivity: new Date().toISOString()
            },
            badges: [],
            gameStats: {},
            subjects: {},
            preferences: {
                difficulty: 'medium',
                gameType: 'quiz',
                notifications: true
            }
        };

        const students = this.getAllStudents();
        students.push(newStudent);
        this.setData('students', students);
        
        this.notifyObservers('studentCreated', newStudent);
        return newStudent;
    }

    /**
     * Mettre à jour un étudiant
     */
    updateStudent(id, updateData) {
        const students = this.getAllStudents();
        const index = students.findIndex(student => student.id === id);
        
        if (index === -1) {
            throw new Error('Étudiant non trouvé');
        }

        const updatedStudent = {
            ...students[index],
            ...updateData
        };

        students[index] = updatedStudent;
        this.setData('students', students);
        
        this.notifyObservers('studentUpdated', updatedStudent);
        return updatedStudent;
    }

    /**
     * Supprimer un étudiant
     */
    deleteStudent(id) {
        const students = this.getAllStudents();
        const index = students.findIndex(student => student.id === id);
        
        if (index === -1) {
            throw new Error('Étudiant non trouvé');
        }

        const deletedStudent = students.splice(index, 1)[0];
        this.setData('students', students);
        
        this.notifyObservers('studentDeleted', deletedStudent);
        return deletedStudent;
    }

    /**
     * Mettre à jour la progression d'un étudiant
     */
    updateProgress(studentId, progressData) {
        const student = this.getStudentById(studentId);
        if (!student) {
            throw new Error('Étudiant non trouvé');
        }

        const updatedProgress = {
            ...student.progress,
            ...progressData,
            lastActivity: new Date().toISOString()
        };

        return this.updateStudent(studentId, { progress: updatedProgress });
    }

    /**
     * Ajouter un badge à un étudiant
     */
    addBadge(studentId, badgeId) {
        const student = this.getStudentById(studentId);
        const badge = this.getBadgeById(badgeId);
        
        if (!student || !badge) {
            throw new Error('Étudiant ou badge non trouvé');
        }

        // Vérifier si le badge n'est pas déjà attribué
        const hasBadge = student.badges.some(b => b.id === badgeId);
        if (hasBadge) {
            return student;
        }

        const newBadge = {
            ...badge,
            earnedAt: new Date().toISOString()
        };

        const updatedBadges = [...student.badges, newBadge];
        const updatedStudent = this.updateStudent(studentId, { badges: updatedBadges });
        
        this.notifyObservers('badgeEarned', { student: updatedStudent, badge: newBadge });
        return updatedStudent;
    }

    /**
     * Mettre à jour les statistiques de jeu
     */
    updateGameStats(studentId, gameId, score) {
        const student = this.getStudentById(studentId);
        if (!student) {
            throw new Error('Étudiant non trouvé');
        }

        const updatedGameStats = {
            ...student.gameStats,
            [gameId]: score
        };

        return this.updateStudent(studentId, { gameStats: updatedGameStats });
    }

    /**
     * Obtenir les étudiants par classe
     */
    getStudentsByClass(className) {
        const students = this.getAllStudents();
        return students.filter(student => student.class === className);
    }

    /**
     * Obtenir les étudiants par groupe
     */
    getStudentsByGroup(groupName) {
        const students = this.getAllStudents();
        return students.filter(student => student.group === groupName);
    }

    /**
     * Obtenir le top des étudiants
     */
    getTopStudents(limit = 10) {
        const students = this.getAllStudents();
        return students
            .sort((a, b) => b.progress.overall - a.progress.overall)
            .slice(0, limit);
    }

    /**
     * Obtenir les étudiants en difficulté
     */
    getStudentsInDifficulty(threshold = 50) {
        const students = this.getAllStudents();
        return students.filter(student => student.progress.overall < threshold);
    }

    /**
     * Obtenir les statistiques globales des étudiants
     */
    getGlobalStats() {
        const students = this.getAllStudents();
        
        if (students.length === 0) {
            return {
                totalStudents: 0,
                averageProgress: 0,
                totalTimeSpent: 0,
                totalBadges: 0,
                activeStudents: 0
            };
        }

        return {
            totalStudents: students.length,
            averageProgress: students.reduce((sum, s) => sum + s.progress.overall, 0) / students.length,
            totalTimeSpent: students.reduce((sum, s) => sum + s.progress.timeSpent, 0),
            totalBadges: students.reduce((sum, s) => sum + s.badges.length, 0),
            activeStudents: this.getActiveStudents().length,
            byClass: this.getStatsByClass(),
            topPerformers: this.getTopStudents(3),
            needHelp: this.getStudentsInDifficulty()
        };
    }

    /**
     * Obtenir les étudiants actifs (activité récente)
     */
    getActiveStudents(hoursThreshold = 24) {
        const students = this.getAllStudents();
        const threshold = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000);
        
        return students.filter(student => 
            new Date(student.progress.lastActivity) > threshold
        );
    }

    /**
     * Statistiques par classe
     */
    getStatsByClass() {
        const students = this.getAllStudents();
        const stats = {};
        
        students.forEach(student => {
            if (!stats[student.class]) {
                stats[student.class] = {
                    count: 0,
                    averageProgress: 0,
                    totalTimeSpent: 0
                };
            }
            
            stats[student.class].count++;
            stats[student.class].averageProgress += student.progress.overall;
            stats[student.class].totalTimeSpent += student.progress.timeSpent;
        });
        
        // Calculer les moyennes
        Object.keys(stats).forEach(className => {
            stats[className].averageProgress /= stats[className].count;
        });
        
        return stats;
    }

    /**
     * Obtenir tous les badges disponibles
     */
    getAllBadges() {
        return this.getData('badges') || [];
    }

    /**
     * Obtenir un badge par ID
     */
    getBadgeById(id) {
        const badges = this.getAllBadges();
        return badges.find(badge => badge.id === id);
    }

    /**
     * Obtenir toutes les classes
     */
    getAllClasses() {
        return this.getData('classes') || [];
    }

    /**
     * Rechercher des étudiants
     */
    searchStudents(query) {
        const students = this.getAllStudents();
        const searchTerm = query.toLowerCase();
        
        return students.filter(student => {
            const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
            const email = student.email.toLowerCase();
            const className = student.class.toLowerCase();
            
            return fullName.includes(searchTerm) || 
                   email.includes(searchTerm) || 
                   className.includes(searchTerm);
        });
    }

    /**
     * Générer des recommandations pour un étudiant
     */
    generateRecommendations(studentId) {
        const student = this.getStudentById(studentId);
        if (!student) {
            throw new Error('Étudiant non trouvé');
        }

        const recommendations = [];
        
        // Analyse de la progression
        if (student.progress.overall >= 90) {
            recommendations.push({
                type: 'strength',
                icon: '🌟',
                title: 'Excellent élève',
                message: 'Performance exceptionnelle dans tous les domaines'
            });
        } else if (student.progress.overall < 50) {
            recommendations.push({
                type: 'help',
                icon: '💡',
                title: 'Besoin d\'aide',
                message: 'Proposer un soutien personnalisé'
            });
        }
        
        // Analyse des jeux
        const gameStats = student.gameStats;
        const bestGame = Object.keys(gameStats).reduce((a, b) => 
            gameStats[a] > gameStats[b] ? a : b, Object.keys(gameStats)[0]
        );
        
        if (bestGame) {
            recommendations.push({
                type: 'suggestion',
                icon: '🎮',
                title: 'Jeu favori identifié',
                message: `Excellente performance en ${bestGame}`
            });
        }
        
        // Analyse du temps d'activité
        if (student.progress.timeSpent < 60) {
            recommendations.push({
                type: 'engagement',
                icon: '⏱️',
                title: 'Augmenter l\'engagement',
                message: 'Encourager plus de temps d\'activité'
            });
        }
        
        return recommendations;
    }

    /**
     * Exporter les données d'un étudiant (RGPD)
     */
    exportStudentData(studentId) {
        const student = this.getStudentById(studentId);
        if (!student) {
            throw new Error('Étudiant non trouvé');
        }

        return {
            ...student,
            exportedAt: new Date().toISOString(),
            exportType: 'student_data',
            privacy: {
                dataRetention: 'Conservé tant que l\'élève est inscrit',
                accessRights: 'L\'élève et ses parents peuvent demander modification ou suppression'
            }
        };
    }

    /**
     * Générer un ID unique pour les étudiants
     */
    generateId() {
        return 'student_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Calculer le niveau d'un étudiant dans une matière
     */
    calculateSubjectLevel(studentId, subject) {
        const student = this.getStudentById(studentId);
        if (!student || !student.subjects[subject]) {
            return null;
        }

        const progress = student.subjects[subject].progress;
        
        if (progress >= 95) return 'A+';
        if (progress >= 90) return 'A';
        if (progress >= 85) return 'A-';
        if (progress >= 80) return 'B+';
        if (progress >= 75) return 'B';
        if (progress >= 70) return 'B-';
        if (progress >= 65) return 'C+';
        if (progress >= 60) return 'C';
        if (progress >= 55) return 'C-';
        return 'D';
    }

    /**
     * Obtenir l'historique d'activité d'un étudiant
     */
    getStudentActivityHistory(studentId, limit = 20) {
        // En production, ceci viendrait d'une base de données avec horodatage
        const student = this.getStudentById(studentId);
        if (!student) {
            return [];
        }

        // Simulation d'un historique d'activité
        return [
            { type: 'completion', activity: 'Chapitre terminé', timestamp: student.progress.lastActivity },
            { type: 'badge', activity: 'Badge obtenu', timestamp: student.badges[student.badges.length - 1]?.earnedAt },
            { type: 'game', activity: 'Mini-jeu joué', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() }
        ].filter(item => item.timestamp).slice(0, limit);
    }
}
     * Initialiser les données par défaut
     */
    initializeDefaultData() {
        if (Object.keys(this.data).length === 0) {
            this.data = {
                students: [
                    {
                        id: 'emma-martin',
                        firstName: 'Emma',
                        lastName: 'Martin',
                        email: 'emma.martin@student.fr',
                        class: 'CM2',
                        group: 'Groupe A',
                        avatar: null,
                        progress: {
                            overall: 87,
                            timeSpent: 135, // minutes cette semaine
                            sessionsCompleted: 12,
                            lastActivity: '2024-03-20T10:30:00Z'
                        },
                        badges: [
                            { id: 'gold', icon: '🥇', name: 'Médaille d\'Or', earnedAt: '2024-03-15T14:20:00Z' },
                            { id: 'silver', icon: '🥈', name: 'Médaille d\'Argent', earnedAt: '2024-03-10T11:15:00Z' },
                            { id: 'bronze', icon: '🥉', name: 'Médaille de Bronze', earnedAt: '2024-03-08T16:45:00Z' },
                            { id: 'detective', icon: '🕵️', name: 'Détective Expert', earnedAt: '2024-03-18T09:30:00Z' }
                        ],
                        gameStats: {
                            'chasse-indices': 95,
                            'quiz-interactifs': 89,
                            'puzzles-educatifs': 83,
                            'memory-concepts': 91
                        },
                        subjects: {
                            'français': { level: 'A', progress: 92 },
                            'mathématiques': { level: 'B+', progress: 78 },
                            'sciences': { level: 'A-', progress: 85 }
                        },
                        preferences: {
                            difficulty: 'medium',
                            gameType: 'puzzle',
                            notifications: true
                        }
                    },
                    {
                        id: 'lucas-dubois',
                        firstName: 'Lucas',
                        lastName: 'Dubois',
                        email: 'lucas.dubois@student.fr',
                        class: 'CM2',
                        group: 'Groupe A',
                        avatar: null,
                        progress: {
                            overall: 73,
                            timeSpent: 105,
                            sessionsCompleted: 8,
                            lastActivity: '2024-03-19T15:45:00Z'
                        },
                        badges: [
                            { id: 'silver', icon: '🥈', name: 'Médaille d\'Argent', earnedAt: '2024-03-12T10:20:00Z' },
                            { id: 'bronze', icon: '🥉', name: 'Médaille de Bronze', earnedAt: '2024-03-07T14:15:00Z' }
                        ],
                        gameStats: {
                            'chasse-indices': 78,
                            'quiz-interactifs': 72,
                            'puzzles-educatifs': 69,
                            'memory-concepts': 74
                        },
                        subjects: {
                            'français': { level: 'B', progress: 75 },
                            'mathématiques': { level: 'B-', progress: 68 },
                            'sciences': { level: 'B+', progress: 76 }
                        },
                        preferences: {
                            difficulty: 'easy',
                            gameType: 'quiz',
                            notifications: true
                        }
                    },
                    {
                        id: 'chloe-durand',
                        firstName: 'Chloé',
                        lastName: 'Durand',
                        email: 'chloe.durand@student.fr',
                        class: 'CM2',
                        group: 'Groupe B',
                        avatar: null,
                        progress: {
                            overall: 91,
                            timeSpent: 150,
                            sessionsCompleted: 15,
                            lastActivity: '2024-03-20T11:20:00Z'
                        },
                        badges: [
                            { id: 'gold', icon: '🥇', name: 'Médaille d\'Or', earnedAt: '2024-03-16T13:30:00Z' },
                            { id: 'gold2', icon: '🥇', name: 'Double Or', earnedAt: '2024-03-18T10:45:00Z' },
                            { id: 'trophy', icon: '🏆', name: 'Champion', earnedAt: '2024-03-19T16:20:00Z' }
                        ],
                        gameStats: {
                            'chasse-indices': 98,
                            'quiz-interactifs': 94,
                            'puzzles-educatifs': 87,
                            'memory-concepts': 96
                        },
                        subjects: {
                            'français': { level: 'A+', progress: 97 },
                            'mathématiques': { level: 'A', progress: 89 },
                            'sciences': { level: 'A+', progress: 93 }
                        },
                        preferences: {
                            difficulty: 'hard',
                            gameType: 'memory',
                            notifications: false
                        }
                    },
                    {
                        id: 'theo-moreau',
                        firstName: 'Théo',
                        lastName: 'Moreau',
                        email: 'theo.moreau@student.fr',
                        class: 'CM2',
                        group: 'Groupe B',
                        avatar: null,
                        progress: {
                            overall: 45,
                            timeSpent: 80,
                            sessionsCompleted: 4,
                            lastActivity: '2024-03-18T09:15:00Z'
                        },
                        badges: [
                            { id: 'bronze', icon: '🥉', name: 'Médaille de Bronze', earnedAt: '2024-03-05T12:30:00Z' }
                        ],
                        gameStats: {
                            'chasse-indices': 52,
                            'quiz-interactifs': 48,
                            'puzzles-educatifs': 41,
                            'memory-concepts': 38
                        },
                        subjects: {
                            'français': { level: 'C+', progress: 48 },
                            'mathématiques': { level: 'C', progress: 42 },
                            'sciences': { level: 'C+', progress: 45 }
                        },
                        preferences: {
                            difficulty: 'easy',
                            gameType: 'quiz',
                            notifications: true
                        }
                    }
                ],
                classes: [
                    { id: 'cm2-a', name: 'CM2 - Groupe A', studentCount: 15 },
                    { id: 'cm2-b', name: 'CM2 - Groupe B', studentCount: 13 },
                    { id: 'cm1', name: 'CM1', studentCount: 18 }
                ],
                badges: [
                    { id: 'bronze', icon: '🥉', name: 'Médaille de Bronze', description: 'Premier exercice terminé' },
                    { id: 'silver', icon: '🥈', name: 'Médaille d\'Argent', description: '5 exercices terminés' },
                    { id: 'gold', icon: '🥇', name: 'Médaille d\'Or', description: '10 exercices terminés' },
                    { id: 'detective', icon: '🕵️', name: 'Détective Expert', description: 'Excellence en inférences' },
                    { id: 'trophy', icon: '🏆', name: 'Champion', description: 'Top 3 de la classe' },
                    { id: 'mentor', icon: '👨‍🏫', name: 'Mentor', description: 'Aide aux autres élèves' }
                ]
            };
            this.saveToStorage();
        }
    }

    /**
     * Règles de validation pour les étudiants
     */
    getValidationRules() {
        return {
            firstName: {
                required: true,
                type: 'string',
                message: 'Le prénom est requis'
            },
            lastName: {
                required: true,
                type: 'string',
                message: 'Le nom est requis'
            },
            email: {
                required: true,
                type: 'email',
                message: 'Un email valide est requis'
            },
            class: {
                required: true,
                type: 'string',
                message: 'La classe est requise'
            }
        };
    }

    /**
     * Obtenir tous les étudiants
     */
    getAllStudents() {
        return this.getData('students') || [];
    }

    /**
     * Obtenir un étudiant par ID
     */
    getStudentById(id) {
        const students = this.getAllStudents();
        return students.find(student => student.id === id);
    }

    /**