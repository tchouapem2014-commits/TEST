# Analyse des SpiraApps - Possibilites et Limitations

> Analyse de 3 projets SpiraApp reels pour comprendre les capacites et les contraintes du framework

---

## Resume Executif

| Projet | Auteur | Objectif | Complexite |
|--------|--------|----------|------------|
| **Change Test Case Type** | Inflectra | Changer le type de test case automatiquement | Simple |
| **SpiraConfluence** | Dermot Canniffe | Integration bidirectionnelle Spira <-> Confluence | Moyenne |
| **ChatGPT/RobotFramework** | Inflectra | Generation IA de test cases, tasks, risks, BDD | Complexe |

> **Note**: Le projet `antimobucc/SpiraApp` est une application iOS Swift, pas une SpiraApp Inflectra.

---

## 1. Change Test Case Type (Inflectra)

### Description
Change automatiquement le type d'un Test Case (ex: Manual -> Automated) quand une propriete personnalisee specifique est modifiee.

### Techniques Utilisees

```javascript
// Enregistrement d'evenement sur changement de dropdown
spiraAppManager.registerEvent_loaded(() => { ... });
spiraAppManager.registerEvent_dropdownChanged(fieldName, callback);

// Lecture de valeur live (non sauvegardee)
spiraAppManager.getLiveFormFieldValue(fieldName);

// Acces aux options d'un dropdown
spiraAppManager.getDropdownItems(fieldName);
```

### Points Cles

| Aspect | Details |
|--------|---------|
| **Page ciblee** | TestCaseDetails (pageId: 2) |
| **Settings** | 3 productSettings (custom property, valeur, type cible) |
| **Evenements** | `registerEvent_loaded`, `registerEvent_dropdownChanged` |
| **Limitation identifiee** | Pas de methode officielle pour modifier un dropdown programmatiquement |

### Hack Technique Important

```javascript
// WORKAROUND: Utilise une methode INTERNE de Spira car pas d'API officielle!
function setLiveFormDropDownFieldValueInternal(fieldName, textValue) {
    var ddlTestCaseType = $find('cplMainContent_ddlType');  // Methode interne ASP.NET
    ddlTestCaseType.set_selectedItem(selectedItemId);
}
```

**LIMITATION DECOUVERTE**: Il n'existe pas de methode `spiraAppManager` pour modifier la valeur d'un dropdown. Le code utilise `$find()` qui est une methode interne ASP.NET AJAX.

---

## 2. SpiraConfluence (Dermot Canniffe)

### Description
Ajoute un bouton "Confluence" sur les Requirements pour :
1. Ouvrir une page Confluence existante (si URL stockee)
2. Creer une nouvelle page Confluence et stocker le lien

### Techniques Utilisees

```javascript
// Enregistrement de clic sur menu
spiraAppManager.registerEvent_menuEntryClick(APP_GUID, "openConfluenceLink", handler);

// Lecture de champs
spiraAppManager.getDataItemField(fieldName, "textValue");
spiraAppManager.artifactId;
spiraAppManager.projectId;

// Modification de champs
spiraAppManager.updateFormField(fieldName, "textValue", newValue);

// Appel API externe (Confluence)
spiraAppManager.executeRest(APP_GUID, name, method, url, body, credentials, headers, success, error);

// Messages
spiraAppManager.displaySuccessMessage(...);
spiraAppManager.displayErrorMessage(...);
spiraAppManager.hideMessage();
```

### Configuration

**System Settings (niveau systeme)**:
- `confluenceBaseUrl` - URL de base Confluence
- `confluenceApiEmail` - Email pour auth
- `confluenceApiToken` - Token API (isSecure: true)

**Product Settings (par produit)**:
- `confluenceLinkFieldName` - Champ custom pour stocker l'URL
- `confluenceSpaceKey` - Espace Confluence cible
- `confluenceParentPageId` - Page parente (optionnel)

### Limitations Decouvertes (Documentees dans le code)

