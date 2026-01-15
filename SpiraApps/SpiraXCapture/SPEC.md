# SpiraXCapture - Specifications Techniques

> Version 2.0.0 - Reproduction fidele du comportement Helix ALM Web

## 1. Objectif

Reproduire fidelement le comportement de capture d'ecran de **Helix ALM Web Client** dans SpiraPlan via une SpiraApp.

---

## 2. Comportement Cible (Helix ALM Web)

### 2.1 Declenchement

| Methode | Action |
|---------|--------|
| Depuis RichText | Bouton "Insert Image" dans toolbar → "Capture Screen" |
| Depuis Attachments | Bouton "Capture Screen" dans zone Attachments |

### 2.2 Workflow

```text
1. Clic sur "Capture Screen"
2. Permission navigateur (Screen Capture API)
3. Selection source (ecran/fenetre/onglet)
4. Capture automatique
5. Dialog "Edit Image" s'ouvre
6. Edition optionnelle (annotations)
7. Dimensionnement (pixels/%)
8. Insertion dans champ RichText
```

### 2.3 Outils d'Edition

**Manipulation:**

- Selection (move, resize, delete)
- Crop
- Rotate Left/Right (90°)

**Dessin:**

- Free Draw (main levee)
- Line (ligne droite)
- Arrow (fleche)
- Rectangle
- Ellipse
- Triangle
- Text

**Options:**

- Couleurs (ligne, bordure, remplissage, texte)
- Epaisseur de ligne
- Police, taille, style du texte

**Actions:**

- Undo / Redo
- Reset (image originale)
- Zoom (slider + Ctrl+molette)

### 2.4 Insertion

- Dimensionnement: pixels ou pourcentage
- Option "Maintain aspect ratio"
- Insertion directe dans champ RichText

---

## 3. Solution Technique pour SpiraPlan

### 3.1 Injection du Bouton dans les Toolbars RichText

SpiraPlan utilise **Telerik RadEditor** comme editeur RichText. SpiraXCapture injecte un bouton "Capture Screen" directement dans la toolbar de CHAQUE editeur RichText present sur la page.

**Approche:**

1. Detection automatique des toolbars RadEditor via selecteurs CSS
2. Injection d'un bouton camera dans chaque toolbar
3. MutationObserver pour gerer les editeurs charges dynamiquement
4. Insertion via l'API RadEditor `pasteHtml()`

```javascript
// Selecteurs pour detecter les toolbars RichText
var TOOLBAR_SELECTORS = [
    '.reToolbar',           // Telerik RadEditor
    '.reToolbarWrapper',
    '.RadEditor .reToolCell'
].join(', ');

// Injection du bouton dans chaque toolbar
function injectCaptureButtons() {
    var toolbars = document.querySelectorAll(TOOLBAR_SELECTORS);
    toolbars.forEach(function(toolbar) {
        var btn = createCaptureButton(toolbar);
        toolbar.appendChild(btn);
    });
}

// Insertion dans l'editeur via RadEditor API
function insertHtmlToEditor(editorInfo, html) {
    editorInfo.instance.pasteHtml(html);  // API Telerik RadEditor
}
```

### 3.2 Champs RichText Disponibles

| Artefact | Champ | Nom API |
|----------|-------|---------|
| Requirement | Description | Description |
| Test Case | Description | Description |
| Incident | Description | Description |
| Task | Description | Description |
| Release | Description | Description |
| Test Set | Description | Description |

### 3.3 Workflow SpiraXCapture

```text
1. DECLENCHEMENT
   └── Bouton camera injecte dans toolbar RichText
   └── OU Menu SpiraApp "SXC > Capturer Ecran" (fallback)

2. CAPTURE
   └── Screen Capture API (getDisplayMedia)
   └── Selection ecran/fenetre/onglet

3. EDITION
   └── Dialog "Edit Image" s'ouvre
   └── Outils d'annotation disponibles

4. INSERTION
   └── Clic sur "Insert"
   └── Image convertie en base64
   └── Injection via updateFormField()
   └── Image inseree dans Description

5. SAUVEGARDE
   └── Optionnel: saveForm() automatique
   └── Ou: utilisateur clique "Save"
```

