/**
 * SmartTasks - Module de calcul des dates
 * Implémentation complète du Critical Path Method (CPM)
 * avec support des 4 types de dépendances et propagation automatique
 *
 * @author Agent Ralph Wiggum 2/4
 * @version 1.0.0
 */

// Types de dépendances
var DEPENDENCY_TYPES = {
    FS: 'Finish-to-Start',   // Le successeur commence après la fin du prédécesseur
    SS: 'Start-to-Start',    // Le successeur commence après le début du prédécesseur
    FF: 'Finish-to-Finish',  // Le successeur finit après la fin du prédécesseur
    SF: 'Start-to-Finish'    // Le successeur finit après le début du prédécesseur
};

/**
 * Ajoute des jours ouvrables à une date (excluant samedi et dimanche)
 * @param {Date} date - Date de départ
 * @param {number} days - Nombre de jours à ajouter (peut être négatif)
 * @returns {Date} Nouvelle date
 */
function addWorkingDays(date, days) {
    var result = new Date(date);
    var direction = days >= 0 ? 1 : -1;
    var remainingDays = Math.abs(days);

    while (remainingDays > 0) {
        result.setDate(result.getDate() + direction);
        var dayOfWeek = result.getDay();
        // 0 = Dimanche, 6 = Samedi
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            remainingDays--;
        }
    }

    return result;
}

/**
 * Calcule le nombre de jours ouvrables entre deux dates
 * @param {Date} startDate - Date de début
 * @param {Date} endDate - Date de fin
 * @returns {number} Nombre de jours ouvrables
 */
function getWorkingDaysBetween(startDate, endDate) {
    var start = new Date(startDate);
    var end = new Date(endDate);
    var count = 0;
    var current = new Date(start);

    while (current <= end) {
        var dayOfWeek = current.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            count++;
        }
        current.setDate(current.getDate() + 1);
    }

    return count;
}

/**
 * Clone une date pour éviter les mutations
 * @param {Date} date - Date à cloner
 * @returns {Date} Copie de la date
 */
function cloneDate(date) {
    return new Date(date.getTime());
}

/**
 * Calcule la date de début et de fin du successeur selon le type de dépendance
 * @param {Date} predecessorStart - Date de début du prédécesseur
 * @param {Date} predecessorEnd - Date de fin du prédécesseur
 * @param {string} linkType - Type de dépendance: FS, SS, FF, SF
 * @param {number} lagDays - Délai en jours (positif=lag/retard, négatif=lead/avance)
 * @param {number} successorDuration - Durée du successeur en jours ouvrables
 * @returns {Object} {startDate: Date, endDate: Date}
 */
function calculateSuccessorDates(predecessorStart, predecessorEnd, linkType, lagDays, successorDuration) {
    var result = {
        startDate: null,
        endDate: null
    };

    // Valider les entrées
    if (!predecessorStart || !predecessorEnd) {
        throw new Error('Les dates du prédécesseur sont requises');
    }

    var predStart = cloneDate(predecessorStart);
    var predEnd = cloneDate(predecessorEnd);
    var lag = lagDays || 0;
    var duration = successorDuration || 1;

    switch (linkType) {
        case 'FS':
        case DEPENDENCY_TYPES.FS:
            // Finish-to-Start: Le successeur commence après la fin du prédécesseur
            // Formule: Successor Start = Predecessor Finish + Lag + 1
            result.startDate = addWorkingDays(predEnd, lag + 1);
            result.endDate = addWorkingDays(result.startDate, duration - 1);
            break;

        case 'SS':
        case DEPENDENCY_TYPES.SS:
            // Start-to-Start: Le successeur commence après le début du prédécesseur
            // Formule: Successor Start = Predecessor Start + Lag
            result.startDate = addWorkingDays(predStart, lag);
            result.endDate = addWorkingDays(result.startDate, duration - 1);
            break;

        case 'FF':
        case DEPENDENCY_TYPES.FF:
            // Finish-to-Finish: Le successeur finit après la fin du prédécesseur
            // Formule: Successor Finish = Predecessor Finish + Lag
            result.endDate = addWorkingDays(predEnd, lag);
            result.startDate = addWorkingDays(result.endDate, -(duration - 1));
            break;

        case 'SF':
        case DEPENDENCY_TYPES.SF:
            // Start-to-Finish: Le successeur finit après le début du prédécesseur
            // Formule: Successor Finish = Predecessor Start + Lag
            result.endDate = addWorkingDays(predStart, lag);
            result.startDate = addWorkingDays(result.endDate, -(duration - 1));
            break;

        default:
            // Par défaut, utiliser Finish-to-Start
            result.startDate = addWorkingDays(predEnd, lag + 1);
            result.endDate = addWorkingDays(result.startDate, duration - 1);
    }

    return result;
}