#### 1. Sauvegarde Automatique via API PUT - ECHEC
```javascript
// PROBLEME: L'API PUT retourne 200 OK mais les donnees ne sont PAS sauvegardees!
// Le code commente montre une tentative complete de:
// - Recuperer le Requirement
// - Modifier les CustomProperties
// - PUT sur l'API
// Resultat: 200 OK mais pas de persistence reelle
```

#### 2. SpiraApp Storage - Erreur 500
```javascript
// PROBLEME: spiraAppManager.storageGetProduct() retourne systematiquement 500 Internal Server Error
// Impact: Impossible de cacher le PropertyDefinitionId
```

#### 3. Solution de Contournement
```javascript
// Le code utilise updateFormField() qui modifie le formulaire
// MAIS l'utilisateur doit cliquer manuellement sur "Save" pour persister!
spiraAppManager.updateFormField(fieldName, "textValue", newPageUrl);
// Message a l'utilisateur: "Please click Spira's 'Save' button to persist this change"
```

### Menus dans Manifest

```yaml
menus:
  - pageId: 9  # RequirementDetails
    caption: Confluence
    icon: fa-brands fa-confluence
    entries:
      - name: openConfluenceLink
        caption: Open Confluence Link
        actionTypeId: 2  # Function
        action: openConfluenceLink
```

---

## 3. ChatGPT / RobotFramework SpiraApp (Inflectra)

### Description
Integration complete avec OpenAI pour generer automatiquement :
- Test Cases avec steps
- Tasks de developpement
- BDD Scenarios (Gherkin)
- Risks

### Techniques Avancees

```javascript
// Verification des permissions
spiraAppManager.canCreateArtifactType(artifactTypeId);
spiraAppManager.canModifyArtifactType(artifactTypeId);

// Appels API internes Spira
spiraAppManager.executeApi(name, version, method, url, body, success, error);

// Appel API externe (OpenAI)
spiraAppManager.executeRest(APP_GUID, name, method, url, body, credentials, headers, success, error);

// Creation d'artefacts via API
// POST projects/{id}/test-cases
// POST projects/{id}/tasks
// POST projects/{id}/risks
// POST projects/{id}/requirements/{id}/steps
// POST projects/{id}/associations

// Rechargement des donnees
spiraAppManager.reloadForm();
spiraAppManager.reloadGrid(spiraAppManager.gridIds.requirementSteps);
```

### Pattern: Token dans Headers

```javascript
// Le token API est injecte automatiquement via la syntaxe ${setting_name}
var headers = {
    "Authorization": "Bearer ${api_key}"  // Remplace par la valeur de settings.api_key
};
```

### Configuration Avancee

**Setting Groups** (organisation visuelle):
```yaml
settingGroups:
  - name: prompts
    caption: ChatGPT Prompts
  - name: regexes
    caption: Regular Expressions
  - name: other
    caption: General Settings
```

**Settings avec groupes**:
```yaml
productSettings:
  - settingTypeId: 1
    settingGroup: prompts  # <-- Rattache au groupe
    name: testcase_prompt
    caption: Test Case Prompt
```

### Gestion d'Etat Local

```javascript
let localState = {};

// Prevention des appels multiples
if (localState.running) {
    spiraAppManager.displayWarningMessage("Another job is running...");
    return;
}
localState.running = true;

// Compteur pour savoir quand tous les items sont crees
localState.testCaseCount = matches.length;
// ...
localState.testCaseCount--;
if (localState.testCaseCount == 0) {
    spiraAppManager.reloadForm();
}
```

### Creation d'Associations

```javascript
// Lier un Risk a un Requirement
var remoteAssociation = {
    SourceArtifactId: requirementId,
    SourceArtifactTypeId: 1,  // Requirement
    DestArtifactId: remoteRisk.RiskId,
    DestArtifactTypeId: 14,   // Risk
    ArtifactLinkTypeId: 1     // Related
};
spiraAppManager.executeApi(..., 'POST', 'projects/{id}/associations', body, ...);
```

