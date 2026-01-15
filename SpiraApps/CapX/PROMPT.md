# Ralph Wiggum Prompt - CapX v1.0 Development

## Mission

Finaliser et perfectionner CapX, une SpiraApp professionnelle de capture d'écran basée sur tui.image-editor, en s'appuyant sur l'expérience de SpiraXCapture.

## Critères de Completion

Dites `<promise>COMPLETE</promise>` UNIQUEMENT quand TOUS ces critères sont remplis:

1. [ ] **tui.image-editor fonctionne** - Chargement CDN + initialisation OK
2. [ ] **Capture d'écran** via getDisplayMedia fonctionnelle
3. [ ] **Tous les outils tui** accessibles (crop, rotate, flip, draw, shapes, text, filter)
4. [ ] **Copie presse-papiers** fonctionnelle
5. [ ] **Insertion RichText** fonctionnelle (TinyMCE, CKEditor, contenteditable)
6. [ ] **Thème dark/light** configurable
7. [ ] **Outil Pixelate/Blur** personnalisé ajouté
8. [ ] `manifest.yaml` valide
9. [ ] `capx.js` sans erreurs de syntaxe (ES5 compatible)
10. [ ] Package `.spiraapp` généré avec succès

## Leçons de SpiraXCapture à Appliquer

### Ce qui a bien marché:
- Détection multiple des éditeurs RichText (TinyMCE, CKEditor, Quill, contenteditable)
- Système de logging avec préfixe `[CapX]`
- Notification toast pour feedback utilisateur
- Gestion des erreurs getDisplayMedia (NotAllowedError)
- Sauvegarder la référence à l'éditeur AVANT la capture

### Ce qui doit être amélioré:
- L'UI canvas basique → Remplacer par tui.image-editor (FAIT)
- Ajouter outil Pixelate/Blur (tui n'a que blur filter, pas pixelate)
- Meilleure gestion du focus fenêtre lors de la capture
- Support des raccourcis clavier dans l'éditeur

## Spécifications Techniques

### Chargement des Librairies (CDN)

```javascript
// Ordre de chargement important:
// 1. CSS d'abord (tui-color-picker.css, tui-image-editor.css)
// 2. fabric.js (dépendance)
// 3. tui-code-snippet.js
// 4. tui-color-picker.js
// 5. tui-image-editor.js (dernier)
```

### Configuration tui.image-editor

```javascript
new tui.ImageEditor(container, {
    includeUI: {
        loadImage: { path: dataUrl, name: 'Captured Image' },
        theme: darkTheme,  // ou lightTheme
        menu: ['crop', 'flip', 'rotate', 'draw', 'shape', 'icon', 'text', 'mask', 'filter'],
        initMenu: 'draw',
        menuBarPosition: 'bottom'
    },
    cssMaxWidth: window.innerWidth - 40,
    cssMaxHeight: window.innerHeight - 120,
    usageStatistics: false
});
```

### Outil Pixelate Personnalisé

tui.image-editor n'a pas de pixelate natif. Implémenter via:
1. Bouton custom dans l'UI
2. Export temporaire en canvas
3. Appliquer algorithme de pixelisation (comme dans SpiraXCapture)
4. Réimporter l'image modifiée

```javascript
function pixelateRegion(imageEditor, x, y, w, h, pixelSize) {
    // 1. Récupérer le canvas tui
    var canvas = imageEditor._graphics.getCanvas();
    var ctx = canvas.getContext('2d');

    // 2. Appliquer pixelisation sur la région
    var imageData = ctx.getImageData(x, y, w, h);
    // ... algorithme pixelisation ...
    ctx.putImageData(imageData, x, y);

    // 3. Rafraîchir l'éditeur
    imageEditor.loadImageFromURL(canvas.toDataURL(), 'pixelated');
}
```

### Export et Insertion

```javascript
// Export depuis tui.image-editor
var dataUrl = imageEditor.toDataURL({
    format: 'png',  // ou 'jpeg'
    quality: 0.92
});

// Insertion TinyMCE
editor.insertContent('<img src="' + dataUrl + '" />');

// Insertion CKEditor
editor.insertHtml('<img src="' + dataUrl + '" />');
```

## Contraintes

- JavaScript ES5 (pas de const/let, pas de arrow functions pour le code principal)
- CDN externe OK (tui.image-editor trop gros pour inline)
- Compatible SpiraPlan v7.0+
- Package final doit être < 500 KB (le JS principal, sans les CDN)

## Fichiers du Projet

```
CapX/
├── manifest.yaml     # Configuration SpiraApp
├── capx.js          # Code principal
├── PROMPT.md        # Ce fichier
└── ralph.bat        # Script d'automatisation
```

## Vérification à Chaque Itération

1. `node -c capx.js` - Pas d'erreurs de syntaxe
2. Vérifier que les URLs CDN sont valides
3. Tester la structure du manifest.yaml
4. S'assurer que les fonctions sont en ES5

## Améliorations Prioritaires

### Phase 1 - Fondations
- [x] Structure de base capx.js
- [x] Chargement CDN des librairies
- [ ] Vérifier syntaxe ES5 stricte
- [ ] Tester initialisation tui.image-editor

### Phase 2 - Fonctionnalités Core
- [ ] Capture d'écran complète
- [ ] Ouverture éditeur avec image capturée
- [ ] Export et copie presse-papiers
- [ ] Insertion dans éditeurs RichText

### Phase 3 - Personnalisation
- [ ] Outil Pixelate custom
- [ ] Thème dark/light fonctionnel
- [ ] Raccourcis clavier

### Phase 4 - Polish
- [ ] Messages d'erreur clairs
- [ ] Fallbacks gracieux
- [ ] Documentation inline

## Notes Importantes

- Ne PAS utiliser `const`, `let`, `=>` - ES5 seulement!
- Tester avec `node -c capx.js` avant chaque commit
- Les CDN peuvent être lents - ajouter timeout et retry
- L'ordre de chargement des scripts est CRITIQUE

## Génération du Package

```bash
cd ../spiraapp-package-generator
npm run build --input="../CapX"
move *.spiraapp ../CapX/
```

Quand TOUS les critères sont validés et le package généré, répondez: `<promise>COMPLETE</promise>`