---

## 4. Architecture

### 4.1 Composants

```text
SpiraXCapture/
├── manifest.yaml          # Configuration SpiraApp
├── capture.js             # Module principal + editeur
├── fabric.min.js          # Bibliotheque Canvas (inline)
└── styles.css             # Styles du dialog (inline)
```

### 4.2 Technologies

| Composant | Technologie |
|-----------|-------------|
| Capture | Screen Capture API (getDisplayMedia) |
| Edition | HTML5 Canvas + Fabric.js |
| Dialog | HTML/CSS modal injecte dans DOM |
| Injection | spiraAppManager.updateFormField() |
| Upload | SpiraPlan REST API (attachments) |

---

## 5. Specifications Dialog "Edit Image"

### 5.1 Dimensions

- Taille par defaut: 900x700 px
- Redimensionnable: Oui
- Modal: Oui (overlay sombre)

### 5.2 Layout

```text
┌─────────────────────────────────────────────────────────┐
│ SpiraXCapture - Edit Image                        [X]   │
├─────────────────────────────────────────────────────────┤
│ [Toolbar]                                               │
│ ↖ │ ⬚ │ ↺ │ ↻ │ ✏ │ / │ → │ □ │ ○ │ △ │ T │ ↶ │ ↷ │ ⟲ │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                                                         │
│                    [Canvas Zone]                        │
│                                                         │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ [Options Panel]                                         │
│ Color: [■] Width: [2] Fill: [■] Font: [Arial] Size:[14] │
├─────────────────────────────────────────────────────────┤
│ Width: [____] px  Height: [____] px  [x] Keep ratio     │
│                                                         │
│              [Cancel]  [Attach Only]  [Insert]          │
└─────────────────────────────────────────────────────────┘
```

### 5.3 Toolbar - Boutons

| Icone | Nom | Fonction | Raccourci |
|-------|-----|----------|-----------|
| ↖ | Select | Selectionner/deplacer objets | V |
| ⬚ | Crop | Recadrer l'image | C |
| ↺ | Rotate Left | Rotation 90° anti-horaire | [ |
| ↻ | Rotate Right | Rotation 90° horaire | ] |
| ✏ | Free Draw | Dessin main levee | D |
| / | Line | Ligne droite | L |
| → | Arrow | Fleche | A |
| □ | Rectangle | Rectangle | R |
| ○ | Ellipse | Ellipse/cercle | E |
| △ | Triangle | Triangle | T |
| T | Text | Ajouter texte | X |
| ↶ | Undo | Annuler | Ctrl+Z |
| ↷ | Redo | Retablir | Ctrl+Y |
| ⟲ | Reset | Image originale | Ctrl+R |

### 5.4 Panel Options (contextuel)

**Pour Free Draw / Line:**

- Line Color: color picker
- Line Width: 1-10 px slider

**Pour Arrow:**

- Arrow Color: color picker
- Line Width: 1-10 px slider

**Pour Rectangle / Ellipse / Triangle:**

- Border Color: color picker
- Border Width: 0-10 px slider
- Fill Color: color picker + checkbox transparent

**Pour Text:**

- Font: dropdown (Arial, Helvetica, Verdana, Times, Courier)
- Size: 8-72 px slider
- Color: color picker
- Style: toggles Bold, Italic, Underline

### 5.5 Panel Dimensionnement

| Champ | Type | Description |
|-------|------|-------------|
| Width | number | Largeur en pixels |
| Height | number | Hauteur en pixels |
| Keep ratio | checkbox | Maintenir proportions (lie W et H) |

### 5.6 Boutons d'Action

| Bouton | Action |
|--------|--------|
| Cancel | Fermer sans rien faire |
| Attach Only | Attacher comme piece jointe uniquement |
| Insert | Inserer dans le champ RichText + attacher |

---

## 6. Implementation Technique

### 6.1 Injection du Dialog dans le DOM

