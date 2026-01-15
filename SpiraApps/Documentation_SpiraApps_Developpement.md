# Guide Complet de Developpement des SpiraApps

> Documentation complete pour le developpement, l'empaquetage et le deploiement des SpiraApps pour SpiraPlan/SpiraTeam/SpiraTest

---

## Table des Matieres

1. Introduction
2. Architecture et Structure
3. Le Fichier Manifest
4. Points d'Extension Disponibles
5. SpiraAppManager - API Complete
6. Capacites et Possibilites
7. Limitations et Restrictions
8. Ressources Techniques Fournies
9. Empaquetage et Deploiement
10. Exemples de Code
11. Bonnes Pratiques et Patterns
12. Sources et References

---

## 1. Introduction

### Qu'est-ce qu'une SpiraApp ?

Les **SpiraApps** sont des extensions/plugins permettant de personnaliser et d'etendre les fonctionnalites de la plateforme Spira (SpiraTest, SpiraTeam, SpiraPlan). Elles permettent de :

- Ajouter des fonctionnalites personnalisees a l'interface utilisateur
- Creer des widgets pour les tableaux de bord
- Ajouter des colonnes personnalisees aux grilles
- Integrer des services externes
- Automatiser des workflows
- Repondre a des besoins specifiques d'industrie ou d'organisation

### Avantages

- **Modularite** : Approche modulaire au developpement logiciel
- **Personnalisation** : Adaptation precise aux besoins specifiques
- **Integration** : Communication securisee avec des services externes (CI/CD, IA, etc.)
- **Distribution** : Possibilite de publier sur le marketplace Inflectra

---

## 2. Architecture et Structure

### Structure d'un Projet SpiraApp

```
MonSpiraApp/
├── manifest.yaml          # Configuration centrale (OBLIGATOIRE)
├── code/
│   ├── requirement.js     # Code JavaScript pour pages details
│   ├── list.js            # Code JavaScript pour pages listes
│   └── widget.js          # Code pour widgets dashboard
├── templates/
│   ├── column.html        # Templates Mustache pour colonnes
│   └── widget.html        # Templates pour widgets
├── styles/
│   └── styles.css         # Styles CSS personnalises
└── assets/
    └── icon.svg           # Icones et ressources
```

### Fichiers Principaux

| Fichier | Role | Obligatoire |
|---------|------|-------------|
| `manifest.yaml` | Configuration complete de la SpiraApp | Oui |
| `*.js` | Logique JavaScript | Selon fonctionnalites |
| `*.html` | Templates Mustache | Pour colonnes/widgets |
| `*.css` | Styles personnalises | Non |

---

## 3. Le Fichier Manifest

Le manifest est le coeur de votre SpiraApp. Il definit tout ce que fait votre application et ou elle s'execute.

### Sections du Manifest (9 sections possibles)

| Section | Description | Obligatoire |
| ------- | ----------- | ----------- |
| `metadata` | Identification de la SpiraApp (niveau racine) | **Oui** |
| `settings` | Configuration niveau systeme | Non |
| `productSettings` | Configuration par produit | Non |
| `settingGroups` | Organisation visuelle des parametres | Non |
| `pageContents` | Injection de code JS/CSS sur les pages | Non |
| `menus` | Boutons et actions dans les toolbars | Non |
| `pageColumns` | Colonnes personnalisees dans les grilles | Non |
| `dashboards` | Widgets de tableau de bord | Non |
| `storage` | Stockage cle/valeur persistant | Non |

### Regles d'Unicite

- **Une seule** `pageContent` par `pageId`
- **Un seul** `menu` par `pageId`
- **Une seule** `pageColumn` par `pageId`
- **Un seul** `dashboard` par `dashboardTypeId`
- Noms uniques dans `settings`, `productSettings`, `settingGroups`

### Exemple de Manifest Complet

```yaml
# ===========================================
# METADATA (Obligatoire)
# ===========================================
guid: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # GUID unique - generer un nouveau!
name: "Ma SpiraApp"
caption: "Ma Super SpiraApp"
summary: "Description courte de la SpiraApp"
description: "Description detaillee de ce que fait la SpiraApp et comment l'utiliser"
productSummary: "Resume pour la page produit"
author: "Votre Nom"
url: "https://votre-site.com"
license: "MIT"
copyright: "2025 Votre Organisation"
version: "1.0.0"

# ===========================================
# SETTINGS (Niveau Systeme)
# ===========================================
settings:
  - name: "apiKey"
    caption: "Cle API"
    isSecure: true              # Ne sera pas accessible cote client
    placeholder: "Entrez votre cle API"
    position: 1
    tooltip: "La cle API pour le service externe"
    settingTypeId: 1            # Plain text

  - name: "enableFeature"
    caption: "Activer la fonctionnalite"
    settingTypeId: 10           # Boolean
    position: 2

# ===========================================
# PRODUCT SETTINGS (Par Produit)
# ===========================================
productSettings:
  - name: "wordsToReplace"
    caption: "Mots a remplacer"
    settingTypeId: 1
    placeholder: "mot1,mot2,mot3"
    position: 1

  - name: "targetStatus"
    caption: "Statut cible"
    settingTypeId: 5            # ArtifactStatusSingleSelect
    artifactTypeId: 1           # Requirement
    position: 2

# ===========================================
# SETTING GROUPS
# ===========================================
settingGroups:
  - name: "general"
    caption: "Parametres Generaux"
    position: 1
  - name: "advanced"
    caption: "Parametres Avances"
    position: 2

# ===========================================
# PAGE CONTENTS
# ===========================================
pageContents:
  - pageId: 9                   # RequirementDetails
    name: "requirementHandler"
    code: file://code/requirement.js
    css: file://styles/styles.css

  - pageId: 8                   # RequirementList
    name: "requirementListHandler"
    code: file://code/list.js

# ===========================================
# MENUS
# ===========================================
menus:
  - pageId: 9                   # RequirementDetails
    caption: "Actions"
    icon: "fas fa-cog"
    isActive: true
    entries:
      - name: "generateTests"
        caption: "Generer Tests"
        tooltip: "Genere automatiquement des cas de test"
        icon: "fas fa-magic"
        actionTypeId: 2         # Function
        action: "generateTestCases"

      - name: "openExternal"
        caption: "Ouvrir Documentation"
        tooltip: "Ouvre la documentation externe"
        icon: "fas fa-external-link-alt"
        actionTypeId: 1         # URL
        action: "https://documentation.exemple.com"

# ===========================================
# PAGE COLUMNS
# ===========================================
pageColumns:
  - pageId: 8                   # RequirementList
    name: "customScore"
    caption: "Score"
    template: file://templates/column.html

  - pageId: 1                   # TestCaseList
    name: "priority"
    caption: "Priorite Calculee"
    template: file://templates/priority-column.html

# ===========================================
# DASHBOARDS
# ===========================================
dashboards:
  - dashboardTypeId: 1          # ProductHome
    name: "metricsWidget"
    description: "Affiche les metriques cles du projet"
    isActive: true
    code: file://code/widget.js

# ===========================================
# STORAGE (Cles/Valeurs Persistantes)
# ===========================================
storage:
  - key: "defaultTemplate"
    value: "<p>Template par defaut</p>"
    isSecure: false
```

### Proprietes Metadata (niveau racine)

| Propriete | Type | Description |
| --------- | ---- | ----------- |
| `guid` | String | Format: aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee |
| `name` | String | Nom code (sans espaces ni tirets) |
| `caption` | String | Nom visible utilisateur |
| `summary` | String | Description courte (liste admin systeme) |
| `description` | String | Description longue (details admin systeme) |
| `productSummary` | String | Description (liste admin produit) |
| `productDescription` | String | Description (details admin produit) |
| `author` | String | Organisation/auteur |
| `url` | String | URL support/documentation |
| `icon` | String | `data:image/svg+xml;base64,file://icon.svg` |
| `license` | String | Type de licence |
| `copyright` | String | Copyright |
| `version` | Decimal | Numero de version |

---

## 4. Points d'Extension Disponibles

### Pages Disponibles (pageId)

| pageId | Nom de la Page | Colonnes Supportees |
|--------|----------------|---------------------|
| 1 | TestCaseList | Oui |
| 2 | TestCaseDetails | Non |
| 3 | TestRunList | Oui |
| 4 | TestRunDetails | Non |
| 5 | ReleaseDetails | Non |
| 6 | RiskList | Oui |
| 7 | RiskDetails | Non |
| 8 | RequirementList | Oui |
| 9 | RequirementDetails | Non |
| 10 | ReleaseList | Oui |
| 11 | TestSetList | Oui |
| 12 | TestSetDetails | Non |
| 13 | TaskList | Oui |
| 14 | TaskDetails | Non |
| 15 | DocumentList | Oui |
| 16 | DocumentDetails | Non |
| 17 | AutomationHostList | Oui |
| 18 | AutomationHostDetails | Non |
| 19 | IncidentList | Oui |
| 20 | IncidentDetails | Non |
| 21 | SpiraAppProductAdmin | Non |

> **Note**: Seules les pages Liste supportent l'ajout de colonnes personnalisees.

### Types d'Artefacts (artifactTypeId)

| artifactTypeId | Type d'Artefact |
|----------------|-----------------|
| 1 | Requirement |
| 2 | TestCase |
| 3 | Incident |
| 4 | Release |
| 5 | TestRun |
| 6 | Task |
| 7 | TestStep |
| 8 | TestSet |
| 9 | AutomationHost |
| 10 | AutomationEngine |
| 12 | RequirementStep |
| 13 | Document |
| 14 | Risk |
| 15 | RiskMitigation |

### Types de Parametres (settingTypeId)

| settingTypeId | Type | Product | System | Description |
| ------------- | ---- | ------- | ------ | ----------- |
| 1 | Plain text | Oui | Oui | Texte simple sur une ligne |
| 2 | Rich text (HTML) | Oui | Oui | Editeur HTML |
| 3 | ArtifactCustomProperty | Oui | Non | Selection de propriete personnalisee |
| 4 | Integer | Oui | Oui | Nombre entier |
| 5 | ArtifactStatusSingleSelect | Oui | Non | Selection simple de statut |
| 6 | ArtifactStatusMultiSelect | Oui | Non | Selection multiple de statuts |
| 7 | ArtifactStandardField | Oui | Non | Champ standard d'artefact |
| 8 | ArtifactFlexibleCustomProperty | Oui | Non | Propriete personnalisee flexible |
| 9 | Multi line plain text | Oui | Oui | Texte multiligne |
| 10 | Boolean | Oui | Oui | Case a cocher (vrai/faux) |
| 11 | ArtifactTypeSingleSelect | Oui | Non | Selection de type d'artefact |

