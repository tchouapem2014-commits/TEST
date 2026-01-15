/**
 * REQUIREMENT TEMPLATE INJECTOR (RTI)
 * Version 2.0.0
 *
 * Approche: loaded (delai 500ms) + dropdownChanged + bouton manuel
 * Configuration: 5 SLOTS (dropdown type natif + template RichText)
 * Le dropdown retourne directement le RequirementTypeId - pas besoin d'API
 *
 * v1.1.0: Ajout du bouton "Injecter Template" pour injection manuelle
 * v1.1.1: Fix updateFormField avec signature 3 parametres (fieldName, dataProperty, value)
 * v1.3.0: Retour a registerEvent_loaded avec delai 500ms (dataPreSave ne fonctionne pas)
 * v1.4.0: Injection via registerEvent_dropdownChanged sur RequirementTypeId
 * v1.5.0: Combine loaded + dropdownChanged pour couvrir tous les cas
 * v2.0.0: Support de n'importe quel champ RichText (standard ou custom)
 */

// ============================================================
// CONSTANTES
// ============================================================
var RTI_VERSION = "2.0.0";
var RTI_DEFAULT_TARGET_FIELD = "Description";
var RTI_PREFIX = "[RTI]";
var RTI_GUID = "b3f5a8d2-7c41-4e9a-b6d8-1f2e3a4b5c6d";
var NUM_SLOTS = 5;

// ============================================================
// ETAT
// ============================================================
var state = {
    settings: null,
    templates: {},           // Map: typeId (string) -> template HTML
    targetField: RTI_DEFAULT_TARGET_FIELD,  // Champ RichText cible (v2.0)
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
// Log TOUJOURS pour debug initial
console.log(RTI_PREFIX + " Script loaded, checking SpiraAppSettings...");

// Attendre que SpiraAppSettings soit disponible
if (typeof SpiraAppSettings !== 'undefined') {
    console.log(RTI_PREFIX + " SpiraAppSettings available, calling initRTI()");
    initRTI();
} else {
    console.log(RTI_PREFIX + " SpiraAppSettings NOT available, waiting...");
    // SpiraAppSettings pas encore disponible, attendre le DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log(RTI_PREFIX + " DOMContentLoaded fired, calling initRTI()");
            initRTI();
        });
    } else {
        // DOM deja charge, petit delai pour laisser Spira initialiser
        console.log(RTI_PREFIX + " DOM ready, waiting 100ms then calling initRTI()");
        setTimeout(initRTI, 100);
    }
}

