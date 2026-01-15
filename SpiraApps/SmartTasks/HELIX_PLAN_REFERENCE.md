# Helix Plan (P4 Plan) - Reference Complete des Fonctionnalites

> Documentation complete des fonctionnalites de gestion des taches dans Helix Plan
> Recherche effectuee avec la methode Ralph Wiggum

---

## Vue d'Ensemble

**Helix Plan** (anciennement **Hansoft**, maintenant **P4 Plan**) est un outil de planification en temps reel de classe entreprise developpe par Perforce. Il permet aux equipes de developper des produits plus rapidement grace a:

- Planification en temps reel (modifications synchronisees instantanement)
- Interface multiplayer (collaboration similaire a un jeu multi-joueurs)
- Support multi-methodologies (SAFe, Scrum, Kanban, Lean, Gantt, hybride)
- Scalabilite (milliers de contributeurs)

**Tarification:** Gratuit jusqu'a 5 utilisateurs, abonnement mensuel pour cloud, licences annuelles pour on-premise.

---

## FOCUS: Dependances et Calcul Automatique des Dates

> Section detaillee sur les fonctionnalites de dependances entre taches

### Types de Liens (Connection Types)

Helix Plan supporte les **4 types de dependances standard**:

| Type Helix Plan | Standard | Description | Exemple |
|-----------------|----------|-------------|---------|
| **End to Start** | Finish-to-Start (FS) | Fin de A declenche debut de B | **Defaut** - Tester apres Developper |
| **Start to Start** | Start-to-Start (SS) | Debut de A declenche debut de B | Design et Doc en parallele |
| **End to End** | Finish-to-Finish (FF) | Fin de A affecte fin de B | Tests finissent avec Dev |
| **Start to End** | Start-to-Finish (SF) | Debut de A affecte fin de B | Rare - Support jusqu'a releve |

### Creation des Dependances

**Methode Drag & Drop:**
1. Clic gauche maintenu sur une tache dans la vue Timeline
2. Glisser vers une autre tache
3. Relacher - fleche orange indique la connexion
4. Les taches connectees apparaissent en orange

**Changer le type de connexion:**
- Clic droit sur la fleche de connexion
- Selectionner "Change connection type"
- Choisir parmi les 4 types

**Validation:**
- Fleche rouge clignotante = connexion impossible/illegale
- Le systeme empeche les dependances circulaires

### Calcul Automatique des Dates

```
EXEMPLE - Chaine de dependances End-to-Start:

Tache A : 10-14 janvier (5 jours)
    |
    v (End-to-Start)
Tache B : 15-17 janvier (3 jours)  <- Date debut CALCULEE automatiquement
    |
    v (End-to-Start)
Tache C : 18-20 janvier            <- Ajustee automatiquement
```

**Comportement automatique:**
- La date de debut du successeur est ajustee pour etre APRES la date de fin du predecesseur
- Modifications en TEMPS REEL, propagees instantanement
- Recalcul en CASCADE dans toute la chaine de dependances

**Colonnes disponibles:**
- **Predecessor activity** : Affiche les taches precedentes
- **Successor activity** : Affiche les taches suivantes

### Lag/Lead Time (Delais)

Configuration via clic droit sur la connexion > "Set lead/lag time":

| Type | Valeur | Effet |
|------|--------|-------|
| **Lag** | Positive (+2 jours) | Attente entre fin predecesseur et debut successeur |
| **Lead** | Negative (-3 jours) | Chevauchement - successeur demarre AVANT fin predecesseur |

**Exemple Lag:**
```
Couler beton (fin: 10 jan) --[+2 jours lag]--> Installer murs (debut: 12 jan)
```

**Exemple Lead:**
```
Developpement (fin: 15 jan) --[-3 jours lead]--> Tests (debut: 12 jan)
```

### Propagation des Changements

Quand une tache est modifiee:
1. Taches dependantes sont **recalculees automatiquement**
2. Dates debut/fin des successeurs sont ajustees
3. Modifications se propagent en **cascade**

**Fonction Compress:**
- Rapproche une tache de sa tache connectee
- Supprime les ecarts/gaps temporels
- Acces: Clic droit > Compress