/**
 * Construit un graphe de dépendances à partir des tâches et dépendances
 * @param {Array} tasks - Tableau des tâches
 * @param {Array} dependencies - Tableau des dépendances
 * @returns {Object} Graphe {predecessors: Map, successors: Map}
 */
function buildDependencyGraph(tasks, dependencies) {
    var predecessors = {}; // taskId -> [{predecessorId, linkType, lag}]
    var successors = {};   // taskId -> [{successorId, linkType, lag}]

    // Initialiser les maps pour toutes les tâches
    tasks.forEach(function(task) {
        predecessors[task.id] = [];
        successors[task.id] = [];
    });

    // Remplir le graphe avec les dépendances
    dependencies.forEach(function(dep) {
        var predId = dep.predecessorId || dep.from;
        var succId = dep.successorId || dep.to;
        var linkType = dep.linkType || dep.type || 'FS';
        var lag = dep.lag || 0;

        if (predecessors[succId]) {
            predecessors[succId].push({
                predecessorId: predId,
                linkType: linkType,
                lag: lag
            });
        }

        if (successors[predId]) {
            successors[predId].push({
                successorId: succId,
                linkType: linkType,
                lag: lag
            });
        }
    });

    return {
        predecessors: predecessors,
        successors: successors
    };
}

/**
 * Effectue un tri topologique des tâches selon leurs dépendances
 * @param {Array} tasks - Tableau des tâches
 * @param {Object} graph - Graphe de dépendances
 * @returns {Array} Tâches triées topologiquement
 */
function topologicalSort(tasks, graph) {
    var sorted = [];
    var visited = {};
    var inStack = {};

    function visit(taskId) {
        if (inStack[taskId]) {
            throw new Error('Dépendance circulaire détectée impliquant la tâche: ' + taskId);
        }

        if (visited[taskId]) {
            return;
        }

        inStack[taskId] = true;

        var preds = graph.predecessors[taskId] || [];
        preds.forEach(function(pred) {
            visit(pred.predecessorId);
        });

        visited[taskId] = true;
        inStack[taskId] = false;
        sorted.push(taskId);
    }

    tasks.forEach(function(task) {
        if (!visited[task.id]) {
            visit(task.id);
        }
    });

    return sorted;
}

/**
 * Propage les changements de dates dans toute la chaîne de dépendances
 * @param {Array} tasks - Tableau des tâches avec {id, startDate, endDate, duration}
 * @param {Array} dependencies - Tableau des dépendances
 * @returns {Object} {tasks: Array, changes: Array} Tâches mises à jour et liste des changements
 */