function initRTI() {
    console.log(RTI_PREFIX + " initRTI() called");

    // Verifier que SpiraAppSettings est maintenant disponible
    if (typeof SpiraAppSettings === 'undefined') {
        console.log(RTI_PREFIX + " [ERROR] SpiraAppSettings not available, RTI cannot initialize");
        return;
    }

    console.log(RTI_PREFIX + " Initializing RTI v" + RTI_VERSION);

    // Charger les settings de base
    if (!loadSettings()) {
        console.log(RTI_PREFIX + " [WARN] Settings not available or no templates configured, RTI disabled");
        return;
    }

    console.log(RTI_PREFIX + " Settings loaded, templates count: " + Object.keys(state.templates).length);
    console.log(RTI_PREFIX + " Target field: " + state.targetField);

    // Enregistrer event loaded pour injection au chargement initial (mode creation)
    spiraAppManager.registerEvent_loaded(onPageLoaded);
    console.log(RTI_PREFIX + " registerEvent_loaded registered");

    // Enregistrer event dropdownChanged pour injection au changement de type
    spiraAppManager.registerEvent_dropdownChanged("RequirementTypeId", onTypeChanged);
    console.log(RTI_PREFIX + " registerEvent_dropdownChanged registered for RequirementTypeId");

    // Enregistrer le handler pour le bouton menu (defini dans manifest.yaml)
    registerMenuHandler();

    console.log(RTI_PREFIX + " Event handlers registered successfully");
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

    // Champ cible (v2.0) - fallback sur Description si non configure
    var configuredField = state.settings.target_field;
    if (configuredField && configuredField.trim() !== "") {
        state.targetField = configuredField.trim();
    } else {
        state.targetField = RTI_DEFAULT_TARGET_FIELD;
    }
    log("DEBUG", "Target field configured:", state.targetField);

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
// HANDLER: PAGE LOADED (injection si champ cible vide)
// ============================================================
function onPageLoaded() {
    console.log(RTI_PREFIX + " onPageLoaded() triggered");
    console.log(RTI_PREFIX + " artifactId = " + spiraAppManager.artifactId);

    console.log(RTI_PREFIX + " Will check " + state.targetField + " after 500ms delay");

    // Delai pour laisser le formulaire se charger completement
    setTimeout(function() {
        console.log(RTI_PREFIX + " Delayed check starting now...");

        // Verifier si le champ cible est vide
        var currentValue = spiraAppManager.getDataItemField(state.targetField, "textValue");
        console.log(RTI_PREFIX + " Current " + state.targetField + ": " + (currentValue ? currentValue.substring(0, 50) : "(empty)"));

        if (currentValue && currentValue.trim() !== "") {
            console.log(RTI_PREFIX + " " + state.targetField + " not empty, skipping injection");
            return;
        }

        // Injecter le template pour le type actuel
        console.log(RTI_PREFIX + " " + state.targetField + " is empty, calling injectTemplateForCurrentType()");
        injectTemplateForCurrentType();
    }, 500);
}

// ============================================================
// HANDLER: TYPE CHANGED (injection au changement de type)
// ============================================================
function onTypeChanged(oldValue, newValue) {
    console.log(RTI_PREFIX + " onTypeChanged() triggered");
    console.log(RTI_PREFIX + " oldValue = " + oldValue + ", newValue = " + newValue);

    // Verifier qu'on a une nouvelle valeur
    if (!newValue) {
        console.log(RTI_PREFIX + " No newValue, skipping");
        return;
    }

    console.log(RTI_PREFIX + " Checking " + state.targetField + " field...");

    // Verifier si le champ cible est vide
    var currentValue = spiraAppManager.getDataItemField(state.targetField, "textValue");
    console.log(RTI_PREFIX + " Current " + state.targetField + ": " + (currentValue ? currentValue.substring(0, 50) : "(empty)"));

    if (currentValue && currentValue.trim() !== "") {
        console.log(RTI_PREFIX + " " + state.targetField + " not empty, skipping injection");
        return;
    }

    // Injecter le template pour le nouveau type
    console.log(RTI_PREFIX + " Calling injectTemplateForType with newValue: " + newValue);
    injectTemplateForType(String(newValue));
}

// ============================================================
// INJECTION DU TEMPLATE
// ============================================================

// Injecter le template pour un type specifique (utilise par onTypeChanged)
function injectTemplateForType(typeId) {
    console.log(RTI_PREFIX + " injectTemplateForType() called with typeId: " + typeId);

    // Recuperer le template depuis la map
    var template = state.templates[typeId];

    if (!template) {
        console.log(RTI_PREFIX + " No template configured for type ID " + typeId);
        return;
    }

    // Injecter dans le champ cible - utiliser la signature a 3 parametres avec "textValue" explicite
    console.log(RTI_PREFIX + " Injecting template into " + state.targetField + " for type ID " + typeId);
    console.log(RTI_PREFIX + " Template content (first 100 chars): " + template.substring(0, 100));
    spiraAppManager.updateFormField(state.targetField, "textValue", template);

    // Message de succes
    spiraAppManager.displaySuccessMessage("[RTI] Template injecte dans " + state.targetField);
}

// Injecter le template pour le type courant (utilise par le bouton et RTI_injectNow)
function injectTemplateForCurrentType() {
    // Recuperer le type actuel - utiliser getLiveFormFieldValue pour avoir la valeur live
    var liveValue = spiraAppManager.getLiveFormFieldValue("RequirementTypeId");
    var typeId = liveValue ? String(liveValue.intValue) : null;

    // Fallback sur getDataItemField si getLiveFormFieldValue ne fonctionne pas
    if (!typeId || typeId === "null" || typeId === "undefined") {
        var typeField = spiraAppManager.getDataItemField("RequirementTypeId", "intValue");
        typeId = String(typeField);
    }

    console.log(RTI_PREFIX + " injectTemplateForCurrentType() - detected typeId: " + typeId);

    // Appeler la fonction d'injection
    injectTemplateForType(typeId);
}

// ============================================================
// BOUTON D'INJECTION MANUELLE (via menu manifest)
// ============================================================
function registerMenuHandler() {
    // Enregistrer le handler pour le clic sur le bouton menu
    // Le bouton est defini dans manifest.yaml section "menus"
    // APP_GUID est fourni par Spira au chargement du script
    try {
        var guid = (typeof APP_GUID !== 'undefined') ? APP_GUID : RTI_GUID;
        spiraAppManager.registerEvent_menuEntryClick(guid, "injectTemplate", onInjectButtonClick);
        log("DEBUG", "Menu handler registered for 'injectTemplate'");
    } catch (err) {
        log("ERROR", "Failed to register menu handler", err);
    }
}

function onInjectButtonClick() {
    log("DEBUG", "Inject button clicked");

    // Recuperer la valeur actuelle du champ cible
    var currentValue = spiraAppManager.getDataItemField(state.targetField, "textValue");

    // Verifier si le champ est vide
    if (currentValue && currentValue.trim() !== "") {
        // Champ non vide - afficher un message d'avertissement
        spiraAppManager.displayWarningMessage(
            "[RTI] Le champ " + state.targetField + " n'est pas vide. Videz-le d'abord pour injecter un template."
        );
        log("INFO", "Injection blocked: " + state.targetField + " field is not empty");
        return;
    }

    // Champ vide - proceder a l'injection
    injectTemplateForCurrentType();
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