---

## Synthese: Ce qui est POSSIBLE

| Capacite | Exemple | Projet Source |
|----------|---------|---------------|
| Reagir aux changements de dropdown | Modifier type quand prop change | Change Test Case Type |
| Appeler des APIs externes | Confluence API, OpenAI API | SpiraConfluence, ChatGPT |
| Creer des artefacts via API | Test Cases, Tasks, Risks | ChatGPT |
| Ajouter des boutons/menus | Bouton Confluence, Menu ChatGPT | Tous |
| Modifier des champs formulaire | updateFormField() | SpiraConfluence |
| Verifier les permissions | canCreateArtifactType() | ChatGPT |
| Utiliser des credentials securises | isSecure: true + ${token} | SpiraConfluence, ChatGPT |
| Organiser les settings en groupes | settingGroups | ChatGPT |
| Recharger formulaires/grilles | reloadForm(), reloadGrid() | ChatGPT |
| Creer des associations entre artefacts | POST /associations | ChatGPT |

---

## Synthese: Ce qui est LIMITE ou IMPOSSIBLE

| Limitation | Details | Decouverte |
|------------|---------|------------|
| **Modifier dropdown programmatiquement** | Pas d'API officielle, hack avec `$find()` necessaire | Change Test Case Type |
| **Sauvegarde automatique via PUT** | PUT retourne 200 mais ne persiste pas toujours | SpiraConfluence |
| **SpiraApp Storage (storageGetProduct)** | Erreurs 500 frequentes | SpiraConfluence |
| **Sauvegarde sans action utilisateur** | updateFormField() ne sauvegarde pas, utilisateur doit cliquer Save | SpiraConfluence |
| **Acces aux settings securises cote client** | isSecure: true = non accessible en JS client | Documentation |

---

## Recommandations pour votre SpiraApp (Requirement Template Injector)

### Ce qui fonctionnera bien
1. **Detecter la creation** via `registerEvent_loaded()`
2. **Lire le type d'exigence** via `getDataItemField("RequirementTypeId", "intValue")`
3. **Modifier le champ Description** via `updateFormField("Description", "textValue", template)`
4. **Configuration des templates** via productSettings (type JSON ou multiline text)

### Points d'attention
1. **Pas de sauvegarde automatique** - Le template sera injecte dans le formulaire mais l'utilisateur devra sauvegarder
2. **Detecter "nouvelle exigence"** - Verifier si `artifactId` est null/undefined ou utiliser un autre indicateur
3. **Champs custom RichText** - Tester le format exact du nom (Custom_01, Custom_02, etc.)
4. **Changement de type** - Utiliser `registerEvent_dropdownChanged("RequirementTypeId", ...)` pour mettre a jour le template si le type change

### Exemple de structure recommandee

```yaml
productSettings:
  - name: targetField
    caption: Champ cible
    settingTypeId: 1  # Text - ex: "Description" ou "Custom_05"

  - name: templates
    caption: Templates par type (JSON)
    settingTypeId: 9  # Multiline text
    # Format: {"1": "<h2>Contexte</h2>...", "2": "<p>En tant que...</p>"}
```

---

## Fichiers de Reference

| Projet | Fichiers cles |
|--------|---------------|
| Change Test Case Type | [manifest.yaml](samples/sample-spiraapp-change-test-case-type/manifest.yaml), [testCaseDetails.js](samples/sample-spiraapp-change-test-case-type/testCaseDetails.js) |
| SpiraConfluence | [manifest.yaml](samples/SpiraConfluence/manifest.yaml), [confluence.js](samples/SpiraConfluence/confluence.js) |
| ChatGPT | [manifest.yaml](samples/RobotFrameworkSpiraApp/manifest.yaml), [requirementDetails.js](samples/RobotFrameworkSpiraApp/requirementDetails.js) |

---

*Analyse effectuee le 2025-01-08*
