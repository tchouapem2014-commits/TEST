# Requirement Template Injector (RTI)

> SpiraApp pour SpiraPlan - Injection automatique de templates dans les exigences

## Description

**Requirement Template Injector (RTI)** est une SpiraApp qui injecte automatiquement des templates HTML formatés dans le champ Description lors de la création de nouvelles exigences dans SpiraPlan.

### Fonctionnalités

- Injection automatique de templates au chargement de la page
- Re-injection lors du changement de type d'exigence
- 5 slots configurables (type + template)
- Éditeur RichText WYSIWYG pour configurer les templates
- Dropdown natif pour sélectionner les types d'exigences
- Protection du contenu modifié par l'utilisateur
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

Pour chaque slot (1-5) :

1. **Type d'exigence** : Sélectionnez dans le dropdown (Feature, User Story, Need, etc.)
2. **Template** : Configurez le HTML dans l'éditeur RichText

### Option Debug

Cochez "Mode debug" pour voir les logs dans la console navigateur (F12).

## Utilisation

### Comportement automatique

1. L'utilisateur crée une nouvelle exigence (Requirements > New)
2. Le template correspondant au type par défaut (Feature) est injecté
3. Si l'utilisateur change le type, le nouveau template est injecté
4. Si l'utilisateur modifie le contenu, il est préservé

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
| `getDataItemField` | Lecture des valeurs de champs |
| `updateFormField` | Mise à jour du champ Description |
| `displaySuccessMessage` | Notification utilisateur |
| `SpiraAppSettings` | Lecture des settings configurés |

## Changelog

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2026-01-14 | Version initiale - 5 slots dropdown + RichText |

## Licence

MIT License - Copyright 2025

## Auteur

SpiraApps Developer

## Support

Pour signaler un bug ou proposer une amélioration :
- Ouvrir une issue sur ce repository
- Consulter la documentation SpiraApps : https://spiradoc.inflectra.com/SpiraApps-Reference/