> **Note** : Les types 3, 5, 6, 7, 8, 11 necessitent `artifactTypeId` et ne sont disponibles que pour `productSettings`.

### Types d'Actions (actionTypeId)

| actionTypeId | Type | Description |
|--------------|------|-------------|
| 1 | URL | Ouvre une URL (interne ou externe) |
| 2 | Function | Execute une fonction JavaScript |

### Pages de Dashboard (dashboardTypeId)

| dashboardTypeId | Dashboard | SpiraApp Support |
| --------------- | --------- | ---------------- |
| 1 | ProductHome | Oui |
| 2 | ProductReports | Oui |
| 3 | MyPage | Oui |
| 4 | ProgramHome | Non |
| 5 | PortfolioHome | Non |
| 6 | EnterpriseHome | Non |
| 7 | ProgramReports | Non |

> **Note** : Seuls les dashboards 1, 2, 3 supportent les widgets SpiraApp.

---

## 5. SpiraAppManager - API Complete

Le `spiraAppManager` est la classe helper principale pour interagir avec Spira.

### Proprietes d'Identification

```javascript
// Identifiants de contexte
spiraAppManager.userId              // ID de l'utilisateur courant
spiraAppManager.projectId           // ID du projet courant
spiraAppManager.projectTemplateId   // ID du template de projet
spiraAppManager.artifactId          // ID de l'artefact courant
spiraAppManager.artifactTypeId      // Type de l'artefact courant
spiraAppManager.pageId              // ID de la page courante
spiraAppManager.displayReleaseId    // ID de la release affichee
```

### Proprietes de Configuration

```javascript
// URLs et configuration
spiraAppManager.baseUrl             // URL de base de Spira
spiraAppManager.baseThemeUrl        // URL du theme (pour les assets)
spiraAppManager.currentUtcOffset    // Decalage UTC de l'utilisateur
spiraAppManager.currentCulture      // Culture/locale de l'utilisateur
spiraAppManager.currentTheme        // Theme actif
spiraAppManager.productType         // Type de produit (Test/Team/Plan)

// Listes de reference
spiraAppManager.gridIds             // IDs des grilles disponibles
spiraAppManager.artifactNames       // Noms des artefacts
spiraAppManager.artifactTypes       // Types d'artefacts
spiraAppManager.requirementStatuses // Statuts des requirements
spiraAppManager.releaseStatuses     // Statuts des releases
spiraAppManager.testCaseStatuses    // Statuts des test cases
```

### Appels API Internes (Spira)

```javascript
// API synchrone - Signature COMPLETE
spiraAppManager.executeApi(
    pluginName,       // Nom de votre SpiraApp (string)
    apiVersion,       // Version de l'API, ex: "7.0"
    method,           // "GET", "POST", "PUT", "DELETE"
    url,              // URL relative de l'API Spira
    body,             // Corps de la requete (string JSON pour POST, objet pour PUT)
    successCallback,  // function(response) { }
    errorCallback     // function(error) { }
);

// API asynchrone (retourne une Promise)
// Signature: executeApiAsync(pluginName, apiVersion, method, url, body) -> Promise<ResponseBody>
var response = await spiraAppManager.executeApiAsync(pluginName, apiVersion, method, url, body);

// Exemple avec async/await
async function loadRequirement() {
    try {
        var req = await spiraAppManager.executeApiAsync(
            "MySpiraApp",
            "7.0",
            "GET",
            "projects/" + spiraAppManager.projectId + "/requirements/" + spiraAppManager.artifactId,
            null
        );
        console.log("Requirement:", req);
    } catch (error) {
        console.error("Erreur:", error);
    }
}

// Exemple d'utilisation
spiraAppManager.executeApi(
    "MySpiraApp",
    "7.0",
    "GET",
    "projects/" + spiraAppManager.projectId + "/requirements/" + spiraAppManager.artifactId,
    null,
    function(requirement) {
        console.log("Requirement:", requirement);
    },
    function(error) {
        console.error("Erreur:", error);
    }
);

// Exemple POST (body doit etre JSON.stringify)
spiraAppManager.executeApi(
    "MySpiraApp",
    "7.0",
    "POST",
    "projects/" + spiraAppManager.projectId + "/requirements",
    JSON.stringify({ Name: "Nouvelle exigence", RequirementTypeId: 1 }),
    function(created) { console.log("Cree:", created); },
    function(error) { console.error(error); }
);

// Exemple PUT (body est un objet direct)
spiraAppManager.executeApi(
    "MySpiraApp",
    "7.0",
    "PUT",
    "projects/" + spiraAppManager.projectId + "/requirements/" + reqId,
    { Name: "Nom modifie", RequirementTypeId: 1 },
    function(updated) { console.log("Mis a jour:", updated); },
    function(error) { console.error(error); }
);
```

### Appels API Externes

```javascript
// Appel REST externe (evite les problemes CORS) - passe par le serveur Spira
spiraAppManager.executeRest(
    appGuid,          // APP_GUID de votre SpiraApp
    appName,          // Nom de votre SpiraApp
    method,           // "GET", "POST", "PUT", "DELETE"
    url,              // URL complete du service externe
    body,             // Corps de la requete
    credentials,      // Credentials (ou null)
    headers,          // Objet avec les headers HTTP
    successCallback,  // function(response) { }
    errorCallback     // function(error) { }
);

// Exemple avec token de setting (remplace {settingApiKey} par la valeur du setting)
spiraAppManager.executeRest(
    APP_GUID,
    "MySpiraApp",
    "POST",
    "https://api.externe.com/endpoint?key={settingApiKey}",
    JSON.stringify({ data: "value" }),
    null,
    { "Content-Type": "application/json" },
    function(response) { console.log(response); },
    function(error) { console.error(error); }
);

// Integration AWS Bedrock (IA) - avec authentification SignatureV4
spiraAppManager.executeAwsBedrockRuntime(
    appGuid,              // APP_GUID
    appName,              // Nom de la SpiraApp
    accessKeyId,          // AWS Access Key ID
    secretAccessKeySetting, // Nom du setting contenant la secret key
    region,               // Region AWS (ex: "us-east-1")
    model,                // ID du modele Bedrock
    body,                 // Corps de la requete
    successCallback,
    errorCallback
);

// IMPORTANT: Structure de la reponse executeRest
// La reponse est WRAPPEE par Spira dans un objet:
// {
//   content: "...",      // String JSON de la reponse externe
//   statusCode: 200,     // Code HTTP
//   statusDescription: "OK"
// }
// Il faut donc parser le content:
function onRestSuccess(responseWrapper) {
    if (responseWrapper.statusCode !== 200) {
        // Erreur HTTP
        return;
    }
    var actualResponse = JSON.parse(responseWrapper.content);
    // Utiliser actualResponse...
}
```

### Manipulation des Formulaires

```javascript
// Lire une valeur de champ sauvegardee
// dataProperty est optionnel, peut etre: "textValue", "intValue", "dateValue"
var value = spiraAppManager.getDataItemField(fieldName, dataProperty);

// Exemples de lecture
var name = spiraAppManager.getDataItemField("Name", "textValue");
var typeId = spiraAppManager.getDataItemField("RequirementTypeId", "intValue");
var creationDate = spiraAppManager.getDataItemField("CreationDate", "dateValue");

// Lire la valeur LIVE (non sauvegardee) d'un champ
// Retourne un objet avec: { dateValue, intValue, textValue }
var liveValue = spiraAppManager.getLiveFormFieldValue(fieldName);
console.log(liveValue.textValue);  // Valeur texte actuelle
console.log(liveValue.intValue);   // Valeur numerique actuelle

// Modifier un champ - deux signatures possibles
// Signature 1: fieldName, newValue (pour les champs texte)
spiraAppManager.updateFormField("Name", "Nouveau Nom");

// Signature 2: fieldName, dataProperty, newValue (pour specifier le type)
spiraAppManager.updateFormField("Description", "textValue", "<p>Nouveau contenu</p>");

// Sauvegarder le formulaire (declenche dataSaved apres succes)
spiraAppManager.saveForm();

// Recharger le formulaire depuis le serveur
spiraAppManager.reloadForm();

// Naviguer vers une URL
spiraAppManager.setWindowLocation("/SpiraPlan/1/Requirement/5.aspx");

// Exemple complet
var description = spiraAppManager.getDataItemField("Description", "textValue");
if (!description) {
    spiraAppManager.updateFormField("Description", "<p>Template par defaut</p>");
    // Note: pas besoin de saveForm() si dans dataPreSave
}
```

### Gestion des Dropdowns

```javascript
// Obtenir les elements d'un dropdown
var items = spiraAppManager.getDropdownItems(fieldName);

// Activer/desactiver des elements
spiraAppManager.setDropdownItemsIsActive(fieldName, itemIds, isActive);

// Exemple: masquer certains statuts
spiraAppManager.setDropdownItemsIsActive("StatusId", [3, 4, 5], false);
```

### Gestion des Grilles

```javascript
// Recharger une grille
spiraAppManager.reloadGrid(gridId);

// Obtenir les elements selectionnes
var selectedIds = spiraAppManager.getGridSelectedItems(gridId);
```

**Grilles disponibles (gridIds):**

| gridId | Description |
| ------ | ----------- |
| `requirementSteps` | Etapes de requirement |
| `riskMitigations` | Mitigations de risque |
| `testCaseTestSteps` | Etapes de test case |
| `testSetTestCases` | Test cases dans un test set |
| `artifactGrid` | Grille principale de liste |

### Messages et Notifications

```javascript
// Message de succes
spiraAppManager.displaySuccessMessage("Operation reussie!");

// Message d'erreur
spiraAppManager.displayErrorMessage("Une erreur est survenue");

// Message d'avertissement
spiraAppManager.displayWarningMessage("Attention: verifiez les donnees");

// Masquer les messages
spiraAppManager.hideMessage();

// Boite de confirmation
spiraAppManager.displayConfirmation(
    "Etes-vous sur de vouloir continuer?",
    function() {
        // Action si confirmee
        // Note: callback appele UNIQUEMENT si l'utilisateur confirme
    }
);

// Dialogue avec dropdown (selection unique)
spiraAppManager.createComboDialog(
    title,           // "Selectionnez une option"
    introText,       // "Choisissez parmi les options suivantes:"
    button,          // "Valider" (texte du bouton)
    entries,         // ["Option 1", "Option 2", "Option 3"] - tableau de strings
    successCallback  // function(chosenOption) { } - chosenOption est le string selectionne
);

// Exemple d'utilisation
spiraAppManager.createComboDialog(
    "Selection du template",
    "Choisissez le template a appliquer:",
    "Appliquer",
    ["Business Requirement", "Functional Requirement", "User Story"],
    function(chosenOption) {
        console.log("Template selectionne:", chosenOption);
    }
);
```

### Verification des Permissions