```javascript
function createEditorDialog() {
    var overlay = document.createElement('div');
    overlay.id = 'sxc-overlay';
    overlay.innerHTML = EDITOR_HTML_TEMPLATE;
    document.body.appendChild(overlay);

    // Initialiser Fabric.js
    sxcCanvas = new fabric.Canvas('sxc-canvas');

    // Charger l'image capturee
    fabric.Image.fromURL(capturedDataUrl, function(img) {
        sxcCanvas.setBackgroundImage(img, sxcCanvas.renderAll.bind(sxcCanvas));
    });
}
```

### 6.2 Capture d'Ecran

```javascript
function captureScreen() {
    navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' }
    }).then(function(stream) {
        var video = document.createElement('video');
        video.srcObject = stream;
        video.onloadedmetadata = function() {
            video.play();
            setTimeout(function() {
                var canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext('2d').drawImage(video, 0, 0);
                stream.getTracks().forEach(t => t.stop());

                // Ouvrir l'editeur avec l'image
                openEditor(canvas.toDataURL('image/png'));
            }, 100);
        };
    });
}
```

### 6.3 Outils de Dessin (Fabric.js)

```javascript
// Selection
function setSelectMode() {
    sxcCanvas.isDrawingMode = false;
    sxcCanvas.selection = true;
}

// Free Draw
function setDrawMode() {
    sxcCanvas.isDrawingMode = true;
    sxcCanvas.freeDrawingBrush.color = currentColor;
    sxcCanvas.freeDrawingBrush.width = currentWidth;
}

// Rectangle
function addRectangle() {
    var rect = new fabric.Rect({
        left: 100, top: 100,
        width: 150, height: 100,
        fill: currentFill,
        stroke: currentBorderColor,
        strokeWidth: currentBorderWidth
    });
    sxcCanvas.add(rect);
    sxcCanvas.setActiveObject(rect);
}

// Arrow (ligne + triangle)
function addArrow() {
    var line = new fabric.Line([100, 100, 200, 100], {
        stroke: currentColor,
        strokeWidth: currentWidth
    });
    var triangle = new fabric.Triangle({
        left: 200, top: 100,
        width: 15, height: 20,
        fill: currentColor,
        angle: 90
    });
    var group = new fabric.Group([line, triangle]);
    sxcCanvas.add(group);
}

// Text
function addText() {
    var text = new fabric.IText('Text', {
        left: 100, top: 100,
        fontFamily: currentFont,
        fontSize: currentFontSize,
        fill: currentTextColor
    });
    sxcCanvas.add(text);
    sxcCanvas.setActiveObject(text);
}
```

### 6.4 Crop

```javascript
function cropImage() {
    // Creer zone de selection pour crop
    var cropRect = new fabric.Rect({
        left: 50, top: 50,
        width: 200, height: 150,
        fill: 'rgba(0,0,0,0.3)',
        stroke: '#fff',
        strokeWidth: 2,
        strokeDashArray: [5, 5]
    });
    sxcCanvas.add(cropRect);
    sxcCanvas.setActiveObject(cropRect);

    // Bouton pour appliquer le crop
    showCropConfirmButton();
}

function applyCrop(cropRect) {
    var cropped = sxcCanvas.toDataURL({
        left: cropRect.left,
        top: cropRect.top,
        width: cropRect.width * cropRect.scaleX,
        height: cropRect.height * cropRect.scaleY
    });
    // Recharger avec l'image croppee
    loadImageToCanvas(cropped);
}
```

### 6.5 Rotation

```javascript
function rotateLeft() {
    rotateCanvas(-90);
}

function rotateRight() {
    rotateCanvas(90);
}

function rotateCanvas(degrees) {
    var dataUrl = sxcCanvas.toDataURL();
    var img = new Image();
    img.onload = function() {
        // Creer nouveau canvas avec dimensions inversees si 90°
        var newCanvas = document.createElement('canvas');
        if (Math.abs(degrees) === 90) {
            newCanvas.width = img.height;
            newCanvas.height = img.width;
        } else {
            newCanvas.width = img.width;
            newCanvas.height = img.height;
        }
        var ctx = newCanvas.getContext('2d');
        ctx.translate(newCanvas.width/2, newCanvas.height/2);
        ctx.rotate(degrees * Math.PI / 180);
        ctx.drawImage(img, -img.width/2, -img.height/2);

        loadImageToCanvas(newCanvas.toDataURL());
    };
    img.src = dataUrl;
}
```

