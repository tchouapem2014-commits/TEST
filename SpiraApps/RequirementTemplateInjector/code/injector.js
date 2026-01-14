/**
 * REQUIREMENT TEMPLATE INJECTOR (RTI) - Version 1.0.0
 */

var RTI_GUID = 'b3f5a8d2-7c41-4e9a-b6d8-1f2e3a4b5c6d';

var DEFAULT_TEMPLATES = {
    "1": { "name": "Need", "template": "<h2>Context</h2>\n<p>[Describe the business context]</p>\n\n<h2>Objective</h2>\n<p>[Describe the objective]</p>\n\n<h2>Expected Benefits</h2>\n<ul>\n<li>[Benefit 1]</li>\n<li>[Benefit 2]</li>\n</ul>" },
    "2": { "name": "Feature", "template": "<h2>Description</h2>\n<p>[Describe the feature]</p>\n\n<h2>Business Rules</h2>\n<ul>\n<li><strong>BR01</strong>: [Rule 1]</li>\n<li><strong>BR02</strong>: [Rule 2]</li>\n</ul>\n\n<h2>Acceptance Criteria</h2>\n<ul>\n<li>[ ] Criteria 1</li>\n<li>[ ] Criteria 2</li>\n</ul>" },
    "3": { "name": "Use Case", "template": "<h2>Actors</h2>\n<p>[List the actors]</p>\n\n<h2>Preconditions</h2>\n<ul>\n<li>[Precondition 1]</li>\n</ul>\n\n<h2>Main Flow</h2>\n<ol>\n<li>[Step 1]</li>\n<li>[Step 2]</li>\n<li>[Step 3]</li>\n</ol>\n\n<h2>Postconditions</h2>\n<ul>\n<li>[Postcondition 1]</li>\n</ul>" },
    "4": { "name": "User Story", "template": "<h2>User Story</h2>\n<p><strong>As a</strong> [user role],</p>\n<p><strong>I want</strong> [action],</p>\n<p><strong>So that</strong> [benefit].</p>\n\n<h2>Acceptance Criteria</h2>\n<ul>\n<li>[ ] <strong>GIVEN</strong> [context]</li>\n<li>[ ] <strong>WHEN</strong> [action]</li>\n<li>[ ] <strong>THEN</strong> [result]</li>\n</ul>" },
    "5": { "name": "Quality", "template": "<h2>Quality Requirement</h2>\n<p>[Describe non-functional requirement]</p>\n\n<h2>Measurable Criteria</h2>\n<ul>\n<li><strong>Metric</strong>: [name]</li>\n<li><strong>Target</strong>: [value]</li>\n</ul>" }
};

var RTI_STATE = {
    isNewRequirement: false,
    lastInjectedTypeId: null,
    config: { enabled: false, templates: {}, customFields: [], skipIfNotEmpty: true, debugMode: false }
};

var RTI_DEBUG_ENABLED = false;

function rtiLog(msg, data) {
    if (RTI_DEBUG_ENABLED) {
        if (data) { console.log('[RTI]', msg, data); }
        else { console.log('[RTI]', msg); }
    }
}

// Start
rtiInit();

function rtiInit() {
    rtiLog('Initializing RTI v1.0.0');
    spiraAppManager.registerEvent_loaded(function() {
        rtiLog('Page loaded');
        rtiOnPageLoaded();
    });
}

