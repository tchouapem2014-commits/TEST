# SmartTasks - Manuel Utilisateur Complet

> Gestion intelligente des dependances de taches avec calcul automatique des dates

---

## Table des Matieres

1. [Introduction](#1-introduction)
2. [Installation et Configuration](#2-installation-et-configuration)
3. [Interface Utilisateur](#3-interface-utilisateur)
4. [Ajouter une Dependance](#4-ajouter-une-dependance)
5. [Types de Dependances](#5-types-de-dependances)
6. [Voir les Dependances](#6-voir-les-dependances)
7. [Recalculer les Dates](#7-recalculer-les-dates)
8. [Analyser la Chaine](#8-analyser-la-chaine)
9. [Configuration Avancee](#9-configuration-avancee)
10. [Cas d'Usage Pratiques](#10-cas-dusage-pratiques)
11. [Depannage](#11-depannage)
12. [Glossaire](#12-glossaire)

---

## 1. Introduction

### Qu'est-ce que SmartTasks?

**SmartTasks** est une SpiraApp qui ajoute des fonctionnalites avancees de gestion des dependances entre taches dans SpiraPlan/SpiraTeam. Inspiree de Helix Plan, elle permet de:

- Creer des liens de dependance entre taches
- Calculer automatiquement les dates de debut/fin
- Propager les modifications en cascade
- Analyser l'impact des changements
- Detecter les dependances circulaires

### Pourquoi utiliser SmartTasks?

| Sans SmartTasks | Avec SmartTasks |
|-----------------|-----------------|
| Mise a jour manuelle des dates | Calcul automatique |
| Risque d'oubli de dependances | Visualisation complete |
| Pas de detection de conflits | Alerte sur cycles |
| Pas d'analyse d'impact | Impact visible avant modification |

---

## 2. Installation et Configuration

### 2.1 Pre-requis

- SpiraPlan/SpiraTeam v7.0 ou superieur
- Droits d'administration systeme (pour l'installation)
- Droits d'administration produit (pour l'activation)

### 2.2 Installation

1. **Telecharger** le fichier `c7e9f3a1-5b28-4d6c-9e1f-8a2b3c4d5e6f.spiraapp`

2. **Uploader dans Spira:**
   - Aller dans `Administration Systeme > SpiraApps`
   - Cliquer sur `Upload`
   - Selectionner le fichier `.spiraapp`
   - Cliquer sur `Importer`

3. **Activer au niveau systeme:**
   - Dans la liste des SpiraApps, cocher `SmartTasks`
   - Cliquer sur `Enregistrer`

### 2.3 Activation par Produit

1. Aller dans `Administration Produit > SpiraApps`
2. Cocher `SmartTasks` pour le produit souhaite
3. Cliquer sur `Enregistrer`

### 2.4 Configuration des Parametres

Acceder aux parametres via `Administration Produit > SpiraApps > SmartTasks > Configurer`:

| Parametre | Description | Valeur par defaut |
|-----------|-------------|-------------------|
| Calcul automatique des dates | Active le recalcul automatique | Active |
| Type de lien par defaut | FS, SS, FF, ou SF | FS |
| Delai par defaut (jours) | Lag entre taches | 0 |
| Propagation en cascade | Propage aux successeurs des successeurs | Active |
| Ignorer les week-ends | Exclut samedi/dimanche du calcul | Desactive |
| Mode debug | Affiche les logs dans la console (F12) | Desactive |

### 2.5 Creation du Custom Property (Optionnel)

Pour stocker les dependances de maniere persistante, creez un Custom Property:

1. Aller dans `Administration Produit > Custom Properties`
2. Selectionner l'artefact `Task`
3. Ajouter une nouvelle propriete:
   - **Nom:** `SmartTasksLinks`
   - **Type:** Text
   - **Position:** Derniere position (pour ne pas encombrer l'interface)

---

## 3. Interface Utilisateur

### 3.1 Acces au Menu SmartTasks

Le menu SmartTasks apparait dans la barre d'outils de la page **Task Details** (detail d'une tache).

```
[Toolbar SpiraPlan]
┌─────────────────────────────────────────────────────────┐
│  [Save] [Refresh] [Delete] ... [SmartTasks ▼]           │
│                                    │                    │
│                                    ├─ Ajouter Dependance│
│                                    ├─ Voir Dependances  │
│                                    ├─ Recalculer Dates  │
│                                    └─ Analyser Chaine   │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Boutons du Menu

| Icone | Nom | Description |
|-------|-----|-------------|
| ➕ | Ajouter Dependance | Cree un lien avec une autre tache |
| 📊 | Voir Dependances | Liste tous les liens de cette tache |
| 🔢 | Recalculer Dates | Recalcule les dates selon les dependances |
| 🌳 | Analyser Chaine | Affiche l'arbre complet des dependances |

---

## 4. Ajouter une Dependance

### 4.1 Procedure

1. Ouvrir la page de detail de la tache **successeur** (celle qui depend d'une autre)
2. Cliquer sur `SmartTasks > Ajouter Dependance`
3. Dans la fenetre qui s'ouvre:
   - **Tache predecesseur:** Selectionner la tache dont celle-ci depend
   - **Type de lien:** Choisir le type de dependance
   - **Delai (lag):** Entrer le nombre de jours de decalage
4. Cliquer sur `Ajouter`

### 4.2 Exemple Concret

**Scenario:** La tache "Tests d'integration" doit commencer 2 jours apres la fin de "Developpement Backend"

1. Ouvrir "Tests d'integration"
2. Cliquer sur `SmartTasks > Ajouter Dependance`
3. Configurer:
   - Predecesseur: "Developpement Backend"
   - Type: FS (Finish-to-Start)
   - Lag: 2 jours
4. Resultat: Si "Developpement Backend" se termine le 15 janvier, "Tests d'integration" commencera le 17 janvier

### 4.3 Validations Automatiques

SmartTasks valide automatiquement:

- ❌ **Auto-reference:** Une tache ne peut pas dependre d'elle-meme
- ❌ **Dependance circulaire:** A → B → C → A est interdit
- ⚠️ **Doublon:** Avertissement si le lien existe deja

---

## 5. Types de Dependances

### 5.1 Finish-to-Start (FS) - Par defaut

```
Predecesseur:  ████████████████░░░░░░░░
                              ↓
Successeur:    ░░░░░░░░░░░░░░░████████████████

"Le successeur commence quand le predecesseur se termine"
```

**Exemple:** Les tests commencent apres la fin du developpement.

### 5.2 Start-to-Start (SS)

```
Predecesseur:  ████████████████░░░░░░░░
               ↓
Successeur:    ████████████████████████

"Les deux taches commencent en meme temps"
```

**Exemple:** La documentation commence en meme temps que le developpement.

### 5.3 Finish-to-Finish (FF)

```
Predecesseur:  ░░░░████████████████
                              ↓
Successeur:    ████████████████████

"Les deux taches se terminent en meme temps"
```

**Exemple:** Les tests et le developpement doivent se terminer ensemble.

### 5.4 Start-to-Finish (SF)

```
Predecesseur:  ░░░░░░░░░░░░░░░████████████████
               ↓
Successeur:    ████████████████

"Le successeur se termine quand le predecesseur commence"
```

**Exemple:** Le support de l'ancien systeme se termine quand le nouveau systeme demarre.

### 5.5 Tableau Recapitulatif

| Type | Signification | Formule |
|------|---------------|---------|
| FS | Finish-to-Start | Debut Successeur = Fin Predecesseur + Lag |
| SS | Start-to-Start | Debut Successeur = Debut Predecesseur + Lag |
| FF | Finish-to-Finish | Fin Successeur = Fin Predecesseur + Lag |
| SF | Start-to-Finish | Fin Successeur = Debut Predecesseur + Lag |

### 5.6 Utilisation du Lag (Delai)

- **Lag positif (+):** Ajoute un delai entre les taches
- **Lag negatif (-):** Permet un chevauchement (la tache successeur peut commencer avant)

**Exemples:**
- Lag = 0: Les taches s'enchainent immediatement
- Lag = 2: 2 jours d'attente entre les taches
- Lag = -3: Le successeur peut commencer 3 jours avant la fin du predecesseur

---

## 6. Voir les Dependances

### 6.1 Procedure

1. Ouvrir la page de detail d'une tache
2. Cliquer sur `SmartTasks > Voir Dependances`

### 6.2 Information Affichee

La fenetre affiche deux sections:

**Predecesseurs (cette tache depend de):**
```
┌────────────────────────────────────────────────────────┐
│ PREDECESSEURS                                          │
├────────────────────────────────────────────────────────┤
│ [TK-42] Developpement Backend                          │
│   Type: FS | Lag: 0 jours | Fin: 15 Jan 2026          │
│   [Supprimer]                                          │
├────────────────────────────────────────────────────────┤
│ [TK-38] Design UI                                      │
│   Type: SS | Lag: 2 jours | Debut: 10 Jan 2026        │
│   [Supprimer]                                          │
└────────────────────────────────────────────────────────┘
```

**Successeurs (dependent de cette tache):**
```
┌────────────────────────────────────────────────────────┐
│ SUCCESSEURS                                            │
├────────────────────────────────────────────────────────┤
│ [TK-55] Deploiement Production                         │
│   Type: FS | Lag: 1 jour                              │
│   [Supprimer]                                          │
└────────────────────────────────────────────────────────┘
```

### 6.3 Supprimer une Dependance

Dans la vue des dependances, cliquer sur `[Supprimer]` a cote du lien a retirer.

---

## 7. Recalculer les Dates

### 7.1 Calcul Automatique vs Manuel

- **Automatique:** Si active dans les parametres, les dates sont recalculees a chaque modification
- **Manuel:** Utiliser le bouton `Recalculer Dates` pour forcer un recalcul

### 7.2 Procedure Manuelle

1. Ouvrir la tache dont vous voulez recalculer les dates
2. Cliquer sur `SmartTasks > Recalculer Dates`
3. Les nouvelles dates sont affichees et appliquees

### 7.3 Regles de Calcul

Le calcul prend en compte:
- Les dates des predecesseurs
- Le type de lien (FS, SS, FF, SF)
- Le delai (lag)
- L'option "Ignorer les week-ends"

### 7.4 Propagation en Cascade

Si l'option est activee, la modification d'une tache propage automatiquement les changements a tous ses successeurs, puis aux successeurs de ses successeurs, etc.

```
Modification de A
       ↓
Recalcul de B (successeur de A)
       ↓
Recalcul de C (successeur de B)
       ↓
Recalcul de D (successeur de C)
       ...
```

---

## 8. Analyser la Chaine

### 8.1 Objectif

L'analyse de chaine permet de visualiser l'ensemble des dependances d'une tache et d'evaluer l'impact d'une modification.

### 8.2 Procedure

1. Ouvrir la tache a analyser
2. Cliquer sur `SmartTasks > Analyser Chaine`

### 8.3 Information Affichee

**Vue Arborescente:**
```
[TK-42] Developpement Backend (Tache courante)
├── PREDECESSEURS
│   ├── [TK-35] Analyse des besoins
│   │   └── [TK-30] Reunion kickoff
│   └── [TK-38] Design UI
│
└── SUCCESSEURS
    ├── [TK-50] Tests d'integration
    │   └── [TK-55] Deploiement Staging
    │       └── [TK-60] Tests UAT
    └── [TK-52] Documentation technique
```

**Statistiques:**
- Nombre total de taches dans la chaine
- Chemin critique (sequence la plus longue)
- Marge totale disponible
- Alertes sur dependances circulaires

### 8.4 Analyse d'Impact

Avant de modifier une date, l'analyse montre:
- Quelles taches seront impactees
- De combien de jours elles seront decalees
- Si des conflits sont crees (ex: date de fin apres deadline du sprint)

---

## 9. Configuration Avancee

### 9.1 Calcul Automatique des Dates

**Active:** Les dates sont recalculees automatiquement quand:
- Une dependance est ajoutee
- Une dependance est supprimee
- Une date de predecesseur change

**Desactive:** Les dates ne sont recalculees que manuellement via le bouton.

### 9.2 Type de Lien par Defaut

Definit le type pre-selectionne lors de l'ajout d'une dependance:
- `FS` - Finish-to-Start (recommande, le plus courant)
- `SS` - Start-to-Start
- `FF` - Finish-to-Finish
- `SF` - Start-to-Finish

### 9.3 Delai par Defaut

Valeur pre-remplie dans le champ "Lag" lors de l'ajout d'une dependance.
- Valeur typique: 0 (enchainage immediat)
- Peut etre negatif pour permettre le chevauchement

### 9.4 Propagation en Cascade

**Active:** Chaque modification se propage a toute la chaine de dependances.
- Avantage: Coherence automatique
- Inconvenient: Peut modifier beaucoup de taches d'un coup

**Desactive:** Seuls les successeurs directs sont recalcules.

### 9.5 Ignorer les Week-ends

**Active:** Les samedis et dimanches sont exclus du calcul.
- Une tache ne commencera jamais un samedi ou dimanche
- Le lag de 2 jours un vendredi = debut le mardi suivant

**Desactive:** Tous les jours calendaires sont comptes.

### 9.6 Mode Debug

**Active:** Affiche des logs detailles dans la console du navigateur (F12).
- Utile pour diagnostiquer des problemes
- Desactiver en production

---

## 10. Cas d'Usage Pratiques

### 10.1 Planification d'un Sprint

**Scenario:** Organiser les taches d'un sprint de 2 semaines.

1. Creer les taches principales
2. Definir les dependances FS entre taches sequentielles
3. Utiliser SS pour les taches parallelisables
4. Activer "Ignorer les week-ends"
5. Analyser la chaine pour identifier le chemin critique

### 10.2 Gestion d'un Retard

**Scenario:** Une tache prend du retard de 3 jours.

1. Modifier la date de fin de la tache en retard
2. SmartTasks recalcule automatiquement tous les successeurs
3. Utiliser "Analyser Chaine" pour voir l'impact global
4. Ajuster les ressources ou le scope si necessaire

### 10.3 Ajout d'une Tache Intermediaire

**Scenario:** Inserer une revue de code entre le developpement et les tests.

1. Creer la tache "Revue de code"
2. Ajouter dependance: "Revue de code" depend de "Developpement" (FS)
3. Modifier la dependance de "Tests": depend maintenant de "Revue de code" (FS)
4. Les dates sont recalculees automatiquement

### 10.4 Taches avec Chevauchement

**Scenario:** Les tests peuvent commencer 2 jours avant la fin du developpement.

1. Creer la dependance "Tests" depend de "Developpement"
2. Type: FS
3. Lag: -2 (negatif = chevauchement)
4. Les tests commenceront 2 jours avant la fin du developpement

---

## 11. Depannage

### 11.1 Le Menu SmartTasks n'Apparait Pas

**Verifications:**
1. La SpiraApp est-elle activee au niveau systeme?
2. La SpiraApp est-elle activee pour ce produit?
3. Etes-vous sur la page de detail d'une tache (Task Details)?
4. Rafraichir la page (F5)

### 11.2 Erreur "Custom Property not found"

**Solution:**
1. Creer le Custom Property `SmartTasksLinks` de type Text sur l'artefact Task
2. Ou contactez votre administrateur pour le creer

### 11.3 Les Dates ne se Recalculent Pas

**Verifications:**
1. L'option "Calcul automatique" est-elle activee?
2. La tache a-t-elle des predecesseurs definis?
3. Essayer "Recalculer Dates" manuellement
4. Verifier les logs en mode debug (F12)

### 11.4 Erreur "Dependance Circulaire"

**Cause:** Vous essayez de creer un cycle A → B → C → A

**Solution:**
1. Identifier le cycle dans l'arbre de dependances
2. Supprimer une des dependances pour casser le cycle
3. Repenser la structure des dependances

### 11.5 Performance Lente

**Causes possibles:**
- Trop de taches dans le projet
- Chaine de dependances tres longue

**Solutions:**
1. Desactiver la propagation en cascade
2. Utiliser le recalcul manuel plutot qu'automatique
3. Limiter la profondeur des chaines de dependances

---

## 12. Glossaire

| Terme | Definition |
|-------|------------|
| **Predecesseur** | Tache qui doit etre completee (ou commencee) avant une autre |
| **Successeur** | Tache qui depend d'une autre tache |
| **Dependance** | Lien logique entre deux taches |
| **Lag** | Delai (positif ou negatif) entre deux taches liees |
| **FS (Finish-to-Start)** | Le successeur commence quand le predecesseur se termine |
| **SS (Start-to-Start)** | Les deux taches commencent en meme temps |
| **FF (Finish-to-Finish)** | Les deux taches se terminent en meme temps |
| **SF (Start-to-Finish)** | Le successeur se termine quand le predecesseur commence |
| **Chemin Critique** | Sequence de taches determinant la duree minimale du projet |
| **Marge (Float)** | Temps dont une tache peut etre retardee sans impacter le projet |
| **Dependance Circulaire** | Cycle de dependances impossible (A depend de B qui depend de A) |
| **Propagation en Cascade** | Recalcul automatique de toute la chaine de successeurs |

---

## Support

Pour toute question ou probleme:
- Consulter ce manuel
- Activer le mode debug pour plus d'informations
- Contacter votre administrateur SpiraPlan

---

*Manuel Utilisateur SmartTasks v1.0.0*
*Derniere mise a jour: Janvier 2026*