### 6.6 Undo/Redo

```javascript
var history = [];
var historyIndex = -1;

function saveState() {
    // Supprimer les etats futurs si on a fait undo
    history = history.slice(0, historyIndex + 1);
    history.push(JSON.stringify(sxcCanvas.toJSON()));
    historyIndex++;

    // Limiter l'historique a 50 etats
    if (history.length > 50) {
        history.shift();
        historyIndex--;
    }
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        sxcCanvas.loadFromJSON(history[historyIndex], function() {
            sxcCanvas.renderAll();
        });
    }
}

function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        sxcCanvas.loadFromJSON(history[historyIndex], function() {
            sxcCanvas.renderAll();
        });
    }
}

// Sauvegarder l'etat apres chaque modification
sxcCanvas.on('object:added', saveState);
sxcCanvas.on('object:modified', saveState);
sxcCanvas.on('object:removed', saveState);
```

### 6.7 Insertion dans RichText

```javascript
function insertIntoRichText() {
    // Obtenir l'image finale
    var finalDataUrl = sxcCanvas.toDataURL({
        format: sxcState.captureFormat,
        quality: sxcState.captureQuality
    });

    // Appliquer le redimensionnement si specifie
    var width = document.getElementById('sxc-width').value;
    var height = document.getElementById('sxc-height').value;

    var styleAttr = '';
    if (width) styleAttr += 'width:' + width + 'px;';
    if (height) styleAttr += 'height:' + height + 'px;';
    if (!styleAttr) styleAttr = 'max-width:100%;';

    // Construire le HTML de l'image
    var imageHtml = '<img src="' + finalDataUrl + '" alt="Capture" style="' + styleAttr + '" />';

    // Lire le contenu actuel du champ Description
    var currentContent = spiraAppManager.getDataItemField("Description", "textValue") || '';

    // Ajouter l'image au contenu
    var newContent = currentContent + '<br/>' + imageHtml;

    // Injecter dans le champ
    spiraAppManager.updateFormField("Description", "textValue", newContent);

    // Fermer l'editeur
    closeEditor();

    // Notifier l'utilisateur
    spiraAppManager.displaySuccessMessage("[SXC] Image inseree dans la description!");
}
```

### 6.8 Attachement Piece Jointe

```javascript
function attachToArtifact() {
    var finalDataUrl = sxcCanvas.toDataURL({
        format: sxcState.captureFormat,
        quality: sxcState.captureQuality
    });

    // Convertir data URL en base64 pur
    var base64Data = finalDataUrl.split(',')[1];

    // Generer nom de fichier
    var filename = generateFilename();

    // Calculer la taille approximative
    var size = Math.round(base64Data.length * 0.75);

    // Preparer les donnees
    var documentData = {
        FilenameOrUrl: filename,
        Description: "Capture d'ecran - " + new Date().toLocaleString(),
        BinaryData: base64Data,
        AttachmentTypeId: 1,
        Size: size
    };

    // Determiner l'endpoint
    var artifactType = spiraAppManager.artifactTypeId;
    var artifactId = spiraAppManager.artifactId;
    var projectId = spiraAppManager.projectId;

    var endpoints = {
        1: "requirements",
        2: "test-cases",
        3: "incidents",
        4: "releases",
        5: "test-sets",
        6: "tasks"
    };

    var url = "projects/" + projectId + "/" + endpoints[artifactType] + "/" + artifactId + "/documents";

    spiraAppManager.executeApi(
        "RestService.svc",
        "POST",
        url,
        JSON.stringify(documentData),
        function(response) {
            spiraAppManager.displaySuccessMessage("[SXC] Image attachee avec succes!");
        },
        function(status, error) {
            spiraAppManager.displayErrorMessage("[SXC] Erreur: " + error);
        }
    );
}
```