```javascript
// Verifier si l'utilisateur peut voir un type d'artefact
var canView = spiraAppManager.canViewArtifactType(artifactTypeId);

// Verifier si l'utilisateur peut creer
var canCreate = spiraAppManager.canCreateArtifactType(artifactTypeId);

// Verifier si l'utilisateur peut modifier
var canModify = spiraAppManager.canModifyArtifactType(artifactTypeId);
```

### Stockage Persistant (Storage API)

Le stockage persistant permet de sauvegarder des donnees cle/valeur a differents niveaux.

#### Niveaux de Stockage

| Niveau | Scope | Usage |
| ------ | ----- | ----- |
| System | Global | Configuration partagee entre tous les produits/utilisateurs |
| User | Par utilisateur | Preferences utilisateur globales |
| Product | Par produit | Configuration specifique au produit |
| ProductUser | Par produit + utilisateur | Preferences utilisateur dans un produit |

#### Insertion (storageInsert*)

```javascript
// Signature complete - TOUTES les methodes Insert
spiraAppManager.storageInsertSystem(
    pluginGuid,       // APP_GUID de votre SpiraApp
    pluginName,       // Nom de votre SpiraApp
    key,              // Cle unique (string)
    value,            // Valeur a stocker (string)
    isSecure,         // true = non accessible cote client
    successFunction,  // function() { }
    failureFunction   // function(error) { }
);

spiraAppManager.storageInsertUser(pluginGuid, pluginName, key, value, isSecure, successFunction, failureFunction);

// Product et ProductUser necessitent productId
spiraAppManager.storageInsertProduct(pluginGuid, pluginName, key, value, productId, isSecure, successFunction, failureFunction);
spiraAppManager.storageInsertProductUser(pluginGuid, pluginName, key, value, productId, isSecure, successFunction, failureFunction);
```

#### Mise a jour (storageUpdate*)

```javascript
// Signature complete - TOUTES les methodes Update
spiraAppManager.storageUpdateSystem(
    pluginGuid,       // APP_GUID
    pluginName,       // Nom SpiraApp
    key,              // Cle existante
    value,            // Nouvelle valeur
    successFunction,  // function() { }
    failureFunction   // function(error) { }
);

spiraAppManager.storageUpdateUser(pluginGuid, pluginName, key, value, successFunction, failureFunction);
spiraAppManager.storageUpdateProduct(pluginGuid, pluginName, key, value, productId, successFunction, failureFunction);
spiraAppManager.storageUpdateProductUser(pluginGuid, pluginName, key, value, productId, successFunction, failureFunction);
```

#### Recuperation (storageGet*)

```javascript
// Recuperer UNE valeur - retourne string
spiraAppManager.storageGetSystem(
    pluginGuid,
    pluginName,
    key,
    successFunction,  // function(value) { } - value est un string
    failureFunction
);

spiraAppManager.storageGetUser(pluginGuid, pluginName, key, successFunction, failureFunction);
spiraAppManager.storageGetProduct(pluginGuid, pluginName, key, productId, successFunction, failureFunction);
spiraAppManager.storageGetProductUser(pluginGuid, pluginName, key, productId, successFunction, failureFunction);

// Recuperer TOUTES les valeurs - retourne objet { key: value, ... }
spiraAppManager.storageGetSystemAll(pluginGuid, pluginName, successFunction, failureFunction);
spiraAppManager.storageGetUserAll(pluginGuid, pluginName, successFunction, failureFunction);
spiraAppManager.storageGetProductAll(pluginGuid, pluginName, productId, successFunction, failureFunction);
spiraAppManager.storageGetProductUserAll(pluginGuid, pluginName, productId, successFunction, failureFunction);
```

#### Suppression (storageDelete*)

```javascript
// Supprimer UNE cle
spiraAppManager.storageDeleteSystem(pluginGuid, pluginName, key, successFunction, failureFunction);
spiraAppManager.storageDeleteUser(pluginGuid, pluginName, key, successFunction, failureFunction);
spiraAppManager.storageDeleteProduct(pluginGuid, pluginName, key, productId, successFunction, failureFunction);
spiraAppManager.storageDeleteProductUser(pluginGuid, pluginName, key, productId, successFunction, failureFunction);

// Supprimer TOUTES les cles d'un niveau
spiraAppManager.storageDeleteSystemAll(pluginGuid, pluginName, successFunction, failureFunction);
spiraAppManager.storageDeleteUserAll(pluginGuid, pluginName, successFunction, failureFunction);
spiraAppManager.storageDeleteProductAll(pluginGuid, pluginName, productId, successFunction, failureFunction);
spiraAppManager.storageDeleteProductUserAll(pluginGuid, pluginName, productId, successFunction, failureFunction);

// Supprimer les donnees ProductUser pour TOUS les utilisateurs d'un produit
spiraAppManager.storageDeleteProductUserAllUsers(pluginGuid, pluginName, productId, successFunction, failureFunction);
```

#### Exemple Complet d'Utilisation

```javascript
// Sauvegarder une preference utilisateur
spiraAppManager.storageInsertUser(
    APP_GUID,
    "MonSpiraApp",
    "lastSelectedFilter",
    JSON.stringify({ status: 2, priority: 1 }),
    false,  // non securise (accessible cote client)
    function() {
        console.log("Preference sauvegardee");
    },
    function(error) {
        console.error("Erreur:", error);
    }
);

// Recuperer la preference
spiraAppManager.storageGetUser(
    APP_GUID,
    "MonSpiraApp",
    "lastSelectedFilter",
    function(value) {
        if (value) {
            var filter = JSON.parse(value);
            console.log("Filtre charge:", filter);
        }
    },
    function(error) {
        console.error("Erreur:", error);
    }
);
```

#### Stockage Local (localStorage)

Pour les donnees temporaires ou non critiques :

```javascript
// Recuperer une valeur du localStorage
var value = spiraAppManager.getLocalData(storageKey);  // retourne string

// Stocker une valeur
spiraAppManager.setLocalData(storageKey, data);  // data converti en string

// Supprimer une valeur
spiraAppManager.removeLocalData(storageKey);
```

> **Note** : Le localStorage est local au navigateur et peut etre efface par l'utilisateur.

### Formatage des Donnees

```javascript
// Formater une date
var dateStr = spiraAppManager.formatDate(dateValue);

// Formater date et heure
var dateTimeStr = spiraAppManager.formatDateTime(dateValue);

// Convertir HTML en texte brut
var plainText = spiraAppManager.convertHtmlToPlainText(htmlString);

// Nettoyer le HTML (securite)
var safeHtml = spiraAppManager.sanitizeHtml(htmlString);

// Formater le nom d'un champ personnalise
var fieldName = spiraAppManager.formatCustomFieldName(customPropertyId);
// Retourne "Custom_01", "Custom_02", etc.
```

### Noms des Champs par Type d'Artefact

Ces noms sont utilises avec `getDataItemField()` et `updateFormField()`.

#### Requirement (pageId: 9)

| Champ | Type | Description |
| ----- | ---- | ----------- |
| `RequirementId` | int | ID unique |
| `Name` | text | Nom |
| `Description` | html | Description (RichText) |
| `RequirementTypeId` | int | Type d'exigence |
| `RequirementStatusId` | int | Statut |
| `ImportanceId` | int | Importance/Priorite |
| `OwnerId` | int | Proprietaire |
| `AuthorId` | int | Auteur |
| `ReleaseId` | int | Release associee |
| `ComponentId` | int | Composant |
| `EstimatedEffort` | int | Effort estime (minutes) |
| `EstimatePoints` | int | Points d'estimation |
| `CreationDate` | date | Date de creation |
| `LastUpdateDate` | date | Derniere modification |
| `Tags` | text | Tags |
| `Custom_01..99` | varies | Proprietes personnalisees |

#### Incident (pageId: 20)

| Champ | Type | Description |
| ----- | ---- | ----------- |
| `IncidentId` | int | ID unique |
| `Name` | text | Nom |
| `Description` | html | Description |
| `IncidentTypeId` | int | Type |
| `IncidentStatusId` | int | Statut |
| `PriorityId` | int | Priorite |
| `SeverityId` | int | Severite |
| `OwnerId` | int | Proprietaire |
| `OpenerId` | int | Createur |
| `DetectedReleaseId` | int | Release detectee |
| `ResolvedReleaseId` | int | Release resolue |
| `VerifiedReleaseId` | int | Release verifiee |
| `Resolution` | html | Resolution |
| `EstimatedEffort` | int | Effort estime |
| `ActualEffort` | int | Effort reel |
| `RemainingEffort` | int | Effort restant |
| `StartDate` | date | Date debut |
| `ClosedDate` | date | Date fermeture |
| `Custom_01..99` | varies | Proprietes personnalisees |

#### Test Case (pageId: 2)

| Champ | Type | Description |
| ----- | ---- | ----------- |
| `TestCaseId` | int | ID unique |
| `Name` | text | Nom |
| `Description` | html | Description |
| `TestCaseTypeId` | int | Type |
| `TestCaseStatusId` | int | Statut |
| `TestCasePriorityId` | int | Priorite |
| `OwnerId` | int | Proprietaire |
| `AuthorId` | int | Auteur |
| `ExecutionStatusId` | int | Statut d'execution |
| `EstimatedDuration` | int | Duree estimee |
| `ActualDuration` | int | Duree reelle |
| `Custom_01..99` | varies | Proprietes personnalisees |

#### Task (pageId: 14)

| Champ | Type | Description |
| ----- | ---- | ----------- |
| `TaskId` | int | ID unique |
| `Name` | text | Nom |
| `Description` | html | Description |
| `TaskTypeId` | int | Type |
| `TaskStatusId` | int | Statut |
| `TaskPriorityId` | int | Priorite |
| `OwnerId` | int | Proprietaire |
| `CreatorId` | int | Createur |
| `ReleaseId` | int | Release |
| `RequirementId` | int | Requirement lie |
| `EstimatedEffort` | int | Effort estime |
| `ActualEffort` | int | Effort reel |
| `RemainingEffort` | int | Effort restant |
| `StartDate` | date | Date debut |
| `EndDate` | date | Date fin |
| `CompletionPercent` | int | Pourcentage completion |
| `Custom_01..99` | varies | Proprietes personnalisees |

#### Risk (pageId: 7)

| Champ | Type | Description |
| ----- | ---- | ----------- |
| `RiskId` | int | ID unique |
| `Name` | text | Nom |
| `Description` | html | Description |
| `RiskTypeId` | int | Type |
| `RiskStatusId` | int | Statut |
| `RiskProbabilityId` | int | Probabilite |
| `RiskImpactId` | int | Impact |
| `RiskExposure` | int | Exposition (calcule) |
| `OwnerId` | int | Proprietaire |
| `CreatorId` | int | Createur |
| `ReleaseId` | int | Release |
| `ReviewDate` | date | Date de revue |
| `ClosedDate` | date | Date fermeture |
| `Custom_01..99` | varies | Proprietes personnalisees |

