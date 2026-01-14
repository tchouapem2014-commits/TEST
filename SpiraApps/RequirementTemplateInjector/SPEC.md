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

#### 2.2 Champs RichText Supportes
- **Champs standards** : Description, ou tout autre champ RichText natif
- **Champs personnalises** : Custom Properties de type RichText (settingTypeId: 2)
- L'administrateur peut choisir quel(s) champ(s) cibler

#### 2.3 Configuration via Admin SpiraApp
Parametres configurables au niveau produit (Product Settings) :
- Selection du/des champ(s) RichText cible(s)
- Definition des templates HTML par type d'exigence
- Activation/desactivation par type

#### 2.4 Comportement Utilisateur
1. L'utilisateur clique sur "Nouveau" pour creer une exigence
2. Il remplit les champs souhaites et/ou selectionne un type d'exigence (un type par defaut est toujours pre-selectionne)
3. **A la premiere sauvegarde** : le template correspondant au type choisi est automatiquement injecte dans le champ RichText cible
4. L'utilisateur peut ensuite modifier le contenu comme il le souhaite

> **Note** : L'injection se fait a la sauvegarde et non au changement de type, car un type par defaut est toujours present. Cela garantit que le template est toujours applique.

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
version: "1.0.0"

productSettings:
  - name: "targetField"
    caption: "Champ RichText cible"
    settingTypeId: 7  # ArtifactStandardField ou 3 pour CustomProperty
    artifactTypeId: 1

  - name: "templates"
    caption: "Templates par type (format JSON)"
    settingTypeId: 9  # Multi line plain text

pageContents:
  - pageId: 9
    name: "templateInjector"
    code: file://code/injector.js
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
// Pseudo-code de la logique principale

// 1. Ecouter l'evenement dataPreSave (avant soumission a la BDD)
// 2. Detecter si c'est une nouvelle exigence (pas d'ID existant)
// 3. Recuperer le type d'exigence selectionne
// 4. Charger la configuration des templates
// 5. Si un template existe pour ce type, l'injecter dans le champ cible

spiraAppManager.registerEvent_dataPreSave(function(operation, newId) {
    // Verifier si c'est une creation (operation == "Insert" ou pas d'artifactId)
    if (!spiraAppManager.artifactId) {
        // Recuperer le type selectionne via le formulaire
        const typeId = spiraAppManager.getDataItemField("RequirementTypeId", "intValue");

        // Charger le template correspondant
        const template = getTemplateForType(typeId);

        // Injecter dans le champ cible si template existe et champ vide
        if (template) {
            const currentValue = spiraAppManager.getDataItemField("Description", "textValue");
            if (!currentValue || currentValue.trim() === "") {
                spiraAppManager.updateFormField("Description", template);
            }
        }
    }
});
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

1. **Detection du mode creation** : Verifier si l'artefact n'a pas encore d'ID (RequirementId == null ou undefined)
2. **Champs Custom** : Tester l'acces aux champs personnalises RichText
3. **Ecrasement** : Ne pas ecraser si l'utilisateur a deja saisi du contenu dans le champ cible
4. **Performance** : Charger les templates une seule fois au demarrage
5. **Type par defaut** : L'injection fonctionne meme si l'utilisateur ne change pas le type (le type par defaut est utilise)

---

### 7. Roadmap

| Phase | Description | Priorite |
|-------|-------------|----------|
| v1.0 | Template sur champ Description standard | Haute |
| v1.1 | Support des champs Custom RichText | Moyenne |
| v1.2 | Interface de configuration visuelle des templates | Basse |
| v1.3 | Import/Export des templates | Basse |

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
