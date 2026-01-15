# SpiraApp - Requirement Template Injector

## Specifications Fonctionnelles

---

### 1. Objectif

Injecter automatiquement un template de texte formate (HTML) dans les champs RichText lors de la creation d'une nouvelle exigence (Requirement), afin de guider les utilisateurs dans la redaction de leur analyse.

---

### 2. Fonctionnalites

#### 2.1 Templates par Type d'Exigence
- Definir un modele de texte different pour chaque type d'exigence (RequirementTypeId)
- Exemples de types : Business Requirement, Functional Requirement, User Story, etc.
- Si aucun template n'est defini pour un type, le champ reste vide

#### 2.2 Champs RichText Supportes (v2.0)

- **Champs standards** : Description (par defaut), ou tout autre champ RichText natif
- **Champs personnalises** : Custom Properties de type RichText (Custom_01, Custom_02, etc.)
- L'administrateur configure le champ cible dans les Product Settings
- Si non configure, le champ Description est utilise par defaut (retrocompatibilite)

#### 2.3 Configuration via Admin SpiraApp
Parametres configurables au niveau produit (Product Settings) :
- Selection du/des champ(s) RichText cible(s)
- Definition des templates HTML par type d'exigence
- Activation/desactivation par type

#### 2.4 Comportement Utilisateur

L'injection se declenche automatiquement dans deux cas :

1. **Au chargement de la page** (avec un delai de 500ms) :
   - L'utilisateur ouvre une exigence (nouvelle ou existante)
   - Si le champ cible est vide, le template correspondant au type actuel est injecte

2. **Au changement de type d'exigence** :
   - L'utilisateur modifie le type dans le dropdown RequirementTypeId
   - Si le champ cible est vide, le template du nouveau type est injecte

**Protection du contenu existant** : Si le champ cible contient deja du texte, aucune injection n'est effectuee. Le contenu de l'utilisateur est toujours preserve.

> **Note** : Spira cree immediatement un artefact avec un ID quand on clique sur "New". Il n'y a donc pas de distinction entre mode creation et mode edition. L'injection se base uniquement sur le contenu du champ cible.

#### 2.5 Bouton d'Injection Manuelle (v1.1)

Un bouton "Injecter Template" est disponible sur la page de detail d'une exigence pour permettre l'injection manuelle du template.

**Comportement :**

1. Le bouton apparait dans la barre d'outils de la page RequirementDetails
2. Au clic :
   - **Si le champ cible est vide** : le template correspondant au type actuel est injecte
   - **Si le champ cible contient du texte** : un message d'avertissement informe l'utilisateur que le champ n'est pas vide
3. Fonctionne en mode creation ET en mode edition (pour recharger un template si besoin)

**Cas d'usage :**

- L'utilisateur a efface le contenu et veut recharger le template
- L'utilisateur veut forcer l'injection sur une exigence existante
- Debug et test de la configuration des templates

---

### 3. Architecture Technique

#### 3.1 Pages Ciblees
| pageId | Page | Usage |
|--------|------|-------|
| 9 | RequirementDetails | Injection du template a la creation |

#### 3.2 Manifest Structure
```yaml
guid: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
name: "RequirementTemplateInjector"
caption: "Requirement Template Injector"
summary: "Injecte des templates dans les champs RichText des exigences"
version: "2.0.0"

productSettings:
  # Champ cible (v2.0) - texte libre pour supporter standard et custom
  - name: "target_field"
    caption: "Champ RichText cible"
    settingTypeId: 1  # String (ex: Description, Custom_01)
    placeholder: "Description"

  # 5 slots type + template
  - name: "type_id_1"
    settingTypeId: 11  # ArtifactTypeSingleSelect
    artifactTypeId: 1
  - name: "template_1"
    settingTypeId: 2   # RichText

pageContents:
  - pageId: 9
    name: "injector"
    code: file://injector.js
```

#### 3.3 Format de Configuration des Templates
```json
{
  "1": {
    "name": "Business Requirement",
    "template": "<h2>Contexte</h2><p>[Decrire le contexte]</p><h2>Besoin</h2><p>[Decrire le besoin]</p>"
  },
  "2": {
    "name": "Functional Requirement",
    "template": "<h2>Description</h2><p>[...]</p><h2>Regles de gestion</h2><ul><li>Regle 1</li></ul>"
  },
  "3": {
    "name": "User Story",
    "template": "<p><strong>En tant que</strong> [role]</p><p><strong>Je veux</strong> [action]</p><p><strong>Afin de</strong> [benefice]</p>"
  }
}
```