### Chemin Critique (Critical Path)

- Option: "Highlight tasks on Critical path"
- Taches critiques mises en evidence visuellement
- Identifie les taches qui, si retardees, affectent la date de fin du projet
- Colonne: "Scheduled - Critical path"

### Comparaison SpiraPlan vs Helix Plan

| Fonctionnalite | Helix Plan | SpiraPlan |
|----------------|------------|-----------|
| Types de liens | 4 types (FS, SS, FF, SF) | 2 types (Related-to, Depends-on) |
| Calcul auto des dates | Oui - Complet | Non - Limité |
| Propagation en cascade | Oui | Non |
| Lag/Lead time | Oui | Non |
| Critical Path | Oui | Non |
| API Associations | GraphQL/REST | REST/SOAP |

**SpiraPlan limitations:**
- Pas de calcul automatique type "chemin critique"
- Pas de propagation des dates basee sur predecesseurs/successeurs
- Associations = liens informatifs, pas de scheduling automatique

---

## 1. Types de Taches Supportes

| Type | Description |
|------|-------------|
| **Backlog Items** | Elements du product backlog, decomposables hierarchiquement |
| **Tasks** | Taches de travail, creees par decomposition des backlog items dans les sprints |
| **Bugs** | Defauts suivis dans la vue Quality Assurance (QA) |
| **Scheduled Tasks** | Taches planifiees dans le mode Gantt avec dates de debut/fin |
| **Sprint Items** | Elements assignes a un sprint specifique |
| **Sub-Projects** | Sous-projets pour organiser le travail |
| **Pipeline Tasks** | Taches associees a des workflows/pipelines |
| **User Stories** | Descriptions de fonctionnalites de haut niveau en langage utilisateur |

---

## 2. Vues Disponibles

| Vue | Utilisation |
|-----|-------------|
| **Product Backlog** | Gestion des exigences et prioritisation (vue hierarchique et vue priorite) |
| **Planning View** | Vue de planification avec timeline/Gantt |
| **Sprint Board** | Tableau Kanban avec colonnes de workflow |
| **To-Do List** | Liste personnelle des taches assignees |
| **Quality Assurance (QA)** | Suivi des bugs et defauts |
| **Timesheet View** | Vue de saisie et suivi du temps |
| **Dashboards** | Tableaux de bord personnalisables avec visualisations |
| **Portfolio Allocations** | Coordination multi-projets |
| **Calendar View** | Vue calendrier |
| **Wall View** | Tableau virtuel simulant un board physique Agile |

### Modes de Planification

- **Mode Agile/Sprint**: Planification par sprints avec boards Kanban/Scrum
- **Mode Gantt/Schedule**: Planification avec diagramme de Gantt, dependencies, critical path

---

## 3. Champs et Proprietes des Taches

### Champs Standard

