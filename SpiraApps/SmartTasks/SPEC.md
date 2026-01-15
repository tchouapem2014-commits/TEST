# SmartTasks - Specifications Techniques

> Version 1.0.0 - Gestion des dependances de taches avec calcul automatique des dates

---

## 1. Vue d'Ensemble

### 1.1 Objectif

**SmartTasks** est une SpiraApp qui ajoute la gestion avancee des dependances de taches a SpiraPlan, inspiree des fonctionnalites de **Helix Plan (P4 Plan)**. Elle comble un gap fonctionnel majeur de SpiraPlan: l'absence de calcul automatique des dates basees sur les dependances.

### 1.2 Probleme Resolu

| Fonctionnalite | SpiraPlan Natif | Avec SmartTasks |
|----------------|-----------------|-----------------|
| Types de liens | 2 types (Related-to, Depends-on) | **4 types** (FS, SS, FF, SF) |
| Calcul auto des dates | Non | **Oui - Complet** |
| Propagation en cascade | Non | **Oui** |
| Lag/Lead time | Non | **Oui** |
| Detection cycles | Non | **Oui** |
| Visualisation dependances | Basique | **Avancee** |

### 1.3 Cas d'Utilisation

1. **Chef de projet**: Planifier une chaine de taches ou le retard d'une tache impacte automatiquement les suivantes
2. **Equipe dev**: Visualiser les blocages et comprendre quelles taches attendent quoi
3. **PMO**: Identifier le chemin critique d'un projet
4. **Scrum Master**: Gerer les dependances entre taches d'un sprint

---

## 2. Fonctionnalites Detaillees

### 2.1 Types de Dependances (4 Types)

SmartTasks supporte les **4 types de dependances standard** de la gestion de projet:

| Type | Code | Description | Formule | Exemple |
|------|------|-------------|---------|---------|
| **Finish-to-Start** | FS | Fin de A declenche debut de B | B.Start >= A.End | Tester APRES Developper |
| **Start-to-Start** | SS | Debut de A declenche debut de B | B.Start >= A.Start | Design et Doc en parallele |
| **Finish-to-Finish** | FF | Fin de A affecte fin de B | B.End >= A.End | Tests finissent avec Dev |
| **Start-to-Finish** | SF | Debut de A affecte fin de B | B.End >= A.Start | Support jusqu'a releve |

**Note**: Le type **FS (Finish-to-Start)** est le plus courant et sera le type par defaut.

### 2.2 Calcul Automatique des Dates

#### Principe de Base

Quand une dependance est creee ou modifiee, SmartTasks recalcule automatiquement les dates du successeur:

```text
EXEMPLE - Chaine Finish-to-Start:

Tache A : 10-14 janvier (5 jours)
    |
    v (FS)
Tache B : 15-17 janvier (3 jours)  <- Date debut CALCULEE automatiquement
    |
    v (FS)
Tache C : 18-20 janvier            <- Propagation en cascade
```

#### Formules de Calcul

```javascript
// Finish-to-Start (FS)
successor.startDate = predecessor.endDate + lag + 1 day

// Start-to-Start (SS)
successor.startDate = predecessor.startDate + lag

// Finish-to-Finish (FF)
successor.endDate = predecessor.endDate + lag
// Et recalcul de startDate si duration fixe

// Start-to-Finish (SF)
successor.endDate = predecessor.startDate + lag
// Et recalcul de startDate si duration fixe
```

#### Preservation de la Duree

Par defaut, SmartTasks preserve la **duree** de la tache lors du recalcul:

```text
Avant:
  Tache B: 15-17 janvier (3 jours)

Apres modification predecesseur:
  Tache B: 18-20 janvier (3 jours preserves)
```

### 2.3 Lag/Lead Time (Delais)

#### Lag (Delai Positif)

Ajoute un temps d'attente entre predecesseur et successeur:

```text
Couler beton (fin: 10 jan) --[+2 jours lag]--> Installer murs (debut: 13 jan)
                                               (attente sechage)
```

#### Lead (Delai Negatif)

Permet un chevauchement - le successeur demarre AVANT la fin du predecesseur:

```text
Developpement (fin: 15 jan) --[-3 jours lead]--> Tests (debut: 13 jan)
                                                  (tests en parallele)
```

| Type | Valeur | Unite | Effet |
|------|--------|-------|-------|
| **Lag** | Positive (+) | Jours | Attente apres predecesseur |
| **Lead** | Negative (-) | Jours | Chevauchement avec predecesseur |