function propagateChanges(tasks, dependencies) {
    // Créer une copie des tâches pour ne pas modifier l'original
    var taskMap = {};
    var tasksCopy = tasks.map(function(task) {
        var copy = {
            id: task.id,
            name: task.name || task.id,
            startDate: task.startDate ? cloneDate(task.startDate) : null,
            endDate: task.endDate ? cloneDate(task.endDate) : null,
            duration: task.duration || 1,
            isFixed: task.isFixed || false // Tâche avec date fixe non modifiable
        };
        taskMap[copy.id] = copy;
        return copy;
    });

    var changes = [];
    var graph = buildDependencyGraph(tasksCopy, dependencies);

    // Trier topologiquement pour respecter l'ordre des dépendances
    var sortedIds;
    try {
        sortedIds = topologicalSort(tasksCopy, graph);
    } catch (e) {
        return {
            tasks: tasksCopy,
            changes: changes,
            error: e.message
        };
    }

    // Propager les dates dans l'ordre topologique
    sortedIds.forEach(function(taskId) {
        var task = taskMap[taskId];
        if (!task || task.isFixed) return;

        var preds = graph.predecessors[taskId] || [];
        if (preds.length === 0) {
            // Tâche sans prédécesseur - garder les dates actuelles ou utiliser aujourd'hui
            if (!task.startDate) {
                task.startDate = new Date();
            }
            // Toujours calculer endDate basé sur startDate et duration
            if (!task.endDate || task.endDate < task.startDate) {
                task.endDate = addWorkingDays(task.startDate, task.duration - 1);
            }
            return;
        }

        // Calculer la date de début au plus tôt (Early Start)
        var calculatedDates = [];

        preds.forEach(function(pred) {
            var predecessor = taskMap[pred.predecessorId];
            if (!predecessor || !predecessor.startDate || !predecessor.endDate) return;

            var dates = calculateSuccessorDates(
                predecessor.startDate,
                predecessor.endDate,
                pred.linkType,
                pred.lag,
                task.duration
            );

            calculatedDates.push(dates);
        });

        if (calculatedDates.length > 0) {
            // Prendre la date de début la plus tardive (contrainte la plus forte)
            var latestStart = calculatedDates.reduce(function(latest, dates) {
                if (!latest || dates.startDate > latest) {
                    return dates.startDate;
                }
                return latest;
            }, null);

            var oldStartDate = task.startDate ? cloneDate(task.startDate) : null;
            var oldEndDate = task.endDate ? cloneDate(task.endDate) : null;

            task.startDate = latestStart;
            task.endDate = addWorkingDays(task.startDate, task.duration - 1);

            // Enregistrer le changement si les dates ont été modifiées
            if (!oldStartDate || task.startDate.getTime() !== oldStartDate.getTime()) {
                changes.push({
                    taskId: task.id,
                    taskName: task.name,
                    oldStartDate: oldStartDate,
                    newStartDate: cloneDate(task.startDate),
                    oldEndDate: oldEndDate,
                    newEndDate: cloneDate(task.endDate),
                    reason: 'Mise à jour suite aux dépendances'
                });
            }
        }
    });

    return {
        tasks: tasksCopy,
        changes: changes,
        error: null
    };
}

/**
 * Détecte les dépendances circulaires dans le graphe
 * Utilise l'algorithme DFS (Depth-First Search) avec coloration
 * @param {Array} tasks - Tableau des tâches
 * @param {Array} dependencies - Tableau des dépendances
 * @returns {Object} {hasCircular: boolean, cycles: Array}
 */
function detectCircularDependencies(tasks, dependencies) {
    var graph = buildDependencyGraph(tasks, dependencies);
    var cycles = [];

    // Couleurs: 0=blanc (non visité), 1=gris (en cours), 2=noir (terminé)
    var color = {};
    var parent = {};

    tasks.forEach(function(task) {
        color[task.id] = 0;
        parent[task.id] = null;
    });

    /**
     * Reconstruit le cycle à partir du noeud de détection
     */
    function reconstructCycle(startId, endId) {
        var cycle = [endId];
        var current = startId;

        while (current !== endId && current !== null) {
            cycle.unshift(current);
            current = parent[current];
        }

        if (current === endId) {
            cycle.unshift(endId);
        }

        return cycle;
    }

    /**
     * DFS avec détection de cycle
     */
    function dfs(taskId, path) {
        color[taskId] = 1; // Marquer comme en cours de visite
        path = path || [];
        path.push(taskId);

        var succs = graph.successors[taskId] || [];

        for (var i = 0; i < succs.length; i++) {
            var succId = succs[i].successorId;

            if (color[succId] === 1) {
                // Cycle détecté! Le successeur est déjà dans la pile de récursion
                var cycleStart = path.indexOf(succId);
                var cycle = path.slice(cycleStart);
                cycle.push(succId); // Fermer le cycle
                cycles.push({
                    tasks: cycle,
                    description: 'Cycle: ' + cycle.join(' -> ')
                });
            } else if (color[succId] === 0) {
                parent[succId] = taskId;
                dfs(succId, path.slice());
            }
        }

        color[taskId] = 2; // Marquer comme terminé
    }

    // Exécuter DFS depuis chaque noeud non visité
    tasks.forEach(function(task) {
        if (color[task.id] === 0) {
            dfs(task.id, []);
        }
    });

    return {
        hasCircular: cycles.length > 0,
        cycles: cycles
    };
}