---

## 7. Settings Produit

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| capture_quality | String | "0.9" | Qualite JPEG (0.1-1.0) |
| capture_format | String | "png" | Format: png ou jpeg |
| auto_timestamp | Boolean | true | Timestamp dans nom fichier |
| default_width | String | "" | Largeur par defaut (vide = auto) |
| target_field | String | "Description" | Champ cible pour insertion |
| debug_mode | Boolean | false | Logs console |

---

## 8. Comparaison Helix ALM Web vs SpiraXCapture

| Fonctionnalite | Helix ALM Web | SpiraXCapture |
|----------------|---------------|---------------|
| Declenchement | Bouton dans toolbar RichText | **Bouton injecte dans toolbar RichText** |
| Capture Screen API | Oui | Oui |
| Dialog Edit Image | Natif | Custom (Fabric.js) |
| Outils Select/Move | Oui | Oui |
| Crop | Oui | Oui |
| Rotate L/R | Oui | Oui |
| Free Draw | Oui | Oui |
| Line | Oui | Oui |
| Arrow | Oui | Oui |
| Rectangle | Oui | Oui |
| Ellipse | Oui | Oui |
| Triangle | Oui | Oui |
| Text | Oui | Oui |
| Couleurs/Epaisseurs | Oui | Oui |
| Undo/Redo/Reset | Oui | Oui |
| Zoom | Oui | Oui |
| Dimensionnement px/% | Oui | Oui (px) |
| Keep aspect ratio | Oui | Oui |
| Insertion RichText | Oui | Oui (via updateFormField) |
| Attachement | Oui | Oui |

---

## 9. Plan d'Implementation

### Phase 1: Core (v1.0) - COMPLETE

- [x] Capture via Screen Capture API
- [x] Upload comme attachment
- [x] Menu dans toolbar page

### Phase 2: Editor (v2.0)

- [ ] Dialog Edit Image (HTML/CSS injecte)
- [ ] Integration Fabric.js
- [ ] Outils: Select, Crop, Rotate L/R
- [ ] Outils: Free Draw, Line, Arrow
- [ ] Outils: Rectangle, Ellipse, Triangle
- [ ] Outil: Text avec options
- [ ] Panel options contextuel
- [ ] Undo/Redo/Reset
- [ ] Zoom (slider)
- [ ] Dimensionnement avec Keep ratio
- [ ] Insertion via updateFormField()
- [ ] Raccourcis clavier

### Phase 3: Polish (v2.1)

- [ ] Sauvegarde preferences utilisateur
- [ ] Choix du champ cible (setting)
- [ ] Ameliorations UX
- [ ] Tests cross-browser

---

## 10. Dependances

| Bibliotheque | Version | Taille | Usage |
|--------------|---------|--------|-------|
| Fabric.js | 5.3.0 | ~300KB | Canvas manipulation |

Fabric.js sera inclus inline dans le code JavaScript pour eviter les dependances externes.

---

## 11. Compatibilite

### Navigateurs

| Navigateur | Screen Capture | Canvas | Fabric.js |
|------------|----------------|--------|-----------|
| Chrome 72+ | Oui | Oui | Oui |
| Firefox 66+ | Oui | Oui | Oui |
| Edge 79+ | Oui | Oui | Oui |
| Safari 13+ | Partiel | Oui | Oui |

### SpiraPlan

- Version minimale: 7.0
- API REST: v6.0

---

## 12. Sources

- [Helix ALM Web 2024.3 - Capturing Screens](https://help.perforce.com/helix-alm/helixalm/2024.3.0/web/Content/User/CapturingScreens.htm)
- [Helix ALM Web 2024.3 - Editing Images](https://help.perforce.com/helix-alm/helixalm/2024.3.0/web/Content/User/EditingImages.htm)
- [Fabric.js Documentation](http://fabricjs.com/docs/)
- [Screen Capture API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API)
- [SpiraApps API - updateFormField](Documentation interne)

---

*Specifications v2.0.0 - 2026-01-14*
*Objectif: Reproduction fidele de Helix ALM Web*
