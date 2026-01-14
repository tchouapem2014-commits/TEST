# Requirement Template Injector - Analyse Fonctionnelle Complete

> Version 1.0 | Date: 2025-01-08

---

## Informations Environnement Cible

| Parametre | Valeur |
|-----------|--------|
| **URL Spira** | https://demo-in.spiraservice.net/mtx |
| **API Version** | v7.0 |
| **Projet Principal** | Library Information System (Sample) - ID: 1 |
| **Template ID** | 1 |

---

## Table des Matieres

1. [Contexte et Objectifs](#1-contexte-et-objectifs)
2. [Exigences Fonctionnelles](#2-exigences-fonctionnelles)
3. [Exigences Non-Fonctionnelles](#3-exigences-non-fonctionnelles)
4. [Cas de Test](#4-cas-de-test)
5. [Maquettes](#5-maquettes)
6. [Outils de Debug Production](#6-outils-de-debug-production)
7. [Donnees de Reference Environnement](#7-donnees-de-reference-environnement)
8. [Matrice de Tracabilite](#8-matrice-de-tracabilite)

---

## 1. Contexte et Objectifs

### 1.1 Contexte
Les equipes de redaction d'exigences ont besoin d'un guide structure pour rediger leurs analyses de maniere homogene. Actuellement, chaque redacteur utilise son propre format, ce qui genere des incoherences.

### 1.2 Objectif Principal
Developper une SpiraApp qui injecte automatiquement un template de texte formate (HTML) dans les champs RichText lors de la creation d'une nouvelle exigence.

### 1.3 Benefices Attendus
- Uniformisation de la redaction des exigences
- Gain de temps pour les redacteurs
- Meilleure qualite des specifications
- Adaptabilite selon le type d'exigence

---

## 2. Exigences Fonctionnelles

### EF-001 : Injection de Template a la Creation
| Attribut | Valeur |
|----------|--------|
| **ID** | EF-001 |
| **Titre** | Injection automatique du template a la creation |
| **Description** | Lorsqu'un utilisateur cree une nouvelle exigence, le systeme doit automatiquement injecter le template correspondant dans le champ RichText cible |
| **Priorite** | Haute |
| **Criteres d'acceptation** | - Le template est injecte des l'ouverture du formulaire de creation<br>- Le champ cible contient le HTML du template<br>- L'utilisateur peut modifier le contenu injecte |

---

### EF-002 : Templates Differencies par Type d'Exigence
| Attribut | Valeur |
|----------|--------|
| **ID** | EF-002 |
| **Titre** | Templates differents selon le type d'exigence |
| **Description** | Le systeme doit permettre de definir un template different pour chaque type d'exigence (Business, Functional, User Story, etc.) |
| **Priorite** | Haute |
| **Criteres d'acceptation** | - Chaque RequirementTypeId peut avoir son propre template<br>- Si aucun template n'est defini pour un type, le champ reste vide<br>- Le template se met a jour si l'utilisateur change le type |

---

### EF-003 : Support du Champ Description Standard
| Attribut | Valeur |
|----------|--------|
| **ID** | EF-003 |
| **Titre** | Injection dans le champ Description standard |
| **Description** | Le systeme doit pouvoir injecter le template dans le champ "Description" natif des exigences |
| **Priorite** | Haute |
| **Criteres d'acceptation** | - Le champ "Description" peut etre selectionne comme cible<br>- Le template HTML s'affiche correctement dans l'editeur RichText |

---

### EF-004 : Support des Champs Custom RichText
| Attribut | Valeur |
|----------|--------|
| **ID** | EF-004 |
| **Titre** | Injection dans les champs personnalises RichText |
| **Description** | Le systeme doit pouvoir injecter le template dans n'importe quel champ personnalise de type RichText (Custom_01, Custom_02, etc.) |
| **Priorite** | Moyenne |
| **Criteres d'acceptation** | - Les champs Custom_XX de type RichText sont supportes<br>- L'administrateur peut specifier le nom du champ cible |

---

### EF-005 : Configuration des Templates via Admin
| Attribut | Valeur |
|----------|--------|
| **ID** | EF-005 |
| **Titre** | Configuration des templates dans l'administration SpiraApp |
| **Description** | L'administrateur doit pouvoir configurer les templates HTML pour chaque type d'exigence via l'interface d'administration de la SpiraApp |
| **Priorite** | Haute |
| **Criteres d'acceptation** | - Interface de configuration accessible dans Product Admin > SpiraApps<br>- Format de configuration clair (JSON ou champs separes)<br>- Validation des templates avant sauvegarde |

---

### EF-006 : Mise a Jour du Template au Changement de Type
| Attribut | Valeur |
|----------|--------|
| **ID** | EF-006 |
| **Titre** | Actualisation du template lors du changement de type |
| **Description** | Si l'utilisateur change le type d'exigence apres la creation, le systeme doit proposer de mettre a jour le template |
| **Priorite** | Moyenne |
| **Criteres d'acceptation** | - Detection du changement de type via evenement dropdown<br>- Confirmation demandee a l'utilisateur avant remplacement<br>- Option de conserver le contenu actuel |

---

### EF-007 : Non-Ecrasement du Contenu Existant
| Attribut | Valeur |
|----------|--------|
| **ID** | EF-007 |
| **Titre** | Protection du contenu existant |
| **Description** | Le systeme ne doit pas ecraser le contenu si le champ cible contient deja du texte (mode edition) |
| **Priorite** | Haute |
| **Criteres d'acceptation** | - En mode edition, aucune injection automatique<br>- Detection du mode (creation vs edition)<br>- Le contenu existant est preserve |

---

### EF-008 : Activation/Desactivation par Type
| Attribut | Valeur |
|----------|--------|
| **ID** | EF-008 |
| **Titre** | Activation selective par type d'exigence |
| **Description** | L'administrateur doit pouvoir activer ou desactiver l'injection pour certains types d'exigence |
| **Priorite** | Basse |
| **Criteres d'acceptation** | - Case a cocher ou liste pour activer/desactiver par type<br>- Types desactives = pas d'injection |

---

## 3. Exigences Non-Fonctionnelles

### ENF-001 : Performance
| Attribut | Valeur |
|----------|--------|
| **ID** | ENF-001 |
| **Titre** | Temps de chargement |
| **Description** | L'injection du template ne doit pas ralentir l'ouverture du formulaire |
| **Critere** | Injection en moins de 500ms apres chargement de la page |

---

### ENF-002 : Compatibilite
| Attribut | Valeur |
|----------|--------|
| **ID** | ENF-002 |
| **Titre** | Compatibilite navigateurs |
| **Description** | La SpiraApp doit fonctionner sur les navigateurs supportes par Spira |
| **Critere** | Chrome, Firefox, Edge (versions recentes) |

---

### ENF-003 : Maintenabilite - Logs de Debug
| Attribut | Valeur |
|----------|--------|
| **ID** | ENF-003 |
| **Titre** | Logs de debug en production |
| **Description** | Le code doit inclure des logs configurables pour faciliter le debug en production |
| **Critere** | Console.log avec prefixe identifiable, niveaux de log configurables |

---

### ENF-004 : Securite
| Attribut | Valeur |
|----------|--------|
| **ID** | ENF-004 |
| **Titre** | Securite des templates HTML |
| **Description** | Les templates HTML doivent etre sanitizes pour eviter les injections XSS |
| **Critere** | Utilisation de spiraAppManager.sanitizeHtml() si disponible |

---

### ENF-005 : Gestion des Erreurs et Feedback Utilisateur
| Attribut | Valeur |
|----------|--------|
| **ID** | ENF-005 |
| **Titre** | Messages d'erreur clairs et actionnables |
| **Description** | En cas d'echec, la SpiraApp doit afficher un message clair indiquant la cause du probleme et les actions correctives possibles |
| **Critere** | Chaque type d'erreur a un message specifique, visible dans l'interface ET dans la console |

---

## 3.1 Catalogue des Messages d'Erreur

### ERR-001 : Configuration Manquante
| Code | ERR-001 |
|------|---------|
| **Condition** | Aucun template configure dans les Product Settings |
| **Message UI** | "RTI: Aucun template configure. Veuillez configurer les templates dans Administration > SpiraApps > Requirement Template Injector." |
| **Niveau** | Warning |
| **Action utilisateur** | Contacter l'administrateur pour configurer les templates |

---

### ERR-002 : Configuration JSON Invalide
| Code | ERR-002 |
|------|---------|
| **Condition** | Le JSON des templates est mal forme |
| **Message UI** | "RTI: Erreur de configuration - le format JSON des templates est invalide. Verifiez la syntaxe dans les parametres." |
| **Niveau** | Error |
| **Log Console** | `[RTI] [ERROR] JSON parse error: {details}` avec le JSON brut |
| **Action utilisateur** | Corriger le JSON dans Product Settings |

---

### ERR-003 : Champ Cible Introuvable
| Code | ERR-003 |
|------|---------|
| **Condition** | Le champ cible (ex: Custom_05) n'existe pas sur la page |
| **Message UI** | "RTI: Le champ cible '{fieldName}' n'est pas disponible sur cette page. Verifiez la configuration." |
| **Niveau** | Error |
| **Log Console** | `[RTI] [ERROR] Target field not found: {fieldName}` |
| **Action utilisateur** | Verifier que le champ existe et est affiche sur le layout |

---

### ERR-004 : Type d'Exigence Non Reconnu
| Code | ERR-004 |
|------|---------|
| **Condition** | Le RequirementTypeId n'a pas de template configure |
| **Message UI** | Aucun (comportement silencieux - pas d'injection) |
| **Niveau** | Info |
| **Log Console** | `[RTI] [INFO] No template configured for type ID: {typeId}` |
| **Action utilisateur** | Aucune - comportement normal |

---

### ERR-005 : Echec d'Injection
| Code | ERR-005 |
|------|---------|
| **Condition** | L'appel a updateFormField() echoue |
| **Message UI** | "RTI: Impossible d'injecter le template dans le champ. Essayez de rafraichir la page." |
| **Niveau** | Error |
| **Log Console** | `[RTI] [ERROR] Injection failed: {error.message}` |
| **Action utilisateur** | Rafraichir la page, si persiste contacter support |

---

### ERR-006 : Mode Edition Detecte
| Code | ERR-006 |
|------|---------|
| **Condition** | L'utilisateur ouvre une exigence existante (pas une creation) |
| **Message UI** | Aucun (comportement silencieux) |
| **Niveau** | Debug |
| **Log Console** | `[RTI] [DEBUG] Edit mode detected - skipping injection` |
| **Action utilisateur** | Aucune - comportement normal |

---

### ERR-007 : SpiraApp Non Initialisee
| Code | ERR-007 |
|------|---------|
| **Condition** | APP_GUID ou spiraAppManager non disponible |
| **Message UI** | "RTI: Erreur d'initialisation. La SpiraApp n'a pas pu demarrer correctement." |
| **Niveau** | Error |
| **Log Console** | `[RTI] [ERROR] Initialization failed: APP_GUID or spiraAppManager undefined` |
| **Action utilisateur** | Verifier que la SpiraApp est activee, rafraichir la page |

---

### ERR-008 : Permission Insuffisante
| Code | ERR-008 |
|------|---------|
| **Condition** | L'utilisateur n'a pas les droits de modification |
| **Message UI** | Aucun (l'injection peut etre tentee mais Save echouera) |
| **Niveau** | Warning |
| **Log Console** | `[RTI] [WARN] User may not have modify permission` |
| **Action utilisateur** | Aucune - Spira gerera l'erreur au Save |

---

## 3.2 Affichage des Messages

### Types de Messages Disponibles

```javascript
// SUCCESS - Bandeau vert
spiraAppManager.displaySuccessMessage("RTI: Template injecte avec succes!");

// WARNING - Bandeau jaune
spiraAppManager.displayWarningMessage("RTI: Aucun template pour ce type d'exigence.");

// ERROR - Bandeau rouge
spiraAppManager.displayErrorMessage("RTI: Erreur de configuration - JSON invalide.");
```

### Format Standard des Messages

```
[RTI] {Type}: {Message court}
      Details: {Information supplementaire si necessaire}
      Action: {Ce que l'utilisateur peut faire}
```

### Exemple Complet d'Affichage Erreur

```javascript
// Erreur avec details complets
function showError(code, message, details, action) {
    const fullMessage = `RTI [${code}]: ${message}`;
    spiraAppManager.displayErrorMessage(fullMessage);

    RTI_DEBUG.error(`${code} - ${message}`, {
        details: details,
        suggestedAction: action,
        context: {
            pageId: spiraAppManager.pageId,
            artifactId: spiraAppManager.artifactId,
            timestamp: new Date().toISOString()
        }
    });
}

// Usage
showError(
    'ERR-002',
    'Configuration JSON invalide',
    'Unexpected token at position 45',
    'Verifiez la syntaxe JSON dans Product Settings'
);
```

---

## 4. Cas de Test

### CT-001 : Creation Nouvelle Exigence - Type avec Template
| Attribut | Valeur |
|----------|--------|
| **ID** | CT-001 |
| **Exigence liee** | EF-001, EF-002 |
| **Titre** | Injection template a la creation |
| **Preconditions** | - SpiraApp activee<br>- Template configure pour type "Business Requirement" |
| **Etapes** | 1. Aller dans Requirements<br>2. Cliquer "Nouveau"<br>3. Selectionner type "Business Requirement" |
| **Resultat attendu** | Le champ Description contient le template HTML formate |
| **Statut** | A executer |

---

### CT-002 : Creation Nouvelle Exigence - Type sans Template
| Attribut | Valeur |
|----------|--------|
| **ID** | CT-002 |
| **Exigence liee** | EF-002 |
| **Titre** | Pas d'injection si type sans template |
| **Preconditions** | - SpiraApp activee<br>- Aucun template pour type "Epic" |
| **Etapes** | 1. Aller dans Requirements<br>2. Cliquer "Nouveau"<br>3. Selectionner type "Epic" |
| **Resultat attendu** | Le champ Description reste vide |
| **Statut** | A executer |

---

### CT-003 : Changement de Type - Mise a Jour Template
| Attribut | Valeur |
|----------|--------|
| **ID** | CT-003 |
| **Exigence liee** | EF-006 |
| **Titre** | MAJ template au changement de type |
| **Preconditions** | - Templates configures pour "Business" et "Functional"<br>- Nouvelle exigence ouverte avec type "Business" |
| **Etapes** | 1. Observer le template Business injecte<br>2. Changer le type en "Functional"<br>3. Confirmer la mise a jour |
| **Resultat attendu** | Le template Functional remplace le template Business |
| **Statut** | A executer |

---

### CT-004 : Mode Edition - Pas d'Ecrasement
| Attribut | Valeur |
|----------|--------|
| **ID** | CT-004 |
| **Exigence liee** | EF-007 |
| **Titre** | Protection du contenu en mode edition |
| **Preconditions** | - Exigence existante avec description remplie |
| **Etapes** | 1. Ouvrir l'exigence existante en edition<br>2. Observer le champ Description |
| **Resultat attendu** | Le contenu original est conserve, pas de template injecte |
| **Statut** | A executer |

---

### CT-005 : Champ Custom RichText
| Attribut | Valeur |
|----------|--------|
| **ID** | CT-005 |
| **Exigence liee** | EF-004 |
| **Titre** | Injection dans champ personnalise |
| **Preconditions** | - Champ Custom_05 configure comme cible<br>- Template defini |
| **Etapes** | 1. Creer nouvelle exigence<br>2. Observer le champ Custom_05 |
| **Resultat attendu** | Le template est injecte dans Custom_05 |
| **Statut** | A executer |

---

### CT-006 : SpiraApp Desactivee
| Attribut | Valeur |
|----------|--------|
| **ID** | CT-006 |
| **Exigence liee** | - |
| **Titre** | Comportement SpiraApp desactivee |
| **Preconditions** | - SpiraApp desactivee pour le produit |
| **Etapes** | 1. Creer nouvelle exigence |
| **Resultat attendu** | Aucune injection, comportement Spira standard |
| **Statut** | A executer |

---

### CT-007 : Configuration Invalide
| Attribut | Valeur |
|----------|--------|
| **ID** | CT-007 |
| **Exigence liee** | ENF-003 |
| **Titre** | Gestion configuration invalide |
| **Preconditions** | - JSON de templates mal forme |
| **Etapes** | 1. Creer nouvelle exigence |
| **Resultat attendu** | Message d'erreur clair, pas de crash, log dans console |
| **Statut** | A executer |

---

### CT-008 : Performance - Temps d'Injection
| Attribut | Valeur |
|----------|--------|
| **ID** | CT-008 |
| **Exigence liee** | ENF-001 |
| **Titre** | Mesure du temps d'injection |
| **Preconditions** | - SpiraApp activee avec template |
| **Etapes** | 1. Ouvrir console developpeur<br>2. Creer nouvelle exigence<br>3. Observer les timestamps dans les logs |
| **Resultat attendu** | Injection complete en < 500ms |
| **Statut** | A executer |

---

## 5. Maquettes

### 5.1 Maquette - Formulaire de Creation (Avant Injection)

```
+------------------------------------------------------------------+
|  REQUIREMENT - Nouveau                                    [Save] |
+------------------------------------------------------------------+
|                                                                  |
|  Nom: [________________________________]                         |
|                                                                  |
|  Type: [Business Requirement    v]                               |
|                                                                  |
|  Statut: [Requested            v]                                |
|                                                                  |
|  Description:                                                    |
|  +------------------------------------------------------------+  |
|  |                                                            |  |
|  |  (champ vide)                                              |  |
|  |                                                            |  |
|  +------------------------------------------------------------+  |
|                                                                  |
+------------------------------------------------------------------+
```

### 5.2 Maquette - Formulaire de Creation (Apres Injection)

```
+------------------------------------------------------------------+
|  REQUIREMENT - Nouveau                                    [Save] |
+------------------------------------------------------------------+
|                                                                  |
|  Nom: [________________________________]                         |
|                                                                  |
|  Type: [Business Requirement    v]                               |
|                                                                  |
|  Statut: [Requested            v]                                |
|                                                                  |
|  Description:                                                    |
|  +------------------------------------------------------------+  |
|  |  ## Contexte Metier                                        |  |
|  |  [Decrire le contexte metier et les enjeux]                |  |
|  |                                                            |  |
|  |  ## Description du Besoin                                  |  |
|  |  [Decrire le besoin fonctionnel]                           |  |
|  |                                                            |  |
|  |  ## Benefices Attendus                                     |  |
|  |  - [Benefice 1]                                            |  |
|  |  - [Benefice 2]                                            |  |
|  |                                                            |  |
|  |  ## Criteres d'Acceptation                                 |  |
|  |  - [ ] Critere 1                                           |  |
|  |  - [ ] Critere 2                                           |  |
|  +------------------------------------------------------------+  |
|                                                                  |
+------------------------------------------------------------------+
```

### 5.3 Maquette - Dialogue de Confirmation (Changement de Type)

```
+--------------------------------------------------+
|  Requirement Template Injector                   |
+--------------------------------------------------+
|                                                  |
|  Le type d'exigence a change.                    |
|                                                  |
|  Voulez-vous remplacer le contenu actuel         |
|  par le template "Functional Requirement" ?      |
|                                                  |
|  [  Conserver  ]     [  Remplacer  ]             |
|                                                  |
+--------------------------------------------------+
```

### 5.4 Maquette - Configuration Admin (Product Settings)

#### Vue d'ensemble de la page

```
+==================================================================================+
|  PRODUCT ADMIN > SPIRAAPPS > REQUIREMENT TEMPLATE INJECTOR                       |
+==================================================================================+
|                                                                                  |
|  +---------------------------+  +---------------------------------------------+  |
|  |  NAVIGATION              |  |  CONFIGURATION                              |  |
|  |--------------------------|  |---------------------------------------------|  |
|  |  > Parametres Generaux   |  |                                             |  |
|  |    Templates par Type    |  |   [Zone de configuration active]            |  |
|  |    Options Avancees      |  |                                             |  |
|  |    Debug & Logs          |  |                                             |  |
|  +---------------------------+  +---------------------------------------------+  |
|                                                                                  |
+==================================================================================+
```

#### 5.4.1 Onglet "Parametres Generaux"

```
+==================================================================================+
|  PARAMETRES GENERAUX                                                             |
+==================================================================================+
|                                                                                  |
|  CHAMP CIBLE POUR L'INJECTION                                                    |
|  +---------------------------------------------------------------------------+   |
|  |  Champ RichText:  [Description                              v]            |   |
|  |                   +-------------------------------------------------+     |   |
|  |                   | Description (standard)                         |     |   |
|  |                   | Custom_04 - Notes (RichText)                   |     |   |
|  |                   +-------------------------------------------------+     |   |
|  |                                                                           |   |
|  |  [i] Le template sera injecte dans ce champ lors de la creation           |   |
|  +---------------------------------------------------------------------------+   |
|                                                                                  |
|  COMPORTEMENT                                                                    |
|  +---------------------------------------------------------------------------+   |
|  |                                                                           |   |
|  |  [x] Activer l'injection automatique a la creation                        |   |
|  |                                                                           |   |
|  |  [x] Demander confirmation avant de remplacer le contenu existant         |   |
|  |                                                                           |   |
|  |  [ ] Afficher un message de succes apres injection                        |   |
|  |                                                                           |   |
|  |  [ ] Injecter aussi lors du changement de type d'exigence                 |   |
|  |                                                                           |   |
|  +---------------------------------------------------------------------------+   |
|                                                                                  |
|                                                    [Annuler]  [Sauvegarder]      |
+==================================================================================+
```

#### 5.4.2 Onglet "Templates par Type"

```
+==================================================================================+
|  TEMPLATES PAR TYPE D'EXIGENCE                                                   |
+==================================================================================+
|                                                                                  |
|  [+ Ajouter un template]                              [Importer JSON] [Exporter] |
|                                                                                  |
|  +---------------------------------------------------------------------------+   |
|  | TYPE: Need (ID: 1)                                           [ON] [Edit]  |   |
|  |---------------------------------------------------------------------------+   |
|  | Apercu: "Contexte Metier / Objectifs / Benefices..."                      |   |
|  +---------------------------------------------------------------------------+   |
|                                                                                  |
|  +---------------------------------------------------------------------------+   |
|  | TYPE: Feature (ID: 2)  [DEFAUT]                              [ON] [Edit]  |   |
|  |---------------------------------------------------------------------------+   |
|  | Apercu: "Description / Criteres d'Acceptation..."                         |   |
|  +---------------------------------------------------------------------------+   |
|                                                                                  |
|  +---------------------------------------------------------------------------+   |
|  | TYPE: Use Case (ID: 3)                                       [ON] [Edit]  |   |
|  |---------------------------------------------------------------------------+   |
|  | Apercu: "Acteurs / Preconditions / Scenario Principal..."                 |   |
|  +---------------------------------------------------------------------------+   |
|                                                                                  |
|  +---------------------------------------------------------------------------+   |
|  | TYPE: User Story (ID: 4)                                     [ON] [Edit]  |   |
|  |---------------------------------------------------------------------------+   |
|  | Apercu: "En tant que / Je veux / Afin de..."                              |   |
|  +---------------------------------------------------------------------------+   |
|                                                                                  |
|  +---------------------------------------------------------------------------+   |
|  | TYPE: Quality (ID: 5)                                        [ON] [Edit]  |   |
|  |---------------------------------------------------------------------------+   |
|  | Apercu: "Exigence Qualite / Metriques / Verification..."                  |   |
|  +---------------------------------------------------------------------------+   |
|                                                                                  |
|  +---------------------------------------------------------------------------+   |
|  | TYPE: Epic (ID: 26)                                         [OFF] [Edit]  |   |
|  |---------------------------------------------------------------------------+   |
|  | (Aucun template - injection desactivee)                                   |   |
|  +---------------------------------------------------------------------------+   |
|                                                                                  |
|                                                    [Annuler]  [Sauvegarder]      |
+==================================================================================+
```

#### 5.4.3 Modal "Edition d'un Template"

```
+================================================================================+
|  EDITER LE TEMPLATE - User Story (ID: 4)                              [X]     |
+================================================================================+
|                                                                                |
|  NOM DU TYPE                                                                   |
|  +------------------------------------------------------------------------+   |
|  |  User Story                                                            |   |
|  +------------------------------------------------------------------------+   |
|                                                                                |
|  STATUT                                                                        |
|  +------------------------------------------------------------------------+   |
|  |  (o) Active    ( ) Desactive                                           |   |
|  +------------------------------------------------------------------------+   |
|                                                                                |
|  CONTENU DU TEMPLATE (HTML)                                                    |
|  +------------------------------------------------------------------------+   |
|  | [B] [I] [U] | [H1] [H2] [H3] | [UL] [OL] | [Table] | [</>] [Preview]   |   |
|  +------------------------------------------------------------------------+   |
|  |                                                                        |   |
|  | <p><strong>En tant que</strong> [type d'utilisateur]</p>               |   |
|  |                                                                        |   |
|  | <p><strong>Je veux</strong> [action/fonctionnalite]</p>                |   |
|  |                                                                        |   |
|  | <p><strong>Afin de</strong> [benefice/valeur]</p>                      |   |
|  |                                                                        |   |
|  | <h3>Criteres d'acceptation</h3>                                        |   |
|  | <ul>                                                                   |   |
|  |   <li>Etant donne [contexte], quand [action], alors [resultat]</li>   |   |
|  |   <li>Etant donne [contexte], quand [action], alors [resultat]</li>   |   |
|  | </ul>                                                                  |   |
|  |                                                                        |   |
|  | <h3>Notes techniques</h3>                                              |   |
|  | <p>[Informations pour l'equipe technique]</p>                         |   |
|  |                                                                        |   |
|  +------------------------------------------------------------------------+   |
|                                                                                |
|  APERCU EN TEMPS REEL                                                          |
|  +------------------------------------------------------------------------+   |
|  |                                                                        |   |
|  |  **En tant que** [type d'utilisateur]                                  |   |
|  |                                                                        |   |
|  |  **Je veux** [action/fonctionnalite]                                   |   |
|  |                                                                        |   |
|  |  **Afin de** [benefice/valeur]                                         |   |
|  |                                                                        |   |
|  |  ### Criteres d'acceptation                                            |   |
|  |  - Etant donne [contexte], quand [action], alors [resultat]            |   |
|  |  - Etant donne [contexte], quand [action], alors [resultat]            |   |
|  |                                                                        |   |
|  |  ### Notes techniques                                                  |   |
|  |  [Informations pour l'equipe technique]                                |   |
|  |                                                                        |   |
|  +------------------------------------------------------------------------+   |
|                                                                                |
|                                         [Annuler]  [Sauvegarder le template]   |
+================================================================================+
```

#### 5.4.4 Onglet "Options Avancees"

```
+==================================================================================+
|  OPTIONS AVANCEES                                                                |
+==================================================================================+
|                                                                                  |
|  VALIDATION                                                                      |
|  +---------------------------------------------------------------------------+   |
|  |                                                                           |   |
|  |  [x] Valider le HTML des templates avant sauvegarde                       |   |
|  |                                                                           |   |
|  |  [x] Sanitizer le HTML (supprimer scripts et attributs dangereux)         |   |
|  |                                                                           |   |
|  +---------------------------------------------------------------------------+   |
|                                                                                  |
|  MESSAGES PERSONNALISES                                                          |
|  +---------------------------------------------------------------------------+   |
|  |                                                                           |   |
|  |  Message de succes:                                                       |   |
|  |  +---------------------------------------------------------------------+  |   |
|  |  | Template applique avec succes. N'oubliez pas de sauvegarder!       |  |   |
|  |  +---------------------------------------------------------------------+  |   |
|  |                                                                           |   |
|  |  Message si aucun template:                                               |   |
|  |  +---------------------------------------------------------------------+  |   |
|  |  | Aucun template disponible pour ce type d'exigence.                 |  |   |
|  |  +---------------------------------------------------------------------+  |   |
|  |                                                                           |   |
|  +---------------------------------------------------------------------------+   |
|                                                                                  |
|  CONFIGURATION JSON BRUTE (mode expert)                                          |
|  +---------------------------------------------------------------------------+   |
|  |  [!] Modification directe du JSON - pour utilisateurs avances             |   |
|  |  +---------------------------------------------------------------------+  |   |
|  |  | {                                                                   |  |   |
|  |  |   "1": { "name": "Need", "enabled": true, "template": "..." },      |  |   |
|  |  |   "2": { "name": "Feature", "enabled": true, "template": "..." },   |  |   |
|  |  |   ...                                                               |  |   |
|  |  | }                                                                   |  |   |
|  |  +---------------------------------------------------------------------+  |   |
|  |                                                                           |   |
|  |  [Valider JSON]   Statut: [v] JSON valide                                 |   |
|  +---------------------------------------------------------------------------+   |
|                                                                                  |
|                                                    [Annuler]  [Sauvegarder]      |
+==================================================================================+
```

#### 5.4.5 Onglet "Debug & Logs"

```
+==================================================================================+
|  DEBUG & LOGS                                                                    |
+==================================================================================+
|                                                                                  |
|  MODE DEBUG                                                                      |
|  +---------------------------------------------------------------------------+   |
|  |                                                                           |   |
|  |  [x] Activer les logs dans la console navigateur                          |   |
|  |                                                                           |   |
|  |  Niveau de log:  [Info          v]                                        |   |
|  |                  +------------------+                                     |   |
|  |                  | Error            |                                     |   |
|  |                  | Warning          |                                     |   |
|  |                  | Info             |                                     |   |
|  |                  | Debug (verbose)  |                                     |   |
|  |                  +------------------+                                     |   |
|  |                                                                           |   |
|  |  [ ] Afficher le badge de debug dans l'interface                          |   |
|  |                                                                           |   |
|  +---------------------------------------------------------------------------+   |
|                                                                                  |
|  TEST DE CONFIGURATION                                                           |
|  +---------------------------------------------------------------------------+   |
|  |                                                                           |   |
|  |  Tester l'injection pour le type:  [Feature (ID: 2)    v]                 |   |
|  |                                                                           |   |
|  |  [Executer le test]                                                       |   |
|  |                                                                           |   |
|  |  Resultat du dernier test:                                                |   |
|  |  +---------------------------------------------------------------------+  |   |
|  |  | [v] Configuration chargee                                          |  |   |
|  |  | [v] JSON valide                                                    |  |   |
|  |  | [v] Template trouve pour type 2                                    |  |   |
|  |  | [v] Champ cible 'Description' disponible                           |  |   |
|  |  | [v] Injection simulee avec succes                                  |  |   |
|  |  |                                                                     |  |   |
|  |  | RESULTAT: PRET A UTILISER                                          |  |   |
|  |  +---------------------------------------------------------------------+  |   |
|  |                                                                           |   |
|  +---------------------------------------------------------------------------+   |
|                                                                                  |
|  DIAGNOSTIC RAPIDE                                                               |
|  +---------------------------------------------------------------------------+   |
|  |                                                                           |   |
|  |  [Exporter le rapport de debug]   [Copier dans le presse-papier]          |   |
|  |                                                                           |   |
|  |  Informations systeme:                                                    |   |
|  |  - SpiraApp GUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx                    |   |
|  |  - Version: 1.0.0                                                         |   |
|  |  - Page ID: 9 (RequirementDetails)                                        |   |
|  |  - Projet ID: 1                                                           |   |
|  |  - Template ID: 1                                                         |   |
|  |  - Types configures: 5/8                                                  |   |
|  |                                                                           |   |
|  +---------------------------------------------------------------------------+   |
|                                                                                  |
|                                                    [Annuler]  [Sauvegarder]      |
+==================================================================================+
```

#### 5.4.6 Indicateurs d'Etat et Erreurs

```
+==================================================================================+
|  INDICATEURS VISUELS DANS L'INTERFACE                                            |
+==================================================================================+

BANDEAU SUCCES (vert):
+-----------------------------------------------------------------------------------+
| [v] RTI: Template sauvegarde avec succes!                                    [X] |
+-----------------------------------------------------------------------------------+

BANDEAU AVERTISSEMENT (jaune):
+-----------------------------------------------------------------------------------+
| [!] RTI: 3 types d'exigence n'ont pas de template configure.                 [X] |
+-----------------------------------------------------------------------------------+

BANDEAU ERREUR (rouge):
+-----------------------------------------------------------------------------------+
| [X] RTI [ERR-002]: Le format JSON est invalide. Erreur a la ligne 15.        [X] |
|     Action: Verifiez la syntaxe JSON dans l'onglet "Options Avancees".           |
+-----------------------------------------------------------------------------------+

VALIDATION EN TEMPS REEL DU JSON:
+---------------------------------------------------------------------+
| {                                                                   |
|   "1": { "name": "Need", "enabled": true, "template": "..." },      |
|   "2": { "name": "Feature" "enabled": true } <-- [X] Virgule manq.  |
| }                                                                   |
+---------------------------------------------------------------------+
| Ligne 2: Erreur de syntaxe - virgule manquante apres "Feature"      |
+---------------------------------------------------------------------+
```

---

## 6. Outils de Debug Production

### 6.1 Module de Logging Integre

Le code JavaScript inclura un module de logging configurable :

```javascript
// === DEBUG MODULE ===
const RTI_DEBUG = {
    enabled: true,  // Activer/desactiver via console: RTI_DEBUG.enabled = false
    prefix: '[RTI]',
    levels: {
        INFO: 'INFO',
        WARN: 'WARN',
        ERROR: 'ERROR',
        DEBUG: 'DEBUG'
    },

    log: function(level, message, data) {
        if (!this.enabled && level !== this.levels.ERROR) return;

        const timestamp = new Date().toISOString();
        const logMessage = `${this.prefix} [${timestamp}] [${level}] ${message}`;

        switch(level) {
            case this.levels.ERROR:
                console.error(logMessage, data || '');
                break;
            case this.levels.WARN:
                console.warn(logMessage, data || '');
                break;
            case this.levels.DEBUG:
                console.debug(logMessage, data || '');
                break;
            default:
                console.log(logMessage, data || '');
        }
    },

    info: function(msg, data) { this.log(this.levels.INFO, msg, data); },
    warn: function(msg, data) { this.log(this.levels.WARN, msg, data); },
    error: function(msg, data) { this.log(this.levels.ERROR, msg, data); },
    debug: function(msg, data) { this.log(this.levels.DEBUG, msg, data); }
};
```

### 6.2 Points de Log dans le Code

| Point | Niveau | Message | Donnees |
|-------|--------|---------|---------|
| Initialisation | INFO | "SpiraApp initialized" | APP_GUID, version |
| Page loaded | INFO | "Page loaded event fired" | pageId, artifactId |
| Detection mode | DEBUG | "Mode detected" | isNewRequirement: true/false |
| Lecture settings | DEBUG | "Settings loaded" | settings object |
| Lecture type | DEBUG | "Requirement type" | typeId, typeName |
| Template trouve | INFO | "Template found for type" | typeId, templateLength |
| Template non trouve | WARN | "No template for type" | typeId |
| Injection | INFO | "Template injected" | fieldName, success |
| Changement type | INFO | "Type changed" | oldType, newType |
| Erreur parsing | ERROR | "Config parse error" | error message |
| Erreur injection | ERROR | "Injection failed" | error message |

### 6.3 Commandes Console pour Debug en Prod

```javascript
// === COMMANDES DEBUG CONSOLE ===

// Activer les logs detailles
RTI_DEBUG.enabled = true;

// Afficher la configuration actuelle
RTI_showConfig();

// Afficher l'etat actuel
RTI_showState();

// Tester l'injection manuellement
RTI_testInject(typeId);

// Afficher les types d'exigence disponibles
RTI_showTypes();

// Valider le JSON de configuration
RTI_validateConfig();

// Mesurer les performances
RTI_benchmark();
```

### 6.4 Implementation des Commandes Debug

```javascript
// Exposer globalement pour acces console
window.RTI_showConfig = function() {
    console.group('[RTI] Current Configuration');
    console.log('APP_GUID:', APP_GUID);
    console.log('Settings:', SpiraAppSettings[APP_GUID]);
    console.log('Target Field:', SpiraAppSettings[APP_GUID]?.targetField);
    console.log('Templates:', SpiraAppSettings[APP_GUID]?.templates);
    console.groupEnd();
};

window.RTI_showState = function() {
    console.group('[RTI] Current State');
    console.log('Page ID:', spiraAppManager.pageId);
    console.log('Artifact ID:', spiraAppManager.artifactId);
    console.log('Project ID:', spiraAppManager.projectId);
    console.log('User ID:', spiraAppManager.userId);
    console.log('Is New:', !spiraAppManager.artifactId);

    try {
        const typeId = spiraAppManager.getDataItemField('RequirementTypeId', 'intValue');
        console.log('Current Type ID:', typeId);
    } catch(e) {
        console.log('Current Type ID: (unable to read)');
    }
    console.groupEnd();
};

window.RTI_showTypes = function() {
    console.group('[RTI] Requirement Types');
    const url = 'project-templates/' + spiraAppManager.projectTemplateId + '/requirements/types';
    spiraAppManager.executeApi('RTI_Debug', '7.0', 'GET', url, null,
        function(types) {
            console.table(types.map(t => ({
                ID: t.RequirementTypeId,
                Name: t.Name,
                IsActive: t.IsActive
            })));
            console.groupEnd();
        },
        function(err) {
            console.error('Error fetching types:', err);
            console.groupEnd();
        }
    );
};

window.RTI_validateConfig = function() {
    console.group('[RTI] Config Validation');
    const templates = SpiraAppSettings[APP_GUID]?.templates;

    if (!templates) {
        console.error('No templates configured!');
        console.groupEnd();
        return false;
    }

    try {
        const parsed = typeof templates === 'string' ? JSON.parse(templates) : templates;
        console.log('JSON valid:', true);
        console.log('Types configured:', Object.keys(parsed).length);

        Object.keys(parsed).forEach(key => {
            const t = parsed[key];
            console.log(`  Type ${key}:`, {
                name: t.name || '(no name)',
                enabled: t.enabled !== false,
                templateLength: t.template?.length || 0
            });
        });

        console.groupEnd();
        return true;
    } catch(e) {
        console.error('JSON parse error:', e.message);
        console.groupEnd();
        return false;
    }
};

window.RTI_benchmark = function() {
    console.group('[RTI] Performance Benchmark');
    const start = performance.now();

    // Simuler les operations
    const t1 = performance.now();
    const settings = SpiraAppSettings[APP_GUID];
    console.log('Settings access:', (performance.now() - t1).toFixed(2) + 'ms');

    const t2 = performance.now();
    try {
        const parsed = JSON.parse(settings?.templates || '{}');
        console.log('JSON parse:', (performance.now() - t2).toFixed(2) + 'ms');
    } catch(e) {}

    const t3 = performance.now();
    try {
        const field = spiraAppManager.getDataItemField('Description', 'textValue');
        console.log('Field read:', (performance.now() - t3).toFixed(2) + 'ms');
    } catch(e) {}

    console.log('Total:', (performance.now() - start).toFixed(2) + 'ms');
    console.groupEnd();
};

window.RTI_testInject = function(typeId) {
    console.group('[RTI] Test Injection for Type ' + typeId);

    try {
        const templates = JSON.parse(SpiraAppSettings[APP_GUID]?.templates || '{}');
        const template = templates[typeId];

        if (!template) {
            console.warn('No template found for type', typeId);
            console.groupEnd();
            return;
        }

        console.log('Template found:', template.name);
        console.log('HTML Preview:', template.template?.substring(0, 200) + '...');

        // Tenter l'injection
        const targetField = SpiraAppSettings[APP_GUID]?.targetField || 'Description';
        spiraAppManager.updateFormField(targetField, 'textValue', template.template);
        console.log('Injection attempted on field:', targetField);

    } catch(e) {
        console.error('Test failed:', e.message);
    }

    console.groupEnd();
};
```

### 6.5 Indicateur Visuel de Debug (Optionnel)

```javascript
// Afficher un badge de debug dans l'interface
window.RTI_showDebugBadge = function() {
    const badge = document.createElement('div');
    badge.id = 'rti-debug-badge';
    badge.innerHTML = '[RTI DEBUG]';
    badge.style.cssText = `
        position: fixed;
        bottom: 10px;
        right: 10px;
        background: #ff6b6b;
        color: white;
        padding: 5px 10px;
        font-size: 12px;
        font-family: monospace;
        border-radius: 4px;
        z-index: 99999;
        cursor: pointer;
    `;
    badge.onclick = function() {
        RTI_showState();
        RTI_showConfig();
    };
    document.body.appendChild(badge);
};

window.RTI_hideDebugBadge = function() {
    const badge = document.getElementById('rti-debug-badge');
    if (badge) badge.remove();
};
```

### 6.6 Export des Logs

```javascript
window.RTI_exportLogs = function() {
    // Collecter toutes les informations de debug
    const report = {
        timestamp: new Date().toISOString(),
        appGuid: APP_GUID,
        spiraInfo: {
            pageId: spiraAppManager.pageId,
            projectId: spiraAppManager.projectId,
            artifactId: spiraAppManager.artifactId,
            userId: spiraAppManager.userId,
            baseUrl: spiraAppManager.baseUrl
        },
        settings: SpiraAppSettings[APP_GUID],
        browserInfo: {
            userAgent: navigator.userAgent,
            language: navigator.language
        }
    };

    // Copier dans le presse-papier
    const json = JSON.stringify(report, null, 2);
    navigator.clipboard.writeText(json).then(() => {
        console.log('[RTI] Debug report copied to clipboard!');
        alert('Debug report copied to clipboard!');
    });

    return report;
};
```

---

## 7. Donnees de Reference Environnement

### 7.1 Types d'Exigences (Template ID: 1)

> Donnees recuperees depuis l'API Spira le 2025-01-08

| RequirementTypeId | Nom | Actif | Par Defaut | Supporte Steps |
|-------------------|-----|-------|------------|----------------|
| 1 | Need | Oui | Non | Non |
| 2 | Feature | Oui | **Oui** | Non |
| 3 | Use Case | Oui | Non | **Oui** |
| 4 | User Story | Oui | Non | Non |
| 5 | Quality | Oui | Non | Non |
| 6 | Design Element | Oui | Non | Non |
| 13 | Acceptance Criteria | Oui | Non | Non |
| 26 | Epic | Oui | Non | Non |

### 7.2 Proprietes Personnalisees Requirements (Template ID: 1)

| FieldName | Nom | Type | RichText | Description |
|-----------|-----|------|----------|-------------|
| Custom_01 | URL | Text | Non | Enter the relevant URL |
| Custom_02 | Difficulty | List | Non | Difficulty (Easy/Moderate/Difficult) |
| Custom_03 | Classification | List | Non | Regulatory/Statutory |
| Custom_04 | Notes | Text | **Oui** | Additional notes |
| Custom_05 | Review Date | Date | Non | Review deadline |
| Custom_06 | Ranking | Integer | Non | Ranking value |
| Custom_07 | Decimal | Decimal | Non | - |

> **Important** : Le champ `Custom_04` (Notes) est de type RichText et peut etre utilise comme cible alternative.

### 7.3 Projets Disponibles

| ProjectId | Nom | TemplateId |
|-----------|-----|------------|
| 1 | Library Information System (Sample) | 1 |
| 2 | Sample Empty Product 1 | 1 |
| 3 | Sample Empty Product 2 | 2 |

---

## 8. Matrice de Tracabilite

| Exigence | Cas de Test | Priorite | Statut |
|----------|-------------|----------|--------|
| EF-001 | CT-001 | Haute | A developper |
| EF-002 | CT-001, CT-002 | Haute | A developper |
| EF-003 | CT-001 | Haute | A developper |
| EF-004 | CT-005 | Moyenne | A developper |
| EF-005 | CT-007 | Haute | A developper |
| EF-006 | CT-003 | Moyenne | A developper |
| EF-007 | CT-004 | Haute | A developper |
| EF-008 | CT-002 | Basse | A developper |
| ENF-001 | CT-008 | Haute | A developper |
| ENF-002 | - | Haute | A verifier |
| ENF-003 | CT-007, CT-008 | Haute | A developper |
| ENF-004 | - | Haute | A developper |

---

## Annexes

### A. Configuration des Templates Recommandee

Basee sur les types d'exigences de votre environnement :

```json
{
  "1": {
    "name": "Need",
    "enabled": true,
    "template": "<h2>Contexte Metier</h2><p>[Decrire le besoin business]</p><h2>Objectifs</h2><ul><li>[Objectif 1]</li></ul>"
  },
  "2": {
    "name": "Feature",
    "enabled": true,
    "template": "<h2>Description</h2><p>[Decrire la fonctionnalite]</p><h2>Criteres d'Acceptation</h2><ul><li>[ ] Critere 1</li></ul>"
  },
  "3": {
    "name": "Use Case",
    "enabled": true,
    "template": "<h2>Acteurs</h2><p>[Lister les acteurs]</p><h2>Preconditions</h2><p>[Conditions prealables]</p><h2>Scenario Principal</h2><ol><li>[Etape 1]</li></ol><h2>Scenarios Alternatifs</h2><p>[Variations]</p>"
  },
  "4": {
    "name": "User Story",
    "enabled": true,
    "template": "<p><strong>En tant que</strong> [type utilisateur]</p><p><strong>Je veux</strong> [action]</p><p><strong>Afin de</strong> [benefice]</p><h3>Criteres d'acceptation</h3><ul><li>Etant donne [contexte], quand [action], alors [resultat]</li></ul>"
  },
  "5": {
    "name": "Quality",
    "enabled": true,
    "template": "<h2>Exigence Qualite</h2><p>[Description]</p><h2>Metriques</h2><ul><li>[Metrique 1]: [Valeur cible]</li></ul><h2>Methode de Verification</h2><p>[Comment verifier]</p>"
  },
  "26": {
    "name": "Epic",
    "enabled": false,
    "template": ""
  }
}
```

### B. Checklist de Deploiement

- [ ] Mode developpeur active sur Spira
- [ ] SpiraApp uploade via System Admin
- [ ] SpiraApp activee au niveau systeme
- [ ] SpiraApp activee par produit
- [ ] Templates configures dans Product Settings
- [ ] Tests executes sur environnement de test
- [ ] Logs de debug verifies
- [ ] Documentation utilisateur fournie

### C. URLs Utiles

- **Spira Instance** : `https://demo-in.spiraservice.net/mtx`
- **API REST** : `https://demo-in.spiraservice.net/mtx/Services/v7_0/RestService.svc`
- **Projet Principal** : `https://demo-in.spiraservice.net/mtx/#/project/1`
- **Admin SpiraApps** : `https://demo-in.spiraservice.net/mtx/Administration/SpiraApps.aspx`

---

*Document cree le 2025-01-08*
