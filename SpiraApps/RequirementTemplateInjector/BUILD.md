# Build Instructions - Requirement Template Injector

## Structure du Projet

```
RequirementTemplateInjector/
├── manifest.yaml              # Configuration SpiraApp (requis)
├── code/
│   └── injector.js           # Code principal (requis)
├── SPEC.md                   # Specifications
├── ANALYSE_FONCTIONNELLE.md  # Analyse detaillee v6.0
├── BUILD.md                  # Ce fichier
└── *.spiraapp                # Package genere
```

## Prerequis

- Node.js installe (v16+)
- Le generateur de package SpiraApp clone dans `../spiraapp-package-generator`

## Generer le package .spiraapp

### Etape 1: Installer les dependances (une seule fois)

```powershell
cd ..\spiraapp-package-generator
npm install
```

### Etape 2: Generer le package

**Mode debug (code non minifie - pour tests):**

```powershell
cd ..\spiraapp-package-generator
npm run build --input="../RequirementTemplateInjector" --output="../RequirementTemplateInjector" --debug
```

**Mode production (code minifie):**

```powershell
cd ..\spiraapp-package-generator
npm run build --input="../RequirementTemplateInjector" --output="../RequirementTemplateInjector"
```

### Fichier genere

Le fichier `.spiraapp` est cree avec le nom base sur le GUID:

```
b3f5a8d2-7c41-4e9a-b6d8-1f2e3a4b5c6d.spiraapp
```

## Installation dans SpiraPlan

### 1. Upload de la SpiraApp (Admin Systeme)

1. Connectez-vous a SpiraPlan en tant qu'**administrateur systeme**
2. Allez dans **Administration > System > SpiraApps**
3. Cliquez sur **Upload SpiraApp**
4. Selectionnez le fichier `b3f5a8d2-7c41-4e9a-b6d8-1f2e3a4b5c6d.spiraapp`
5. La SpiraApp apparait dans la liste

### 2. Activation pour un Produit (Admin Produit)

1. Allez dans **Administration > Product > SpiraApps**
2. Activez **Requirement Template Injector**

### 3. Configuration des Templates

1. Dans la liste des SpiraApps du produit, cliquez sur **Configure** pour RTI
2. Configurez jusqu'a 5 slots:

   | Champ | Description |
   |-------|-------------|
   | Type d'exigence #1 | Selectionnez un type dans le dropdown |
   | Template #1 | Editez le template HTML avec l'editeur RichText |
   | ... | Repetez pour les slots 2-5 |
   | Mode debug | Cochez pour voir les logs dans la console (F12) |

3. Cliquez sur **Save**

## Test de la SpiraApp

1. Allez dans **Requirements**
2. Cliquez sur **New**
3. Le template correspondant au type par defaut (Feature) devrait etre injecte automatiquement
4. Changez le type d'exigence - le template devrait etre mis a jour

### Debug (Console F12)

Si le mode debug est active, vous verrez les logs:

```
[RTI] [INFO] Initializing RTI v1.0.0
[RTI] [DEBUG] Slot 1: Type ID 2 configured
[RTI] [DEBUG] Templates configured: 3
[RTI] [INFO] Event handlers registered
[RTI] [DEBUG] Page loaded
[RTI] [DEBUG] Creation mode detected
[RTI] [INFO] Injecting template for type ID 2
```

### Commandes Debug Manuelles

Dans la console F12:

```javascript
RTI_showState()      // Affiche l'etat interne
RTI_showTemplates()  // Affiche le mapping typeId -> template
RTI_injectNow()      // Force l'injection du template
```

## Notes Importantes

- **settingTypeId: 11** (ArtifactTypeSingleSelect) affiche les types d'exigences du produit
- L'injection ne se fait qu'en **mode creation** (pas d'artifactId)
- Le contenu modifie par l'utilisateur est **preserve** (pas d'ecrasement)

## Changelog

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2026-01-14 | Version initiale avec 5 slots dropdown + RichText |
