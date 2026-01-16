# Ralph Wiggum Prompt - SpiraXCapture v2.0 Modernization

## Mission

Moderniser SpiraXCapture en ajoutant des fonctionnalites d'annotation avancees inspirees de Shottr, Snagit et CleanShot X.

## Criteres de Completion

Dites `<promise>COMPLETE</promise>` UNIQUEMENT quand TOUS ces criteres sont remplis:

1. [ ] Outil **Blur/Pixelate** fonctionnel (flouter zones sensibles)
2. [ ] Outil **Numerotation sequentielle** (badges 1, 2, 3...)
3. [ ] Outil **Spotlight** (surbrillance zone, assombrissement reste)
4. [ ] Outil **Highlight/Marker** (surligneur jaune semi-transparent)
5. [ ] **Toolbar modernisee** avec icones claires
6. [ ] **Raccourcis clavier** (B=blur, N=numero, H=highlight, S=spotlight)
7. [ ] `manifest.yaml` valide
8. [ ] `capture.js` sans erreurs de syntaxe
9. [ ] Package `.spiraapp` genere avec succes

## Specifications Techniques

### Nouveaux Outils a Implementer

```javascript
// BLUR TOOL (B)
// - Dessiner rectangle sur zone a flouter
// - Appliquer filtre blur CSS ou canvas pixelisation
// - Taille pixel configurable (8x8, 16x16, 32x32)

// STEP COUNTER TOOL (N)
// - Clic = ajouter badge numero
// - Cercle colore avec numero auto-incremente
// - Couleur configurable

// SPOTLIGHT TOOL (S)
// - Dessiner rectangle ou ellipse
// - Zone selectionnee = 100% opacite
// - Reste de l'image = overlay sombre 50%

// HIGHLIGHT TOOL (H)
// - Dessiner rectangle semi-transparent
// - Couleur jaune par defaut (#FFFF00, 40% opacite)
// - Comme un surligneur
```

### Structure Toolbar Modernisee

```
[Undo][Redo] | [Select][Arrow][Rect][Ellipse][Line][Text] | [Blur][Number][Spotlight][Highlight] | [Color][Size]
```

### Raccourcis Clavier

| Touche | Action |
|--------|--------|
| V | Select/Move |
| A | Arrow |
| R | Rectangle |
| E | Ellipse |
| L | Line |
| T | Text |
| B | Blur/Pixelate |
| N | Number/Step |
| S | Spotlight |
| H | Highlight |
| Z | Undo |
| Delete | Supprimer selection |

## Contraintes

- JavaScript ES5 (pas de const/let, pas de arrow functions)
- Pas de dependances externes (tout en inline)
- Compatible SpiraPlan v7.0+
- Code minifiable par spiraapp-package-generator

## Fichiers a Modifier

1. `capture.js` - Ajouter les nouveaux outils
2. `manifest.yaml` - Mettre a jour version si necessaire

## Verification a Chaque Iteration

1. Verifier syntaxe JavaScript (pas d'erreurs)
2. Tester que les outils existants fonctionnent toujours
3. S'assurer que les nouveaux outils sont accessibles dans la toolbar

## Notes

- Garder le code existant fonctionnel (ne pas casser ce qui marche)
- Ajouter des logs console pour debug ([SXC] prefix)
- Les annotations doivent etre sauvegardees avec couleur/style

## Etat Actuel

- Outils existants: Select, Arrow, Rectangle, Ellipse, Line, Text, Draw
- A ajouter: Blur, Number, Spotlight, Highlight
- Copie presse-papiers: Fonctionnelle
- Insertion editeur: En cours d'amelioration

Quand TOUS les criteres sont valides, repondez: `<promise>COMPLETE</promise>`
