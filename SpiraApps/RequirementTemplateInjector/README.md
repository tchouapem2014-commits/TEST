# Requirement Template Injector (RTI)

> SpiraApp pour SpiraPlan - Injection automatique de templates dans les exigences

## Description

**Requirement Template Injector (RTI)** est une SpiraApp qui injecte automatiquement des templates HTML formatés dans n'importe quel champ RichText lors de la création de nouvelles exigences dans SpiraPlan.

### Fonctionnalités

- Injection automatique de templates au chargement de la page
- Re-injection lors du changement de type d'exigence
- **Champ cible configurable** : Description (défaut) ou tout champ RichText (Custom_01, etc.) (v2.0)
- **Bouton "Injecter Template"** dans la toolbar pour injection manuelle (v1.1)
- 5 slots configurables (type + template)
- Éditeur RichText WYSIWYG pour configurer les templates
- Dropdown natif pour sélectionner les types d'exigences
- Protection du contenu modifié par l'utilisateur
- Rétrocompatible avec les versions précédentes
- Mode debug avec logs console (F12)

## Installation

### Prérequis

- SpiraPlan v7.0+
- Node.js v16+ (pour la génération du package)
- [spiraapp-package-generator](https://github.com/ArtifactB1/spiraapp-package-generator)

### Génération du package

```bash
# Cloner le générateur (si pas déjà fait)
cd ../
git clone https://github.com/ArtifactB1/spiraapp-package-generator.git
cd spiraapp-package-generator
npm install

# Générer le package RTI
npm run build --input="../RequirementTemplateInjector" --output="../RequirementTemplateInjector" --debug
```

Le fichier `.spiraapp` sera généré : `b3f5a8d2-7c41-4e9a-b6d8-1f2e3a4b5c6d.spiraapp`

### Installation dans SpiraPlan

1. **Admin Système** : Administration > System > SpiraApps > Upload
2. **Admin Produit** : Administration > Product > SpiraApps > Activer RTI
3. **Configuration** : Cliquer sur "Configure" pour paramétrer les templates

## Configuration

### Interface de configuration

![Configuration RTI](docs/config-screenshot.png)

### Champ cible (v2.0)

1. **Champ RichText cible** : Entrez le nom du champ (ex: `Description`, `Custom_01`, `Custom_02`)
   - Laissez vide pour utiliser `Description` par défaut
   - Les champs custom sont accessibles via leur nom technique (Custom_XX)

### Slots de templates

Pour chaque slot (1-5) :

1. **Type d'exigence** : Sélectionnez dans le dropdown (Feature, User Story, Need, etc.)
2. **Template** : Configurez le HTML dans l'éditeur RichText

### Option Debug

Cochez "Mode debug" pour voir les logs dans la console navigateur (F12).

## Utilisation

### Comportement automatique

L'injection se declenche automatiquement dans deux cas :

1. **Au chargement de la page** (avec un delai de 500ms) :
   - L'utilisateur ouvre une exigence (nouvelle ou existante)
   - Si le champ cible est vide, le template correspondant au type actuel est injecte

2. **Au changement de type d'exigence** :
   - L'utilisateur modifie le type dans le dropdown RequirementTypeId
   - Si le champ cible est vide, le template du nouveau type est injecte

**Protection du contenu existant** : Si le champ cible contient deja du texte, aucune injection n'est effectuee. Le contenu de l'utilisateur est toujours preserve.

### Bouton "Injecter Template" (v1.1)

Un bouton **RTI > Injecter Template** est disponible dans la toolbar de la page de detail d'une exigence.

**Comportement au clic :**

- **Si le champ cible est vide** : le template correspondant au type actuel est injecte
- **Si le champ cible contient du texte** : un message d'avertissement s'affiche pour informer que le champ n'est pas vide

**Cas d'usage :**

- Recharger un template apres avoir vide le champ cible
- Forcer l'injection sur une exigence existante (vider d'abord le champ)
- Tester la configuration des templates

### Commandes debug (Console F12)

```javascript
RTI_showState()      // Affiche l'état interne
RTI_showTemplates()  // Affiche le mapping typeId -> template
RTI_injectNow()      // Force l'injection manuelle
```

## Structure du projet

```
RequirementTemplateInjector/
├── manifest.yaml           # Configuration SpiraApp
├── injector.js             # Code JavaScript principal
├── code/
│   └── injector.js         # Copie de référence
├── SPEC.md                 # Spécifications techniques
├── ANALYSE_FONCTIONNELLE.md # Analyse fonctionnelle détaillée
├── BUILD.md                # Instructions de build
├── README.md               # Ce fichier
└── *.spiraapp              # Package généré
```

## Templates exemples

### Feature (Type 2)

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

### User Story (Type 4)

```html
<p><strong>En tant que</strong> [type d'utilisateur]</p>
<p><strong>Je veux</strong> [fonctionnalite souhaitee]</p>
<p><strong>Afin de</strong> [benefice/valeur]</p>

<h3>Criteres d'acceptation</h3>
<ul>
<li>Etant donne [contexte], quand [action], alors [resultat]</li>
</ul>
```

## Documentation

- [SPEC.md](SPEC.md) - Spécifications techniques
- [ANALYSE_FONCTIONNELLE.md](ANALYSE_FONCTIONNELLE.md) - Analyse fonctionnelle complète (wireframes, cas de test, etc.)
- [BUILD.md](BUILD.md) - Instructions de build détaillées

## API SpiraApp utilisées

| API | Usage |
|-----|-------|
| `registerEvent_loaded` | Injection au chargement |
| `registerEvent_dropdownChanged` | Re-injection au changement de type |
| `registerEvent_menuEntryClick` | Gestion du clic sur le bouton menu |
| `getDataItemField` | Lecture des valeurs de champs |
| `updateFormField` | Mise à jour du champ cible |
| `displaySuccessMessage` | Notification utilisateur (succès) |
| `displayWarningMessage` | Notification utilisateur (avertissement) |
| `SpiraAppSettings` | Lecture des settings configurés |

## Changelog

- **v2.0.0** (2026-01-14) : Support de n'importe quel champ RichText
- **v1.5.0** (2026-01-14) : Injection auto au chargement + changement de type
- **v1.4.0** (2026-01-14) : Injection via dropdownChanged sur RequirementTypeId
- **v1.1.0** (2026-01-14) : Ajout du bouton "Injecter Template" dans la toolbar
- **v1.0.0** (2026-01-14) : Version initiale - 5 slots dropdown + RichText

## Licence

MIT License - Copyright 2025

## Auteur

SpiraApps Developer

## Support

Pour signaler un bug ou proposer une amélioration :
- Ouvrir une issue sur ce repository
- Consulter la documentation SpiraApps : https://spiradoc.inflectra.com/SpiraApps-Reference/