---

### 4. Logique du Code

```javascript
// Pseudo-code de la logique principale v2.0.0

// 1. Charger le champ cible depuis settings (fallback: Description)
// 2. Ecouter l'evenement loaded (page chargee)
// 3. Ecouter l'evenement dropdownChanged sur RequirementTypeId
// 4. Pour chaque evenement: verifier si le champ cible est vide
// 5. Si vide, injecter le template correspondant au type actuel

// Chargement du champ cible
var targetField = state.settings.target_field || "Description";

// Handler pour le chargement de la page
spiraAppManager.registerEvent_loaded(function() {
    setTimeout(function() {
        var currentValue = spiraAppManager.getDataItemField(targetField, "textValue");
        if (!currentValue || currentValue.trim() === "") {
            injectTemplateForCurrentType();
        }
    }, 500);
});

// Handler pour le changement de type
spiraAppManager.registerEvent_dropdownChanged("RequirementTypeId", function(oldValue, newValue) {
    var currentValue = spiraAppManager.getDataItemField(targetField, "textValue");
    if (!currentValue || currentValue.trim() === "") {
        injectTemplateForType(String(newValue));
    }
});

// Injection du template
function injectTemplateForType(typeId) {
    var template = state.templates[typeId];
    if (template) {
        // IMPORTANT: utiliser la signature a 3 parametres pour RichText
        spiraAppManager.updateFormField(targetField, "textValue", template);
        spiraAppManager.displaySuccessMessage("[RTI] Template injecte dans " + targetField);
    }
}
```

---

### 5. Exemples de Templates

#### Business Requirement
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

#### User Story
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

#### Functional Requirement
```html
<h2>Description Fonctionnelle</h2>
<p>[Description detaillee de la fonctionnalite]</p>

<h2>Regles de Gestion</h2>
<table border="1">
    <tr><th>ID</th><th>Regle</th><th>Description</th></tr>
    <tr><td>RG01</td><td>[Nom]</td><td>[Description]</td></tr>
</table>

<h2>Cas Nominaux</h2>
<p>[Decrire le scenario principal]</p>

<h2>Cas Alternatifs / Erreurs</h2>
<p>[Decrire les cas d'erreur]</p>
```

---

### 6. Points d'Attention

1. **Pas de mode creation distinct** : Spira cree immediatement un artefact avec un ID quand on clique sur "New". Ne pas se baser sur `artifactId` pour detecter le mode creation.
2. **Signature updateFormField** : Utiliser la signature a 3 parametres `updateFormField(fieldName, "textValue", value)` pour les champs RichText.
3. **Ecrasement** : Ne jamais ecraser si l'utilisateur a deja saisi du contenu dans le champ cible.
4. **Performance** : Charger les templates une seule fois au demarrage depuis `SpiraAppSettings`.
5. **Delai au chargement** : Utiliser un `setTimeout` de 500ms apres `registerEvent_loaded` pour laisser le formulaire se charger completement.
6. **SpiraAppSettings** : Verifier que `SpiraAppSettings` est disponible avant d'initialiser (peut necessiter un delai).
7. **Champs custom** : Les champs personnalises RichText sont accessibles via `Custom_01`, `Custom_02`, etc. Utiliser le meme `textValue` que pour les champs standards.
8. **Retrocompatibilite** : Si `target_field` n'est pas configure, utiliser `Description` par defaut.

---

### 7. Roadmap

- **v1.0** : Template sur champ Description standard - Done
- **v1.1** : Bouton d'injection manuelle - Done
- **v1.5** : Injection auto au chargement + changement de type - Done
- **v2.0** : Support de n'importe quel champ RichText - Done
- **v2.1** : Interface de configuration visuelle des templates - Planned
- **v2.2** : Import/Export des templates - Planned

---

### 8. Structure des Fichiers

```
RequirementTemplateInjector/
├── manifest.yaml
├── code/
│   └── injector.js
├── SPEC.md (ce fichier)
└── README.md
```

---

*Document cree le 2025-01-08*
*Mis a jour le 2026-01-14 - v2.0.0*