/**
 * Calcule le chemin critique (Critical Path)
 * @param {Array} tasks - Tableau des tâches
 * @param {Array} dependencies - Tableau des dépendances
 * @returns {Object} {criticalPath: Array, totalDuration: number, earlyDates: Object, lateDates: Object}
 */
function calculateCriticalPath(tasks, dependencies) {
    // D'abord propager les dates pour avoir les Early Start/Finish
    var propagated = propagateChanges(tasks, dependencies);

    if (propagated.error) {
        return {
            criticalPath: [],
            totalDuration: 0,
            error: propagated.error
        };
    }

    var taskMap = {};
    propagated.tasks.forEach(function(task) {
        taskMap[task.id] = task;
    });

    var graph = buildDependencyGraph(propagated.tasks, dependencies);

    // Calculer Early Start (ES) et Early Finish (EF) - Forward Pass
    var earlyDates = {};
    propagated.tasks.forEach(function(task) {
        earlyDates[task.id] = {
            ES: task.startDate,
            EF: task.endDate
        };
    });

    // Trouver la date de fin du projet (la plus tardive)
    var projectEnd = propagated.tasks.reduce(function(latest, task) {
        if (!latest || (task.endDate && task.endDate > latest)) {
            return task.endDate;
        }
        return latest;
    }, null);

    // Calculer Late Start (LS) et Late Finish (LF) - Backward Pass
    var lateDates = {};
    var sortedIds = topologicalSort(propagated.tasks, graph);

    // Initialiser toutes les tâches avec la fin du projet
    propagated.tasks.forEach(function(task) {
        lateDates[task.id] = {
            LS: null,
            LF: projectEnd ? cloneDate(projectEnd) : null
        };
    });

    // Parcourir en ordre inverse
    var reversedIds = sortedIds.slice().reverse();

    reversedIds.forEach(function(taskId) {
        var task = taskMap[taskId];
        var succs = graph.successors[taskId] || [];

        if (succs.length === 0) {
            // Tâche finale - LF = date de fin du projet
            lateDates[taskId].LF = projectEnd ? cloneDate(projectEnd) : cloneDate(task.endDate);
            lateDates[taskId].LS = addWorkingDays(lateDates[taskId].LF, -(task.duration - 1));
        } else {
            // Calculer LF comme le minimum des LS des successeurs (ajusté selon le type de dépendance)
            var earliestLF = null;

            succs.forEach(function(succ) {
                var successorLateDates = lateDates[succ.successorId];
                var successorTask = taskMap[succ.successorId];

                if (!successorLateDates || !successorLateDates.LS) return;

                var constraintDate;

                switch (succ.linkType) {
                    case 'FS':
                        // LF du prédécesseur = LS du successeur - lag - 1
                        constraintDate = addWorkingDays(successorLateDates.LS, -succ.lag - 1);
                        break;
                    case 'SS':
                        // LS du prédécesseur = LS du successeur - lag
                        // Donc LF = LS + duration - 1
                        var predLS = addWorkingDays(successorLateDates.LS, -succ.lag);
                        constraintDate = addWorkingDays(predLS, task.duration - 1);
                        break;
                    case 'FF':
                        // LF du prédécesseur = LF du successeur - lag
                        constraintDate = addWorkingDays(successorLateDates.LF, -succ.lag);
                        break;
                    case 'SF':
                        // LS du prédécesseur = LF du successeur - lag
                        var predLSsf = addWorkingDays(successorLateDates.LF, -succ.lag);
                        constraintDate = addWorkingDays(predLSsf, task.duration - 1);
                        break;
                    default:
                        constraintDate = addWorkingDays(successorLateDates.LS, -succ.lag - 1);
                }

                if (!earliestLF || constraintDate < earliestLF) {
                    earliestLF = constraintDate;
                }
            });

            if (earliestLF) {
                lateDates[taskId].LF = earliestLF;
                lateDates[taskId].LS = addWorkingDays(earliestLF, -(task.duration - 1));
            }
        }
    });

    // Calculer le float (marge) et identifier le chemin critique
    var criticalPath = [];
    var taskFloats = {};

    propagated.tasks.forEach(function(task) {
        var early = earlyDates[task.id];
        var late = lateDates[task.id];

        if (early && early.ES && late && late.LS) {
            var float = getWorkingDaysBetween(early.ES, late.LS) - 1;
            taskFloats[task.id] = float;

            // Float = 0 signifie que la tâche est sur le chemin critique
            if (float <= 0) {
                criticalPath.push({
                    id: task.id,
                    name: task.name,
                    duration: task.duration,
                    ES: early.ES,
                    EF: early.EF,
                    LS: late.LS,
                    LF: late.LF,
                    float: float
                });
            }
        }
    });

    // Calculer la durée totale du projet
    var totalDuration = 0;
    if (projectEnd) {
        var projectStart = propagated.tasks.reduce(function(earliest, task) {
            if (!earliest || (task.startDate && task.startDate < earliest)) {
                return task.startDate;
            }
            return earliest;
        }, null);

        if (projectStart) {
            totalDuration = getWorkingDaysBetween(projectStart, projectEnd);
        }
    }

    return {
        criticalPath: criticalPath,
        totalDuration: totalDuration,
        projectStart: propagated.tasks.reduce(function(earliest, task) {
            if (!earliest || (task.startDate && task.startDate < earliest)) {
                return task.startDate;
            }
            return earliest;
        }, null),
        projectEnd: projectEnd,
        earlyDates: earlyDates,
        lateDates: lateDates,
        floats: taskFloats,
        allTasks: propagated.tasks
    };
}

