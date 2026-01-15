# Helix ALM Web - Comportement Capture d'Ecran

> Documentation de reference basee sur Helix ALM Web Client 2024.3

## 1. Vue d'Ensemble

Helix ALM Web Client permet de capturer, editer et inserer des screenshots directement dans les champs RichText (multi-line text fields) des artefacts.

---

## 2. Declenchement

### 2.1 Depuis un champ RichText

1. Positionner le curseur dans le champ texte multi-ligne
2. Cliquer sur le bouton **Insert Image** dans la toolbar du champ
3. Choisir **Capture Screen**

### 2.2 Depuis les Attachments

| Type d'artefact | Emplacement |
|-----------------|-------------|
| Documents | Onglet Files |
| Requirements | Onglet Files |
| Test Cases | Onglet Files + Onglet Steps |
| Manual Test Runs | Onglet Files + Steps |
| Issues | Onglet Details > Zone Attachments |

---

## 3. Workflow Complet

```
1. DECLENCHEMENT
   └── Cliquer "Capture Screen" (bouton ou menu)

2. PERMISSION NAVIGATEUR
   └── Le navigateur demande l'autorisation de partage d'ecran
   └── Accorder l'acces

3. SELECTION DE LA SOURCE
   └── Ecran entier
   └── Fenetre d'application
   └── Onglet de navigateur

4. CAPTURE
   └── L'ecran selectionne est capture
   └── Le dialog "Edit Image" s'ouvre automatiquement

5. EDITION (optionnel)
   └── Utiliser les outils pour annoter
   └── Crop, fleches, formes, texte, etc.

6. DIMENSIONNEMENT
   └── Specifier largeur/hauteur (pixels ou %)
   └── Option "Maintain aspect ratio"

7. INSERTION
   └── Cliquer "Insert" ou "Attach"
   └── L'image est inseree dans le champ RichText
```

---

## 4. Dialog "Edit Image" - Outils Complets

### 4.1 Selection et Manipulation

| Outil | Fonction |
|-------|----------|
| **Selection** | Selectionner, deplacer, redimensionner, supprimer objets |
| **Crop** | Recadrer l'image |
| **Rotate Left** | Rotation 90° sens anti-horaire |
| **Rotate Right** | Rotation 90° sens horaire |

### 4.2 Outils de Dessin

| Outil | Fonction |
|-------|----------|
| **Free Draw** | Dessin a main levee |
| **Line** | Ligne droite |
| **Arrow** | Fleche (ligne avec pointe) |
| **Rectangle** | Rectangle |
| **Ellipse** | Ellipse / Cercle |
| **Triangle** | Triangle |
| **Text** | Ajouter du texte |

### 4.3 Options de Personnalisation

**Texte:**
- Police (font)
- Taille (size)
- Couleur (color)
- Style (gras, italique, etc.)

**Dessin (Free Draw, Line):**
- Epaisseur de ligne (line width)
- Couleur de ligne (line color)

**Formes (Rectangle, Ellipse, Triangle):**
- Epaisseur de bordure (border width)
- Couleur de bordure (border color)
- Couleur de remplissage (fill color)

**Fleches:**
- Couleur de fleche (arrow color)

### 4.4 Zoom et Navigation

| Action | Methode |
|--------|---------|
| Zoom | Slider de zoom |
| Zoom rapide | Ctrl + molette souris |

### 4.5 Actions

| Bouton | Fonction |
|--------|----------|
| **Undo** | Annuler derniere action |
| **Redo** | Retablir action annulee |
| **Reset** | Revenir a l'image originale |
| **Save** | Sauvegarder les modifications |

---

## 5. Insertion dans Champ RichText

### 5.1 Workflow d'insertion

```
1. Curseur positionne dans le champ texte
2. Cliquer bouton "Insert Image"
3. Dialog "Insert Image" s'ouvre
4. Capturer ou selectionner image
5. Editer si necessaire
6. Specifier dimensions:
   - Largeur (pixels ou %)
   - Hauteur (pixels ou %)
   - [x] Maintain aspect ratio
7. Cliquer "Insert"
```

### 5.2 Redimensionnement apres insertion

| Methode | Action |
|---------|--------|
| Glisser coins | Selectionner l'image, glisser un coin |
| Dimensions exactes | Selectionner > toolbar > "Edit Image/Diagram Size" |
| Pixels ou % | Entrer les valeurs numeriques |

### 5.3 Edition apres insertion

> **Important:** Les images peuvent etre editees AVANT la sauvegarde de l'item uniquement.

1. Selectionner l'image dans le champ
2. Cliquer sur le bouton d'edition dans la toolbar
3. Le dialog "Edit Image" s'ouvre
4. Modifier et sauvegarder

---

## 6. Gestion Multi-Images

Helix ALM Web gere **une image a la fois** par action de capture. Pour plusieurs images:

1. Capturer et inserer la premiere image
2. Positionner le curseur pour la suivante
3. Repeter le processus

---

## 7. Navigateurs Supportes

| Navigateur | Support Screen Capture |
|------------|----------------------|
| Chrome | Oui |
| Firefox | Oui |
| Edge (Chromium) | Oui |
| Edge 17-18 | Partiel (fenetre doit etre au premier plan) |
| Safari | Limite |

---

## 8. Limitations

1. **Edition limitee dans le temps:** Les images ne peuvent etre editees qu'avant la sauvegarde de l'item
2. **Renommage:** Les attachments ne peuvent etre renommes qu'avant sauvegarde
3. **Qualite:** Le redimensionnement dans le champ peut affecter la qualite (l'original est preserve dans le dialog Edit)
4. **Une image a la fois:** Pas de capture multiple simultanee

---

## 9. Cas d'Usage Typiques

### 9.1 Bug Report avec Screenshot

```
1. Reproduire le bug
2. Ouvrir l'Issue dans Helix ALM Web
3. Dans le champ Description, cliquer "Insert Image"
4. Capturer l'ecran montrant l'erreur
5. Ajouter une fleche pointant vers l'erreur
6. Ajouter du texte explicatif
7. Inserer dans la description
```

### 9.2 Documentation de Test Step

```
1. Ouvrir le Test Case
2. Aller a l'onglet Steps
3. Selectionner le step ou expected result
4. Capturer l'ecran du resultat attendu
5. Annoter si necessaire
6. Attacher au step
```

---

## 10. Sources

- [Helix ALM Web Client 2024.3 - Capturing Screens](https://help.perforce.com/helix-alm/helixalm/2024.3.0/web/Content/User/CapturingScreens.htm)
- [Helix ALM Web Client 2024.3 - Editing Images](https://help.perforce.com/helix-alm/helixalm/2024.3.0/web/Content/User/EditingImages.htm)
- [Helix ALM Web Client 2022.3 - Capturing Screens](https://help.perforce.com/helix-alm/helixalm/2022.3.0/web/Content/User/CapturingScreens.htm)

---

*Document de reference cree le 2026-01-14*
*Base sur la documentation officielle Perforce Helix ALM Web Client*
