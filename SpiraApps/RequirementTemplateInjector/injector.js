/**
 * REQUIREMENT TEMPLATE INJECTOR (RTI)
 * Version 1.0.0
 *
 * Approche: loaded + dropdownChanged
 * Configuration: 5 SLOTS (dropdown type natif + template RichText)
 * Le dropdown retourne directement le RequirementTypeId - pas besoin d'API
 */

// ============================================================
// CONSTANTES
// ============================================================
var RTI_VERSION = "1.0.0";
var RTI_PREFIX = "[RTI]";
var RTI_GUID = "b3f5a8d2-7c41-4e9a-b6d8-1f2e3a4b5c6d";
var NUM_SLOTS = 5;

// ============================================================
// ETAT
// ============================================================
var state = {
    settings: null,
    templates: {},           // Map: typeId (string) -> template HTML
    lastInjectedTemplate: "",
    debugMode: false
};

// ============================================================
// LOGGING
// ============================================================
function log(level, message, data) {
    if (!state.debugMode && level !== "ERROR") return;
    var prefix = RTI_PREFIX + " [" + level + "]";
    if (data !== undefined) {
        console.log(prefix, message, data);
    } else {
        console.log(prefix, message);
    }
}

// ============================================================
// INITIALISATION
// ============================================================
initRTI();

function initRTI() {
    log("INFO", "Initializing RTI v" + RTI_VERSION);

    // Charger les settings de base
    if (!loadSettings()) {
        log("WARN", "Settings not available or no templates configured, RTI disabled");
        return;
    }

    // Enregistrer event loaded
    spiraAppManager.registerEvent_loaded(onPageLoaded);

    // Enregistrer event changement de type
    spiraAppManager.registerEvent_dropdownChanged("RequirementTypeId", onTypeChanged);

    log("INFO", "Event handlers registered");
}

// ============================================================
// CHARGEMENT SETTINGS (SLOTS avec dropdown)
// ============================================================
function loadSettings() {
    state.settings = SpiraAppSettings[RTI_GUID];

    if (!state.settings) {
        return false;
    }

    // Mode debug
    state.debugMode = (state.settings.debug_mode === true ||
                       state.settings.debug_mode === "Y");

    // Charger les templates depuis les slots (dropdown retourne directement l'ID)
    state.templates = {};

    for (var i = 1; i <= NUM_SLOTS; i++) {
        // type_id_X contient directement le RequirementTypeId (depuis dropdown)
        var typeId = state.settings["type_id_" + i];
        var template = state.settings["template_" + i];

        // Si le type est selectionne et le template n'est pas vide
        if (typeId && template && template.trim() !== "") {
            var typeIdStr = String(typeId);
            // Premier template pour ce type gagne (si doublon)
            if (!state.templates[typeIdStr]) {
                state.templates[typeIdStr] = template;
                log("DEBUG", "Slot " + i + ": Type ID " + typeIdStr + " configured");
            } else {
                log("WARN", "Slot " + i + ": Type ID " + typeIdStr + " already configured, skipping");
            }
        }
    }

    var configuredCount = Object.keys(state.templates).length;
    log("DEBUG", "Templates configured:", configuredCount);
    return configuredCount > 0;
}

// ============================================================
// HANDLER: PAGE LOADED
// ============================================================
function onPageLoaded() {
    log("DEBUG", "Page loaded");

    // Seulement en mode creation
    if (spiraAppManager.artifactId) {
        log("DEBUG", "Edit mode (artifactId exists), skipping");
        return;
    }

    log("DEBUG", "Creation mode detected");
    injectTemplateForCurrentType();
}

// ============================================================
// HANDLER: TYPE CHANGED
// ============================================================
function onTypeChanged(oldVal, newVal) {
    log("DEBUG", "Type changed", { from: oldVal, to: newVal });

    // Seulement en mode creation
    if (spiraAppManager.artifactId) {
        return true;
    }

    // Verifier si on peut injecter (contenu non modifie)
    if (canInject()) {
        // Petit delai pour laisser le dropdown se mettre a jour
        setTimeout(function() {
            injectTemplateForCurrentType();
        }, 10);
    } else {
        log("DEBUG", "Content modified by user, skipping injection");
    }

    return true; // Autoriser le changement de type
}

// ============================================================
// INJECTION DU TEMPLATE
// ============================================================
function injectTemplateForCurrentType() {
    // Recuperer le type actuel
    var typeField = spiraAppManager.getDataItemField("RequirementTypeId", "intValue");
    var typeId = String(typeField);
    log("DEBUG", "Current type ID: " + typeId);

    // Recuperer le template depuis la map
    var template = state.templates[typeId];

    if (!template) {
        log("INFO", "No template configured for type ID " + typeId);
        state.lastInjectedTemplate = "";
        return;
    }

    // Injecter
    log("INFO", "Injecting template for type ID " + typeId);
    spiraAppManager.updateFormField("Description", template);
    state.lastInjectedTemplate = template;

    // Message de succes
    spiraAppManager.displaySuccessMessage("[RTI] Template injecte pour le type selectionne");
}

// ============================================================
// HELPERS
// ============================================================
function canInject() {
    var currentValue = spiraAppManager.getDataItemField("Description", "textValue");

    // Peut injecter si champ vide
    if (!currentValue || currentValue.trim() === "") {
        return true;
    }

    // Peut injecter si contenu = dernier template (pas modifie)
    if (currentValue === state.lastInjectedTemplate) {
        return true;
    }

    // Verifier aussi si c'est un des templates configures
    for (var typeId in state.templates) {
        if (currentValue === state.templates[typeId]) {
            return true;
        }
    }

    return false;
}

// ============================================================
// DEBUG HELPERS (accessibles depuis console F12)
// ============================================================
window.RTI_showState = function() {
    console.log(RTI_PREFIX + " State:", state);
    return state;
};

window.RTI_showTemplates = function() {
    console.log(RTI_PREFIX + " Templates mapping (typeId -> template):");
    for (var id in state.templates) {
        console.log("  Type ID " + id + ": " + state.templates[id].substring(0, 50) + "...");
    }
    return state.templates;
};

window.RTI_injectNow = function() {
    injectTemplateForCurrentType();
};