### 2.4 Propagation en Cascade

Quand une tache est modifiee, les changements se propagent a travers toute la chaine de dependances:

```text
Modification Tache A (+2 jours)
    |
    v Recalcul B
    |
    v Recalcul C
    |
    v Recalcul D
    |
    v ... jusqu'aux feuilles
```

**Algorithme de Propagation:**

1. Identifier toutes les taches dependantes (directes et indirectes)
2. Trier par ordre topologique
3. Recalculer chaque tache dans l'ordre
4. Sauvegarder les modifications en batch

### 2.5 Detection des Cycles

SmartTasks detecte et empeche les dependances circulaires:

```text
CYCLE DETECTE - INTERDIT:

A --> B --> C --> A  (cycle!)
```

**Implementation:**

- Algorithme DFS (Depth-First Search) pour detecter les cycles
- Verification AVANT la creation de chaque nouveau lien
- Message d'erreur explicite si cycle detecte

```javascript
function detectCycle(taskId, targetId, links) {
    var visited = new Set();
    var stack = [targetId];

    while (stack.length > 0) {
        var current = stack.pop();
        if (current === taskId) {
            return true; // Cycle detecte!
        }
        if (!visited.has(current)) {
            visited.add(current);
            // Ajouter tous les successeurs
            links.filter(l => l.predecessorId === current)
                 .forEach(l => stack.push(l.successorId));
        }
    }
    return false; // Pas de cycle
}
```

---

## 3. Interface Utilisateur

### 3.1 Points d'Entree

#### Menu SpiraApp (Page Tache)

```text
SmartTasks
├── Ajouter Dependance...
├── Voir Dependances
├── Recalculer Dates
└── Configuration
```

#### Bouton dans Toolbar Tache

Bouton "Dependances" injecte dans la toolbar de la page details tache.

#### Menu Contextuel (Liste Taches)

Clic-droit sur une tache dans la liste:
- "SmartTasks > Ajouter comme predecesseur de..."
- "SmartTasks > Ajouter comme successeur de..."

### 3.2 Dialog Creation de Dependance

```text
┌─────────────────────────────────────────────────────────────┐
│ SmartTasks - Nouvelle Dependance                       [X]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Predecesseur:                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Recherche tache...]                            [v] │   │
│  └─────────────────────────────────────────────────────┘   │
│  TK-123: Developper le module authentification             │
│                                                             │
│  Successeur:                                                │
│  TK-456: Ecrire les tests unitaires (tache courante)       │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Type de Dependance:                                        │
│  ○ Finish-to-Start (FS) - Defaut                           │
│  ○ Start-to-Start (SS)                                      │
│  ○ Finish-to-Finish (FF)                                    │
│  ○ Start-to-Finish (SF)                                     │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Lag/Lead Time:                                             │
│  [____] jours   (negatif = lead, positif = lag)            │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  [ ] Recalculer les dates automatiquement                   │
│                                                             │
│              [Annuler]  [Creer Dependance]                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Dialog Visualisation des Dependances

```text
┌─────────────────────────────────────────────────────────────┐
│ SmartTasks - Dependances de TK-456                     [X]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PREDECESSEURS (cette tache attend):                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ TK-123  Developper module auth    FS  +0j  [Editer] │   │
│  │ TK-124  Configurer environnement  SS  +1j  [Editer] │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  SUCCESSEURS (attendent cette tache):                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ TK-457  Revue de code             FS  +0j  [Editer] │   │
│  │ TK-458  Merge vers develop        FS  +0j  [Editer] │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  CHAINE COMPLETE:                                           │
│                                                             │
│  TK-120 ──> TK-123 ──> [TK-456] ──> TK-457 ──> TK-460      │
│               │                       │                     │
│             TK-124                  TK-458 ──> TK-461      │
│                                                             │
│              [Ajouter]  [Recalculer]  [Fermer]              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.4 Indicateurs Visuels

#### Badge sur Liste de Taches

Dans la liste des taches, afficher un indicateur:

| Indicateur | Signification |
|------------|---------------|
| `<- 2` | 2 predecesseurs |
| `-> 3` | 3 successeurs |
| `<->` | A la fois predecesseurs et successeurs |
| `!` | Conflit de dates detecte |

#### Code Couleur

- **Vert**: Dates coherentes
- **Orange**: Dates a recalculer
- **Rouge**: Conflit ou cycle detecte

---

## 4. Architecture Technique

### 4.1 Structure des Donnees