/**
 * Valide une dépendance avant de l'ajouter
 * @param {Array} tasks - Tableau des tâches
 * @param {Array} existingDependencies - Dépendances existantes
 * @param {Object} newDependency - Nouvelle dépendance à valider
 * @returns {Object} {isValid: boolean, errors: Array, warnings: Array}
 */
function validateDependency(tasks, existingDependencies, newDependency) {
    var errors = [];
    var warnings = [];

    var predId = newDependency.predecessorId || newDependency.from;
    var succId = newDependency.successorId || newDependency.to;
    var linkType = newDependency.linkType || newDependency.type || 'FS';

    // Vérifier que les tâches existent
    var taskMap = {};
    tasks.forEach(function(task) {
        taskMap[task.id] = task;
    });

    if (!taskMap[predId]) {
        errors.push('La tâche prédécesseur "' + predId + '" n\'existe pas');
    }

    if (!taskMap[succId]) {
        errors.push('La tâche successeur "' + succId + '" n\'existe pas');
    }

    // Vérifier que ce n'est pas une auto-dépendance
    if (predId === succId) {
        errors.push('Une tâche ne peut pas dépendre d\'elle-même');
    }

    // Vérifier que le type de dépendance est valide
    var validTypes = ['FS', 'SS', 'FF', 'SF'];
    if (validTypes.indexOf(linkType) === -1) {
        errors.push('Type de dépendance invalide: ' + linkType + '. Types valides: ' + validTypes.join(', '));
    }

    // Vérifier si cette dépendance existe déjà
    var exists = existingDependencies.some(function(dep) {
        var existPred = dep.predecessorId || dep.from;
        var existSucc = dep.successorId || dep.to;
        return existPred === predId && existSucc === succId;
    });

    if (exists) {
        warnings.push('Une dépendance entre ces deux tâches existe déjà');
    }

    // Vérifier si l'ajout créerait un cycle
    if (errors.length === 0) {
        var testDependencies = existingDependencies.slice();
        testDependencies.push(newDependency);

        var circularCheck = detectCircularDependencies(tasks, testDependencies);
        if (circularCheck.hasCircular) {
            errors.push('Cette dépendance créerait un cycle: ' + circularCheck.cycles[0].description);
        }
    }

    return {
        isValid: errors.length === 0,
        errors: errors,
        warnings: warnings
    };
}

/**
 * Met à jour une tâche et propage automatiquement les changements
 * @param {Array} tasks - Tableau des tâches
 * @param {Array} dependencies - Tableau des dépendances
 * @param {string} taskId - ID de la tâche à mettre à jour
 * @param {Object} updates - Mises à jour {startDate, endDate, duration}
 * @returns {Object} Résultat de la propagation
 */
