# Ralph Wiggum Prompt - SpiraXCapture

## Objectif

Developper une SpiraApp complete appellee "SpiraXCapture" pour capturer des screenshots et les attacher aux artefacts SpiraPlan.

## Criteres de Completion

1. `manifest.yaml` valide avec tous les settings necessaires
2. `capture.js` sans erreurs de syntaxe
3. `README.md` documentation complete
4. `SPEC.md` specifications techniques
5. Package `.spiraapp` genere avec succes (via spiraapp-package-generator)

## Specifications Fonctionnelles

### Fonctionnalites Principales

1. **Bouton de capture d'ecran** dans la toolbar des pages de detail
2. **Capture de la zone visible** du navigateur
3. **Apercu de l'image** avant upload
4. **Upload automatique** comme piece jointe a l'artefact courant
5. **Notification de succes/erreur**

### Pages Cibles (pageId)

- 9: RequirementDetails
- 10: TestCaseDetails
- 11: TestSetDetails
- 14: IncidentDetails (bugs)
- 15: TaskDetails
- 16: ReleaseDetails

### Settings Produit

1. `capture_quality` (String): Qualite JPEG 0.1-1.0 (defaut: 0.8)
2. `capture_format` (String): Format image - png ou jpeg (defaut: png)
3. `auto_timestamp` (Boolean): Ajouter timestamp au nom du fichier
4. `debug_mode` (Boolean): Mode debug console

### API SpiraApp a Utiliser

- `registerEvent_menuEntryClick`: Handler bouton menu
- `displaySuccessMessage`: Notification succes
- `displayErrorMessage`: Notification erreur
- `executeApi`: Appel REST API pour upload
- `spiraAppManager.artifactId`: ID artefact courant
- `spiraAppManager.artifactTypeId`: Type artefact courant

### Logique de Capture

```javascript
// Pseudo-code
1. Clic sur bouton "Capturer"
2. Utiliser html2canvas ou API native pour capturer
3. Convertir en blob (PNG ou JPEG selon config)
4. Generer nom fichier avec timestamp si active
5. Appeler API REST POST /documents pour uploader
6. Lier le document a l'artefact courant
7. Afficher notification succes/erreur
```

### Structure du Manifest

```yaml
guid: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
name: "SpiraXCapture"
caption: "SpiraX Capture"
summary: "Capture screenshots and attach to artifacts"
version: "1.0"

productSettings:
  - name: capture_quality
    settingTypeId: 1
    caption: "Qualite capture (0.1-1.0)"
    position: 1
    placeholder: "0.8"

  - name: capture_format
    settingTypeId: 1
    caption: "Format (png/jpeg)"
    position: 2
    placeholder: "png"

  - name: auto_timestamp
    settingTypeId: 10
    caption: "Ajouter timestamp au nom"
    position: 3

  - name: debug_mode
    settingTypeId: 10
    caption: "Mode debug"
    position: 4

pageContents:
  - pageId: 9
    name: "capture"
    code: "file://capture.js"
  - pageId: 10
    name: "capture"
    code: "file://capture.js"
  # ... autres pages

menus:
  - pageId: 9
    caption: "SXC"
    icon: "fa-solid fa-camera"
    isActive: true
    entries:
      - name: "captureScreen"
        caption: "Capturer Ecran"
        tooltip: "Capture l'ecran et l'attache a l'artefact"
        icon: "fa-solid fa-camera-retro"
        isActive: true
        actionTypeId: 2
        action: "captureScreen"
```

## Contraintes

- Utiliser les APIs SpiraApp documentees uniquement
- Pas de dependances externes (html2canvas peut etre inclus inline ou utiliser API native)
- Compatible SpiraPlan v7.0+
- Code JavaScript ES5 pour compatibilite navigateur

## Fichiers a Creer

1. `manifest.yaml` - Configuration SpiraApp
2. `capture.js` - Code principal
3. `README.md` - Documentation utilisateur
4. `SPEC.md` - Specifications techniques

## Verification

A chaque iteration:
1. Verifier la syntaxe YAML du manifest
2. Verifier la syntaxe JavaScript
3. S'assurer que toutes les pages ont leurs menus
4. Valider la structure des settings

## Notes Importantes

- Le GUID doit etre unique (different de RTI)
- Les positions des settings commencent a 1
- actionTypeId: 2 = appel fonction JavaScript
- Inclure les logs console pour debug