### Proprietes de Donnees (dataProperty)

| Propriete | Type | Usage |
| --------- | ---- | ----- |
| `textValue` | String | Texte, RichText, multi-select |
| `intValue` | Integer | IDs dropdown, effort, custom int |
| `dateValue` | Date | Dates |
| `caption` | String | Nom localise du champ |
| `tooltip` | String | Info-bulle |
| `lookups` | Array | Valeurs possibles dropdown |
| `editable` | Boolean | Champ modifiable (workflow) |
| `required` | Boolean | Champ obligatoire (workflow) |
| `hidden` | Boolean | Champ masque (workflow) |
| `fieldType` | Integer | Type de champ (voir tableau) |

### Types de Champs (fieldType)

| ID | Type | Description |
| -- | ---- | ----------- |
| 1 | Text | Texte simple |
| 2 | Lookup | Dropdown simple |
| 3 | DateTime | Date/heure |
| 4 | Identifier | ID artefact |
| 5 | Equalizer | Barre de progression |
| 6 | Name | Nom d'artefact |
| 7 | CustomPropertyLookup | Liste custom |
| 8 | Integer | Entier custom |
| 9 | TimeInterval | Effort/duree |
| 10 | Flag | Boolean |
| 11 | HierarchyLookup | Release/Requirement hierarchique |
| 12 | Html | RichText |
| 13 | Decimal | Decimal custom |
| 14 | CustomPropertyMultiList | Multi-select custom |
| 15 | CustomPropertyDate | Date custom |
| 16 | MultiList | Multi-select standard |

### Enregistrement d'Evenements

#### Evenements de Cycle de Vie

```javascript
// Au chargement de la page (apres init des composants)
spiraAppManager.registerEvent_loaded(function(dontClearMessages) {
    // dontClearMessages: boolean indiquant si les messages doivent persister
    console.log("Page chargee");
});

// Chargement complet de la fenetre (window.onload)
spiraAppManager.registerEvent_windowLoad(function() {
    console.log("Fenetre completement chargee");
});
```

#### Evenements de Sauvegarde

```javascript
// AVANT sauvegarde des donnees (avant soumission a la BDD)
// C'est ici qu'on peut MODIFIER les donnees avant sauvegarde
spiraAppManager.registerEvent_dataPreSave(function(operation) {
    // operation: "Insert" ou "Update"
    // IMPORTANT: pas de newId ici, l'artefact n'est pas encore cree
    console.log("Sauvegarde en cours...", operation);

    // Exemple: injecter un template si creation
    if (operation === "Insert") {
        var currentDesc = spiraAppManager.getDataItemField("Description", "textValue");
        if (!currentDesc || currentDesc.trim() === "") {
            spiraAppManager.updateFormField("Description", "<p>Template</p>");
        }
    }
});

// APRES sauvegarde des donnees (succes)
spiraAppManager.registerEvent_dataSaved(function(operation, newId) {
    // operation: type d'operation effectuee
    // newId: ID de l'artefact nouvellement cree (seulement si Insert)
    console.log("Donnees sauvegardees", operation, newId);

    if (newId) {
        console.log("Nouvel artefact cree avec ID:", newId);
    }
});

// En cas d'echec de sauvegarde
spiraAppManager.registerEvent_dataFailure(function(error) {
    // error: objet PluginRestException avec details de l'erreur
    console.log("Erreur de sauvegarde:", error);
});

// Quand un changement de statut est annule (workflow)
spiraAppManager.registerEvent_operationReverted(function(statusId, isOpen) {
    // statusId: ID du statut restaure
    // isOpen: boolean indiquant si l'artefact est ouvert
    console.log("Operation annulee, statut restaure:", statusId);
});
```

#### Evenements de Formulaire

```javascript
// Changement de valeur dans un dropdown
// Retourne boolean pour annuler le changement si false
spiraAppManager.registerEvent_dropdownChanged(fieldName, function(oldValue, newValue) {
    console.log("Changement:", oldValue, "->", newValue);

    // Exemple: empecher certains changements
    if (fieldName === "RequirementTypeId" && newValue === "5") {
        spiraAppManager.displayWarningMessage("Ce type n'est pas autorise");
        return false;  // Annule le changement
    }
    return true;  // Accepte le changement
});
```

#### Evenements de Grille

```javascript
// Chargement d'une grille (apres rendu)
spiraAppManager.registerEvent_gridLoaded(gridId, function() {
    // gridId: identifiant de la grille (voir gridIds)
    console.log("Grille chargee:", gridId);
});
```

#### Evenements de Dashboard

```javascript
// Mise a jour du dashboard (changement de filtre release, etc.)
spiraAppManager.registerEvent_dashboardUpdated(function() {
    console.log("Dashboard mis a jour");
    // Recharger les donnees du widget si necessaire
});
```

#### Evenements de Menu

```javascript
// Clic sur une entree de menu definie dans le manifest
// SIGNATURE COMPLETE avec 3 parametres
spiraAppManager.registerEvent_menuEntryClick(appGuid, menuEntry, handler);

// Exemple d'utilisation
spiraAppManager.registerEvent_menuEntryClick(
    APP_GUID,           // GUID de votre SpiraApp
    "generateTests",    // Nom de l'entree de menu (defini dans manifest)
    function() {
        console.log("Menu clique");
        // Votre logique ici
    }
);
```

---

## 6. Capacites et Possibilites

### Ce qu'une SpiraApp PEUT faire

#### Interface Utilisateur
- Ajouter des **boutons et menus** dans les toolbars des pages
- Creer des **colonnes personnalisees** dans les grilles de liste
- Afficher des **widgets** sur les tableaux de bord
- Afficher des **messages** (succes, erreur, avertissement)
- Creer des **dialogues de confirmation** et de selection

#### Manipulation des Donnees
- **Lire** les donnees des artefacts (requirements, test cases, incidents, etc.)
- **Modifier** les champs des formulaires
- **Sauvegarder** les modifications
- **Reagir aux evenements** (chargement, sauvegarde, changement)
- **Masquer/afficher** des options dans les dropdowns

#### Integration
- Appeler l'**API REST interne** de Spira
- Appeler des **APIs externes** (sans probleme CORS via executeRest)
- Integrer **AWS Bedrock** pour l'IA
- Stocker des donnees de maniere **persistante** (serveur ou localStorage via spiraAppManager)

#### Automatisation
- Automatiser la creation d'artefacts
- Transformer automatiquement des donnees a la sauvegarde
- Declencher des actions sur des evenements
- Integrer des pipelines CI/CD externes

#### Exemples de Cas d'Usage
- Generation automatique de cas de test depuis les requirements (IA)
- Integration avec des outils externes (GitHub, Jenkins, etc.)
- Validation automatique des donnees
- Calcul de metriques personnalisees
- Workflows personnalises par industrie

---

## 7. Limitations et Restrictions

### Modele d'Execution du Code

#### JavaScript - Sandboxing IIFE
Le code JavaScript est automatiquement :
- Insere dynamiquement dans la page
- Enveloppe dans un **IIFE** (Immediately Invoked Function Expression)
- Execute en **mode strict** (`"use strict"`)

Cela cree un contexte d'execution isole ou les variables "globales" sont confinees au scope de l'IIFE.

