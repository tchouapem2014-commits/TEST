/**
 * SMARTTASKS (ST)
 * Version 1.0.0
 *
 * Gestion intelligente des dependances de taches avec calcul
 * automatique des dates - Inspire de Helix Plan
 *
 * Fonctionnalites:
 * - 4 types de dependances (FS, SS, FF, SF)
 * - Calcul automatique des dates avec lag/lead time
 * - Propagation en cascade
 * - Detection des cycles
 * - Visualisation des chaines de dependances
 *
 * @author SmartTasks Team
 * @version 1.0.0
 */

(function() {
    'use strict';

    // ============================================================
    // CONSTANTES
    // ============================================================
    var ST_VERSION = "1.0.0";
    var ST_PREFIX = "[ST]";
    var ST_GUID = "c7e9f3a1-5b28-4d6c-9e1f-8a2b3c4d5e6f";
    var CUSTOM_PROPERTY_NAME = "SmartTasksLinks";
    var ARTIFACT_TYPE_TASK = 6;

    // Types de dependances
    var DEPENDENCY_TYPES = {
        FS: { code: 'FS', name: 'Finish-to-Start', description: 'Le successeur commence apres la fin du predecesseur' },
        SS: { code: 'SS', name: 'Start-to-Start', description: 'Le successeur commence apres le debut du predecesseur' },
        FF: { code: 'FF', name: 'Finish-to-Finish', description: 'Le successeur finit apres la fin du predecesseur' },
        SF: { code: 'SF', name: 'Start-to-Finish', description: 'Le successeur finit apres le debut du predecesseur' }
    };

    // ============================================================
    // ETAT GLOBAL
    // ============================================================
    var stState = {
        settings: null,
        debugMode: false,
        autoCalculate: true,
        defaultLinkType: 'FS',
        defaultLag: 0,
        cascadePropagation: true,
        skipWeekends: false,
        currentTaskId: null,
        currentProjectId: null,
        dependencies: [],
        taskCache: {},
        dialogOpen: false
    };

    // ============================================================
    // LOGGING
    // ============================================================
    function log(level, message, data) {
        if (!stState.debugMode && level !== "ERROR") return;
        var prefix = ST_PREFIX + " [" + level + "]";
        if (data !== undefined) {
            console.log(prefix, message, data);
        } else {
            console.log(prefix, message);
        }
    }

    // ============================================================
    // UTILITAIRES DATE
    // ============================================================

    /**
     * Clone une date pour eviter les mutations
     */
    function cloneDate(date) {
        if (!date) return null;
        if (typeof date === 'string') {
            return new Date(date);
        }
        return new Date(date.getTime());
    }

    /**
     * Ajoute des jours ouvrables a une date (excluant samedi et dimanche si skipWeekends)
     */
    function addWorkingDays(date, days) {
        var result = cloneDate(date);
        if (!result) return null;

        if (!stState.skipWeekends) {
            // Mode simple: ajouter tous les jours
            result.setDate(result.getDate() + days);
            return result;
        }

        // Mode avec week-ends exclus
        var direction = days >= 0 ? 1 : -1;
        var remainingDays = Math.abs(days);

        while (remainingDays > 0) {
            result.setDate(result.getDate() + direction);
            var dayOfWeek = result.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                remainingDays--;
            }
        }

        return result;
    }

    /**
     * Calcule le nombre de jours ouvrables entre deux dates
     */
    function getWorkingDaysBetween(startDate, endDate) {
        var start = cloneDate(startDate);
        var end = cloneDate(endDate);
        if (!start || !end) return 0;

        if (!stState.skipWeekends) {
            return Math.round((end - start) / (1000 * 60 * 60 * 24));
        }

        var count = 0;
        var current = cloneDate(start);

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
     * Formate une date en ISO string pour API SpiraPlan
     */
    function formatDateISO(date) {
        if (!date) return null;
        var d = cloneDate(date);
        return d.toISOString();
    }

    /**
     * Formate une date pour affichage
     */
    function formatDateDisplay(date) {
        if (!date) return 'N/A';
        var d = cloneDate(date);
        var options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return d.toLocaleDateString('fr-FR', options);
    }

    // ============================================================
    // ALGORITHMES DE CALCUL DES DATES
    // ============================================================

    /**
     * Calcule les dates du successeur selon le type de dependance
     */
    function calculateSuccessorDates(predecessorStart, predecessorEnd, linkType, lagDays, successorDuration) {
        var result = {
            startDate: null,
            endDate: null
        };

        if (!predecessorStart || !predecessorEnd) {
            return result;
        }

        var predStart = cloneDate(predecessorStart);
        var predEnd = cloneDate(predecessorEnd);
        var lag = lagDays || 0;
        var duration = successorDuration || 1;

        switch (linkType) {
            case 'FS':
                // Finish-to-Start: Successor Start = Predecessor Finish + Lag + 1
                result.startDate = addWorkingDays(predEnd, lag + 1);
                result.endDate = addWorkingDays(result.startDate, duration - 1);
                break;

            case 'SS':
                // Start-to-Start: Successor Start = Predecessor Start + Lag
                result.startDate = addWorkingDays(predStart, lag);
                result.endDate = addWorkingDays(result.startDate, duration - 1);
                break;

            case 'FF':
                // Finish-to-Finish: Successor Finish = Predecessor Finish + Lag
                result.endDate = addWorkingDays(predEnd, lag);
                result.startDate = addWorkingDays(result.endDate, -(duration - 1));
                break;

            case 'SF':
                // Start-to-Finish: Successor Finish = Predecessor Start + Lag
                result.endDate = addWorkingDays(predStart, lag);
                result.startDate = addWorkingDays(result.endDate, -(duration - 1));
                break;

            default:
                // Par defaut: Finish-to-Start
                result.startDate = addWorkingDays(predEnd, lag + 1);
                result.endDate = addWorkingDays(result.startDate, duration - 1);
        }

        return result;
    }

    /**
     * Construit un graphe de dependances
     */
    function buildDependencyGraph(tasks, dependencies) {
        var predecessors = {};
        var successors = {};

        tasks.forEach(function(task) {
            var id = task.TaskId || task.id;
            predecessors[id] = [];
            successors[id] = [];
        });

        dependencies.forEach(function(dep) {
            var predId = dep.predecessorId;
            var succId = dep.successorId;

            if (predecessors[succId]) {
                predecessors[succId].push({
                    predecessorId: predId,
                    linkType: dep.type || 'FS',
                    lag: dep.lag || 0
                });
            }

            if (successors[predId]) {
                successors[predId].push({
                    successorId: succId,
                    linkType: dep.type || 'FS',
                    lag: dep.lag || 0
                });
            }
        });

        return {
            predecessors: predecessors,
            successors: successors
        };
    }

    /**
     * Tri topologique des taches
     */
    function topologicalSort(tasks, graph) {
        var sorted = [];
        var visited = {};
        var inStack = {};

        function visit(taskId) {
            if (inStack[taskId]) {
                throw new Error('Dependance circulaire detectee impliquant la tache: ' + taskId);
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
            var id = task.TaskId || task.id;
            if (!visited[id]) {
                visit(id);
            }
        });

        return sorted;
    }

    /**
     * Detecte les dependances circulaires
     */
    function detectCircularDependencies(tasks, dependencies) {
        var graph = buildDependencyGraph(tasks, dependencies);
        var cycles = [];
        var color = {};

        tasks.forEach(function(task) {
            var id = task.TaskId || task.id;
            color[id] = 0;
        });

        function dfs(taskId, path) {
            color[taskId] = 1;
            path = path || [];
            path.push(taskId);

            var succs = graph.successors[taskId] || [];

            for (var i = 0; i < succs.length; i++) {
                var succId = succs[i].successorId;

                if (color[succId] === 1) {
                    var cycleStart = path.indexOf(succId);
                    var cycle = path.slice(cycleStart);
                    cycle.push(succId);
                    cycles.push({
                        tasks: cycle,
                        description: 'Cycle: ' + cycle.join(' -> ')
                    });
                } else if (color[succId] === 0) {
                    dfs(succId, path.slice());
                }
            }

            color[taskId] = 2;
        }

        tasks.forEach(function(task) {
            var id = task.TaskId || task.id;
            if (color[id] === 0) {
                dfs(id, []);
            }
        });

        return {
            hasCircular: cycles.length > 0,
            cycles: cycles
        };
    }

    /**
     * Propage les changements dans la chaine de dependances
     */
    function propagateChanges(tasks, dependencies) {
        var taskMap = {};
        var tasksCopy = tasks.map(function(task) {
            var id = task.TaskId || task.id;
            var copy = {
                id: id,
                name: task.Name || task.name || 'TK-' + id,
                startDate: task.StartDate ? cloneDate(task.StartDate) : null,
                endDate: task.EndDate ? cloneDate(task.EndDate) : null,
                duration: task.EstimatedEffort || task.duration || 1
            };
            taskMap[id] = copy;
            return copy;
        });

        var changes = [];
        var graph = buildDependencyGraph(tasksCopy, dependencies);

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

        sortedIds.forEach(function(taskId) {
            var task = taskMap[taskId];
            if (!task) return;

            var preds = graph.predecessors[taskId] || [];
            if (preds.length === 0) {
                if (!task.startDate) {
                    task.startDate = new Date();
                }
                if (!task.endDate || task.endDate < task.startDate) {
                    task.endDate = addWorkingDays(task.startDate, task.duration - 1);
                }
                return;
            }

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
                var latestStart = calculatedDates.reduce(function(latest, dates) {
                    if (!latest || (dates.startDate && dates.startDate > latest)) {
                        return dates.startDate;
                    }
                    return latest;
                }, null);

                var oldStartDate = task.startDate ? cloneDate(task.startDate) : null;
                var oldEndDate = task.endDate ? cloneDate(task.endDate) : null;

                task.startDate = latestStart;
                task.endDate = addWorkingDays(task.startDate, task.duration - 1);

                if (!oldStartDate || task.startDate.getTime() !== oldStartDate.getTime()) {
                    changes.push({
                        taskId: task.id,
                        taskName: task.name,
                        oldStartDate: oldStartDate,
                        newStartDate: cloneDate(task.startDate),
                        oldEndDate: oldEndDate,
                        newEndDate: cloneDate(task.endDate)
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
     * Valide une dependance avant de l'ajouter
     */
    function validateDependency(tasks, existingDependencies, newDependency) {
        var errors = [];
        var warnings = [];

        var predId = newDependency.predecessorId;
        var succId = newDependency.successorId;
        var linkType = newDependency.type || 'FS';

        var taskMap = {};
        tasks.forEach(function(task) {
            var id = task.TaskId || task.id;
            taskMap[id] = task;
        });

        if (!taskMap[predId]) {
            errors.push('La tache predecesseur "TK-' + predId + '" n\'existe pas');
        }

        if (!taskMap[succId]) {
            errors.push('La tache successeur "TK-' + succId + '" n\'existe pas');
        }

        if (predId === succId) {
            errors.push('Une tache ne peut pas dependre d\'elle-meme');
        }

        var validTypes = ['FS', 'SS', 'FF', 'SF'];
        if (validTypes.indexOf(linkType) === -1) {
            errors.push('Type de dependance invalide: ' + linkType);
        }

        var exists = existingDependencies.some(function(dep) {
            return dep.predecessorId === predId && dep.successorId === succId;
        });

        if (exists) {
            warnings.push('Une dependance entre ces deux taches existe deja');
        }

        if (errors.length === 0) {
            var testDependencies = existingDependencies.slice();
            testDependencies.push(newDependency);

            var circularCheck = detectCircularDependencies(tasks, testDependencies);
            if (circularCheck.hasCircular) {
                errors.push('Cette dependance creerait un cycle: ' + circularCheck.cycles[0].description);
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors,
            warnings: warnings
        };
    }

    // ============================================================
    // INITIALISATION
    // ============================================================
    console.log(ST_PREFIX + " SmartTasks v" + ST_VERSION + " - Loading...");

    function init() {
        console.log(ST_PREFIX + " Initializing...");

        loadSettings();

        if (typeof spiraAppManager !== 'undefined') {
            stState.currentTaskId = spiraAppManager.artifactId;
            stState.currentProjectId = spiraAppManager.projectId;

            // Enregistrer les events
            spiraAppManager.registerEvent_loaded(onPageLoaded);
            spiraAppManager.registerEvent_dataSaved(onDataSaved);

            // Enregistrer les handlers de menu
            registerMenuHandlers();

            log("DEBUG", "Event handlers registered");
        }

        console.log(ST_PREFIX + " Initialized successfully");
    }

    function loadSettings() {
        if (typeof SpiraAppSettings === 'undefined') {
            log("DEBUG", "SpiraAppSettings not available");
            return;
        }

        stState.settings = SpiraAppSettings[ST_GUID];
        if (!stState.settings) {
            log("DEBUG", "No settings for this SpiraApp");
            return;
        }

        stState.debugMode = (stState.settings.debug_mode === true ||
                             stState.settings.debug_mode === "Y");

        stState.autoCalculate = (stState.settings.auto_calculate !== false &&
                                  stState.settings.auto_calculate !== "N");

        stState.cascadePropagation = (stState.settings.cascade_propagation !== false &&
                                       stState.settings.cascade_propagation !== "N");

        stState.skipWeekends = (stState.settings.skip_weekends === true ||
                                 stState.settings.skip_weekends === "Y");

        if (stState.settings.default_link_type) {
            var linkType = stState.settings.default_link_type.toUpperCase();
            if (['FS', 'SS', 'FF', 'SF'].indexOf(linkType) !== -1) {
                stState.defaultLinkType = linkType;
            }
        }

        var lag = parseInt(stState.settings.default_lag);
        if (!isNaN(lag)) {
            stState.defaultLag = lag;
        }

        log("DEBUG", "Settings loaded:", stState);
    }

    function registerMenuHandlers() {
        if (typeof spiraAppManager === 'undefined') return;

        try {
            var guid = (typeof APP_GUID !== 'undefined') ? APP_GUID : ST_GUID;

            spiraAppManager.registerEvent_menuEntryClick(guid, "addDependency", showAddDependencyDialog);
            spiraAppManager.registerEvent_menuEntryClick(guid, "viewDependencies", showDependenciesDialog);
            spiraAppManager.registerEvent_menuEntryClick(guid, "recalculateDates", recalculateDates);
            spiraAppManager.registerEvent_menuEntryClick(guid, "analyzeChain", analyzeChain);

            log("DEBUG", "Menu handlers registered");
        } catch (err) {
            log("ERROR", "Failed to register menu handlers", err);
        }
    }

    // ============================================================
    // EVENT HANDLERS
    // ============================================================
    function onPageLoaded() {
        log("DEBUG", "Page loaded, taskId:", stState.currentTaskId);

        stState.currentTaskId = spiraAppManager.artifactId;
        stState.currentProjectId = spiraAppManager.projectId;

        loadDependenciesFromCustomProperty();
    }

    function onDataSaved() {
        log("DEBUG", "Data saved");

        if (stState.autoCalculate) {
            setTimeout(function() {
                triggerAutoRecalculation();
            }, 500);
        }
    }

    // ============================================================
    // STOCKAGE DES DEPENDANCES (Custom Property)
    // ============================================================

    /**
     * Charge les dependances depuis le Custom Property
     */
    function loadDependenciesFromCustomProperty() {
        try {
            var customProps = spiraAppManager.getDataItemField("CustomProperties", "value");
            if (!customProps) {
                stState.dependencies = [];
                return;
            }

            // Chercher le custom property SmartTasksLinks
            for (var i = 0; i < customProps.length; i++) {
                if (customProps[i].Definition && customProps[i].Definition.Name === CUSTOM_PROPERTY_NAME) {
                    var value = customProps[i].StringValue;
                    if (value) {
                        try {
                            var data = JSON.parse(value);
                            stState.dependencies = data.links || [];
                            log("DEBUG", "Dependencies loaded:", stState.dependencies.length);
                        } catch (e) {
                            log("ERROR", "Failed to parse dependencies JSON", e);
                            stState.dependencies = [];
                        }
                    }
                    return;
                }
            }

            stState.dependencies = [];
        } catch (e) {
            log("ERROR", "Failed to load dependencies", e);
            stState.dependencies = [];
        }
    }

    /**
     * Sauvegarde les dependances dans le Custom Property
     */
    function saveDependenciesToCustomProperty(dependencies, callback) {
        var data = {
            version: ST_VERSION,
            links: dependencies,
            lastModified: new Date().toISOString()
        };

        var jsonString = JSON.stringify(data);

        try {
            // Chercher l'index du custom property SmartTasksLinks
            var customProps = spiraAppManager.getDataItemField("CustomProperties", "value");
            if (!customProps) {
                log("ERROR", "Custom Properties not available");
                if (callback) callback(false, "Custom Properties not available");
                return;
            }

            var propIndex = -1;
            for (var i = 0; i < customProps.length; i++) {
                if (customProps[i].Definition && customProps[i].Definition.Name === CUSTOM_PROPERTY_NAME) {
                    propIndex = i;
                    break;
                }
            }

            if (propIndex === -1) {
                log("ERROR", "Custom Property '" + CUSTOM_PROPERTY_NAME + "' not found");
                if (callback) callback(false, "Custom Property not found. Please create a Text custom property named '" + CUSTOM_PROPERTY_NAME + "'");
                return;
            }

            customProps[propIndex].StringValue = jsonString;

            spiraAppManager.updateFormField("CustomProperties", "value", customProps);

            stState.dependencies = dependencies;
            log("DEBUG", "Dependencies saved:", dependencies.length);

            if (callback) callback(true);
        } catch (e) {
            log("ERROR", "Failed to save dependencies", e);
            if (callback) callback(false, e.message);
        }
    }

    // ============================================================
    // API SPIRAPLAN
    // ============================================================

    /**
     * Recupere les details d'une tache
     */
    function getTaskDetails(taskId, callback) {
        if (stState.taskCache[taskId]) {
            callback(stState.taskCache[taskId]);
            return;
        }

        var url = "projects/" + stState.currentProjectId + "/tasks/" + taskId;

        spiraAppManager.executeApi(
            "SmartTasks",
            "7.0",
            "GET",
            url,
            null,
            function(response) {
                stState.taskCache[taskId] = response;
                callback(response);
            },
            function(error) {
                log("ERROR", "Failed to get task " + taskId, error);
                callback(null);
            }
        );
    }

    /**
     * Recupere la liste des taches du projet
     * Utilise la pagination pour eviter les timeouts
     */
    function getProjectTasks(callback) {
        // L'API Spira requiert des parametres de pagination
        var url = "projects/" + stState.currentProjectId + "/tasks?start_row=1&number_of_rows=500";

        log("DEBUG", "Fetching tasks from:", url);

        spiraAppManager.executeApi(
            "SmartTasks",
            "7.0",
            "GET",
            url,
            null,
            function(response) {
                log("DEBUG", "Tasks received:", response ? response.length : 0);
                if (response && Array.isArray(response)) {
                    response.forEach(function(task) {
                        stState.taskCache[task.TaskId] = task;
                    });
                    callback(response);
                } else {
                    log("WARN", "Unexpected response format", response);
                    callback([]);
                }
            },
            function(error) {
                log("ERROR", "Failed to get project tasks", error);
                callback([]);
            }
        );
    }

    /**
     * Met a jour une tache
     */
    function updateTask(taskId, taskData, callback) {
        // Note: PUT /tasks sans taskId dans l'URL - le TaskId est dans le body
        var url = "projects/" + stState.currentProjectId + "/tasks";

        spiraAppManager.executeApi(
            "SmartTasks",
            "7.0",
            "PUT",
            url,
            taskData,
            function(response) {
                stState.taskCache[taskId] = response;
                callback(true, response);
            },
            function(error) {
                log("ERROR", "Failed to update task " + taskId, error);
                callback(false, error);
            }
        );
    }

    // ============================================================
    // DIALOGS
    // ============================================================

    /**
     * Cree le style CSS pour les dialogs
     */
    function getDialogStyles() {
        return [
            '.st-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 999990; display: flex; align-items: center; justify-content: center; }',
            '.st-dialog { background: #fff; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); max-width: 600px; width: 90%; max-height: 80vh; display: flex; flex-direction: column; overflow: hidden; }',
            '.st-header { padding: 16px 20px; background: #f5f5f5; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center; }',
            '.st-title { font-weight: bold; font-size: 16px; color: #333; }',
            '.st-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #666; padding: 0 8px; }',
            '.st-close:hover { color: #333; }',
            '.st-body { padding: 20px; overflow-y: auto; flex: 1; }',
            '.st-footer { padding: 16px 20px; background: #f5f5f5; border-top: 1px solid #ddd; display: flex; justify-content: flex-end; gap: 12px; }',
            '.st-btn { padding: 8px 20px; border-radius: 4px; cursor: pointer; font-size: 14px; }',
            '.st-btn-primary { background: #0078d4; color: #fff; border: none; }',
            '.st-btn-primary:hover { background: #006abc; }',
            '.st-btn-secondary { background: #fff; color: #333; border: 1px solid #ccc; }',
            '.st-btn-secondary:hover { background: #f5f5f5; }',
            '.st-btn-danger { background: #d32f2f; color: #fff; border: none; }',
            '.st-btn-danger:hover { background: #b71c1c; }',
            '.st-form-group { margin-bottom: 16px; }',
            '.st-label { display: block; margin-bottom: 6px; font-weight: 500; color: #333; }',
            '.st-input, .st-select { width: 100%; padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; box-sizing: border-box; }',
            '.st-input:focus, .st-select:focus { border-color: #0078d4; outline: none; }',
            '.st-radio-group { display: flex; flex-direction: column; gap: 8px; }',
            '.st-radio-item { display: flex; align-items: center; gap: 8px; }',
            '.st-radio-item input { margin: 0; }',
            '.st-radio-item label { cursor: pointer; }',
            '.st-list { list-style: none; padding: 0; margin: 0; }',
            '.st-list-item { padding: 12px; border: 1px solid #eee; border-radius: 4px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; }',
            '.st-list-item:hover { background: #f9f9f9; }',
            '.st-badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; }',
            '.st-badge-fs { background: #e3f2fd; color: #1976d2; }',
            '.st-badge-ss { background: #fff3e0; color: #f57c00; }',
            '.st-badge-ff { background: #e8f5e9; color: #388e3c; }',
            '.st-badge-sf { background: #fce4ec; color: #c2185b; }',
            '.st-section { margin-bottom: 24px; }',
            '.st-section-title { font-size: 14px; font-weight: 600; color: #666; margin-bottom: 12px; text-transform: uppercase; }',
            '.st-info { padding: 12px; background: #e3f2fd; border-radius: 4px; color: #1565c0; margin-bottom: 16px; }',
            '.st-warning { padding: 12px; background: #fff3e0; border-radius: 4px; color: #e65100; margin-bottom: 16px; }',
            '.st-error { padding: 12px; background: #ffebee; border-radius: 4px; color: #c62828; margin-bottom: 16px; }',
            '.st-success { padding: 12px; background: #e8f5e9; border-radius: 4px; color: #2e7d32; margin-bottom: 16px; }',
            '.st-chain { font-family: monospace; padding: 16px; background: #f5f5f5; border-radius: 4px; overflow-x: auto; }',
            '.st-task-current { font-weight: bold; color: #0078d4; }',
            '.st-actions { display: flex; gap: 8px; }'
        ].join('\n');
    }

    /**
     * Injecte les styles si pas deja fait
     */
    function injectStyles() {
        if (document.getElementById('st-styles')) return;

        var style = document.createElement('style');
        style.id = 'st-styles';
        style.textContent = getDialogStyles();
        document.head.appendChild(style);
    }

    /**
     * Cree un dialog modal
     */
    function createDialog(title, bodyContent, footerButtons, options) {
        injectStyles();
        options = options || {};

        var overlay = document.createElement('div');
        overlay.className = 'st-overlay';

        var dialog = document.createElement('div');
        dialog.className = 'st-dialog';
        if (options.width) {
            dialog.style.maxWidth = options.width;
        }

        // Header
        var header = document.createElement('div');
        header.className = 'st-header';

        var titleEl = document.createElement('span');
        titleEl.className = 'st-title';
        titleEl.textContent = title;

        var closeBtn = document.createElement('button');
        closeBtn.className = 'st-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = function() { closeDialog(overlay); };

        header.appendChild(titleEl);
        header.appendChild(closeBtn);

        // Body
        var body = document.createElement('div');
        body.className = 'st-body';
        if (typeof bodyContent === 'string') {
            body.innerHTML = bodyContent;
        } else {
            body.appendChild(bodyContent);
        }

        // Footer
        var footer = document.createElement('div');
        footer.className = 'st-footer';

        footerButtons.forEach(function(btn) {
            var button = document.createElement('button');
            button.className = 'st-btn ' + (btn.class || 'st-btn-secondary');
            button.textContent = btn.text;
            button.onclick = function() {
                if (btn.onclick) {
                    btn.onclick(overlay);
                }
            };
            footer.appendChild(button);
        });

        dialog.appendChild(header);
        dialog.appendChild(body);
        dialog.appendChild(footer);
        overlay.appendChild(dialog);

        // Fermer en cliquant sur l'overlay
        overlay.onclick = function(e) {
            if (e.target === overlay) {
                closeDialog(overlay);
            }
        };

        // Fermer avec Escape
        var escHandler = function(e) {
            if (e.key === 'Escape') {
                closeDialog(overlay);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        document.body.appendChild(overlay);
        stState.dialogOpen = true;

        return overlay;
    }

    /**
     * Ferme un dialog
     */
    function closeDialog(overlay) {
        if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
        stState.dialogOpen = false;
    }

    // ============================================================
    // DIALOG: AJOUTER DEPENDANCE
    // ============================================================
    function showAddDependencyDialog() {
        log("DEBUG", "showAddDependencyDialog");

        var currentTaskId = stState.currentTaskId;
        if (!currentTaskId) {
            showNotification("Aucune tache selectionnee", "error");
            return;
        }

        // Charger les taches du projet
        getProjectTasks(function(tasks) {
            var bodyContent = document.createElement('div');

            // Info tache courante
            var currentTask = stState.taskCache[currentTaskId];
            var currentTaskName = currentTask ? currentTask.Name : 'TK-' + currentTaskId;

            var infoDiv = document.createElement('div');
            infoDiv.className = 'st-info';
            infoDiv.innerHTML = '<strong>Tache courante:</strong> TK-' + currentTaskId + ' - ' + escapeHtml(currentTaskName);
            bodyContent.appendChild(infoDiv);

            // Selection du predecesseur
            var predGroup = document.createElement('div');
            predGroup.className = 'st-form-group';

            var predLabel = document.createElement('label');
            predLabel.className = 'st-label';
            predLabel.textContent = 'Predecesseur:';
            predGroup.appendChild(predLabel);

            var predSelect = document.createElement('select');
            predSelect.className = 'st-select';
            predSelect.id = 'st-predecessor-select';

            var defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = '-- Selectionnez une tache --';
            predSelect.appendChild(defaultOption);

            tasks.forEach(function(task) {
                if (task.TaskId !== currentTaskId) {
                    var option = document.createElement('option');
                    option.value = task.TaskId;
                    option.textContent = 'TK-' + task.TaskId + ': ' + task.Name;
                    predSelect.appendChild(option);
                }
            });

            predGroup.appendChild(predSelect);
            bodyContent.appendChild(predGroup);

            // Type de dependance
            var typeGroup = document.createElement('div');
            typeGroup.className = 'st-form-group';

            var typeLabel = document.createElement('label');
            typeLabel.className = 'st-label';
            typeLabel.textContent = 'Type de dependance:';
            typeGroup.appendChild(typeLabel);

            var radioGroup = document.createElement('div');
            radioGroup.className = 'st-radio-group';

            Object.keys(DEPENDENCY_TYPES).forEach(function(type) {
                var item = document.createElement('div');
                item.className = 'st-radio-item';

                var input = document.createElement('input');
                input.type = 'radio';
                input.name = 'st-dep-type';
                input.value = type;
                input.id = 'st-type-' + type;
                if (type === stState.defaultLinkType) {
                    input.checked = true;
                }

                var label = document.createElement('label');
                label.htmlFor = 'st-type-' + type;
                label.innerHTML = '<strong>' + type + '</strong> - ' + DEPENDENCY_TYPES[type].description;

                item.appendChild(input);
                item.appendChild(label);
                radioGroup.appendChild(item);
            });

            typeGroup.appendChild(radioGroup);
            bodyContent.appendChild(typeGroup);

            // Lag/Lead time
            var lagGroup = document.createElement('div');
            lagGroup.className = 'st-form-group';

            var lagLabel = document.createElement('label');
            lagLabel.className = 'st-label';
            lagLabel.textContent = 'Delai (lag/lead) en jours:';
            lagGroup.appendChild(lagLabel);

            var lagInput = document.createElement('input');
            lagInput.type = 'number';
            lagInput.className = 'st-input';
            lagInput.id = 'st-lag-input';
            lagInput.value = stState.defaultLag;
            lagInput.placeholder = 'Positif = lag (attente), Negatif = lead (chevauchement)';
            lagGroup.appendChild(lagInput);

            bodyContent.appendChild(lagGroup);

            // Message d'erreur/warning
            var messageDiv = document.createElement('div');
            messageDiv.id = 'st-add-message';
            messageDiv.style.display = 'none';
            bodyContent.appendChild(messageDiv);

            // Creer le dialog
            createDialog('SmartTasks - Ajouter Dependance', bodyContent, [
                {
                    text: 'Annuler',
                    class: 'st-btn-secondary',
                    onclick: closeDialog
                },
                {
                    text: 'Creer Dependance',
                    class: 'st-btn-primary',
                    onclick: function(overlay) {
                        handleAddDependency(overlay, currentTaskId);
                    }
                }
            ]);
        });
    }

    /**
     * Gere la creation d'une dependance
     */
    function handleAddDependency(overlay, successorId) {
        var predSelect = document.getElementById('st-predecessor-select');
        var lagInput = document.getElementById('st-lag-input');
        var messageDiv = document.getElementById('st-add-message');

        var predecessorId = parseInt(predSelect.value);
        if (!predecessorId) {
            messageDiv.className = 'st-error';
            messageDiv.textContent = 'Veuillez selectionner un predecesseur';
            messageDiv.style.display = 'block';
            return;
        }

        var typeRadio = document.querySelector('input[name="st-dep-type"]:checked');
        var linkType = typeRadio ? typeRadio.value : 'FS';

        var lag = parseInt(lagInput.value) || 0;

        var newDependency = {
            id: 'dep_' + Date.now(),
            predecessorId: predecessorId,
            successorId: successorId,
            type: linkType,
            lag: lag,
            createdDate: new Date().toISOString()
        };

        // Charger les taches pour validation
        getProjectTasks(function(tasks) {
            var validation = validateDependency(tasks, stState.dependencies, newDependency);

            if (!validation.isValid) {
                messageDiv.className = 'st-error';
                messageDiv.innerHTML = '<strong>Erreur:</strong><br>' + validation.errors.join('<br>');
                messageDiv.style.display = 'block';
                return;
            }

            if (validation.warnings.length > 0) {
                messageDiv.className = 'st-warning';
                messageDiv.innerHTML = '<strong>Attention:</strong><br>' + validation.warnings.join('<br>');
                messageDiv.style.display = 'block';
            }

            // Ajouter la dependance
            var newDependencies = stState.dependencies.slice();
            newDependencies.push(newDependency);

            saveDependenciesToCustomProperty(newDependencies, function(success, error) {
                if (success) {
                    showNotification('Dependance creee avec succes!', 'success');
                    closeDialog(overlay);

                    if (stState.autoCalculate) {
                        triggerAutoRecalculation();
                    }
                } else {
                    messageDiv.className = 'st-error';
                    messageDiv.textContent = 'Erreur lors de la sauvegarde: ' + (error || 'Erreur inconnue');
                    messageDiv.style.display = 'block';
                }
            });
        });
    }

    // ============================================================
    // DIALOG: VOIR DEPENDANCES
    // ============================================================
    function showDependenciesDialog() {
        log("DEBUG", "showDependenciesDialog");

        var currentTaskId = stState.currentTaskId;
        if (!currentTaskId) {
            showNotification("Aucune tache selectionnee", "error");
            return;
        }

        loadDependenciesFromCustomProperty();

        getProjectTasks(function(tasks) {
            var bodyContent = document.createElement('div');

            var currentTask = stState.taskCache[currentTaskId];
            var currentTaskName = currentTask ? currentTask.Name : 'TK-' + currentTaskId;

            // Titre de la tache
            var titleDiv = document.createElement('div');
            titleDiv.className = 'st-info';
            titleDiv.innerHTML = '<strong>TK-' + currentTaskId + ':</strong> ' + escapeHtml(currentTaskName);
            bodyContent.appendChild(titleDiv);

            // Predecesseurs
            var predsSection = document.createElement('div');
            predsSection.className = 'st-section';

            var predsTitle = document.createElement('div');
            predsTitle.className = 'st-section-title';
            predsTitle.textContent = 'Predecesseurs (cette tache attend):';
            predsSection.appendChild(predsTitle);

            var predecessors = stState.dependencies.filter(function(dep) {
                return dep.successorId === currentTaskId;
            });

            if (predecessors.length === 0) {
                var noPreds = document.createElement('p');
                noPreds.style.color = '#666';
                noPreds.textContent = 'Aucun predecesseur';
                predsSection.appendChild(noPreds);
            } else {
                var predsList = document.createElement('ul');
                predsList.className = 'st-list';

                predecessors.forEach(function(dep) {
                    var predTask = stState.taskCache[dep.predecessorId];
                    var predName = predTask ? predTask.Name : 'TK-' + dep.predecessorId;

                    var item = document.createElement('li');
                    item.className = 'st-list-item';

                    var info = document.createElement('div');
                    info.innerHTML = '<strong>TK-' + dep.predecessorId + '</strong>: ' + escapeHtml(predName) +
                        ' <span class="st-badge st-badge-' + dep.type.toLowerCase() + '">' + dep.type + '</span>' +
                        (dep.lag !== 0 ? ' <em>(' + (dep.lag > 0 ? '+' : '') + dep.lag + 'j)</em>' : '');

                    var actions = document.createElement('div');
                    actions.className = 'st-actions';

                    var deleteBtn = document.createElement('button');
                    deleteBtn.className = 'st-btn st-btn-danger';
                    deleteBtn.textContent = 'Supprimer';
                    deleteBtn.onclick = function() {
                        deleteDependency(dep.id);
                    };

                    actions.appendChild(deleteBtn);

                    item.appendChild(info);
                    item.appendChild(actions);
                    predsList.appendChild(item);
                });

                predsSection.appendChild(predsList);
            }

            bodyContent.appendChild(predsSection);

            // Successeurs
            var succsSection = document.createElement('div');
            succsSection.className = 'st-section';

            var succsTitle = document.createElement('div');
            succsTitle.className = 'st-section-title';
            succsTitle.textContent = 'Successeurs (attendent cette tache):';
            succsSection.appendChild(succsTitle);

            var successors = stState.dependencies.filter(function(dep) {
                return dep.predecessorId === currentTaskId;
            });

            if (successors.length === 0) {
                var noSuccs = document.createElement('p');
                noSuccs.style.color = '#666';
                noSuccs.textContent = 'Aucun successeur';
                succsSection.appendChild(noSuccs);
            } else {
                var succsList = document.createElement('ul');
                succsList.className = 'st-list';

                successors.forEach(function(dep) {
                    var succTask = stState.taskCache[dep.successorId];
                    var succName = succTask ? succTask.Name : 'TK-' + dep.successorId;

                    var item = document.createElement('li');
                    item.className = 'st-list-item';

                    var info = document.createElement('div');
                    info.innerHTML = '<strong>TK-' + dep.successorId + '</strong>: ' + escapeHtml(succName) +
                        ' <span class="st-badge st-badge-' + dep.type.toLowerCase() + '">' + dep.type + '</span>' +
                        (dep.lag !== 0 ? ' <em>(' + (dep.lag > 0 ? '+' : '') + dep.lag + 'j)</em>' : '');

                    var actions = document.createElement('div');
                    actions.className = 'st-actions';

                    var deleteBtn = document.createElement('button');
                    deleteBtn.className = 'st-btn st-btn-danger';
                    deleteBtn.textContent = 'Supprimer';
                    deleteBtn.onclick = function() {
                        deleteDependency(dep.id);
                    };

                    actions.appendChild(deleteBtn);

                    item.appendChild(info);
                    item.appendChild(actions);
                    succsList.appendChild(item);
                });

                succsSection.appendChild(succsList);
            }

            bodyContent.appendChild(succsSection);

            // Creer le dialog
            createDialog('SmartTasks - Dependances de TK-' + currentTaskId, bodyContent, [
                {
                    text: 'Ajouter',
                    class: 'st-btn-secondary',
                    onclick: function(overlay) {
                        closeDialog(overlay);
                        showAddDependencyDialog();
                    }
                },
                {
                    text: 'Recalculer',
                    class: 'st-btn-secondary',
                    onclick: function(overlay) {
                        closeDialog(overlay);
                        recalculateDates();
                    }
                },
                {
                    text: 'Fermer',
                    class: 'st-btn-primary',
                    onclick: closeDialog
                }
            ], { width: '700px' });
        });
    }

    /**
     * Supprime une dependance
     */
    function deleteDependency(depId) {
        var newDependencies = stState.dependencies.filter(function(dep) {
            return dep.id !== depId;
        });

        saveDependenciesToCustomProperty(newDependencies, function(success, error) {
            if (success) {
                showNotification('Dependance supprimee', 'success');
                // Rafraichir le dialog
                var overlay = document.querySelector('.st-overlay');
                if (overlay) {
                    closeDialog(overlay);
                    showDependenciesDialog();
                }
            } else {
                showNotification('Erreur lors de la suppression: ' + (error || 'Erreur inconnue'), 'error');
            }
        });
    }

    // ============================================================
    // RECALCUL DES DATES
    // ============================================================
    function recalculateDates() {
        log("DEBUG", "recalculateDates");

        showNotification('Recalcul des dates en cours...', 'info');

        getProjectTasks(function(tasks) {
            if (tasks.length === 0) {
                showNotification('Aucune tache trouvee', 'warning');
                return;
            }

            // Collecter toutes les dependances
            var allDependencies = collectAllDependencies(tasks);

            if (allDependencies.length === 0) {
                showNotification('Aucune dependance trouvee', 'info');
                return;
            }

            // Propager les changements
            var result = propagateChanges(tasks, allDependencies);

            if (result.error) {
                showNotification('Erreur: ' + result.error, 'error');
                return;
            }

            if (result.changes.length === 0) {
                showNotification('Aucune modification necessaire', 'success');
                return;
            }

            // Afficher les changements
            showRecalculationResults(result.changes);
        });
    }

    /**
     * Collecte toutes les dependances (pour l'instant juste celles de la tache courante)
     */
    function collectAllDependencies(tasks) {
        // TODO: Pour une version plus complete, parcourir toutes les taches
        // et collecter leurs dependances depuis les Custom Properties
        return stState.dependencies;
    }

    /**
     * Affiche les resultats du recalcul
     */
    function showRecalculationResults(changes) {
        var bodyContent = document.createElement('div');

        var infoDiv = document.createElement('div');
        infoDiv.className = 'st-success';
        infoDiv.innerHTML = '<strong>' + changes.length + ' tache(s)</strong> ont ete recalculees.';
        bodyContent.appendChild(infoDiv);

        var listSection = document.createElement('div');
        listSection.className = 'st-section';

        var list = document.createElement('ul');
        list.className = 'st-list';

        changes.forEach(function(change) {
            var item = document.createElement('li');
            item.className = 'st-list-item';
            item.style.flexDirection = 'column';
            item.style.alignItems = 'flex-start';

            item.innerHTML =
                '<strong>TK-' + change.taskId + '</strong>: ' + escapeHtml(change.taskName) +
                '<br><small>Ancien: ' + formatDateDisplay(change.oldStartDate) + ' - ' + formatDateDisplay(change.oldEndDate) + '</small>' +
                '<br><small>Nouveau: <strong>' + formatDateDisplay(change.newStartDate) + ' - ' + formatDateDisplay(change.newEndDate) + '</strong></small>';

            list.appendChild(item);
        });

        listSection.appendChild(list);
        bodyContent.appendChild(listSection);

        createDialog('SmartTasks - Resultats du Recalcul', bodyContent, [
            {
                text: 'Appliquer les modifications',
                class: 'st-btn-primary',
                onclick: function(overlay) {
                    applyDateChanges(changes, overlay);
                }
            },
            {
                text: 'Annuler',
                class: 'st-btn-secondary',
                onclick: closeDialog
            }
        ]);
    }

    /**
     * Applique les modifications de dates
     */
    function applyDateChanges(changes, overlay) {
        var completed = 0;
        var errors = [];

        changes.forEach(function(change, index) {
            var taskData = {
                TaskId: change.taskId,
                StartDate: formatDateISO(change.newStartDate),
                EndDate: formatDateISO(change.newEndDate)
            };

            updateTask(change.taskId, taskData, function(success, error) {
                completed++;

                if (!success) {
                    errors.push('TK-' + change.taskId + ': ' + error);
                }

                if (completed === changes.length) {
                    closeDialog(overlay);

                    if (errors.length === 0) {
                        showNotification('Toutes les dates ont ete mises a jour!', 'success');
                    } else {
                        showNotification('Certaines mises a jour ont echoue: ' + errors.join(', '), 'warning');
                    }
                }
            });
        });
    }

    /**
     * Declenchement du recalcul automatique
     */
    function triggerAutoRecalculation() {
        if (!stState.autoCalculate) return;

        log("DEBUG", "Auto recalculation triggered");

        getProjectTasks(function(tasks) {
            var allDependencies = collectAllDependencies(tasks);

            if (allDependencies.length === 0) return;

            var result = propagateChanges(tasks, allDependencies);

            if (result.error) {
                log("ERROR", "Auto recalculation failed:", result.error);
                return;
            }

            if (result.changes.length > 0) {
                showNotification(result.changes.length + ' tache(s) peuvent etre recalculees. Utilisez "Recalculer Dates" pour appliquer.', 'info');
            }
        });
    }

    // ============================================================
    // ANALYSE DE LA CHAINE
    // ============================================================
    function analyzeChain() {
        log("DEBUG", "analyzeChain");

        var currentTaskId = stState.currentTaskId;
        if (!currentTaskId) {
            showNotification("Aucune tache selectionnee", "error");
            return;
        }

        getProjectTasks(function(tasks) {
            var allDependencies = collectAllDependencies(tasks);

            if (allDependencies.length === 0) {
                showNotification('Aucune dependance trouvee', 'info');
                return;
            }

            var circularCheck = detectCircularDependencies(tasks, allDependencies);
            var graph = buildDependencyGraph(tasks, allDependencies);

            var bodyContent = document.createElement('div');

            // Verification des cycles
            var cycleSection = document.createElement('div');
            cycleSection.className = 'st-section';

            if (circularCheck.hasCircular) {
                var cycleWarning = document.createElement('div');
                cycleWarning.className = 'st-error';
                cycleWarning.innerHTML = '<strong>Attention!</strong> Des dependances circulaires ont ete detectees:<br>' +
                    circularCheck.cycles.map(function(c) { return c.description; }).join('<br>');
                cycleSection.appendChild(cycleWarning);
            } else {
                var noCycle = document.createElement('div');
                noCycle.className = 'st-success';
                noCycle.textContent = 'Aucune dependance circulaire detectee';
                cycleSection.appendChild(noCycle);
            }

            bodyContent.appendChild(cycleSection);

            // Chaine de la tache courante
            var chainSection = document.createElement('div');
            chainSection.className = 'st-section';

            var chainTitle = document.createElement('div');
            chainTitle.className = 'st-section-title';
            chainTitle.textContent = 'Chaine de dependances pour TK-' + currentTaskId + ':';
            chainSection.appendChild(chainTitle);

            var chainDiv = document.createElement('div');
            chainDiv.className = 'st-chain';

            // Trouver les ancetres
            var ancestors = findAncestors(currentTaskId, graph);
            // Trouver les descendants
            var descendants = findDescendants(currentTaskId, graph);

            var chainHtml = '';

            if (ancestors.length > 0) {
                chainHtml += ancestors.map(function(id) {
                    return 'TK-' + id;
                }).join(' --> ') + ' --> ';
            }

            chainHtml += '<span class="st-task-current">[TK-' + currentTaskId + ']</span>';

            if (descendants.length > 0) {
                chainHtml += ' --> ' + descendants.map(function(id) {
                    return 'TK-' + id;
                }).join(' --> ');
            }

            chainDiv.innerHTML = chainHtml || 'Tache isolee (pas de dependances)';
            chainSection.appendChild(chainDiv);

            bodyContent.appendChild(chainSection);

            // Statistiques
            var statsSection = document.createElement('div');
            statsSection.className = 'st-section';

            var statsTitle = document.createElement('div');
            statsTitle.className = 'st-section-title';
            statsTitle.textContent = 'Statistiques:';
            statsSection.appendChild(statsTitle);

            var statsDiv = document.createElement('div');
            statsDiv.className = 'st-info';
            statsDiv.innerHTML =
                '<strong>Total taches:</strong> ' + tasks.length + '<br>' +
                '<strong>Total dependances:</strong> ' + allDependencies.length + '<br>' +
                '<strong>Predecesseurs directs:</strong> ' + (graph.predecessors[currentTaskId] || []).length + '<br>' +
                '<strong>Successeurs directs:</strong> ' + (graph.successors[currentTaskId] || []).length + '<br>' +
                '<strong>Profondeur chaine amont:</strong> ' + ancestors.length + '<br>' +
                '<strong>Profondeur chaine aval:</strong> ' + descendants.length;

            statsSection.appendChild(statsDiv);
            bodyContent.appendChild(statsSection);

            createDialog('SmartTasks - Analyse de la Chaine', bodyContent, [
                {
                    text: 'Fermer',
                    class: 'st-btn-primary',
                    onclick: closeDialog
                }
            ], { width: '700px' });
        });
    }

    /**
     * Trouve les ancetres d'une tache (predecesseurs recursifs)
     */
    function findAncestors(taskId, graph, visited) {
        visited = visited || {};
        var result = [];

        if (visited[taskId]) return result;
        visited[taskId] = true;

        var preds = graph.predecessors[taskId] || [];

        preds.forEach(function(pred) {
            var ancestors = findAncestors(pred.predecessorId, graph, visited);
            result = result.concat(ancestors);
            result.push(pred.predecessorId);
        });

        return result;
    }

    /**
     * Trouve les descendants d'une tache (successeurs recursifs)
     */
    function findDescendants(taskId, graph, visited) {
        visited = visited || {};
        var result = [];

        if (visited[taskId]) return result;
        visited[taskId] = true;

        var succs = graph.successors[taskId] || [];

        succs.forEach(function(succ) {
            result.push(succ.successorId);
            var descendants = findDescendants(succ.successorId, graph, visited);
            result = result.concat(descendants);
        });

        return result;
    }

    // ============================================================
    // NOTIFICATIONS
    // ============================================================
    function showNotification(message, type) {
        if (typeof spiraAppManager !== 'undefined') {
            switch (type) {
                case 'success':
                    spiraAppManager.displaySuccessMessage(ST_PREFIX + ' ' + message);
                    break;
                case 'error':
                    spiraAppManager.displayErrorMessage(ST_PREFIX + ' ' + message);
                    break;
                case 'warning':
                    spiraAppManager.displayWarningMessage(ST_PREFIX + ' ' + message);
                    break;
                default:
                    spiraAppManager.displayWarningMessage(ST_PREFIX + ' ' + message);
            }
            return;
        }

        // Fallback: notification HTML
        var colors = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196F3'
        };

        var notif = document.createElement('div');
        notif.style.cssText = [
            'position: fixed',
            'bottom: 20px',
            'right: 20px',
            'padding: 12px 20px',
            'background: ' + (colors[type] || colors.info),
            'color: white',
            'border-radius: 4px',
            'z-index: 999999',
            'font-family: sans-serif',
            'font-size: 14px',
            'box-shadow: 0 2px 10px rgba(0,0,0,0.2)',
            'max-width: 400px'
        ].join(';');
        notif.textContent = message;
        document.body.appendChild(notif);

        setTimeout(function() {
            notif.style.opacity = '0';
            notif.style.transition = 'opacity 0.3s';
            setTimeout(function() {
                if (notif.parentNode) {
                    notif.parentNode.removeChild(notif);
                }
            }, 300);
        }, 4000);
    }

    // ============================================================
    // UTILITAIRES
    // ============================================================
    function escapeHtml(text) {
        if (!text) return '';
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ============================================================
    // DEMARRAGE
    // ============================================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ============================================================
    // DEBUG HELPERS (accessibles depuis console F12)
    // ============================================================
    window.ST_showState = function() {
        console.log(ST_PREFIX + " State:", stState);
        return stState;
    };

    window.ST_showDependencies = function() {
        console.log(ST_PREFIX + " Dependencies:", stState.dependencies);
        return stState.dependencies;
    };

    window.ST_showTaskCache = function() {
        console.log(ST_PREFIX + " Task Cache:", stState.taskCache);
        return stState.taskCache;
    };

    window.ST_addDependency = showAddDependencyDialog;
    window.ST_viewDependencies = showDependenciesDialog;
    window.ST_recalculateDates = recalculateDates;
    window.ST_analyzeChain = analyzeChain;

    window.ST_testCalculation = function(predStart, predEnd, linkType, lag, duration) {
        var result = calculateSuccessorDates(
            new Date(predStart),
            new Date(predEnd),
            linkType || 'FS',
            lag || 0,
            duration || 5
        );
        console.log(ST_PREFIX + " Calculation result:", {
            startDate: formatDateDisplay(result.startDate),
            endDate: formatDateDisplay(result.endDate)
        });
        return result;
    };

    window.ST_version = ST_VERSION;

    // API publique
    window.SmartTasks = {
        version: ST_VERSION,
        addDependency: showAddDependencyDialog,
        viewDependencies: showDependenciesDialog,
        recalculateDates: recalculateDates,
        analyzeChain: analyzeChain,
        getState: function() { return stState; },
        getDependencies: function() { return stState.dependencies; }
    };

})();
