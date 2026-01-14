# Requirement Template Injector (RTI) - Analyse Fonctionnelle

> **Version 6.0** | Date: 2026-01-14
> Basee sur SPEC.md et Documentation_SpiraApps_Developpement.md v1.4.0
>
> **Approche finale :**
> - Injection au **chargement** (`registerEvent_loaded`) + **changement de type** (`registerEvent_dropdownChanged`)
> - **5 slots configurables** : dropdown natif (`settingTypeId: 11`) + template RichText (`settingTypeId: 2`)
> - **Selection visuelle** du type dans une liste deroulante (pas de saisie manuelle)

---

## Table des Matieres

1. [Contexte et Objectifs](#1-contexte-et-objectifs)
2. [Specifications Fonctionnelles](#2-specifications-fonctionnelles)
3. [Architecture Technique](#3-architecture-technique)
4. [Maquettes Wireframes](#4-maquettes-wireframes)
5. [Cas de Test](#5-cas-de-test)
6. [Catalogue des Erreurs](#6-catalogue-des-erreurs)
7. [Roadmap](#7-roadmap)
8. [Annexes](#8-annexes)

---

## 1. Contexte et Objectifs

### 1.1 Problematique

Les equipes de redaction d'exigences dans Spira manquent de structure homogene pour documenter leurs requirements. Chaque redacteur utilise son propre format, ce qui entraine :

- Des incoherences dans la documentation
- Une perte de temps a formater manuellement
- Une difficulte a maintenir des standards de qualite

### 1.2 Solution Proposee

Developper une **SpiraApp** nommee **Requirement Template Injector (RTI)** qui :

1. Injecte automatiquement un template HTML dans le champ Description
2. Adapte le template selon le type d'exigence (RequirementTypeId)
3. S'execute **au chargement** et lors du **changement de type**
4. Preserve le contenu existant si l'utilisateur a deja saisi du texte

### 1.3 Choix d'Implementation

#### Pourquoi `loaded` + `dropdownChanged` plutot que `dataPreSave` ?

| Critere | `loaded` + `dropdownChanged` | `dataPreSave` |
| ------- | ---------------------------- | ------------- |
| **Simplicite** | ✅ Code synchrone, direct | ⚠️ Timing async complexe |
| **UX** | ✅ Template visible AVANT save | ❌ Visible apres save seulement |
| **Flexibilite** | ✅ L'user peut modifier avant save | ❌ Modification apres save |
| **Changement type** | ✅ Re-injection automatique | ❌ Pas de re-injection |

**Conclusion : `loaded` + `dropdownChanged` offre une meilleure UX et est plus simple.**

#### Pourquoi des dropdowns natifs (`settingTypeId: 11`) ?

| Critere | Dropdown natif | Saisie manuelle texte |
| ------- | -------------- | --------------------- |
| **UX Admin** | ✅ Selection visuelle, zero erreur | ❌ Doit connaitre le nom exact |
| **Types disponibles** | ✅ Liste automatique du produit | ❌ Doit verifier les noms |
| **Types personnalises** | ✅ Inclus automatiquement | ✅ Possible si nom correct |
| **Erreurs** | ✅ Impossible de se tromper | ❌ Fautes de frappe possibles |

**Configuration manifest :**

```yaml
- settingTypeId: 11        # ArtifactTypeSingleSelect (dropdown)
  artifactTypeId: 1        # 1 = Requirement → liste les types d'exigences
```

**Le dropdown affiche :** Need, Feature, Use Case, User Story, Quality, + types custom du produit

#### Pourquoi des champs RichText plutot que JSON ?

| Critere | Champs RichText (settingTypeId: 2) | JSON (settingTypeId: 9) |
| ------- | ---------------------------------- | ----------------------- |
| **UX Admin** | ✅ Editeur visuel WYSIWYG | ❌ Edition JSON brute |
| **Erreurs** | ✅ Impossible de casser la syntaxe | ❌ Erreurs JSON frequentes |
| **Preview** | ✅ Voir le rendu direct | ❌ Pas de preview |
| **Accessibilite** | ✅ Tout le monde peut l'utiliser | ❌ Necessite connaissances JSON |

**Conclusion : Editeur RichText = configuration intuitive pour tous.**

### 1.4 Comportement Utilisateur

```text
SCENARIO 1 - Creation nouvelle exigence :
1. L'utilisateur clique sur "Nouveau"
2. Le formulaire s'ouvre avec type par defaut (ex: Feature)
3. *** Le template "Feature" est IMMEDIATEMENT injecte dans Description ***
4. L'utilisateur peut modifier le template ou changer le type
5. S'il change le type -> le nouveau template remplace (si champ inchange)
6. Il sauvegarde avec le contenu pre-rempli

SCENARIO 2 - Edition exigence existante :
1. L'utilisateur ouvre un requirement existant
2. Pas d'injection (artifactId existe)
3. Comportement normal
```

### 1.5 Benefices Attendus

| Benefice | Impact |
| -------- | ------ |
| Uniformisation | Toutes les exigences suivent le meme format |
| Gain de temps | Template pre-rempli des l'ouverture |
| Qualite | Structure guidee pour une meilleure redaction |
| Flexibilite | Templates personnalisables visuellement |
| Accessibilite | Pas besoin de connaitre JSON/HTML |

### 1.6 Perimetre par Version

| Version | Fonctionnalites | Priorite |
| ------- | --------------- | -------- |
| v1.0 | Template sur champ Description + Config RichText | Haute |
| v1.1 | Support des champs Custom RichText | Moyenne |
| v1.2 | Templates par projet (product-level) | Basse |
| v1.3 | Import/Export des templates | Basse |

---

## 2. Specifications Fonctionnelles

### 2.1 Exigences Fonctionnelles

#### EF-001 : Injection au Chargement

| Attribut | Valeur |
| -------- | ------ |
| **ID** | EF-001 |
| **Titre** | Injecter le template lors du chargement de la page |
| **Priorite** | Critique |

**Description :**

L'injection du template doit se faire dans l'evenement `registerEvent_loaded`, des que la page s'affiche.

**Implementation technique :**

```javascript
spiraAppManager.registerEvent_loaded(function() {
    // Verifier si c'est une creation (pas d'artifactId)
    if (!spiraAppManager.artifactId) {
        injectTemplateForCurrentType();
    }
});
```

**Criteres d'acceptation :**

- [ ] Le template est visible des l'ouverture du formulaire
- [ ] Le template correspond au type par defaut (Feature)
- [ ] Pas d'injection en mode edition

---

#### EF-002 : Re-injection au Changement de Type

| Attribut | Valeur |
| -------- | ------ |
| **ID** | EF-002 |
| **Titre** | Re-injecter le template quand l'utilisateur change le type |
| **Priorite** | Critique |

**Description :**

Quand l'utilisateur change le RequirementTypeId, le template doit etre mis a jour.

**Implementation technique :**

```javascript
spiraAppManager.registerEvent_dropdownChanged("RequirementTypeId", function(oldVal, newVal) {
    // Re-injecter seulement si le champ n'a pas ete modifie
    if (canInject()) {
        injectTemplateForCurrentType();
    }
    return true; // Permettre le changement
});
```

**Criteres d'acceptation :**

- [ ] Changement de type -> nouveau template injecte
- [ ] Seulement si le contenu actuel = template precedent ou vide
- [ ] Le changement de type est autorise (`return true`)

---

#### EF-003 : Detection du Mode Creation

| Attribut | Valeur |
| -------- | ------ |
| **ID** | EF-003 |
| **Titre** | Detecter si c'est une nouvelle exigence |
| **Priorite** | Critique |

**Implementation technique :**

```javascript
function isCreationMode() {
    return !spiraAppManager.artifactId;
}
```

**Criteres d'acceptation :**

- [ ] `spiraAppManager.artifactId` est null/undefined en creation
- [ ] Pas d'injection si l'artefact existe deja

---

#### EF-004 : Configuration par Slots (Dropdown + Template RichText)

| Attribut | Valeur |
| -------- | ------ |
| **ID** | EF-004 |
| **Titre** | 5 slots configurables (dropdown type + template RichText) |
| **Priorite** | Critique |

**Description :**

L'admin dispose de **5 slots**. Chaque slot contient :

1. **Un dropdown natif** (settingTypeId: 11) pour **selectionner** le type d'exigence
2. **Un editeur RichText** (settingTypeId: 2) pour configurer le template

Le dropdown affiche automatiquement tous les types d'exigences du produit (standard + personnalises).

**Product Settings (manifest) :**

```yaml
productSettings:

  # ══════════════════════════════════════════════════════════════
  # SLOT 1 - Premier type configurable
  # ══════════════════════════════════════════════════════════════
  - settingTypeId: 11             # Dropdown des types d'exigences
    name: "type_id_1"
    caption: "Type d'exigence #1"
    position: 1
    artifactTypeId: 1             # 1 = Requirement
    tooltip: "Selectionnez le type d'exigence"

  - settingTypeId: 2              # Rich text (HTML)
    name: "template_1"
    caption: "Template #1"
    position: 2
    tooltip: "Template HTML pour le type ci-dessus"

  # ══════════════════════════════════════════════════════════════
  # SLOT 2 - Deuxieme type configurable
  # ══════════════════════════════════════════════════════════════
  - settingTypeId: 11
    name: "type_id_2"
    caption: "Type d'exigence #2"
    position: 3
    artifactTypeId: 1
    tooltip: "Selectionnez le type d'exigence"

  - settingTypeId: 2
    name: "template_2"
    caption: "Template #2"
    position: 4
    tooltip: "Template HTML pour le type ci-dessus"

  # ══════════════════════════════════════════════════════════════
  # SLOT 3 - Troisieme type configurable
  # ══════════════════════════════════════════════════════════════
  - settingTypeId: 11
    name: "type_id_3"
    caption: "Type d'exigence #3"
    position: 5
    artifactTypeId: 1
    tooltip: "Selectionnez le type d'exigence"

  - settingTypeId: 2
    name: "template_3"
    caption: "Template #3"
    position: 6
    tooltip: "Template HTML pour le type ci-dessus"

  # ══════════════════════════════════════════════════════════════
  # SLOT 4 - Quatrieme type configurable
  # ══════════════════════════════════════════════════════════════
  - settingTypeId: 11
    name: "type_id_4"
    caption: "Type d'exigence #4"
    position: 7
    artifactTypeId: 1
    tooltip: "Selectionnez le type d'exigence"

  - settingTypeId: 2
    name: "template_4"
    caption: "Template #4"
    position: 8
    tooltip: "Template HTML pour le type ci-dessus"

  # ══════════════════════════════════════════════════════════════
  # SLOT 5 - Cinquieme type configurable
  # ══════════════════════════════════════════════════════════════
  - settingTypeId: 11
    name: "type_id_5"
    caption: "Type d'exigence #5"
    position: 9
    artifactTypeId: 1
    tooltip: "Selectionnez le type d'exigence"

  - settingTypeId: 2
    name: "template_5"
    caption: "Template #5"
    position: 10
    tooltip: "Template HTML pour le type ci-dessus"
```

**Avantages de cette approche :**

| Avantage | Description |
| -------- | ----------- |
| **UX optimale** | L'admin selectionne dans une liste, zero erreur possible |
| **Types auto** | Le dropdown liste automatiquement tous les types du produit |
| **Types custom** | Les types personnalises apparaissent dans la liste |
| **Simple** | Pas besoin de connaitre les IDs ou les noms exacts |
| **Visuel** | Editeur RichText WYSIWYG pour les templates |

**Criteres d'acceptation :**

- [ ] 5 slots disponibles dans Product Settings
- [ ] Chaque slot a un dropdown listant les types d'exigences du produit
- [ ] Chaque slot a un editeur RichText pour le template
- [ ] Le dropdown retourne directement le RequirementTypeId
- [ ] Un slot sans type selectionne est ignore
- [ ] Si un type est selectionne plusieurs fois, seul le premier template est utilise

---

#### EF-005 : Protection du Contenu Modifie

| Attribut | Valeur |
| -------- | ------ |
| **ID** | EF-005 |
| **Titre** | Ne pas ecraser le contenu modifie par l'utilisateur |
| **Priorite** | Haute |

**Description :**

Si l'utilisateur a modifie le contenu (different du template original), ne pas re-injecter.

**Implementation technique :**

```javascript
var lastInjectedTemplate = "";

function canInject() {
    var currentValue = spiraAppManager.getDataItemField("Description", "textValue");

    // Peut injecter si:
    // - Champ vide
    // - Champ = dernier template injecte (pas modifie)
    if (!currentValue || currentValue.trim() === "") return true;
    if (currentValue === lastInjectedTemplate) return true;

    return false;
}
```

**Criteres d'acceptation :**

- [ ] Pas d'injection si le champ a ete modifie manuellement
- [ ] Injection OK si le champ = template precedent
- [ ] Injection OK si le champ est vide

---

#### EF-006 : Mode Debug

| Attribut | Valeur |
| -------- | ------ |
| **ID** | EF-006 |
| **Titre** | Option de debug pour le depannage |
| **Priorite** | Moyenne |

**Product Setting :**

```yaml
  - settingTypeId: 10             # Boolean
    name: "debug_mode"
    caption: "Mode debug"
    position: 10
    tooltip: "Affiche les logs dans la console navigateur (F12)"
```

---

### 2.2 Exigences Non-Fonctionnelles

#### ENF-001 : Performance

| Attribut | Valeur |
| -------- | ------ |
| **ID** | ENF-001 |
| **Titre** | Injection immediate sans delai perceptible |
| **Critere** | Injection < 100ms |

---

#### ENF-002 : Compatibilite

| Attribut | Valeur |
| -------- | ------ |
| **ID** | ENF-002 |
| **Titre** | Support navigateurs modernes |
| **Critere** | Chrome, Firefox, Edge (versions recentes) |

---

#### ENF-003 : Maintenabilite

| Attribut | Valeur |
| -------- | ------ |
| **ID** | ENF-003 |
| **Titre** | Logs de debug configurables |
| **Implementation** | Console.log avec prefixe [RTI] |

---

## 3. Architecture Technique

### 3.1 Structure des Fichiers

```text
RequirementTemplateInjector/
├── manifest.yaml
├── code/
│   └── injector.js
├── SPEC.md
├── ANALYSE_FONCTIONNELLE.md (ce fichier)
└── README.md
```

### 3.2 Manifest SpiraApp Complet

```yaml
# ============================================================
# REQUIREMENT TEMPLATE INJECTOR
# Version 1.0.0 - Dropdown natif + Template RichText
# ============================================================

# Metadata obligatoire
guid: "b3f5a8d2-7c41-4e9a-b6d8-1f2e3a4b5c6d"
name: "RequirementTemplateInjector"
caption: "Requirement Template Injector"
summary: "Injecte des templates dans les champs RichText des exigences"
description: >-
  SpiraApp qui injecte automatiquement des templates de description
  formates en HTML lors de la creation de nouvelles exigences.
  Configurez jusqu'a 5 types d'exigences avec leurs templates.
version: 1.0
author: "SpiraApps Developer"
license: "MIT"
copyright: "2025"

# ============================================================
# PRODUCT SETTINGS - 5 SLOTS (Dropdown + Template RichText)
# ============================================================
productSettings:

  # ══════════════════════════════════════════════════════════════
  # SLOT 1
  # ══════════════════════════════════════════════════════════════
  - settingTypeId: 11             # Dropdown des types d'exigences
    name: "type_id_1"
    caption: "Type d'exigence #1"
    position: 1
    artifactTypeId: 1             # 1 = Requirement
    tooltip: "Selectionnez le type d'exigence"

  - settingTypeId: 2              # Editeur RichText
    name: "template_1"
    caption: "Template #1"
    position: 2
    tooltip: "Template HTML pour le type ci-dessus"

  # ══════════════════════════════════════════════════════════════
  # SLOT 2
  # ══════════════════════════════════════════════════════════════
  - settingTypeId: 11
    name: "type_id_2"
    caption: "Type d'exigence #2"
    position: 3
    artifactTypeId: 1
    tooltip: "Selectionnez le type d'exigence"

  - settingTypeId: 2
    name: "template_2"
    caption: "Template #2"
    position: 4
    tooltip: "Template HTML pour le type ci-dessus"

  # ══════════════════════════════════════════════════════════════
  # SLOT 3
  # ══════════════════════════════════════════════════════════════
  - settingTypeId: 11
    name: "type_id_3"
    caption: "Type d'exigence #3"
    position: 5
    artifactTypeId: 1
    tooltip: "Selectionnez le type d'exigence"

  - settingTypeId: 2
    name: "template_3"
    caption: "Template #3"
    position: 6
    tooltip: "Template HTML pour le type ci-dessus"

  # ══════════════════════════════════════════════════════════════
  # SLOT 4
  # ══════════════════════════════════════════════════════════════
  - settingTypeId: 11
    name: "type_id_4"
    caption: "Type d'exigence #4"
    position: 7
    artifactTypeId: 1
    tooltip: "Selectionnez le type d'exigence"

  - settingTypeId: 2
    name: "template_4"
    caption: "Template #4"
    position: 8
    tooltip: "Template HTML pour le type ci-dessus"

  # ══════════════════════════════════════════════════════════════
  # SLOT 5
  # ══════════════════════════════════════════════════════════════
  - settingTypeId: 11
    name: "type_id_5"
    caption: "Type d'exigence #5"
    position: 9
    artifactTypeId: 1
    tooltip: "Selectionnez le type d'exigence"

  - settingTypeId: 2
    name: "template_5"
    caption: "Template #5"
    position: 10
    tooltip: "Template HTML pour le type ci-dessus"

  # ══════════════════════════════════════════════════════════════
  # OPTIONS
  # ══════════════════════════════════════════════════════════════
  - settingTypeId: 10             # Boolean
    name: "debug_mode"
    caption: "Mode debug"
    position: 20
    tooltip: "Affiche les logs dans la console navigateur (F12)"

# ============================================================
# PAGE CONTENTS - Code injecte sur RequirementDetails
# ============================================================
pageContents:
  - pageId: 9                     # RequirementDetails
    name: "templateInjector"
    code: "file://code/injector.js"
```

### 3.3 Structure des Slots

| Slot | Setting Type ID | Setting Template | Description |
| ---- | --------------- | ---------------- | ----------- |
| 1 | `type_id_1` | `template_1` | Premier type configurable |
| 2 | `type_id_2` | `template_2` | Deuxieme type configurable |
| 3 | `type_id_3` | `template_3` | Troisieme type configurable |
| 4 | `type_id_4` | `template_4` | Quatrieme type configurable |
| 5 | `type_id_5` | `template_5` | Cinquieme type configurable |

> **Note** : L'admin **selectionne** le type dans un dropdown. Le dropdown retourne directement le `RequirementTypeId`.

### 3.4 Flux d'Execution

```text
[Page RequirementDetails charge]
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│  registerEvent_loaded()                                      │
│                                                              │
│  1. Charger settings (templates RichText)                   │
│  2. Verifier si creation (!spiraAppManager.artifactId)      │
│  3. Recuperer type actuel (defaut: Feature = 2)             │
│  4. Charger template correspondant                          │
│  5. Si template existe: injecter dans Description           │
└─────────────────────────────────────────────────────────────┘
     │
     ▼
[Template visible immediatement dans le formulaire]
     │
     ▼
[Utilisateur peut modifier le type]
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│  registerEvent_dropdownChanged("RequirementTypeId")          │
│                                                              │
│  1. Verifier si contenu = template precedent ou vide        │
│  2. Si oui: charger nouveau template et injecter            │
│  3. Si non: ne pas toucher (utilisateur a modifie)          │
│  4. return true pour autoriser le changement                │
└─────────────────────────────────────────────────────────────┘
     │
     ▼
[Nouveau template injecte si applicable]
```

### 3.5 Code Principal (injector.js)

```javascript
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
```

---

## 4. Maquettes Wireframes

> **Note**: Les maquettes suivantes representent fidelement l'interface Spira avec tous les elements de navigation et les interactions utilisateur.

---

### 4.1 ADMINISTRATION - Liste des SpiraApps

```text
╔══════════════════════════════════════════════════════════════════════════════════════╗
║  SpiraPlan v8.0                                                    [?] [⚙] [👤 Admin]║
╠══════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                       ║
║  ┌─────────────────┐                                                                  ║
║  │ ADMINISTRATION  │                                                                  ║
║  ├─────────────────┤                                                                  ║
║  │ ▸ System        │   PRODUCT ADMINISTRATION > SPIRAAPPS                             ║
║  │ ▾ Product       │   ═══════════════════════════════════════════                    ║
║  │   ├─ General    │                                                                  ║
║  │   ├─ Users      │   Manage SpiraApps for this product. SpiraApps extend            ║
║  │   ├─ Planning   │   functionality and integrate with external services.            ║
║  │   ├─ Workflows  │                                                                  ║
║  │   ├─ Templates  │   ┌─────────────────────────────────────────────────────────┐    ║
║  │   └─ SpiraApps ◀│   │ INSTALLED SPIRAAPPS                              [+ Add]│    ║
║  └─────────────────┘   ├─────────────────────────────────────────────────────────┤    ║
║                        │                                                         │    ║
║                        │  ┌──────┐  Requirement Template Injector      v1.0.0   │    ║
║                        │  │ RTI  │  ─────────────────────────────────────────   │    ║
║                        │  │ ✓    │  Injecte des templates dans les champs       │    ║
║                        │  └──────┘  RichText des exigences lors de leur         │    ║
║                        │            creation.                                    │    ║
║                        │                                                         │    ║
║                        │            Status: [●] Active                           │    ║
║                        │                                                         │    ║
║                        │            [Configure]  [Disable]  [Remove]             │    ║
║                        │                                                         │    ║
║                        ├─────────────────────────────────────────────────────────┤    ║
║                        │                                                         │    ║
║                        │  ┌──────┐  Another SpiraApp                   v2.1.0   │    ║
║                        │  │ APP  │  ─────────────────────────────────────────   │    ║
║                        │  │      │  Description of another app...               │    ║
║                        │  └──────┘                                               │    ║
║                        │                                                         │    ║
║                        └─────────────────────────────────────────────────────────┘    ║
║                                                                                       ║
╚══════════════════════════════════════════════════════════════════════════════════════╝
```

---

### 4.2 ADMINISTRATION - Configuration SpiraApp (Dropdown type + Template RichText)

```text
╔══════════════════════════════════════════════════════════════════════════════════════╗
║  SpiraPlan v8.0                                                    [?] [⚙] [👤 Admin]║
╠══════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                       ║
║  PRODUCT ADMINISTRATION > SPIRAAPPS > REQUIREMENT TEMPLATE INJECTOR                   ║
║  ════════════════════════════════════════════════════════════════════════════════     ║
║                                                                                       ║
║  ┌────────────────────────────────────────────────────────────────────────────────┐   ║
║  │  ╔═══════════════════════════════════════════════════════════════════════════╗ │   ║
║  │  ║  REQUIREMENT TEMPLATE INJECTOR                                    v1.0.0  ║ │   ║
║  │  ║═══════════════════════════════════════════════════════════════════════════║ │   ║
║  │  ║  Injecte automatiquement des templates HTML dans les descriptions des     ║ │   ║
║  │  ║  requirements lors de leur creation. Configurez jusqu'a 5 types.          ║ │   ║
║  │  ║                                                                           ║ │   ║
║  │  ║  💡 Selectionnez un type dans la liste deroulante pour chaque slot        ║ │   ║
║  │  ╚═══════════════════════════════════════════════════════════════════════════╝ │   ║
║  │                                                                                │   ║
║  │  ┌──────────────────────────────────────────────────────────────────────────┐  │   ║
║  │  │  PRODUCT SETTINGS - CONFIGURATION DES TEMPLATES                          │  │   ║
║  │  ├──────────────────────────────────────────────────────────────────────────┤  │   ║
║  │  │                                                                          │  │   ║
║  │  │  ╔════════════════════════════════════════════════════════════════════╗  │  │   ║
║  │  │  ║  SLOT #1                                                           ║  │  │   ║
║  │  │  ╚════════════════════════════════════════════════════════════════════╝  │  │   ║
║  │  │                                                                          │  │   ║
║  │  │  Type d'exigence #1:  ┌──────────────────────────────────────────┐ [▼]  │  │   ║
║  │  │                       │ Feature                                  │      │  │   ║
║  │  │                       ├──────────────────────────────────────────┤      │  │   ║
║  │  │                       │   Need                                   │      │  │   ║
║  │  │                       │ ✓ Feature                                │      │  │   ║
║  │  │                       │   Use Case                               │      │  │   ║
║  │  │                       │   User Story                             │      │  │   ║
║  │  │                       │   Quality                                │      │  │   ║
║  │  │                       │   [Types custom du produit...]           │      │  │   ║
║  │  │                       └──────────────────────────────────────────┘      │  │   ║
║  │  │                                                                          │  │   ║
║  │  │  Template #1:                                                      [i]   │  │   ║
║  │  │  ┌────────────────────────────────────────────────────────────────────┐  │  │   ║
║  │  │  │ [B] [I] [U] [S] │ [🔗] [📷] │ [≡] [•] │ [📊] │ [</>] │    [⤢]     │  │  │   ║
║  │  │  ├────────────────────────────────────────────────────────────────────┤  │  │   ║
║  │  │  │                                                                    │  │  │   ║
║  │  │  │  ┌─────────────────────────────────────────────────────────────┐   │  │  │   ║
║  │  │  │  │ Description                                                 │   │  │  │   ║
║  │  │  │  └─────────────────────────────────────────────────────────────┘   │  │  │   ║
║  │  │  │  [Description detaillee de la fonctionnalite]                      │  │  │   ║
║  │  │  │                                                                    │  │  │   ║
║  │  │  │  ┌─────────────────────────────────────────────────────────────┐   │  │  │   ║
║  │  │  │  │ Regles de Gestion                                           │   │  │  │   ║
║  │  │  │  └─────────────────────────────────────────────────────────────┘   │  │  │   ║
║  │  │  │  • RG01: [Regle 1]                                                 │  │  │   ║
║  │  │  │  • RG02: [Regle 2]                                                 │  │  │   ║
║  │  │  │                                                                    │  │  │   ║
║  │  │  │  ┌─────────────────────────────────────────────────────────────┐   │  │  │   ║
║  │  │  │  │ Criteres d'Acceptation                                      │   │  │  │   ║
║  │  │  │  └─────────────────────────────────────────────────────────────┘   │  │  │   ║
║  │  │  │  ☐ Critere 1                                                       │  │  │   ║
║  │  │  │  ☐ Critere 2                                                       │  │  │   ║
║  │  │  │                                                                    │  │  │   ║
║  │  │  └────────────────────────────────────────────────────────────────────┘  │  │   ║
║  │  │                                                                          │  │   ║
║  │  │  ────────────────────────────────────────────────────────────────────    │  │   ║
║  │  │                                                                          │  │   ║
║  │  │  ╔════════════════════════════════════════════════════════════════════╗  │  │   ║
║  │  │  ║  SLOT #2                                                           ║  │  │   ║
║  │  │  ╚════════════════════════════════════════════════════════════════════╝  │  │   ║
║  │  │                                                                          │  │   ║
║  │  │  Type d'exigence #2:  ┌──────────────────────────────────────────┐ [▼]  │  │   ║
║  │  │                       │ User Story                               │      │  │   ║
║  │  │                       └──────────────────────────────────────────┘      │  │   ║
║  │  │                                                                          │  │   ║
║  │  │  Template #2:                                                      [i]   │  │   ║
║  │  │  ┌────────────────────────────────────────────────────────────────────┐  │  │   ║
║  │  │  │ [B] [I] [U] [S] │ [🔗] [📷] │ [≡] [•] │ [📊] │ [</>] │    [⤢]     │  │  │   ║
║  │  │  ├────────────────────────────────────────────────────────────────────┤  │  │   ║
║  │  │  │                                                                    │  │  │   ║
║  │  │  │  **En tant que** [type d'utilisateur]                              │  │  │   ║
║  │  │  │  **Je veux** [fonctionnalite souhaitee]                            │  │  │   ║
║  │  │  │  **Afin de** [benefice/valeur]                                     │  │  │   ║
║  │  │  │                                                                    │  │  │   ║
║  │  │  │  Criteres d'acceptation:                                           │  │  │   ║
║  │  │  │  • Etant donne [contexte], quand [action], alors [resultat]        │  │  │   ║
║  │  │  │                                                                    │  │  │   ║
║  │  │  └────────────────────────────────────────────────────────────────────┘  │  │   ║
║  │  │                                                                          │  │   ║
║  │  └──────────────────────────────────────────────────────────────────────────┘  │   ║
║  │                                                                                │   ║
║  │                                     [Scroll down for slots 3, 4, 5...]         │   ║
║  │                                                                                │   ║
║  └────────────────────────────────────────────────────────────────────────────────┘   ║
║                                                                                       ║
╚══════════════════════════════════════════════════════════════════════════════════════╝
```

---

### 4.3 ADMINISTRATION - Configuration SpiraApp (Suite - Slots 3, 4, 5 + Options)

```text
╔══════════════════════════════════════════════════════════════════════════════════════╗
║  SpiraPlan v8.0                                                    [?] [⚙] [👤 Admin]║
╠══════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                       ║
║  PRODUCT ADMINISTRATION > SPIRAAPPS > REQUIREMENT TEMPLATE INJECTOR (suite)           ║
║  ════════════════════════════════════════════════════════════════════════════════     ║
║                                                                                       ║
║  ┌────────────────────────────────────────────────────────────────────────────────┐   ║
║  │                                                                                │   ║
║  │  ╔════════════════════════════════════════════════════════════════════════╗   │   ║
║  │  ║  SLOT #3                                                               ║   │   ║
║  │  ╚════════════════════════════════════════════════════════════════════════╝   │   ║
║  │                                                                                │   ║
║  │  Type d'exigence #3:  ┌────────────────────────────────────────────┐ [▼]      │   ║
║  │                       │ Need                                       │          │   ║
║  │                       └────────────────────────────────────────────┘          │   ║
║  │                                                                                │   ║
║  │  Template #3:                                                           [i]   │   ║
║  │  ┌────────────────────────────────────────────────────────────────────────┐   │   ║
║  │  │ [B] [I] [U] [S] │ [🔗] [📷] │ [≡] [•] │ [📊] │ [</>] │    [⤢]        │   │   ║
║  │  ├────────────────────────────────────────────────────────────────────────┤   │   ║
║  │  │  Contexte Metier: [...]                                                │   │   ║
║  │  │  Description du Besoin: [...]                                          │   │   ║
║  │  │  Benefices Attendus: • [...]                                           │   │   ║
║  │  └────────────────────────────────────────────────────────────────────────┘   │   ║
║  │                                                                                │   ║
║  │  ────────────────────────────────────────────────────────────────────────────  │   ║
║  │                                                                                │   ║
║  │  ╔════════════════════════════════════════════════════════════════════════╗   │   ║
║  │  ║  SLOT #4                                                               ║   │   ║
║  │  ╚════════════════════════════════════════════════════════════════════════╝   │   ║
║  │                                                                                │   ║
║  │  Type d'exigence #4:  ┌────────────────────────────────────────────┐ [▼]      │   ║
║  │                       │ -- Selectionner --                         │ ◀ VIDE   │   ║
║  │                       └────────────────────────────────────────────┘          │   ║
║  │                                                                                │   ║
║  │  Template #4:                                                           [i]   │   ║
║  │  ┌────────────────────────────────────────────────────────────────────────┐   │   ║
║  │  │                        (Slot non utilise)                              │   │   ║
║  │  └────────────────────────────────────────────────────────────────────────┘   │   ║
║  │                                                                                │   ║
║  │  ────────────────────────────────────────────────────────────────────────────  │   ║
║  │                                                                                │   ║
║  │  ╔════════════════════════════════════════════════════════════════════════╗   │   ║
║  │  ║  SLOT #5                                                               ║   │   ║
║  │  ╚════════════════════════════════════════════════════════════════════════╝   │   ║
║  │                                                                                │   ║
║  │  Type d'exigence #5:  ┌────────────────────────────────────────────┐ [▼]      │   ║
║  │                       │ -- Selectionner --                         │ ◀ VIDE   │   ║
║  │                       └────────────────────────────────────────────┘          │   ║
║  │                                                                                │   ║
║  │  Template #5:                                                           [i]   │   ║
║  │  ┌────────────────────────────────────────────────────────────────────────┐   │   ║
║  │  │                        (Slot non utilise)                              │   │   ║
║  │  └────────────────────────────────────────────────────────────────────────┘   │   ║
║  │                                                                                │   ║
║  │  ════════════════════════════════════════════════════════════════════════════  │   ║
║  │                                                                                │   ║
║  │  OPTIONS AVANCEES                                                              │   ║
║  │  ┌────────────────────────────────────────────────────────────────────────┐   │   ║
║  │  │                                                                        │   │   ║
║  │  │  Mode debug:  [☐]                                                      │   │   ║
║  │  │               Affiche les logs dans la console navigateur (F12)        │   │   ║
║  │  │                                                                        │   │   ║
║  │  └────────────────────────────────────────────────────────────────────────┘   │   ║
║  │                                                                                │   ║
║  │  ┌────────────────────────────────────────────────────────────────────────┐   │   ║
║  │  │  💡 COMMENT CA MARCHE                                                  │   │   ║
║  │  │  ─────────────────────────────────────────                             │   │   ║
║  │  │  1. Selectionnez un type d'exigence dans la liste deroulante           │   │   ║
║  │  │  2. Configurez le template HTML dans l'editeur RichText                │   │   ║
║  │  │  3. Le template sera injecte a la creation d'une exigence de ce type   │   │   ║
║  │  │                                                                        │   │   ║
║  │  │  La liste inclut tous les types standards + vos types personnalises    │   │   ║
║  │  └────────────────────────────────────────────────────────────────────────┘   │   ║
║  │                                                                                │   ║
║  │                                    [  Annuler  ]    [  Sauvegarder  ]          │   ║
║  │                                                                                │   ║
║  └────────────────────────────────────────────────────────────────────────────────┘   ║
║                                                                                       ║
╚══════════════════════════════════════════════════════════════════════════════════════╝
```

---

### 4.4 INTERFACE UTILISATEUR - Nouvelle Exigence (Etape 1: Ouverture)

```text
╔══════════════════════════════════════════════════════════════════════════════════════╗
║  SpiraPlan v8.0                                                 [?] [⚙] [👤 JDupont]║
╠══════════════════════════════════════════════════════════════════════════════════════╣
║  [Projects ▾]  [Artifacts ▾]  [Reports ▾]  [Documents ▾]  [Admin ▾]                  ║
╠══════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                       ║
║  📁 My Project > Requirements > RQ:??? (New)                                          ║
║  ══════════════════════════════════════════                                           ║
║                                                                                       ║
║  ┌────────────────────────────────────────────────────────────────────────────────┐   ║
║  │ [💾 Save] [💾 Save & New] [↩ Undo] [🗑 Delete] [⋮ More ▾]                       │   ║
║  └────────────────────────────────────────────────────────────────────────────────┘   ║
║                                                                                       ║
║  ┌─ GENERAL ──────────────────────────────────────────────────────────────────────┐   ║
║  │                                                                                │   ║
║  │  Name*:        ┌────────────────────────────────────────────────────────────┐  │   ║
║  │                │                                                            │  │   ║
║  │                └────────────────────────────────────────────────────────────┘  │   ║
║  │                                                                                │   ║
║  │  Type*:        ┌────────────────────────────────────────────┐                  │   ║
║  │                │ Feature                                  ▾ │ ◀── TYPE DEFAUT │   ║
║  │                └────────────────────────────────────────────┘                  │   ║
║  │                                                                                │   ║
║  │  Status*:      ┌────────────────────────────────────────────┐                  │   ║
║  │                │ Requested                                ▾ │                  │   ║
║  │                └────────────────────────────────────────────┘                  │   ║
║  │                                                                                │   ║
║  │  Importance:   ┌────────────────────────────────────────────┐                  │   ║
║  │                │ -- None --                               ▾ │                  │   ║
║  │                └────────────────────────────────────────────┘                  │   ║
║  │                                                                                │   ║
║  └────────────────────────────────────────────────────────────────────────────────┘   ║
║                                                                                       ║
║  ┌─ DESCRIPTION ──────────────────────────────────────────────────────────────────┐   ║
║  │                                                                                │   ║
║  │  ┌──────────────────────────────────────────────────────────────────────────┐  │   ║
║  │  │ [B] [I] [U] [S] │ [🔗 Link] [📷 Image] │ [≡] [•] [1.] │ [📊] │ [</>]    │  │   ║
║  │  ├──────────────────────────────────────────────────────────────────────────┤  │   ║
║  │  │                                                                          │  │   ║
║  │  │  ╔════════════════════════════════════════════════════════════════════╗  │  │   ║
║  │  │  ║                        Description                                 ║  │  │   ║
║  │  │  ╚════════════════════════════════════════════════════════════════════╝  │  │   ║
║  │  │  [Description detaillee de la fonctionnalite]                            │  │   ║
║  │  │                                                                          │  │   ║
║  │  │  ╔════════════════════════════════════════════════════════════════════╗  │  │   ║
║  │  │  ║                      Regles de Gestion                             ║  │  │   ║
║  │  │  ╚════════════════════════════════════════════════════════════════════╝  │  │   ║
║  │  │  • RG01: [Regle 1]                                                       │  │   ║
║  │  │  • RG02: [Regle 2]                                                       │  │   ║
║  │  │                                                                          │  │   ║
║  │  │  ╔════════════════════════════════════════════════════════════════════╗  │  │   ║
║  │  │  ║                    Criteres d'Acceptation                          ║  │  │   ║
║  │  │  ╚════════════════════════════════════════════════════════════════════╝  │  │   ║
║  │  │  ☐ Critere 1                                                             │  │   ║
║  │  │  ☐ Critere 2                                                             │  │   ║
║  │  │                                                                          │  │   ║
║  │  └──────────────────────────────────────────────────────────────────────────┘  │   ║
║  │       ▲                                                                        │   ║
║  │       │                                                                        │   ║
║  │       └──── 🎯 TEMPLATE "FEATURE" INJECTE AUTOMATIQUEMENT PAR RTI !            │   ║
║  │                                                                                │   ║
║  └────────────────────────────────────────────────────────────────────────────────┘   ║
║                                                                                       ║
╚══════════════════════════════════════════════════════════════════════════════════════╝
```

---

### 4.5 INTERFACE UTILISATEUR - Changement de Type (User Story)

```text
╔══════════════════════════════════════════════════════════════════════════════════════╗
║  SpiraPlan v8.0                                                 [?] [⚙] [👤 JDupont]║
╠══════════════════════════════════════════════════════════════════════════════════════╣
║  [Projects ▾]  [Artifacts ▾]  [Reports ▾]  [Documents ▾]  [Admin ▾]                  ║
╠══════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                       ║
║  📁 My Project > Requirements > RQ:??? (New)                                          ║
║  ══════════════════════════════════════════                                           ║
║                                                                                       ║
║  ┌────────────────────────────────────────────────────────────────────────────────┐   ║
║  │ [💾 Save] [💾 Save & New] [↩ Undo] [🗑 Delete] [⋮ More ▾]                       │   ║
║  └────────────────────────────────────────────────────────────────────────────────┘   ║
║                                                                                       ║
║  ┌─ GENERAL ──────────────────────────────────────────────────────────────────────┐   ║
║  │                                                                                │   ║
║  │  Name*:        ┌────────────────────────────────────────────────────────────┐  │   ║
║  │                │ Gestion des notifications utilisateur                      │  │   ║
║  │                └────────────────────────────────────────────────────────────┘  │   ║
║  │                                                                                │   ║
║  │  Type*:        ┌────────────────────────────────────────────┐                  │   ║
║  │                │ User Story                               ▾ │ ◀── CHANGE !    │   ║
║  │                ├────────────────────────────────────────────┤                  │   ║
║  │                │   Need                                     │                  │   ║
║  │                │ ✓ Feature                                  │                  │   ║
║  │                │   Use Case                                 │                  │   ║
║  │                │ ► User Story ◀─────────────────────────────│─ SELECTIONNE    │   ║
║  │                │   Quality                                  │                  │   ║
║  │                │   Epic                                     │                  │   ║
║  │                └────────────────────────────────────────────┘                  │   ║
║  │                                                                                │   ║
║  └────────────────────────────────────────────────────────────────────────────────┘   ║
║                                                                                       ║
║                            ┌──────────────────────────────────┐                       ║
║                            │  🔄 RTI: Re-injection en cours   │                       ║
║                            │     Template -> User Story       │                       ║
║                            └──────────────────────────────────┘                       ║
║                                          │                                            ║
║                                          ▼                                            ║
║  ┌─ DESCRIPTION ──────────────────────────────────────────────────────────────────┐   ║
║  │                                                                                │   ║
║  │  ┌──────────────────────────────────────────────────────────────────────────┐  │   ║
║  │  │ [B] [I] [U] [S] │ [🔗 Link] [📷 Image] │ [≡] [•] [1.] │ [📊] │ [</>]    │  │   ║
║  │  ├──────────────────────────────────────────────────────────────────────────┤  │   ║
║  │  │                                                                          │  │   ║
║  │  │  **En tant que** [type d'utilisateur]                                    │  │   ║
║  │  │                                                                          │  │   ║
║  │  │  **Je veux** [fonctionnalite souhaitee]                                  │  │   ║
║  │  │                                                                          │  │   ║
║  │  │  **Afin de** [benefice/valeur]                                           │  │   ║
║  │  │                                                                          │  │   ║
║  │  │  ╔════════════════════════════════════════════════════════════════════╗  │  │   ║
║  │  │  ║                    Criteres d'acceptation                          ║  │  │   ║
║  │  │  ╚════════════════════════════════════════════════════════════════════╝  │  │   ║
║  │  │  • Etant donne [contexte], quand [action], alors [resultat]              │  │   ║
║  │  │                                                                          │  │   ║
║  │  │  ╔════════════════════════════════════════════════════════════════════╗  │  │   ║
║  │  │  ║                      Notes techniques                              ║  │  │   ║
║  │  │  ╚════════════════════════════════════════════════════════════════════╝  │  │   ║
║  │  │  [Notes pour l'equipe technique]                                         │  │   ║
║  │  │                                                                          │  │   ║
║  │  └──────────────────────────────────────────────────────────────────────────┘  │   ║
║  │       ▲                                                                        │   ║
║  │       │                                                                        │   ║
║  │       └──── 🎯 NOUVEAU TEMPLATE "USER STORY" INJECTE !                         │   ║
║  │                                                                                │   ║
║  └────────────────────────────────────────────────────────────────────────────────┘   ║
║                                                                                       ║
╚══════════════════════════════════════════════════════════════════════════════════════╝
```

---

### 4.6 INTERFACE UTILISATEUR - Contenu Modifie (Protection)

```text
╔══════════════════════════════════════════════════════════════════════════════════════╗
║  SpiraPlan v8.0                                                 [?] [⚙] [👤 JDupont]║
╠══════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                       ║
║  📁 My Project > Requirements > RQ:??? (New)                                          ║
║  ══════════════════════════════════════════                                           ║
║                                                                                       ║
║  ┌─ GENERAL ──────────────────────────────────────────────────────────────────────┐   ║
║  │                                                                                │   ║
║  │  Name*:        ┌────────────────────────────────────────────────────────────┐  │   ║
║  │                │ Gestion des notifications utilisateur                      │  │   ║
║  │                └────────────────────────────────────────────────────────────┘  │   ║
║  │                                                                                │   ║
║  │  Type*:        ┌────────────────────────────────────────────┐                  │   ║
║  │                │ User Story                               ▾ │                  │   ║
║  │                └────────────────────────────────────────────┘                  │   ║
║  │                     │                                                          │   ║
║  │                     │ L'utilisateur change en "Need"                           │   ║
║  │                     ▼                                                          │   ║
║  │                ┌────────────────────────────────────────────┐                  │   ║
║  │                │ Need                                     ▾ │                  │   ║
║  │                └────────────────────────────────────────────┘                  │   ║
║  │                                                                                │   ║
║  └────────────────────────────────────────────────────────────────────────────────┘   ║
║                                                                                       ║
║  ┌─ DESCRIPTION ──────────────────────────────────────────────────────────────────┐   ║
║  │                                                                                │   ║
║  │  ┌──────────────────────────────────────────────────────────────────────────┐  │   ║
║  │  │ [B] [I] [U] [S] │ [🔗 Link] [📷 Image] │ [≡] [•] [1.] │ [📊] │ [</>]    │  │   ║
║  │  ├──────────────────────────────────────────────────────────────────────────┤  │   ║
║  │  │                                                                          │  │   ║
║  │  │  **En tant que** administrateur systeme    ◀── MODIFIE PAR L'UTILISATEUR │  │   ║
║  │  │                                                                          │  │   ║
║  │  │  **Je veux** recevoir des alertes en temps reel   ◀── MODIFIE            │  │   ║
║  │  │                                                                          │  │   ║
║  │  │  **Afin de** reagir rapidement aux incidents      ◀── MODIFIE            │  │   ║
║  │  │                                                                          │  │   ║
║  │  │  ╔════════════════════════════════════════════════════════════════════╗  │  │   ║
║  │  │  ║                    Criteres d'acceptation                          ║  │  │   ║
║  │  │  ╚════════════════════════════════════════════════════════════════════╝  │  │   ║
║  │  │  • Etant donne un incident critique, quand il se produit,                │  │   ║
║  │  │    alors l'admin recoit une notification sous 30 secondes                │  │   ║
║  │  │                                                                          │  │   ║
║  │  └──────────────────────────────────────────────────────────────────────────┘  │   ║
║  │       ▲                                                                        │   ║
║  │       │                                                                        │   ║
║  │       └──── 🛡️ CONTENU PRESERVE ! RTI detecte que l'utilisateur a modifie     │   ║
║  │             le template. Pas de re-injection meme si le type change.          │   ║
║  │                                                                                │   ║
║  └────────────────────────────────────────────────────────────────────────────────┘   ║
║                                                                                       ║
║  ┌─ Console (F12) ────────────────────────────────────────────────────────────────┐   ║
║  │  > [RTI] [DEBUG] Type changed {from: 4, to: 1}                                 │   ║
║  │  > [RTI] [DEBUG] Content modified by user, skipping injection                  │   ║
║  └────────────────────────────────────────────────────────────────────────────────┘   ║
║                                                                                       ║
╚══════════════════════════════════════════════════════════════════════════════════════╝
```

---

### 4.7 INTERFACE UTILISATEUR - Mode Edition (Pas d'injection)

```text
╔══════════════════════════════════════════════════════════════════════════════════════╗
║  SpiraPlan v8.0                                                 [?] [⚙] [👤 JDupont]║
╠══════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                       ║
║  📁 My Project > Requirements > RQ:1234                     ◀── REQUIREMENT EXISTANT ║
║  ══════════════════════════════════════════                                           ║
║                                                                                       ║
║  ┌────────────────────────────────────────────────────────────────────────────────┐   ║
║  │ [💾 Save] [💾 Save & New] [↩ Undo] [🗑 Delete] [⋮ More ▾]                       │   ║
║  └────────────────────────────────────────────────────────────────────────────────┘   ║
║                                                                                       ║
║  ┌─ GENERAL ──────────────────────────────────────────────────────────────────────┐   ║
║  │                                                                                │   ║
║  │  Name*:        ┌────────────────────────────────────────────────────────────┐  │   ║
║  │                │ Fonctionnalite de recherche avancee                        │  │   ║
║  │                └────────────────────────────────────────────────────────────┘  │   ║
║  │                                                                                │   ║
║  │  Type*:        ┌────────────────────────────────────────────┐                  │   ║
║  │                │ Feature                                  ▾ │                  │   ║
║  │                └────────────────────────────────────────────┘                  │   ║
║  │                                                                                │   ║
║  │  Status*:      ┌────────────────────────────────────────────┐                  │   ║
║  │                │ In Progress                              ▾ │                  │   ║
║  │                └────────────────────────────────────────────┘                  │   ║
║  │                                                                                │   ║
║  └────────────────────────────────────────────────────────────────────────────────┘   ║
║                                                                                       ║
║  ┌─ DESCRIPTION ──────────────────────────────────────────────────────────────────┐   ║
║  │                                                                                │   ║
║  │  ┌──────────────────────────────────────────────────────────────────────────┐  │   ║
║  │  │ [B] [I] [U] [S] │ [🔗 Link] [📷 Image] │ [≡] [•] [1.] │ [📊] │ [</>]    │  │   ║
║  │  ├──────────────────────────────────────────────────────────────────────────┤  │   ║
║  │  │                                                                          │  │   ║
║  │  │  Cette fonctionnalite permet aux utilisateurs de rechercher des          │  │   ║
║  │  │  documents en utilisant des filtres avances comme:                       │  │   ║
║  │  │                                                                          │  │   ║
║  │  │  • Type de document                                                      │  │   ║
║  │  │  • Date de creation                                                      │  │   ║
║  │  │  • Auteur                                                                │  │   ║
║  │  │  • Tags                                                                  │  │   ║
║  │  │                                                                          │  │   ║
║  │  │  Le resultat sera affiche dans une liste paginee avec tri.               │  │   ║
║  │  │                                                                          │  │   ║
║  │  └──────────────────────────────────────────────────────────────────────────┘  │   ║
║  │       ▲                                                                        │   ║
║  │       │                                                                        │   ║
║  │       └──── 📝 CONTENU EXISTANT - RTI ne fait RIEN en mode edition             │   ║
║  │             car spiraAppManager.artifactId = 1234 (existe)                     │   ║
║  │                                                                                │   ║
║  └────────────────────────────────────────────────────────────────────────────────┘   ║
║                                                                                       ║
║  ┌─ Console (F12) ────────────────────────────────────────────────────────────────┐   ║
║  │  > [RTI] [DEBUG] Page loaded                                                   │   ║
║  │  > [RTI] [DEBUG] Edit mode (artifactId exists), skipping                       │   ║
║  └────────────────────────────────────────────────────────────────────────────────┘   ║
║                                                                                       ║
╚══════════════════════════════════════════════════════════════════════════════════════╝
```

---

### 4.8 CONSOLE DEBUG (F12) - Logs Complets

```text
╔══════════════════════════════════════════════════════════════════════════════════════╗
║  DevTools - Console                                               [×]                ║
╠══════════════════════════════════════════════════════════════════════════════════════╣
║  Filter: [RTI                                    ]  [All levels ▾]  [🔍]             ║
╠══════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                       ║
║  ▶ [RTI] [INFO] Initializing RTI v1.0.0                                              ║
║  ▶ [RTI] [DEBUG] Template loaded for type 1                                          ║
║  ▶ [RTI] [DEBUG] Template loaded for type 2                                          ║
║  ▶ [RTI] [DEBUG] Template loaded for type 3                                          ║
║  ▶ [RTI] [DEBUG] Template loaded for type 4                                          ║
║  ▶ [RTI] [DEBUG] Templates loaded ▶ (4) ["1", "2", "3", "4"]                         ║
║  ▶ [RTI] [INFO] Event handlers registered                                            ║
║                                                                                       ║
║  ──────────────────────── Page chargee ────────────────────────                       ║
║                                                                                       ║
║  ▶ [RTI] [DEBUG] Page loaded                                                         ║
║  ▶ [RTI] [DEBUG] Creation mode detected                                              ║
║  ▶ [RTI] [DEBUG] Current type: 2                                                     ║
║  ▶ [RTI] [INFO] Injecting template for type 2                                        ║
║                                                                                       ║
║  ──────────────────────── Type change: Feature -> User Story ────────────────────    ║
║                                                                                       ║
║  ▶ [RTI] [DEBUG] Type changed ▶ {from: 2, to: 4}                                     ║
║  ▶ [RTI] [DEBUG] Current type: 4                                                     ║
║  ▶ [RTI] [INFO] Injecting template for type 4                                        ║
║                                                                                       ║
║  ──────────────────────── Type change: User Story -> Need (contenu modifie) ─────    ║
║                                                                                       ║
║  ▶ [RTI] [DEBUG] Type changed ▶ {from: 4, to: 1}                                     ║
║  ▶ [RTI] [DEBUG] Content modified by user, skipping injection                        ║
║                                                                                       ║
║  ──────────────────────── Debug helpers ────────────────────────                      ║
║                                                                                       ║
║  > RTI_showState()                                                                    ║
║  ◀ ▶ {settings: {...}, templates: {...}, lastInjectedTemplate: "...", debug: true}   ║
║                                                                                       ║
║  > RTI_showTemplates()                                                                ║
║  ◀ ▶ {1: "<h2>Contexte...", 2: "<h2>Description...", 4: "<p><strong>En tant..."}     ║
║                                                                                       ║
║  > RTI_injectNow()                                                                    ║
║  ◀ undefined                                                                          ║
║  ▶ [RTI] [DEBUG] Current type: 1                                                     ║
║  ▶ [RTI] [INFO] Injecting template for type 1                                        ║
║                                                                                       ║
╚══════════════════════════════════════════════════════════════════════════════════════╝
```

---

### 4.9 RESUME VISUEL - Flux Complet

```text
╔══════════════════════════════════════════════════════════════════════════════════════╗
║                         FLUX D'UTILISATION RTI                                        ║
╚══════════════════════════════════════════════════════════════════════════════════════╝

    ┌─────────────────┐
    │  ADMIN CONFIG   │
    │  (une seule     │
    │   fois)         │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────────────────────────────────────────────────┐
    │  Product Admin > SpiraApps > RTI > Configure                │
    │                                                             │
    │  ┌─────────────────┐  ┌─────────────────┐                   │
    │  │ Template Need   │  │ Template Feature│  ...              │
    │  │ [RichText Edit] │  │ [RichText Edit] │                   │
    │  └─────────────────┘  └─────────────────┘                   │
    │                                                             │
    │                              [Save]                         │
    └─────────────────────────────────────────────────────────────┘
             │
             │ Templates sauvegardes
             ▼
    ┌─────────────────┐
    │  UTILISATEUR    │
    │  (quotidien)    │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────────────────────────────────────────────────┐
    │  Requirements > [+ New]                                     │
    └─────────────────────────────────────────────────────────────┘
             │
             │ registerEvent_loaded()
             ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                                                             │
    │   Type: [Feature ▾]     ◀── Type par defaut                 │
    │                                                             │
    │   Description:                                              │
    │   ┌─────────────────────────────────────────────────────┐   │
    │   │  ## Description                                     │   │
    │   │  [Description detaillee...]        ◀── TEMPLATE     │   │
    │   │                                        INJECTE!     │   │
    │   │  ## Regles de Gestion                               │   │
    │   │  • RG01: [...]                                      │   │
    │   └─────────────────────────────────────────────────────┘   │
    │                                                             │
    └─────────────────────────────────────────────────────────────┘
             │
             │ L'utilisateur peut:
             │
    ┌────────┴────────┬────────────────────┐
    │                 │                    │
    ▼                 ▼                    ▼
┌──────────┐   ┌─────────────┐   ┌────────────────┐
│ MODIFIER │   │ CHANGER     │   │ SAUVEGARDER    │
│ contenu  │   │ le TYPE     │   │ directement    │
└────┬─────┘   └──────┬──────┘   └────────────────┘
     │                │
     │                │ registerEvent_dropdownChanged()
     │                ▼
     │         ┌──────────────────────────────────────────┐
     │         │ Type: [User Story ▾]                     │
     │         │                                          │
     │         │ Description:                             │
     │         │ ┌────────────────────────────────────┐   │
     │         │ │ **En tant que** [...]              │   │
     │         │ │ **Je veux** [...]     ◀── NOUVEAU  │   │
     │         │ │ **Afin de** [...]         TEMPLATE │   │
     │         │ └────────────────────────────────────┘   │
     │         └──────────────────────────────────────────┘
     │
     │ Si contenu modifie:
     ▼
┌──────────────────────────────────────────────────────────┐
│  🛡️ PROTECTION: Le contenu modifie est PRESERVE          │
│     meme si l'utilisateur change le type ensuite        │
└──────────────────────────────────────────────────────────┘
```

---

## 5. Cas de Test

### CT-001 : Injection au Chargement - Type par Defaut

| Attribut | Valeur |
| -------- | ------ |
| **ID** | CT-001 |
| **Exigences** | EF-001, EF-003, EF-004 |
| **Preconditions** | SpiraApp activee, template configure pour type 2 (Feature) |
| **Etapes** | 1. Naviguer vers Requirements > New |
| **Resultat attendu** | Template "Feature" visible immediatement dans Description |
| **Verification** | Le formulaire s'ouvre avec Description pre-remplie |

---

### CT-002 : Re-injection au Changement de Type

| Attribut | Valeur |
| -------- | ------ |
| **ID** | CT-002 |
| **Exigences** | EF-002, EF-004 |
| **Preconditions** | Templates configures pour types 2 et 4 |
| **Etapes** | 1. Creer nouveau requirement (template Feature affiche) |
|  | 2. Changer type en "User Story" (4) |
| **Resultat attendu** | Template "User Story" remplace le template "Feature" |

---

### CT-003 : Mode Edition - Pas d'Injection

| Attribut | Valeur |
| -------- | ------ |
| **ID** | CT-003 |
| **Exigences** | EF-003 |
| **Preconditions** | Requirement existant |
| **Etapes** | 1. Ouvrir un requirement existant |
| **Resultat attendu** | Description inchangee, pas d'injection |

---

### CT-004 : Protection Contenu Modifie

| Attribut | Valeur |
| -------- | ------ |
| **ID** | CT-004 |
| **Exigences** | EF-005 |
| **Preconditions** | Creation en cours avec template Feature |
| **Etapes** | 1. Modifier manuellement le contenu Description |
|  | 2. Changer le type en User Story |
| **Resultat attendu** | Contenu modifie preserve, pas de re-injection |

---

### CT-005 : Type sans Template

| Attribut | Valeur |
| -------- | ------ |
| **ID** | CT-005 |
| **Exigences** | EF-004 |
| **Preconditions** | Pas de template configure pour type 26 (Epic) |
| **Etapes** | 1. Creer nouveau requirement |
|  | 2. Changer type en "Epic" |
| **Resultat attendu** | Description devient vide (ou garde l'ancien si modifie) |

---

### CT-006 : Configuration RichText Vide

| Attribut | Valeur |
| -------- | ------ |
| **ID** | CT-006 |
| **Exigences** | EF-004 |
| **Preconditions** | Champ RichText template_need vide dans settings |
| **Etapes** | 1. Creer requirement de type Need |
| **Resultat attendu** | Description reste vide |

---

### CT-007 : Debug Mode Console

| Attribut | Valeur |
| -------- | ------ |
| **ID** | CT-007 |
| **Exigences** | EF-006, ENF-003 |
| **Preconditions** | debug_mode = true dans settings |
| **Etapes** | 1. Ouvrir console (F12) |
|  | 2. Creer nouveau requirement |
| **Resultat attendu** | Logs [RTI] visibles dans console |

---

### CT-008 : Plusieurs Changements de Type

| Attribut | Valeur |
| -------- | ------ |
| **ID** | CT-008 |
| **Exigences** | EF-002, EF-005 |
| **Etapes** | 1. Nouveau requirement (Feature) |
|  | 2. Changer en User Story -> template US |
|  | 3. Changer en Need -> template Need |
|  | 4. Changer en Feature -> template Feature |
| **Resultat attendu** | Chaque changement injecte le bon template |

---

## 6. Catalogue des Erreurs

### ERR-001 : Settings Non Disponibles

| Code | ERR-001 |
| ---- | ------- |
| **Condition** | `SpiraAppSettings[APP_GUID]` est undefined |
| **Cause probable** | SpiraApp non activee pour ce produit |
| **Message console** | `[RTI] [WARN] Settings not available, RTI disabled` |
| **Action** | Activer la SpiraApp dans Product Admin > SpiraApps |

---

### ERR-002 : Aucun Template Configure

| Code | ERR-002 |
| ---- | ------- |
| **Condition** | Tous les champs RichText templates sont vides |
| **Message console** | `[RTI] [DEBUG] Templates loaded []` |
| **Impact** | RTI actif mais aucune injection |
| **Action** | Configurer au moins un template dans Product Settings |

---

### ERR-003 : Template Non Trouve pour Type

| Code | ERR-003 |
| ---- | ------- |
| **Condition** | Pas de template pour le RequirementTypeId selectionne |
| **Message console** | `[RTI] [INFO] No template for type X` |
| **Impact** | Comportement normal, pas d'injection pour ce type |

---

## 7. Roadmap

| Phase | Description | Priorite | Statut |
| ----- | ----------- | -------- | ------ |
| v1.0 | Templates RichText par type + injection loaded/dropdown | Haute | En cours |
| v1.1 | Support des champs Custom RichText | Moyenne | Planifie |
| v1.2 | Selection du champ cible (settingTypeId: 7) | Moyenne | Planifie |
| v1.3 | Import/Export des templates | Basse | Futur |

---

## 8. Annexes

### 8.1 Templates Exemples Pre-configures

#### Need (Type 1)

```html
<h2>Contexte Metier</h2>
<p>[Decrire le contexte metier et les enjeux]</p>

<h2>Description du Besoin</h2>
<p>[Decrire le besoin fonctionnel]</p>

<h2>Benefices Attendus</h2>
<ul>
    <li>[Benefice 1]</li>
    <li>[Benefice 2]</li>
</ul>

<h2>Criteres d'Acceptation</h2>
<ul>
    <li>[ ] Critere 1</li>
    <li>[ ] Critere 2</li>
</ul>
```

#### Feature (Type 2) - Par defaut

```html
<h2>Description</h2>
<p>[Description detaillee de la fonctionnalite]</p>

<h2>Regles de Gestion</h2>
<ul>
    <li><strong>RG01:</strong> [Regle 1]</li>
    <li><strong>RG02:</strong> [Regle 2]</li>
</ul>

<h2>Criteres d'Acceptation</h2>
<ul>
    <li>[ ] Critere 1</li>
    <li>[ ] Critere 2</li>
</ul>
```

#### User Story (Type 4)

```html
<p><strong>En tant que</strong> [type d'utilisateur]</p>
<p><strong>Je veux</strong> [fonctionnalite souhaitee]</p>
<p><strong>Afin de</strong> [benefice/valeur]</p>

<h3>Criteres d'acceptation</h3>
<ul>
    <li>Etant donne [contexte], quand [action], alors [resultat]</li>
</ul>

<h3>Notes techniques</h3>
<p>[Notes pour l'equipe technique]</p>
```

### 8.2 Matrice de Tracabilite

| Exigence | Description | Cas de Test | API Utilisee |
| -------- | ----------- | ----------- | ------------ |
| EF-001 | Injection au chargement | CT-001 | `registerEvent_loaded` |
| EF-002 | Re-injection au changement type | CT-002, CT-008 | `registerEvent_dropdownChanged` |
| EF-003 | Detection mode creation | CT-001, CT-003 | `spiraAppManager.artifactId` |
| EF-004 | Config RichText par type | CT-001, CT-005, CT-006 | `settingTypeId: 2` |
| EF-005 | Protection contenu modifie | CT-004 | `getDataItemField` |
| EF-006 | Mode debug | CT-007 | `settingTypeId: 10` |

### 8.3 Avantages de cette Approche

1. **UX Superieure** : L'utilisateur voit le template immediatement
2. **Configuration Intuitive** : Editeurs RichText visuels, pas de JSON
3. **Code Simple** : Pas de timing async complexe
4. **Flexible** : Re-injection automatique au changement de type
5. **Robuste** : Protection contre l'ecrasement du contenu modifie

---

*Document genere le 2026-01-14*
*Version 5.0 - Approche API dynamique + Slots (nom type texte + template RichText)*