Les dependances sont stockees dans les **Custom Properties** de la tache, en JSON:

```javascript
// Structure d'une dependance
{
    "id": "dep_uuid_123",
    "predecessorId": 123,        // TaskId du predecesseur
    "successorId": 456,          // TaskId du successeur
    "type": "FS",                // FS, SS, FF, SF
    "lag": 0,                    // Jours (negatif = lead)
    "createdDate": "2026-01-15T10:00:00Z",
    "createdBy": 42              // UserId
}
```

### 4.2 Stockage des Metadonnees

#### Option 1: Custom Property Texte (Recommandee)

Utiliser un champ Custom Property de type "Text" nomme `SmartTasksLinks`:

```javascript
// Stockage dans Custom Property "SmartTasksLinks"
{
    "version": "1.0",
    "links": [
        {
            "id": "dep_001",
            "predecessorId": 123,
            "type": "FS",
            "lag": 0
        },
        {
            "id": "dep_002",
            "predecessorId": 124,
            "type": "SS",
            "lag": 1
        }
    ],
    "lastCalculation": "2026-01-15T10:30:00Z"
}
```

#### Option 2: Associations SpiraPlan + Metadonnees

Combiner les associations natives avec des metadonnees additionnelles:

1. Creer association SpiraPlan native (pour tracabilite)
2. Stocker les metadonnees (type, lag) dans Custom Property

### 4.3 Algorithmes

#### Algorithme de Recalcul (Tri Topologique)

```javascript
function recalculateDates(modifiedTaskId) {
    // 1. Construire le graphe de dependances
    var graph = buildDependencyGraph();

    // 2. Tri topologique pour ordre de traitement
    var sortedTasks = topologicalSort(graph, modifiedTaskId);

    // 3. Recalculer chaque tache dans l'ordre
    var updates = [];
    sortedTasks.forEach(function(taskId) {
        var newDates = calculateDates(taskId, graph);
        if (datesChanged(taskId, newDates)) {
            updates.push({ taskId: taskId, dates: newDates });
        }
    });

    // 4. Appliquer les modifications en batch
    applyUpdates(updates);
}
```

#### Algorithme de Tri Topologique (Kahn)

```javascript
function topologicalSort(graph, startTaskId) {
    var inDegree = new Map();
    var queue = [];
    var result = [];

    // Calculer les degres entrants
    graph.nodes.forEach(node => inDegree.set(node, 0));
    graph.edges.forEach(edge => {
        inDegree.set(edge.to, inDegree.get(edge.to) + 1);
    });

    // Commencer par les noeuds sans predecesseurs (ou le noeud modifie)
    inDegree.forEach((degree, node) => {
        if (degree === 0 || node === startTaskId) {
            queue.push(node);
        }
    });

    // Traitement BFS
    while (queue.length > 0) {
        var current = queue.shift();
        result.push(current);

        graph.getSuccessors(current).forEach(successor => {
            inDegree.set(successor, inDegree.get(successor) - 1);
            if (inDegree.get(successor) === 0) {
                queue.push(successor);
            }
        });
    }

    return result;
}
```

#### Calcul des Dates selon Type

```javascript
function calculateDates(taskId, graph) {
    var task = getTask(taskId);
    var predecessors = graph.getPredecessors(taskId);

    if (predecessors.length === 0) {
        return { startDate: task.startDate, endDate: task.endDate };
    }

    var constraints = [];

    predecessors.forEach(function(link) {
        var pred = getTask(link.predecessorId);
        var lag = link.lag || 0;

        switch (link.type) {
            case 'FS':
                constraints.push({
                    field: 'start',
                    minDate: addDays(pred.endDate, lag + 1)
                });
                break;
            case 'SS':
                constraints.push({
                    field: 'start',
                    minDate: addDays(pred.startDate, lag)
                });
                break;
            case 'FF':
                constraints.push({
                    field: 'end',
                    minDate: addDays(pred.endDate, lag)
                });
                break;
            case 'SF':
                constraints.push({
                    field: 'end',
                    minDate: addDays(pred.startDate, lag)
                });
                break;
        }
    });

    // Appliquer les contraintes (prendre la date max)
    var newStart = task.startDate;
    var newEnd = task.endDate;
    var duration = dateDiff(task.endDate, task.startDate);

    constraints.forEach(function(c) {
        if (c.field === 'start' && c.minDate > newStart) {
            newStart = c.minDate;
            newEnd = addDays(newStart, duration);
        }
        if (c.field === 'end' && c.minDate > newEnd) {
            newEnd = c.minDate;
            newStart = addDays(newEnd, -duration);
        }
    });

    return { startDate: newStart, endDate: newEnd };
}
```