#### CSS - Scoping Automatique
Le CSS est automatiquement :
- Imbrique dans un selecteur de classe base sur le **GUID** de la SpiraApp
- Les elements UI crees recoivent un wrapper avec cette meme classe
- **Utiliser uniquement des selecteurs de classe** (pas d'IDs, pas de selecteurs globaux)

#### References de Fichiers
Les fichiers CSS et JS peuvent referencer d'autres fichiers avec `file://nomDuFichier.extension`. Lors du packaging, ces references sont automatiquement remplacees par le contenu complet des fichiers.

### Ce qu'une SpiraApp NE PEUT PAS faire

#### Patterns INTERDITS (Securite)

| Interdit | Raison |
| -------- | ------ |
| Acces au namespace global du navigateur | Isolation |
| Utilisation de fonctions internes Spira | Non documentees, instables |
| Manipulation de `document` ou `window` | Securite |
| Import de libraries externes ou CDN | Non supporte |
| Modification des helpers Spira fournis | Securite |
| Hardcoder les GUIDs | Erreur si copie |
| Acces direct a localStorage/localDB | Conflits possibles |
| Secrets hardcodes dans le code | Securite |
| APIs navigateur (Camera, Bluetooth, Geolocation) | Non autorise |
| Tracking de donnees utilisateur | Confidentialite |
| Partage de donnees avec tiers sans consentement | RGPD |
| Cookies | Non autorise |
| WebAssembly | Non supporte |
| WebSockets | Non supporte |
| iframes | Non supporte |

#### Limitations Techniques
- **Pas d'acces aux credentials cote client** : Les parametres marques `isSecure: true` ne sont pas accessibles dans le JavaScript client
- **Pas de modification des dates systeme** : Les champs de creation/modification ne peuvent pas etre modifies
- **Pas de modification du core Spira** : L'interface native ne peut pas etre modifiee directement
- **Pas d'acces direct a la base de donnees** : Tout passe par les APIs
- **Colonnes uniquement sur les listes** : Les pages Details ne supportent pas les colonnes personnalisees

#### Restrictions de Securite
- Les permissions utilisateur Spira s'appliquent aux actions de la SpiraApp
- Les appels API sont effectues avec les droits de l'utilisateur courant
- Le mode developpeur doit etre active pour les SpiraApps non approuvees

#### Contraintes de Distribution
- Les SpiraApps doivent passer par un **processus d'approbation Inflectra** pour distribution officielle
- Les fichiers `.spiraapp` locaux necessitent le **mode developpeur**
- Les SpiraApps approuvees sont empaquetees en fichiers `.spab` securises

#### Contraintes de Donnees
- Les champs de formulaire doivent utiliser les bonnes proprietes (`textValue`, `intValue`, `dateValue`)
- Une mauvaise manipulation peut casser la fonctionnalite de sauvegarde

---

## 8. Ressources Techniques Fournies

### JavaScript
- **React v16.14** : Disponible pour les composants UI
- **Mustache** : Moteur de templates pour le rendu dynamique
- **Constantes globales** :
  - `spiraAppManager` : API principale
  - `APP_GUID` : GUID de votre SpiraApp (string)
  - `WIDGET_ELEMENT` : Element DOM du widget (pour dashboards uniquement)
  - `SpiraAppSettings[APP_GUID]` : Acces aux parametres configures

### Acces aux Settings (IMPORTANT)

```javascript
// Verifier et acceder aux parametres produit
if (SpiraAppSettings[APP_GUID]) {
    // Acces a un parametre specifique
    var myParam = SpiraAppSettings[APP_GUID].monParametre;

    // Toujours verifier l'existence avant utilisation
    if (SpiraAppSettings[APP_GUID].templates) {
        var templates = JSON.parse(SpiraAppSettings[APP_GUID].templates);
    }
}

// Exemple complet d'utilisation des settings
(function() {
    // Verifier que les settings existent
    var settings = SpiraAppSettings[APP_GUID];
    if (!settings) {
        console.warn("SpiraApp non configuree");
        return;
    }

    // Utiliser les settings
    var wordsToReplace = settings.wordsToReplace || "";
    var targetField = settings.targetField || "Description";

    // Suite du code...
})();
```

> **Note** : Les parametres marques `isSecure: true` dans le manifest ne sont PAS accessibles via `SpiraAppSettings`. Ils sont uniquement disponibles cote serveur via les tokens `{settingName}` dans `executeRest`.

### CSS et Styles
- **FontAwesome 6 Pro** : Icones disponibles
- **Unity CSS Library** : Bibliotheque CSS d'Inflectra
- **Scoping automatique** : Les styles sont automatiquement isoles

### Assets
- **50+ images SVG** d'artefacts accessibles via `baseThemeUrl`
- Support pour les icones personnalisees

### Templates Mustache
```html
<!-- Exemple de template pour colonne -->
<div class="custom-column">
    {{#value}}
        <span class="badge">{{value}}</span>
    {{/value}}
    {{^value}}
        <span class="empty">-</span>
    {{/value}}
</div>

<!-- Exemple de template pour widget -->
<div class="widget-content">
    <h3>{{title}}</h3>
    <ul>
        {{#items}}
            <li>{{name}}: {{count}}</li>
        {{/items}}
    </ul>
</div>
```

---

## 9. Empaquetage et Deploiement

### Prerequis
- Node.js installe (v16+)
- Git installe
- Compte GitHub (pour la soumission officielle)

### Etape 1: Developper la SpiraApp

1. Creer la structure de dossiers
2. Ecrire le `manifest.yaml`
3. Developper le code JavaScript
4. Creer les templates HTML si necessaire
5. Ajouter les styles CSS si necessaire

### Etape 2: Installation du Generateur de Package

Le generateur officiel Inflectra convertit votre SpiraApp en fichier `.spiraapp` valide.

```bash
# Cloner le generateur de package
git clone https://github.com/Inflectra/spiraapp-package-generator
cd spiraapp-package-generator

# Installer les dependances (une seule fois)
npm install
```

### Etape 3: Generer le Package .spiraapp

**Syntaxe de la commande:**
```bash
npm run build --input="CHEMIN_VERS_SPIRAAPP" --output="CHEMIN_SORTIE"
```

**Parametres:**
| Parametre | Description | Obligatoire |
|-----------|-------------|-------------|
| `--input` | Chemin absolu vers le dossier contenant `manifest.yaml` | Oui |
| `--output` | Chemin absolu vers le dossier de sortie du `.spiraapp` | Oui |
| `--debug` | Mode debug - ne minifie pas le JavaScript | Non |

**Exemples concrets:**

```bash
# Windows - Build standard (JavaScript minifie)
npm run build --input="C:\SpiraApps\SmartTasks" --output="C:\SpiraApps\SmartTasks"

# Windows - Build debug (JavaScript non minifie, pour debogage)
npm run build --input="C:\SpiraApps\SmartTasks" --output="C:\SpiraApps\SmartTasks" --debug

# Linux/Mac
npm run build --input="/home/user/SpiraApps/SmartTasks" --output="/home/user/SpiraApps/SmartTasks"
```

**Resultat:**
- Le fichier genere est nomme automatiquement d'apres le GUID du manifest
- Format: `{guid}.spiraapp` (ex: `c7e9f3a1-5b28-4d6c-9e1f-8a2b3c4d5e6f.spiraapp`)
- Le generateur valide le manifest et affiche les erreurs eventuelles

**Exemple de sortie reussie:**
```
package has started
Successfully created "SmartTasks" bundle - saved to C:\SpiraApps\SmartTasks/c7e9f3a1-5b28-4d6c-9e1f-8a2b3c4d5e6f.spiraapp
```

**Erreurs courantes:**
| Erreur | Cause | Solution |
|--------|-------|----------|
| `no manifest file found` | Chemin incorrect ou manifest.yaml absent | Verifier le chemin --input |
| `Error in manifest` | Manifest invalide | Corriger les erreurs indiquees |
| `file not found: file://xxx.js` | Fichier JS reference mais absent | Creer le fichier ou corriger la reference |

### Etape 4: Activer le Mode Developpeur (Optionnel)

Pour tester sans passer par le marketplace:

1. **Activer le mode developpeur** :
   - System Administration > General Settings
   - Cocher "Enable Developer Mode"

2. Cela permet d'uploader des fichiers `.spiraapp` directement

### Etape 3: Installer pour Test

1. **Upload** : System Administration > SpiraApps > Upload
2. **Activer au niveau systeme** : Cocher la SpiraApp dans la liste
3. **Activer par produit** : Product Administration > SpiraApps

### Etape 4: Distribution Officielle (Optionnelle)

Pour publier sur le marketplace Inflectra :

1. **Creer un repository GitHub** :
   - Repository public
   - Structure de fichiers standard
   - README avec documentation

2. **Preparer la soumission** :
   - Creer une branche de developpement
   - Developper et tester
   - Creer une Pull Request vers main

3. **Soumettre a Inflectra** :
   - Suivre le processus de soumission officiel
   - Attendre l'approbation

4. **Apres approbation** :
   - Inflectra empaquete en fichier `.spab` securise
   - Distribution via le marketplace

### Structure de Versioning Recommandee

```
version: "MAJOR.MINOR.PATCH"

# MAJOR: Changements incompatibles
# MINOR: Nouvelles fonctionnalites compatibles
# PATCH: Corrections de bugs
```

---

## 10. Exemples de Code

### Exemple 1: SpiraApp Basique (Remplacement de Texte)

**manifest.yaml**
```yaml
guid: "12345678-1234-1234-1234-123456789012"
name: "TextReplacer"
caption: "Remplaceur de Texte"
summary: "Remplace automatiquement des mots dans les descriptions"
author: "Mon Organisation"
version: "1.0.0"

productSettings:
  - name: "wordsToReplace"
    caption: "Mots a remplacer (format: ancien1:nouveau1,ancien2:nouveau2)"
    settingTypeId: 1
    position: 1

pageContents:
  - pageId: 9
    name: "requirementReplacer"
    code: file://requirement.js
```

**requirement.js**
```javascript
// Enregistrer l'evenement de sauvegarde
spiraAppManager.registerEvent_dataSaved(function() {
    // Recuperer les parametres
    var settings = SpiraAppSettings[APP_GUID];
    var wordsConfig = settings.wordsToReplace;

    if (!wordsConfig) return;

    // Parser la configuration
    var replacements = wordsConfig.split(',').map(function(pair) {
        var parts = pair.split(':');
        return { old: parts[0].trim(), new: parts[1].trim() };
    });

    // Recuperer la description actuelle
    var description = spiraAppManager.getDataItemField("Description", "textValue");

    if (description) {
        // Appliquer les remplacements
        replacements.forEach(function(r) {
            description = description.replace(new RegExp(r.old, 'gi'), r.new);
        });

        // Mettre a jour et sauvegarder
        spiraAppManager.updateFormField("Description", description);
        spiraAppManager.displaySuccessMessage("Texte mis a jour automatiquement!");
    }
});
```

### Exemple 2: Widget Dashboard

**manifest.yaml (extrait)**
```yaml
dashboards:
  - dashboardPageId: 1
    name: "requirementStats"
    caption: "Statistiques Requirements"
    description: "Affiche les statistiques des requirements"
    code: file://widget.js
    template: file://widget.html
```

**widget.js**
```javascript
// Fonction executee au chargement du widget
(function() {
    var projectId = spiraAppManager.projectId;

    // Appeler l'API pour obtenir les requirements
    spiraAppManager.executeApi(
        "GET",
        "projects/" + projectId + "/requirements",
        null,
        function(requirements) {
            // Calculer les statistiques
            var stats = {
                total: requirements.length,
                completed: 0,
                inProgress: 0,
                notStarted: 0
            };

            requirements.forEach(function(req) {
                if (req.StatusId === 4) stats.completed++;
                else if (req.StatusId === 2) stats.inProgress++;
                else stats.notStarted++;
            });

            // Rendre le template avec Mustache
            var template = WIDGET_ELEMENT.querySelector('template').innerHTML;
            var html = Mustache.render(template, stats);
            WIDGET_ELEMENT.innerHTML = html;
        }
    );
})();
```

**widget.html**
```html
<template>
    <div class="stats-widget">
        <h4>Requirements</h4>
        <div class="stat-row">
            <span>Total:</span>
            <strong>{{total}}</strong>
        </div>
        <div class="stat-row completed">
            <span>Termines:</span>
            <strong>{{completed}}</strong>
        </div>
        <div class="stat-row in-progress">
            <span>En cours:</span>
            <strong>{{inProgress}}</strong>
        </div>
        <div class="stat-row not-started">
            <span>Non demarres:</span>
            <strong>{{notStarted}}</strong>
        </div>
    </div>
</template>
```

### Exemple 3: Menu avec Action

**manifest.yaml (extrait)**
```yaml
menus:
  - pageId: 2
    caption: "Test Actions"
    icon: "fas fa-flask"
    isActive: true
    entries:
      - name: "cloneTestCase"
        caption: "Cloner ce Test Case"
        tooltip: "Cree une copie de ce test case"
        icon: "fas fa-copy"
        actionTypeId: 2
        action: "handleClone"
```

**testcase.js**
```javascript
// Enregistrer le handler du menu
spiraAppManager.registerEvent_menuEntryClick("cloneTestCase", function() {
    // Confirmation
    spiraAppManager.displayConfirmation(
        "Voulez-vous vraiment cloner ce test case?",
        function(confirmed) {
            if (!confirmed) return;

            var testCaseId = spiraAppManager.artifactId;
            var projectId = spiraAppManager.projectId;

            // Recuperer le test case actuel
            spiraAppManager.executeApi(
                "GET",
                "projects/" + projectId + "/test-cases/" + testCaseId,
                null,
                function(testCase) {
                    // Preparer la copie
                    var newTestCase = {
                        Name: testCase.Name + " (Copie)",
                        Description: testCase.Description,
                        TestCasePriorityId: testCase.TestCasePriorityId,
                        TestCaseTypeId: testCase.TestCaseTypeId,
                        OwnerId: testCase.OwnerId
                    };

                    // Creer le nouveau test case
                    spiraAppManager.executeApi(
                        "POST",
                        "projects/" + projectId + "/test-cases",
                        newTestCase,
                        function(created) {
                            spiraAppManager.displaySuccessMessage(
                                "Test case clone avec succes! ID: " + created.TestCaseId
                            );
                        }
                    );
                }
            );
        }
    );
});
```

### Exemple 4: Colonne Personnalisee

**manifest.yaml (extrait)**
```yaml
pageColumns:
  - pageId: 8
    name: "riskScore"
    caption: "Score de Risque"
    template: file://risk-column.html
```

**risk-column.html**
```html
{{#RiskScore}}
    {{#isHigh}}
        <span class="badge badge-danger" title="Risque eleve">
            <i class="fas fa-exclamation-triangle"></i> {{RiskScore}}
        </span>
    {{/isHigh}}
    {{#isMedium}}
        <span class="badge badge-warning" title="Risque moyen">
            <i class="fas fa-exclamation-circle"></i> {{RiskScore}}
        </span>
    {{/isMedium}}
    {{#isLow}}
        <span class="badge badge-success" title="Risque faible">
            <i class="fas fa-check-circle"></i> {{RiskScore}}
        </span>
    {{/isLow}}
{{/RiskScore}}
{{^RiskScore}}
    <span class="text-muted">-</span>
{{/RiskScore}}
```

---

## 11. Bonnes Pratiques et Patterns

### Structure de Code Recommandee

```javascript
// Tout le code est automatiquement enveloppe dans un IIFE strict
// Pas besoin de le faire manuellement

// 1. Verifier les settings au debut
var settings = SpiraAppSettings[APP_GUID];
if (!settings) {
    return; // Pas de config, ne rien faire
}

// 2. Enregistrer les evenements
spiraAppManager.registerEvent_loaded(onLoaded);
spiraAppManager.registerEvent_dataPreSave(onPreSave);
spiraAppManager.registerEvent_dataSaved(onSaved);

// 3. Definir les handlers
function onLoaded() {
    // Code execute au chargement
}

function onPreSave(operation) {
    // Code execute AVANT sauvegarde
    // Ideal pour modifier les donnees
}

function onSaved(operation, newId) {
    // Code execute APRES sauvegarde
    // newId contient l'ID si creation
}
```

### Gestion des Erreurs

```javascript
// Toujours gerer les erreurs API
spiraAppManager.executeApi(
    "MyApp", "7.0", "GET", url, null,
    function(data) {
        // Succes
    },
    function(error) {
        spiraAppManager.displayErrorMessage("Erreur: " + error);
    }
);

// Verifier les permissions avant action
if (!spiraAppManager.canModifyArtifactType(1)) { // 1 = Requirement
    spiraAppManager.displayWarningMessage("Vous n'avez pas les droits de modification");
    return;
}
```

### Patterns a Eviter

| A Eviter | Pourquoi | Alternative |
| -------- | -------- | ----------- |
| Variables globales | Pollution namespace | Utiliser IIFE |
| Fonctions internes Spira | Non documentees, instables | Utiliser spiraAppManager |
| Libraries externes | Non supportees | Utiliser Mustache/React fournis |
| localStorage direct | Conflits possibles | Prefixer avec APP_GUID |
| iframes | Non supportes | Utiliser executeRest |
| Hardcoder le GUID | Erreur si copie | Utiliser APP_GUID |

### Detection Creation vs Edition

```javascript
// Methode 1: Verifier artifactId
if (!spiraAppManager.artifactId) {
    // Mode creation - pas encore d'ID
}

// Methode 2: Dans dataPreSave, verifier operation
spiraAppManager.registerEvent_dataPreSave(function(operation) {
    if (operation === "Insert") {
        // Creation
    } else if (operation === "Update") {
        // Modification
    }
});

// Methode 3: Dans dataSaved
spiraAppManager.registerEvent_dataSaved(function(operation, newId) {
    if (newId) {
        // C'etait une creation, newId = nouvel ID
    }
});
```

### Templates HTML pour Colonnes

```html
<!-- Tokens disponibles dans les templates de colonnes -->
<p>
    Projet: {project_id}
    Artefact: {artifact_id}
</p>

<!-- Acces aux champs de l'artefact via Mustache -->
{{#Name}}
    <strong>{{Name}}</strong>
{{/Name}}
{{^Name}}
    <em>Sans nom</em>
{{/Name}}
```

---

## 12. Sources et References

### Documentation Officielle

- [Introduction to SpiraApps](https://spiradoc.inflectra.com/SpiraApps/) - Presentation generale
- [SpiraApps Developer Reference](https://spiradoc.inflectra.com/Developers/SpiraApps-Reference/) - Reference technique complete
- [SpiraApps Tutorial](https://spiradoc.inflectra.com/Developers/SpiraApps-Tutorial/) - Tutoriel pas a pas
- [SpiraApps Manifest Reference](https://spiradoc.inflectra.com/Developers/SpiraApps-Manifest/) - Reference du fichier manifest
- [SpiraAppManager Documentation](https://spiradoc.inflectra.com/Developers/SpiraApps-Manager/) - API SpiraAppManager

### Outils et Ressources

- [SpiraApp Package Generator](https://github.com/Inflectra/spiraapp-package-generator) - Outil de build
- [SpiraApps Product Page](https://www.inflectra.com/Products/SpiraApps/) - Page produit Inflectra
- [Spira REST API](https://api.inflectra.com/Spira/Services/v5_0/RestService.aspx) - Documentation API REST

### Communaute

- [Forum Inflectra](https://www.inflectra.com/Support/) - Support et communaute
- [GitHub Inflectra](https://github.com/Inflectra) - Repositories officiels

---

## Changelog

| Version | Date | Description |
| ------- | ---- | ----------- |
| 1.0.0 | 2025-01-08 | Documentation initiale complete |
| 1.1.0 | 2025-01-14 | Ajout registerEvent_dataPreSave, signatures API corrigees, section Bonnes Pratiques |
| 1.2.0 | 2025-01-14 | Ajout noms de champs par artefact, gridIds, fieldTypes, dataProperties, section storage |
| 1.3.0 | 2025-01-14 | Signatures completes Storage API, executeApiAsync, createComboDialog, registerEvent_menuEntryClick, parametres evenements |
| 1.4.0 | 2025-01-14 | Analyse samples: reponse executeRest wrappee, API associations, projectTemplateId, tokens ${} vs {}, window.location.origin |
| 1.5.0 | 2026-01-14 | Pieges courants: updateFormField signatures, initialisation SpiraAppSettings, debugging |

---

## 13. Pieges Courants et Resolutions

Cette section documente les problemes frequemment rencontres lors du developpement de SpiraApps et leurs solutions.

### 13.1 Signature de updateFormField pour les Champs RichText

**Probleme** : `updateFormField` est appele mais le champ Description (ou autre RichText) ne se met pas a jour visuellement.

**Cause** : La signature a 2 parametres ne fonctionne pas toujours pour les champs RichText.

**Solution** : Utiliser la signature a 3 parametres avec `"textValue"` explicite.

```javascript
// ❌ NE FONCTIONNE PAS TOUJOURS pour RichText
spiraAppManager.updateFormField("Description", template);

// ✅ FONCTIONNE - Signature a 3 parametres
spiraAppManager.updateFormField("Description", "textValue", template);
```

**Signatures disponibles** :

| Signature | Usage |
|-----------|-------|
| `updateFormField(fieldName, value)` | Champs texte simples |
| `updateFormField(fieldName, dataProperty, value)` | **Recommande** pour RichText et tous les types |

**dataProperty valides** : `"textValue"`, `"intValue"`, `"dateValue"`

### 13.2 SpiraAppSettings Non Disponible au Chargement

**Probleme** : Erreur `Uncaught ReferenceError: SpiraAppSettings is not defined` au chargement de la SpiraApp.

**Cause** : Le code JavaScript s'execute avant que Spira ait initialise l'objet `SpiraAppSettings`.

**Solution** : Attendre que `SpiraAppSettings` soit disponible avant d'initialiser.

```javascript
// ✅ Pattern robuste d'initialisation
if (typeof SpiraAppSettings !== 'undefined') {
    // SpiraAppSettings deja disponible
    initMySpiraApp();
} else {
    // Attendre le chargement
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMySpiraApp);
    } else {
        // DOM deja charge, petit delai pour laisser Spira initialiser
        setTimeout(initMySpiraApp, 100);
    }
}

function initMySpiraApp() {
    // Re-verifier au cas ou
    if (typeof SpiraAppSettings === 'undefined') {
        console.error("[MyApp] SpiraAppSettings not available");
        return;
    }

    var settings = SpiraAppSettings[APP_GUID];
    if (!settings) {
        console.warn("[MyApp] No settings configured");
        return;
    }

    // Initialisation normale...
}
```

### 13.3 spiraAppManager Non Accessible dans la Console F12

**Probleme** : `spiraAppManager is not defined` quand on essaie de l'appeler depuis la console du navigateur.

**Cause** : `spiraAppManager` est injecte dans le scope IIFE de la SpiraApp, pas dans le scope global.

**Solution** : Exposer des fonctions de debug sur `window` pour le diagnostic.

```javascript
// Dans votre SpiraApp, exposer des helpers de debug
window.MyApp_debug = function() {
    console.log("Settings:", SpiraAppSettings[APP_GUID]);
    console.log("ArtifactId:", spiraAppManager.artifactId);
    console.log("ProjectId:", spiraAppManager.projectId);
};

window.MyApp_getField = function(fieldName) {
    return spiraAppManager.getDataItemField(fieldName, "textValue");
};

window.MyApp_injectNow = function() {
    // Votre fonction d'injection
    injectTemplate();
};
```

Depuis la console F12 :
```javascript
MyApp_debug()           // Voir l'etat
MyApp_getField("Name")  // Lire un champ
MyApp_injectNow()       // Forcer une action
```

### 13.4 updateFormField ne Persiste Pas les Donnees

**Probleme** : `updateFormField` met a jour l'interface mais les donnees ne sont pas sauvegardees en base.

**Cause** : `updateFormField` modifie uniquement le formulaire UI, pas la base de donnees.

**Solution** : L'utilisateur doit cliquer sur "Save" ou appeler `saveForm()`.

```javascript
// Modifier le champ
spiraAppManager.updateFormField("Description", "textValue", newContent);

// Option 1: Informer l'utilisateur de sauvegarder
spiraAppManager.displaySuccessMessage("Template injecte. Cliquez sur 'Save' pour enregistrer.");

// Option 2: Sauvegarder automatiquement (declenche dataSaved apres succes)
spiraAppManager.saveForm();
```

### 13.5 Template Non Injecte en Mode Creation

**Probleme** : Le template ne s'injecte pas lors de la creation d'un nouvel artefact.

**Cause** : En mode creation, `spiraAppManager.artifactId` est `null` ou `undefined`.

**Solution** : Utiliser cette caracteristique pour detecter le mode.

```javascript
spiraAppManager.registerEvent_loaded(function() {
    // Verifier si mode creation (pas d'ID)
    if (!spiraAppManager.artifactId) {
        console.log("Mode creation detecte");
        injectDefaultTemplate();
    } else {
        console.log("Mode edition, ID:", spiraAppManager.artifactId);
    }
});
```

### 13.6 Evenement dropdownChanged Declenche Plusieurs Fois

**Probleme** : Le handler `dropdownChanged` est appele plusieurs fois pour un seul changement.

**Cause** : Certains dropdowns Spira peuvent declencher l'evenement plusieurs fois.

**Solution** : Utiliser un flag pour eviter les traitements multiples.

```javascript
var isProcessing = false;

spiraAppManager.registerEvent_dropdownChanged("RequirementTypeId", function(oldVal, newVal) {
    if (isProcessing) return true;

    isProcessing = true;
    try {
        // Votre logique ici
        console.log("Type change de", oldVal, "a", newVal);
    } finally {
        // Reset apres un court delai
        setTimeout(function() { isProcessing = false; }, 100);
    }

    return true; // Autoriser le changement
});
```

### 13.7 Erreur "No manifest file found"

**Probleme** : Le generateur de package affiche `Error: no manifest file found`.

**Cause** : Le chemin vers le dossier source est incorrect ou ne contient pas `manifest.yaml`.

**Solution** : Verifier le chemin et la presence du manifest.

```bash
# Verifier que le manifest existe
ls "C:/chemin/vers/MaSpiraApp/manifest.yaml"

# Utiliser npm run build avec les bons parametres
npm run build --input="C:/chemin/vers/MaSpiraApp" --output="C:/chemin/output"

# Note: les chemins doivent utiliser / ou \\ (pas \)
```

### 13.8 Le Bouton Menu Ne Declenche Pas le Handler

**Probleme** : Le bouton apparait dans la toolbar mais le clic ne declenche rien.

**Cause** : Le `name` dans le manifest ne correspond pas au `menuEntry` dans `registerEvent_menuEntryClick`.

**Solution** : Verifier la correspondance exacte des noms.

```yaml
# manifest.yaml
menus:
  - pageId: 9
    caption: "Mon Menu"
    entries:
      - name: "monAction"           # <-- Ce nom
        caption: "Faire quelque chose"
        actionTypeId: 2
        action: "monAction"
```

```javascript
// JavaScript - le deuxieme parametre doit correspondre au "name"
spiraAppManager.registerEvent_menuEntryClick(
    APP_GUID,      // ou RTI_GUID si vous l'avez defini
    "monAction",   // <-- Doit correspondre au "name" ci-dessus
    function() {
        console.log("Bouton clique!");
    }
);
```

### 13.9 APP_GUID vs GUID Personnalise

**Probleme** : `APP_GUID` est `undefined` dans certains contextes.

**Cause** : `APP_GUID` est fourni par Spira mais peut ne pas etre disponible au moment de l'execution.

**Solution** : Definir votre propre constante GUID comme fallback.

```javascript
// Definir le GUID en constante au debut du fichier
var MY_APP_GUID = "b3f5a8d2-7c41-4e9a-b6d8-1f2e3a4b5c6d";

// Utiliser avec fallback
var guid = (typeof APP_GUID !== 'undefined') ? APP_GUID : MY_APP_GUID;

// Pour les settings
var settings = SpiraAppSettings[guid];
```

### 13.10 Resume des Signatures API Critiques

| Methode | Signature Correcte | Notes |
|---------|-------------------|-------|
| `updateFormField` (RichText) | `updateFormField(fieldName, "textValue", value)` | 3 params pour RichText |
| `getDataItemField` | `getDataItemField(fieldName, dataProperty)` | dataProperty obligatoire |
| `registerEvent_menuEntryClick` | `registerEvent_menuEntryClick(appGuid, menuName, handler)` | 3 params |
| `executeApi` | `executeApi(pluginName, apiVersion, method, url, body, successCb, errorCb)` | 7 params |

---

## 14. Reference Complete API REST Spira v7.0

Cette section documente les endpoints REST API Spira pour une utilisation avec `spiraAppManager.executeApi()`.

### 14.1 URL de Base et Authentification

**URL de Base:**
```
https://{instance}.spiraservice.net/Services/v7_0/RestService.svc/
```

**Authentification via SpiraApps:**
```javascript
// L'authentification est geree automatiquement par executeApi
spiraAppManager.executeApi(
    "MaSpiraApp",    // pluginName
    "7.0",           // apiVersion
    "GET",           // method
    "projects/1/tasks/42",  // url relative
    null,            // body
    successCallback,
    errorCallback
);
```

**Authentification directe (hors SpiraApp):**
```
Headers:
  username: {votre_username}
  api-key: {votre_api_key}  // Format: {00000000-0000-0000-0000-000000000000}
  Content-Type: application/json
  Accept: application/json
```

### 14.2 ArtifactTypeId - Table de Reference

| Artifact | ID | Utilisation |
|----------|-----|-------------|
| Requirement | 1 | Exigences |
| TestCase | 2 | Cas de test |
| Incident | 3 | Bugs/Defauts |
| Release | 4 | Versions/Iterations |
| TestRun | 5 | Executions de test |
| Task | 6 | Taches |
| TestStep | 7 | Etapes de test |
| TestSet | 8 | Jeux de tests |
| AutomationHost | 9 | Hotes d'automatisation |
| AutomationEngine | 10 | Moteurs d'automatisation |
| RequirementStep | 12 | Etapes d'exigence |
| Document | 13 | Documents/Pieces jointes |
| Risk | 14 | Risques |
| RiskMitigation | 15 | Mitigations de risque |

### 14.3 Pagination et Filtrage

**Parametres de Pagination (Query String):**
```
?starting_row=0&number_of_rows=100&sort_field=Name&sort_direction=ASC
```

| Parametre | Description |
|-----------|-------------|
| `starting_row` | Index de depart (0-based) |
| `number_of_rows` | Nombre max de resultats |
| `sort_field` | Champ de tri (ex: "Name", "TaskId", "StartDate") |
| `sort_direction` | "ASC" ou "DESC" |

**Format de Filtre (POST Body):**
```json
[
  {"PropertyName": "Name", "StringValue": "login"},
  {"PropertyName": "TaskStatusId", "IntValue": 2},
  {"PropertyName": "OwnerId", "MultiValue": [1, 2, 3]},
  {"PropertyName": "StartDate", "DateRangeValue": {
    "StartDate": "2024-01-01T00:00:00Z",
    "EndDate": "2024-12-31T23:59:59Z"
  }}
]
```

### 14.4 API TASKS (Taches)

#### Lister les Taches
```javascript
// GET avec pagination
spiraAppManager.executeApi(
    "SmartTasks", "7.0", "GET",
    "projects/" + projectId + "/tasks?starting_row=0&number_of_rows=500",
    null,
    function(tasks) { console.log(tasks); },
    function(error) { console.error(error); }
);
```

#### Recuperer une Tache
```javascript
spiraAppManager.executeApi(
    "SmartTasks", "7.0", "GET",
    "projects/" + projectId + "/tasks/" + taskId,
    null,
    successCallback, errorCallback
);
```

#### Creer une Tache
```javascript
var newTask = {
    Name: "Nouvelle tache",
    Description: "Description de la tache",
    TaskStatusId: 1,           // Requis
    TaskTypeId: 1,
    TaskPriorityId: 2,
    OwnerId: 5,
    StartDate: "2024-01-15T00:00:00",
    EndDate: "2024-01-20T00:00:00",
    EstimatedEffort: 480,      // En minutes (480 = 8h)
    ReleaseId: 5,
    RequirementId: 10
};

spiraAppManager.executeApi(
    "SmartTasks", "7.0", "POST",
    "projects/" + projectId + "/tasks",
    newTask,
    successCallback, errorCallback
);
```

#### Mettre a Jour une Tache
```javascript
// IMPORTANT: Recuperer d'abord ConcurrencyDate via GET
var updateTask = {
    TaskId: 42,
    Name: "Tache modifiee",
    TaskStatusId: 3,
    ActualEffort: 520,
    ConcurrencyDate: "2024-01-15T14:20:00"  // Requis!
};

spiraAppManager.executeApi(
    "SmartTasks", "7.0", "PUT",
    "projects/" + projectId + "/tasks",  // Sans taskId dans l'URL
    updateTask,
    successCallback, errorCallback
);
```

#### Supprimer une Tache
```javascript
spiraAppManager.executeApi(
    "SmartTasks", "7.0", "DELETE",
    "projects/" + projectId + "/tasks/" + taskId,
    null,
    successCallback, errorCallback
);
```

#### Rechercher avec Filtres
```javascript
var filters = [
    {"PropertyName": "TaskStatusId", "IntValue": 2},
    {"PropertyName": "OwnerId", "IntValue": 5}
];

spiraAppManager.executeApi(
    "SmartTasks", "7.0", "POST",
    "projects/" + projectId + "/tasks?starting_row=0&number_of_rows=100",
    filters,
    successCallback, errorCallback
);
```

### 14.5 API REQUIREMENTS (Exigences)

#### Lister les Exigences
```javascript
spiraAppManager.executeApi(
    "MyApp", "7.0", "GET",
    "projects/" + projectId + "/requirements?starting_row=0&number_of_rows=500",
    null, successCallback, errorCallback
);
```

#### Recuperer une Exigence
```javascript
spiraAppManager.executeApi(
    "MyApp", "7.0", "GET",
    "projects/" + projectId + "/requirements/" + requirementId,
    null, successCallback, errorCallback
);
```

#### Creer une Exigence (racine)
```javascript
var newReq = {
    Name: "Nouvelle exigence",
    Description: "Description detaillee",
    RequirementStatusId: 1,
    RequirementTypeId: 2,
    ImportanceId: 2,
    OwnerId: 5,
    ReleaseId: 3
};

spiraAppManager.executeApi(
    "MyApp", "7.0", "POST",
    "projects/" + projectId + "/requirements",
    newReq, successCallback, errorCallback
);
```

#### Creer sous un Parent
```javascript
spiraAppManager.executeApi(
    "MyApp", "7.0", "POST",
    "projects/" + projectId + "/requirements/parent/" + parentId,
    newReq, successCallback, errorCallback
);
```

#### Recuperer les Enfants
```javascript
spiraAppManager.executeApi(
    "MyApp", "7.0", "GET",
    "projects/" + projectId + "/requirements/" + requirementId + "/children",
    null, successCallback, errorCallback
);
```

#### Deplacer/Indenter
```javascript
// Indenter
spiraAppManager.executeApi(
    "MyApp", "7.0", "POST",
    "projects/" + projectId + "/requirements/" + reqId + "/indent",
    null, successCallback, errorCallback
);

// Outdenter
spiraAppManager.executeApi(
    "MyApp", "7.0", "POST",
    "projects/" + projectId + "/requirements/" + reqId + "/outdent",
    null, successCallback, errorCallback
);

// Deplacer
spiraAppManager.executeApi(
    "MyApp", "7.0", "POST",
    "projects/" + projectId + "/requirements/" + reqId + "/move?destination_requirement_id=" + destId,
    null, successCallback, errorCallback
);
```

### 14.6 API INCIDENTS (Bugs)

#### Lister les Incidents
```javascript
spiraAppManager.executeApi(
    "MyApp", "7.0", "GET",
    "projects/" + projectId + "/incidents?starting_row=0&number_of_rows=100",
    null, successCallback, errorCallback
);
```

#### Creer un Incident
```javascript
var newIncident = {
    Name: "Bug: Erreur de connexion",
    Description: "L'utilisateur ne peut pas se connecter",
    IncidentStatusId: 1,       // Requis
    IncidentTypeId: 1,         // Requis
    IncidentPriorityId: 2,
    IncidentSeverityId: 2,
    OwnerId: 5,
    DetectedReleaseId: 3,
    ResolvedReleaseId: null
};

spiraAppManager.executeApi(
    "MyApp", "7.0", "POST",
    "projects/" + projectId + "/incidents",
    newIncident, successCallback, errorCallback
);
```

#### Mettre a Jour un Incident
```javascript
var updateIncident = {
    IncidentId: 123,
    Name: "Bug corrige",
    IncidentStatusId: 3,
    ConcurrencyDate: "2024-01-15T14:20:00"
};

spiraAppManager.executeApi(
    "MyApp", "7.0", "PUT",
    "projects/" + projectId + "/incidents/" + incidentId,
    updateIncident, successCallback, errorCallback
);
```

#### Ajouter un Commentaire
```javascript
var comment = {
    Text: "Ce bug est en cours d'investigation."
};

spiraAppManager.executeApi(
    "MyApp", "7.0", "POST",
    "projects/" + projectId + "/incidents/" + incidentId + "/comments",
    comment, successCallback, errorCallback
);
```

### 14.7 API RELEASES (Versions)

#### Lister les Releases
```javascript
spiraAppManager.executeApi(
    "MyApp", "7.0", "GET",
    "projects/" + projectId + "/releases?active_only=true",
    null, successCallback, errorCallback
);
```

#### Creer une Release
```javascript
var newRelease = {
    Name: "Version 2.0",
    Description: "Nouvelle version majeure",
    VersionNumber: "2.0.0.0",
    StartDate: "2024-02-01T00:00:00",
    EndDate: "2024-06-30T00:00:00",
    ResourceCount: 5,
    DaysNonWorking: 0
};

// Release racine
spiraAppManager.executeApi(
    "MyApp", "7.0", "POST",
    "projects/" + projectId + "/releases",
    newRelease, successCallback, errorCallback
);

// Release enfant (iteration)
spiraAppManager.executeApi(
    "MyApp", "7.0", "POST",
    "projects/" + projectId + "/releases/" + parentReleaseId,
    newRelease, successCallback, errorCallback
);
```

### 14.8 API TEST CASES (Cas de Test)

#### Lister les Test Cases
```javascript
spiraAppManager.executeApi(
    "MyApp", "7.0", "GET",
    "projects/" + projectId + "/test-cases?starting_row=0&number_of_rows=100",
    null, successCallback, errorCallback
);
```

#### Creer un Test Case
```javascript
var newTestCase = {
    Name: "Test de connexion utilisateur",
    Description: "Verifie que l'utilisateur peut se connecter",
    TestCaseStatusId: 1,       // Requis
    TestCaseTypeId: 2,         // Requis
    TestCasePriorityId: 2,
    OwnerId: 5,
    EstimatedDuration: 15      // En minutes
};

spiraAppManager.executeApi(
    "MyApp", "7.0", "POST",
    "projects/" + projectId + "/test-cases",
    newTestCase, successCallback, errorCallback
);
```

#### Ajouter des Test Steps
```javascript
var newStep = {
    Description: "Entrer le nom d'utilisateur",
    ExpectedResult: "Le champ accepte la saisie",
    SampleData: "testuser@example.com",
    Position: 1
};

spiraAppManager.executeApi(
    "MyApp", "7.0", "POST",
    "projects/" + projectId + "/test-cases/" + testCaseId + "/test-steps",
    newStep, successCallback, errorCallback
);
```

#### Recuperer les Test Steps
```javascript
spiraAppManager.executeApi(
    "MyApp", "7.0", "GET",
    "projects/" + projectId + "/test-cases/" + testCaseId + "/test-steps",
    null, successCallback, errorCallback
);
```

### 14.9 API TEST RUNS (Executions)

#### Creer un Test Run Manuel
```javascript
spiraAppManager.executeApi(
    "MyApp", "7.0", "POST",
    "projects/" + projectId + "/test-runs/create?test_case_id=" + testCaseId + "&release_id=" + releaseId,
    null, successCallback, errorCallback
);
```

#### Enregistrer un Test Run Automatise
```javascript
var testRunResult = {
    TestCaseId: 123,
    ReleaseId: 5,
    ExecutionStatusId: 2,      // 2 = Passed
    StartDate: "2024-01-15T10:00:00",
    EndDate: "2024-01-15T10:05:00",
    RunnerName: "Automation Suite",
    RunnerTestName: "LoginTest",
    RunnerMessage: "Test passed successfully",
    RunnerStackTrace: null
};

spiraAppManager.executeApi(
    "MyApp", "7.0", "POST",
    "projects/" + projectId + "/test-runs/record",
    testRunResult, successCallback, errorCallback
);
```

**ExecutionStatusId:**
| ID | Statut |
|----|--------|
| 1 | Failed |
| 2 | Passed |
| 3 | Not Run |
| 4 | Not Applicable |
| 5 | Blocked |
| 6 | Caution |

### 14.10 API ASSOCIATIONS (Liens entre Artefacts)

#### Creer une Association
```javascript
var association = {
    ArtifactTypeId: 1,           // Requirement
    ArtifactId: 10,
    LinkedArtifactTypeId: 6,     // Task
    LinkedArtifactId: 42,
    LinkTypeId: 1,
    LinkDescription: "Implementation de l'exigence"
};

spiraAppManager.executeApi(
    "MyApp", "7.0", "POST",
    "projects/" + projectId + "/associations",
    association, successCallback, errorCallback
);
```

#### Recuperer les Associations
```javascript
// Associations d'une exigence (artifact_type_id=1)
spiraAppManager.executeApi(
    "MyApp", "7.0", "GET",
    "projects/" + projectId + "/associations/1/" + requirementId,
    null, successCallback, errorCallback
);
```

#### Supprimer une Association
```javascript
spiraAppManager.executeApi(
    "MyApp", "7.0", "DELETE",
    "projects/" + projectId + "/associations/" + associationId,
    null, successCallback, errorCallback
);
```

### 14.11 API DOCUMENTS (Pieces Jointes)

#### Lister les Documents
```javascript
spiraAppManager.executeApi(
    "MyApp", "7.0", "GET",
    "projects/" + projectId + "/documents",
    null, successCallback, errorCallback
);
```

#### Telecharger un Document
```javascript
spiraAppManager.executeApi(
    "MyApp", "7.0", "GET",
    "projects/" + projectId + "/documents/" + documentId + "/open",
    null,
    function(data) {
        // data contient le contenu binaire encode
    },
    errorCallback
);
```

#### Attacher un Document a un Artefact
```javascript
// Attacher doc 100 a l'incident 50 (artifact_type_id=3)
spiraAppManager.executeApi(
    "MyApp", "7.0", "POST",
    "projects/" + projectId + "/artifact-types/3/artifacts/50/documents/100",
    null, successCallback, errorCallback
);
```

### 14.12 API USERS (Utilisateurs)

#### Utilisateur Courant
```javascript
spiraAppManager.executeApi(
    "MyApp", "7.0", "GET",
    "users",
    null, successCallback, errorCallback
);
```

#### Lister les Utilisateurs du Projet
```javascript
spiraAppManager.executeApi(
    "MyApp", "7.0", "GET",
    "projects/" + projectId + "/users",
    null, successCallback, errorCallback
);
```

### 14.13 API COMMENTAIRES (Generique)

Les commentaires suivent le meme pattern pour tous les artefacts:

```javascript
// GET commentaires
"projects/{pid}/requirements/{id}/comments"
"projects/{pid}/tasks/{id}/comments"
"projects/{pid}/incidents/{id}/comments"
"projects/{pid}/releases/{id}/comments"
"projects/{pid}/test-cases/{id}/comments"
"projects/{pid}/risks/{id}/comments"

// POST commentaire
var comment = { Text: "Mon commentaire" };
spiraAppManager.executeApi(
    "MyApp", "7.0", "POST",
    "projects/" + projectId + "/tasks/" + taskId + "/comments",
    comment, successCallback, errorCallback
);
```

### 14.14 Gestion des Erreurs

```javascript
spiraAppManager.executeApi(
    "MyApp", "7.0", "GET",
    "projects/" + projectId + "/tasks",
    null,
    function(response) {
        // Succes
        if (Array.isArray(response)) {
            console.log("Taches recues:", response.length);
        }
    },
    function(error) {
        // Erreur
        console.error("Erreur API:", error);

        // Types d'erreurs courants:
        // - 401: Non authentifie
        // - 403: Acces refuse
        // - 404: Ressource non trouvee
        // - 409: Conflit de concurrence (ConcurrencyDate invalide)
        // - 500: Erreur serveur
    }
);
```

### 14.15 Bonnes Pratiques API

1. **Toujours utiliser la pagination** pour les listes:
   ```javascript
   "?starting_row=0&number_of_rows=100"
   ```

2. **Recuperer ConcurrencyDate avant PUT**:
   ```javascript
   // 1. GET pour obtenir ConcurrencyDate
   // 2. PUT avec ConcurrencyDate inclus
   ```

3. **Format des dates**: ISO 8601 UTC
   ```javascript
   "2024-01-15T14:30:00.000Z"
   ```

4. **Effort en minutes**:
   ```javascript
   EstimatedEffort: 480  // = 8 heures
   ```

5. **Ne pas envoyer de valeurs null dans les filtres**

---

*Document genere a partir des recherches sur la documentation officielle Inflectra.*
*Mise a jour: Janvier 2026 - API REST v7.0*
