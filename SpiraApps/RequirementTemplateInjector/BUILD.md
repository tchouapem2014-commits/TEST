# Build Instructions - Requirement Template Injector

## Prérequis

- Node.js installé
- Le générateur de package SpiraApp cloné dans `../spiraapp-package-generator`

## Générer le package

```powershell
# Depuis le dossier spiraapp-package-generator
cd ..\spiraapp-package-generator

# Installer les dépendances (une seule fois)
npm install

# Générer le package en mode debug
npm run build -- --input="..\RequirementTemplateInjector" --output="..\RequirementTemplateInjector" --debug

# Générer le package en mode production (minifié)
npm run build -- --input="..\RequirementTemplateInjector" --output="..\RequirementTemplateInjector"
```

## Fichier généré

Le fichier `.spiraapp` sera créé avec le nom basé sur le GUID :
```
com.spiraapps.requirement-template-injector.spiraapp
```

## Installation dans Spira

1. Connectez-vous à SpiraPlan en tant qu'administrateur système
2. Allez dans **Administration > System > SpiraApps**
3. Cliquez sur **Upload SpiraApp**
4. Sélectionnez le fichier `.spiraapp` généré
5. Activez la SpiraApp pour les produits souhaités

## Configuration post-installation

1. Allez dans **Administration > Product > SpiraApps**
2. Cliquez sur **Requirement Template Injector**
3. Configurez :
   - ✓ Activer l'injection
   - Templates par type d'exigence
   - Champs personnalisés (optionnel)
   - Mode debug (optionnel)

## Structure des fichiers

```
RequirementTemplateInjector/
├── manifest.yaml           # Configuration SpiraApp (requis)
├── injector.js            # Code principal (requis)
├── config-page.html       # Page d'administration (requis)
├── SPEC.md               # Spécifications
├── ANALYSE_FONCTIONNELLE.md  # Analyse détaillée
├── BUILD.md              # Ce fichier
└── debug/                # Outils de debug PowerShell
    ├── spira_api_config.ps1
    ├── test_full_workflow.ps1
    └── ...
```