### 4.4 Composants

```text
SmartTasks/
├── manifest.yaml              # Configuration SpiraApp
├── smarttasks.js              # Module principal
├── dependency-graph.js        # Gestion du graphe
├── date-calculator.js         # Algorithmes de calcul
├── ui-dialogs.js              # Dialogs HTML
└── styles.css                 # Styles (inline)
```

---

## 5. Integration SpiraPlan

### 5.1 APIs Utilisees

#### Lecture des Taches

```javascript
// GET: Liste des taches du projet
spiraAppManager.executeApi(
    "RestService.svc",
    "GET",
    "projects/{project_id}/tasks",
    null,
    onSuccess,
    onError
);

// GET: Details d'une tache
spiraAppManager.executeApi(
    "RestService.svc",
    "GET",
    "projects/{project_id}/tasks/{task_id}",
    null,
    onSuccess,
    onError
);
```

#### Modification des Dates

```javascript
// PUT: Mettre a jour une tache
var taskData = {
    TaskId: taskId,
    StartDate: newStartDate,    // Format ISO
    EndDate: newEndDate         // Format ISO
};

spiraAppManager.executeApi(
    "RestService.svc",
    "PUT",
    "projects/{project_id}/tasks/{task_id}",
    JSON.stringify(taskData),
    onSuccess,
    onError
);
```

#### Custom Properties

```javascript
// Lecture Custom Property
var customProps = spiraAppManager.getDataItemField("CustomProperties", "value");

// Ecriture Custom Property
spiraAppManager.updateFormField("CustomProperties", "value", newCustomProps);
```

#### Associations SpiraPlan

```javascript
// GET: Associations d'un artefact
spiraAppManager.executeApi(
    "RestService.svc",
    "GET",
    "projects/{project_id}/tasks/{task_id}/associations",
    null,
    onSuccess,
    onError
);

// POST: Creer une association
var assocData = {
    DestArtifactId: destTaskId,
    DestArtifactTypeId: 6,        // 6 = Task
    Comment: "SmartTasks: FS +0d"
};

spiraAppManager.executeApi(
    "RestService.svc",
    "POST",
    "projects/{project_id}/artifacts/6/{source_task_id}/associations",
    JSON.stringify(assocData),
    onSuccess,
    onError
);
```

### 5.2 Events SpiraApp

#### Events Ecoutes

| Event | Usage |
|-------|-------|
| `loaded` | Initialisation, chargement des dependances |
| `formPopulated` | Affichage des indicateurs |
| `dataSaved` | Recalcul apres sauvegarde |

```javascript
// manifest.yaml
pageContents:
  - pageType: 6           # Task Details
    name: SmartTasks
    code: |
      // Code execute au chargement
      spiraAppManager.registerEvent_loaded(function() {
          SmartTasks.init();
      });

      spiraAppManager.registerEvent_dataSaved(function() {
          SmartTasks.onTaskSaved();
      });
```

### 5.3 Menus et Actions

```yaml
# manifest.yaml
menus:
  - pageType: 6
    caption: "SmartTasks"
    icon: "link"
    entries:
      - caption: "Ajouter Dependance..."
        action: "SmartTasks.showAddDependencyDialog()"
      - caption: "Voir Dependances"
        action: "SmartTasks.showDependenciesDialog()"
      - caption: "-"  # Separateur
      - caption: "Recalculer Dates"
        action: "SmartTasks.recalculateDates()"
      - caption: "Configuration"
        action: "SmartTasks.showSettings()"
```

### 5.4 Limitations et Contraintes

#### Limitations SpiraPlan

| Limitation | Impact | Contournement |
|------------|--------|---------------|
| Pas de webhooks | Pas de notification temps reel | Recalcul a la demande |
| Pas de transactions | Risque d'inconsistance | Validation avant update |
| Custom Props limites | 4000 caracteres max | Compression JSON |
| Rate limiting API | Lenteur si nombreuses taches | Batch updates |

#### Contraintes Techniques

1. **Calcul cote client uniquement**: Pas de backend - tout en JavaScript
2. **Stockage distribue**: Chaque tache stocke ses propres liens
3. **Coherence**: Risque de desynchronisation si modification hors SpiraApp
4. **Performance**: Limiter le recalcul en cascade pour grands projets

---