function rtiOnPageLoaded() {
    // Load settings from SpiraAppSettings
    if (!SpiraAppSettings || !SpiraAppSettings[RTI_GUID]) {
        rtiLog('SpiraAppSettings not available');
        return;
    }

    var settings = SpiraAppSettings[RTI_GUID];
    rtiLog('Settings', settings);

    // Check enabled
    RTI_STATE.config.enabled = (settings.enabled === true || settings.enabled === 'Y');
    if (!RTI_STATE.config.enabled) {
        rtiLog('SpiraApp disabled');
        return;
    }

    // Debug mode
    RTI_DEBUG_ENABLED = (settings.debug_mode === true || settings.debug_mode === 'Y');
    rtiLog('Debug mode: ' + RTI_DEBUG_ENABLED);

    // Templates
    if (settings.templates_config && settings.templates_config.trim() !== '') {
        try {
            RTI_STATE.config.templates = JSON.parse(settings.templates_config);
        } catch (e) {
            rtiLog('JSON parse error', e);
            RTI_STATE.config.templates = DEFAULT_TEMPLATES;
        }
    } else {
        RTI_STATE.config.templates = DEFAULT_TEMPLATES;
    }

    // Custom fields
    if (settings.custom_fields && settings.custom_fields.trim() !== '') {
        RTI_STATE.config.customFields = settings.custom_fields.split(',').map(function(s) { return s.trim(); }).filter(function(s) { return s !== ''; });
    }

    // Skip if not empty
    RTI_STATE.config.skipIfNotEmpty = (settings.skip_if_not_empty === true || settings.skip_if_not_empty === 'Y');

    rtiLog('Config loaded', RTI_STATE.config);

    // Check if new requirement
    var reqId = spiraAppManager.getDataItemField('RequirementId');
    RTI_STATE.isNewRequirement = (!reqId || reqId <= 0);
    rtiLog('Is new requirement: ' + RTI_STATE.isNewRequirement + ' (reqId=' + reqId + ')');

    if (!RTI_STATE.isNewRequirement) {
        rtiLog('Not a new requirement, done');
        return;
    }

    // Get current type and inject
    var typeId = spiraAppManager.getDataItemField('RequirementTypeId');
    rtiLog('Initial type ID: ' + typeId);
    if (typeId) {
        rtiPerformInjection(parseInt(typeId, 10));
    }

    // Register for type dropdown changes
    spiraAppManager.registerEvent_dropdownChanged('RequirementTypeId', function(oldVal, newVal) {
        rtiLog('Type dropdown changed', { oldVal: oldVal, newVal: newVal });
        if (RTI_STATE.isNewRequirement && newVal) {
            setTimeout(function() {
                var newTypeId = parseInt(newVal, 10);
                if (newTypeId !== RTI_STATE.lastInjectedTypeId) {
                    rtiPerformInjection(newTypeId);
                }
            }, 10);
        }
        return true;
    });
}

function rtiPerformInjection(typeId) {
    rtiLog('Performing injection for type ' + typeId);

    var typeIdStr = String(typeId);
    var templateConfig = RTI_STATE.config.templates[typeIdStr] || DEFAULT_TEMPLATES[typeIdStr];

    if (!templateConfig || !templateConfig.template) {
        rtiLog('No template for type ' + typeId);
        return;
    }

    var injected = 0;

    // Description field
    if (rtiInjectField('Description', templateConfig.template)) {
        injected++;
    }

    // Custom fields
    for (var i = 0; i < RTI_STATE.config.customFields.length; i++) {
        if (rtiInjectField(RTI_STATE.config.customFields[i], templateConfig.template)) {
            injected++;
        }
    }

    if (injected > 0) {
        rtiLog('Injected ' + injected + ' field(s)');
        spiraAppManager.displaySuccessMessage('[RTI] Template "' + templateConfig.name + '" injected');
        RTI_STATE.lastInjectedTypeId = typeId;
    }
}

function rtiInjectField(fieldName, html) {
    try {
        var currentVal = spiraAppManager.getLiveFormFieldValue(fieldName);

        if (RTI_STATE.config.skipIfNotEmpty && currentVal) {
            var stripped = String(currentVal).replace(/<[^>]*>/g, '').trim();
            if (stripped !== '' && stripped !== '&nbsp;') {
                rtiLog('Skipping non-empty: ' + fieldName);
                return false;
            }
        }

        spiraAppManager.updateFormField(fieldName, html);
        rtiLog('Injected: ' + fieldName);
        return true;
    } catch (e) {
        rtiLog('Error injecting ' + fieldName, e);
        return false;
    }
}

// Debug helpers
window.RTI_showState = function() { console.log(RTI_STATE); return RTI_STATE; };
window.RTI_showConfig = function() { console.log(RTI_STATE.config); return RTI_STATE.config; };
window.RTI_forceInject = function(typeId) {
    if (!typeId) typeId = spiraAppManager.getDataItemField('RequirementTypeId');
    RTI_STATE.lastInjectedTypeId = null;
    rtiPerformInjection(parseInt(typeId, 10));
};