function updateTaskAndPropagate(tasks, dependencies, taskId, updates) {
    // Trouver et mettre à jour la tâche
    var updatedTasks = tasks.map(function(task) {
        if (task.id === taskId) {
            var updated = Object.assign({}, task);

            if (updates.startDate !== undefined) {
                updated.startDate = updates.startDate;
            }
            if (updates.endDate !== undefined) {
                updated.endDate = updates.endDate;
            }
            if (updates.duration !== undefined) {
                updated.duration = updates.duration;
                // Recalculer la date de fin si la durée change
                if (updated.startDate) {
                    updated.endDate = addWorkingDays(updated.startDate, updated.duration - 1);
                }
            }

            return updated;
        }
        return Object.assign({}, task);
    });

    // Propager les changements
    return propagateChanges(updatedTasks, dependencies);
}

/**
 * Formate une date en chaîne lisible
 * @param {Date} date - Date à formater
 * @returns {string} Date formatée
 */
function formatDate(date) {
    if (!date) return 'N/A';
    var options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString('fr-FR', options);
}

/**
 * Génère un rapport de projet
 * @param {Array} tasks - Tableau des tâches
 * @param {Array} dependencies - Tableau des dépendances
 * @returns {Object} Rapport complet
 */
function generateProjectReport(tasks, dependencies) {
    var criticalPathResult = calculateCriticalPath(tasks, dependencies);
    var circularCheck = detectCircularDependencies(tasks, dependencies);

    return {
        summary: {
            totalTasks: tasks.length,
            totalDependencies: dependencies.length,
            projectStart: formatDate(criticalPathResult.projectStart),
            projectEnd: formatDate(criticalPathResult.projectEnd),
            totalDuration: criticalPathResult.totalDuration + ' jours ouvrables',
            hasCircularDependencies: circularCheck.hasCircular
        },
        criticalPath: {
            tasks: criticalPathResult.criticalPath.map(function(task) {
                return {
                    id: task.id,
                    name: task.name,
                    duration: task.duration + ' jours',
                    start: formatDate(task.ES),
                    end: formatDate(task.EF),
                    float: task.float + ' jours'
                };
            }),
            count: criticalPathResult.criticalPath.length
        },
        allTasks: criticalPathResult.allTasks.map(function(task) {
            return {
                id: task.id,
                name: task.name,
                duration: task.duration + ' jours',
                start: formatDate(task.startDate),
                end: formatDate(task.endDate),
                float: (criticalPathResult.floats[task.id] || 0) + ' jours',
                isCritical: criticalPathResult.floats[task.id] <= 0
            };
        }),
        issues: circularCheck.hasCircular ? circularCheck.cycles : []
    };
}

// Export pour utilisation en module (Node.js / ES6)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DEPENDENCY_TYPES: DEPENDENCY_TYPES,
        addWorkingDays: addWorkingDays,
        getWorkingDaysBetween: getWorkingDaysBetween,
        calculateSuccessorDates: calculateSuccessorDates,
        propagateChanges: propagateChanges,
        detectCircularDependencies: detectCircularDependencies,
        calculateCriticalPath: calculateCriticalPath,
        validateDependency: validateDependency,
        updateTaskAndPropagate: updateTaskAndPropagate,
        generateProjectReport: generateProjectReport,
        formatDate: formatDate
    };
}

// Export pour navigateur (variable globale)
if (typeof window !== 'undefined') {
    window.SmartTasksDateCalculation = {
        DEPENDENCY_TYPES: DEPENDENCY_TYPES,
        addWorkingDays: addWorkingDays,
        getWorkingDaysBetween: getWorkingDaysBetween,
        calculateSuccessorDates: calculateSuccessorDates,
        propagateChanges: propagateChanges,
        detectCircularDependencies: detectCircularDependencies,
        calculateCriticalPath: calculateCriticalPath,
        validateDependency: validateDependency,
        updateTaskAndPropagate: updateTaskAndPropagate,
        generateProjectReport: generateProjectReport,
        formatDate: formatDate
    };
}