| Categorie | Champs |
|-----------|--------|
| **Priorite** | Sprint Backlog Priority, Backlog Priority |
| **Estimation** | Work Remaining, Duration, Estimated Days, Points, Original Estimate |
| **Assignation** | Assigned To (plusieurs utilisateurs, pourcentages d'allocation) |
| **Temps** | Time Spent (integration Timesheet) |
| **Dates** | Start Date, Finish Date |
| **Statut** | Workflow Status (icones personnalisables) |
| **Relations** | Linked to Item (Related To, Duplicates, Blocks) |

### Champs Personnalises

| Type | Description |
|------|-------------|
| **Texte** | Champ texte libre |
| **Nombre** | Valeur numerique |
| **Droplist** | Liste deroulante |
| **People** | Selection d'utilisateur |
| **Date** | Date simple |
| **Datetime** | Date et heure |
| **Hyperlink** | Lien URL |

### Permissions par Champ

- **Edit**: Modification autorisee
- **Normal**: Acces standard
- **Read-only**: Lecture seule
- **Hidden**: Masque

---

## 4. Workflows et Pipelines

### Workflows de Statut

- Statuts personnalisables avec icones
- Colonnes de workflow mappees sur les tableaux Kanban
- Transitions entre statuts configurables
- Acces: **Menu More > Pipelines and workflows**

### Pipelines

- **Definition of Done**: Processus repetitifs standardises
- **Pipeline Editor integre**: Editeur pour creer et gerer les pipelines
- **Valeurs par defaut**: User story flag, estimated days, points, champs personnalises

---

## 5. Fonctionnalites Agile

### Gestion des Sprints

- **Planification de sprint**: Glisser-deposer depuis le Product Backlog
- **Configuration des sprints par defaut**: Parametres configurables par projet
- **Vue Planning**: Timeline complete avec tous les sprints et releases
- **Decomposition en taches**: User stories decomposees en taches avec estimation

### Backlogs

#### Product Backlog

- Liste d'elements en attente ou en cours
- **Trois vues**: Hierarchie, Priorite, Wall (tableau virtuel)
- Raffinement, prioritisation et estimation
- Colonnes personnalisables
- Gestion hierarchique des elements

#### Sprint Backlog

- Engagement des elements via colonne "Committed to"
- Delegation aux utilisateurs et groupes
- Backlog Grooming selon methode **DEEP** (Detailed, Estimated, Emergent, Prioritized)

### User Stories et Estimation

**Methodes d'estimation supportees:**

| Methode | Description |
|---------|-------------|
| **Points** | Story Points |
| **Jours ideaux** | Ideal Days / Estimated Days |
| **Heures** | Estimation en heures |
| **Personnalise** | Methode custom |

Les colonnes "Estimated Days" et "Points" s'agregent automatiquement depuis les sous-taches.

### Burndown Charts

| Type | Description |
|------|-------------|
| **Sprint Burndown** | Heures de travail restant et progression realisee |
| **Release Burndown** | Graphique pour releases/milestones |
| **Prediction de Burndown** | Calcul base sur moyenne ponderee |

### Velocity Tracking

- **Graphique de velocite**: Velocite passee des sprints precedents
- **Prediction de velocite**: Calcul automatique
- **Parametres configurables**: Nombre de jours dans la moyenne ponderee
- **Exclusion automatique**: Jours feries et week-ends ignores

### Boards Kanban/Scrum

#### Wall View

- Simule un tableau physique Agile
- Personnalisable (colonnes, lignes/lanes)
- Menus deroulants pour tri et affichage

#### Sprint Boards

- Trois colonnes par defaut (deplacables, renommables, supprimables)
- Ajout de nouvelles colonnes et lanes
- Glisser-deposer pour reorganisation

### Methodologies Supportees

| Methodologie | Support |
|--------------|---------|
| **SAFe** | Oui - Scaled Agile Framework |
| **Scrum** | Oui |
| **Kanban** | Oui |
| **Lean** | Oui |
| **Gantt** | Oui |
| **Scrumban** | Oui (Kanban + Scrum) |
| **Kanplan** | Oui (Kanban + Gantt) |
| **Hybride** | Oui - Mix de plusieurs methodes |

---

## 6. Planification Gantt (Scheduling)

### Fonctionnalites

| Fonctionnalite | Description |
|----------------|-------------|
| **Taches planifiees** | Dates de debut et fin |
| **Dependencies** | Liaison chronologique entre elements |
| **Types de liens** | Related To, Duplicates, Blocks |
| **Critical Path** | Identification du chemin critique |
| **Baselines** | Points de reference pour comparaison |
| **Resource Leveling** | Nivellement des ressources |
| **Split Tasks** | Division des taches |
| **% Completion** | Suivi de l'avancement |

### Conversion Agile ↔ Gantt

- Glisser-deposer bidirectionnel entre sprint items et scheduled tasks
- Mix de methodologies dans le meme projet

---

## 7. Gestion des Ressources

### Allocation des Ressources

- **Allocation par pourcentage**: 0-100% par utilisateur
- **Multi-sprint**: Travail sur plusieurs sprints en parallele
- **Ghost Users**: Utilisateurs fictifs pour scenarios de planification
- **Indicateur de surallocation**: Work remaining affiche en rouge

### Capacity Planning

- **Vue Portfolio Allocations**: Barre horizontale avec zones colorees
- **Visualisation journaliere**: Heures allouees jour par jour (zoom maximal)
- **Objectif**: Allocation lisse a 100%
- **Sprint Capacity**: Total d'heures disponibles par sprint
- **Detection de conflits**: Identification visuelle des conflits multi-projets

### Time Tracking

| Colonne | Description |
|---------|-------------|
| **Estimated Days/Points** | Temps "budgete" (defini dans le backlog) |
| **Work Remaining** | Temps restant jusqu'a la fin (defini dans le sprint) |
| **Time Spent** | Temps reellement passe ("actual") |

- Flexibilite d'affichage (jours ou heures)
- Comparaison Estimated vs Actual

### Gestion des Equipes

- **Project User Groups**: Vues specifiques par collaborateur
- **Main Managers**: Acces complet, delegation, gestion des allocations
- **Permissions granulaires**: Par colonne et par utilisateur/groupe
- **Support equipes distribuees**: Collaboration securisee cross-fonctionnelle

---

## 8. Assignation et Collaboration

### Assignation

- **Assignation multiple**: Plusieurs utilisateurs par tache
- **Pourcentage d'allocation**: Repartition du travail entre assignes
- **Alerte de surallocation**: Affichage en rouge
- **Delegation**: Delegation de taches a d'autres utilisateurs

### Collaboration Temps Reel

- **Mise a jour instantanee**: Modifications visibles immediatement par tous
- **Commentaires et discussions**: Communication sur les taches
- **Partage de dashboards**: URL partageables

### Controle d'Acces

- **Project User Groups**: Limitent la visibilite aux vues necessaires
- **Permissions entreprise**: Controle granulaire au niveau des champs
- **Roles**: Manager, Main Manager, membres d'equipe
- **Document Permissions**: Controle d'acces aux documents

---

## 9. Reporting et Tableaux de Bord

### Dashboards

- **Personnalisables**: Creation par clic-droit sur sous-projets
- **Visualisations de donnees**: Graphiques et metriques multiples
- **Widgets pre-fabriques**: Pour methodes flux et iteration
- **Rapports personnalisables**: Controle complet sur l'affichage

### Exports

| Format | Support |
|--------|---------|
| **PowerPoint** | Generation de presentations |
| **Rapports Timesheet** | Export individuel |
| **XML** | Import/Export |
| **CSV/Text** | Import/Export |
| **Microsoft Word** | Export |
| **Microsoft Excel** | Export |
| **ReqIF** | Import |

### Historique et Tracabilite

- **Project History**: Historique complet des modifications
- **Tracabilite des changements**: Identification des modifications dans le temps

---

## 10. Integrations

### Integrations Natives Perforce

| Integration | Fonctionnalite |
|-------------|----------------|
| **Helix Core (P4)** | Lien taches ↔ changelists, tracabilite complete |
| **Helix ALM** | Synchronisation exigences, gestion defauts, tracabilite reglementaire |
| **P4 Authentication Service** | SSO (Single Sign-On) |

### Integrations Tierces

| Integration | Fonctionnalite |
|-------------|----------------|
| **Jira Cloud/Data Center** | Synchronisation bidirectionnelle, mapping workflows, gestion Epics |
| **Jenkins** | Pipelines CI/CD, declenchement de builds (via OpsHub) |
| **GitHub** | Integration workflows developpement |
| **MS Project** | Import/Export plans de projet |
| **Excel** | Import/Export donnees |
| **LDAP** | Authentification centralisee |
| **Slack** | Expansion automatique des liens |

### SSO / Identity Provider

- Integration via Helix Authentication Service
- Support SAML 2.0 et OpenID Connect
- Option forcer SSO ou permettre login par mot de passe

---

## 11. APIs et SDK

### GraphQL API

L'API principale de Helix Plan est basee sur **GraphQL**.

#### Queries (Lecture)

- Informations projets, calendriers, structures arborescentes
- Donnees de sprint (items, travail restant, estimations)
- Taches backlog, bugs, taches planifiees avec champs personnalises
- Colonnes, couloirs, graphiques, tableaux de bord
- Commentaires et attributions d'utilisateurs
- Rapports et suivi du temps

#### Mutations (Ecriture)

- Creation et modification de taches
- Gestion des sprints, releases, colonnes personnalisees
- Liens entre items et pieces jointes
- Comptes utilisateurs et appartenances aux projets
- Mises a jour de statut de workflow

#### Subscriptions (Temps Reel)

- Notifications de mises a jour de workflow et de champs
- Suppressions d'items et changements d'arborescence
- Modifications d'appartenance aux projets
- Changements de donnees de tableaux de bord
- Engagements de sprint

### Helix Plan SDK

- **Plateformes**: Linux 64-bit, macOS (x64/arm64), Windows 64-bit
- **Port HTTP**: Configurable (defaut: 4000)
- **GraphQL Playground**: Disponible pour developpement
- **Documentation**: [Helix Plan REST API](https://help.perforce.com/hansoft/current/Content/hansoftapi/helixplan-api-rest-docs.html)

### Automatisation

- Creation d'automatisations via API GraphQL
- Triggers pour integration Helix Core (Perl, Python, Ruby, C/C++)
- Gestion automatisee des workflows
- Synchronisation bidirectionnelle avec Jira

---

## 12. Resume des Capacites

| Fonctionnalite | Disponibilite |
|----------------|---------------|
| Gestion des Sprints | Oui - Complete |
| Product Backlog | Oui - Vues multiples |
| Sprint Backlog | Oui - Engagement et delegation |
| User Stories | Oui - Creation et decomposition |
| Estimation (Points/Jours) | Oui - Multiple methodes |
| Burndown Charts | Oui - Sprint et Release |
| Velocity Tracking | Oui - Avec prediction |
| Planning Poker | Non integre nativement |
| Kanban Board | Oui - Personnalisable |
| Scrum Board | Oui - Sprint Boards |
| Gantt Chart | Oui - Complet |
| Dependencies | Oui - Multiple types |
| Critical Path | Oui |
| Resource Management | Oui - Allocation, capacity |
| Time Tracking | Oui - Estimated vs Actual |
| Dashboards | Oui - BI flexible |
| Multi-methodologies | Oui - SAFe, Scrum, Kanban, Lean, Gantt |
| API REST/GraphQL | Oui - Complete |
| SDK | Oui - Multi-plateforme |
| Integration Jira | Oui - Bidirectionnelle |
| Integration Jenkins | Oui - Via OpsHub |
| SSO/LDAP | Oui |
| Import/Export | Oui - XML, CSV, Excel, Word |

---

## Sources

### Documentation Officielle

- [Perforce P4 Plan (Hansoft) - Page produit](https://www.perforce.com/products/hansoft)
- [P4 Plan Documentation](https://help.perforce.com/hansoft/)
- [P4 Plan User Documentation](https://help.perforce.com/hansoft/current/Content/user/home-user.htm)
- [Helix Plan REST API](https://help.perforce.com/hansoft/current/Content/hansoftapi/helixplan-api-rest-docs.html)

### Guides et Tutoriels

- [Getting Started with Helix Plan Client](https://www.perforce.com/products/hansoft/setting-up-hansoft)
- [Getting started with Gantt scheduling](https://help.perforce.com/hansoft/current/Content/user/getting-started-task-scheduling.htm)
- [How To: Sprint Planning](https://help.perforce.com/hansoft/current/Content/how-to/how-to-sprint-planning.htm)
- [Product Backlog](https://help.perforce.com/hansoft/current/Content/user/backlog.htm)

### Integrations

- [Helix Plan Jira Cloud Integration](https://www.perforce.com/downloads/helix-plan-jira-cloud-integration)
- [Helix Plan SDK Download](https://www.perforce.com/downloads/helix-plan-sdk)
- [Helix Plan API Download](https://www.perforce.com/downloads/helix-plan-api)

### Release Notes

- [P4 Plan Client & Server Release Notes](https://cache.hansoft.com/releasenotes/helix-plan-client-server.html)
- [What's New in Perforce P4 Plan](https://www.perforce.com/products/hansoft/whats-new-hansoft)

---

*Document cree le 2026-01-15*
*Methode: Recherche Ralph Wiggum (4 agents paralleles)*
*Agents utilises: Task Management, Agile Features, Resource Management, API & Integrations*