## 6. Settings Produit

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| auto_recalculate | Boolean | true | Recalcul auto apres modification |
| default_link_type | String | "FS" | Type de lien par defaut |
| preserve_duration | Boolean | true | Preserver la duree lors du recalcul |
| max_cascade_depth | Integer | 50 | Limite de propagation en cascade |
| show_badges | Boolean | true | Afficher badges dans liste |
| custom_property_name | String | "SmartTasksLinks" | Nom du champ Custom Property |
| debug_mode | Boolean | false | Logs console |

---

## 7. Gestion des Erreurs

### 7.1 Erreurs Utilisateur

| Erreur | Message | Action |
|--------|---------|--------|
| Cycle detecte | "Dependance impossible: cree une boucle circulaire" | Refuser creation |
| Tache non trouvee | "La tache TK-XXX n'existe plus" | Supprimer lien orphelin |
| Conflit de dates | "Les dates calculees sont dans le passe" | Avertissement |

### 7.2 Erreurs Techniques

| Erreur | Cause | Recuperation |
|--------|-------|--------------|
| API timeout | Serveur lent | Retry avec backoff |
| JSON invalide | Donnees corrompues | Reset des metadonnees |
| Permission denied | Droits insuffisants | Message utilisateur |

---

## 8. Roadmap

### Phase 1: Core (v1.0)

- [x] Types de dependances (4 types)
- [x] Stockage metadonnees
- [x] Calcul automatique des dates
- [x] Detection des cycles
- [x] Dialog creation dependance
- [x] Dialog visualisation

### Phase 2: UX (v1.1)

- [ ] Lag/Lead time
- [ ] Propagation en cascade
- [ ] Badges dans liste taches
- [ ] Indicateurs de conflits
- [ ] Raccourcis clavier

### Phase 3: Avance (v1.2)

- [ ] Chemin critique
- [ ] Export dependances
- [ ] Mini diagramme de Gantt
- [ ] Historique des modifications

---

## 9. Comparaison Helix Plan vs SmartTasks

| Fonctionnalite | Helix Plan | SmartTasks |
|----------------|------------|------------|
| Types de liens | 4 types (FS, SS, FF, SF) | **4 types (FS, SS, FF, SF)** |
| Calcul auto dates | Oui - Complet | **Oui** |
| Propagation cascade | Oui | **Oui** |
| Lag/Lead time | Oui | **Oui (v1.1)** |
| Detection cycles | Oui | **Oui** |
| Chemin critique | Oui | Non (v1.2) |
| Resource leveling | Oui | Non |
| Temps reel | Oui | Non (limitation SpiraPlan) |
| Drag & Drop Gantt | Oui | Non |
| UI native | Oui | Dialog injecte |

---

## 10. Securite et Permissions

### Permissions Requises

- **Lecture taches**: Pour afficher dependances
- **Modification taches**: Pour creer dependances et recalculer dates
- **Custom Properties**: Pour stocker metadonnees

### Validation

- Toutes les entrees utilisateur sont validees
- Les IDs de taches sont verifies avant creation de lien
- Protection contre XSS dans les dialogs

---

## 11. Compatibilite

### SpiraPlan

- Version minimale: 7.0
- API REST: v6.0+
- Custom Properties: Requis

### Navigateurs

| Navigateur | Support |
|------------|---------|
| Chrome 80+ | Oui |
| Firefox 75+ | Oui |
| Edge 80+ | Oui |
| Safari 13+ | Oui |

---

## 12. References

### Documentation SpiraPlan

- [SpiraApps Developer Guide](https://spiradoc.inflectra.com/Developers/SpiraApps-Overview/)
- [SpiraPlan REST API](https://spiradoc.inflectra.com/Developers/REST-API/)
- [Custom Properties](https://spiradoc.inflectra.com/Spira-Administration-Guide/Template-Custom-Properties/)

### Inspiration

- [Helix Plan User Documentation](https://help.perforce.com/hansoft/current/Content/user/home-user.htm)
- [Helix Plan - Getting started with Gantt scheduling](https://help.perforce.com/hansoft/current/Content/user/getting-started-task-scheduling.htm)

### Algorithmes

- [Topological Sort - Wikipedia](https://en.wikipedia.org/wiki/Topological_sorting)
- [Cycle Detection in Directed Graph](https://en.wikipedia.org/wiki/Cycle_(graph_theory))

---

*Specifications v1.0.0 - 2026-01-15*
*SpiraApp SmartTasks - Gestion des dependances de taches*
*Inspire de Helix Plan (P4 Plan) par Perforce*
