# CapX Pro - Manuel Utilisateur

## Description

CapX Pro est une SpiraApp professionnelle de capture d'écran et d'annotation pour SpiraPlan. Elle permet de capturer des screenshots, de les annoter avec des outils avancés (dessin, formes, texte, filtres, recadrage, etc.) et de les insérer directement dans les champs RichText des artifacts SpiraPlan.

**Version:** 1.0
**Auteur:** SpiraApps Developer
**Licence:** MIT

---

## Fonctionnalités

- **Capture d'écran** : Capture de l'écran entier, d'une fenêtre ou d'un onglet
- **Éditeur d'image professionnel** : Basé sur TOAST UI Image Editor
- **Outils d'annotation** :
  - Dessin libre et lignes droites
  - Formes (rectangles, cercles, triangles)
  - Icônes et flèches
  - Texte avec personnalisation
  - Masques
  - Filtres (blur, sharpen, emboss, etc.)
  - Recadrage (crop)
  - Rotation et retournement (flip)
- **Insertion directe** : L'image éditée est insérée directement dans l'éditeur RichText
- **Copie dans le presse-papiers** : L'image est également copiée pour un collage manuel si nécessaire
- **Thèmes** : Light (défaut) ou Dark

---

## Installation

### Prérequis

- SpiraPlan v7.0 ou supérieur
- Droits administrateur sur SpiraPlan

### Étapes d'installation

1. Connectez-vous à SpiraPlan en tant qu'administrateur
2. Allez dans **Administration > System > SpiraApps**
3. Cliquez sur **Upload SpiraApp**
4. Sélectionnez le fichier `b2c3d4e5-f6a7-8901-bcde-f23456789012.spiraapp`
5. Cliquez sur **Upload**
6. Activez la SpiraApp en cochant la case **Active**
7. Cliquez sur **Save**

### Activation par produit

1. Allez dans **Administration > Product > SpiraApps**
2. Trouvez **CapX Pro** dans la liste
3. Cochez **Active** pour activer sur ce produit
4. Configurez les paramètres si nécessaire (voir section Configuration)

---

## Configuration

### Paramètres disponibles

| Paramètre | Description | Valeur par défaut |
|-----------|-------------|-------------------|
| **Capture Quality** | Qualité JPEG (0.1-1.0). Ignoré pour PNG. | 0.92 |
| **Format** | Format de sortie (png/jpeg) | png |
| **Add timestamp** | Ajouter un horodatage au nom de fichier | Activé |
| **Editor Theme** | Thème de l'éditeur (light/dark) | light |
| **Debug Mode** | Afficher les logs dans la console (F12) | Désactivé |

---

## Utilisation

### Méthode 1 : Via le menu CapX

1. Ouvrez une page de détail d'artifact (Requirement, Test Case, Incident, Task, Release, Test Set)
2. Cliquez sur le menu **CapX** dans la barre d'outils SpiraPlan
3. Sélectionnez **Capture Screen** ou **Capture Area**
4. Choisissez la source à capturer (écran, fenêtre, ou onglet)
5. L'éditeur s'ouvre avec l'image capturée

### Méthode 2 : Via le bouton dans la toolbar RichText

1. Localisez un champ RichText (Description, Notes, etc.)
2. Cliquez sur le bouton **caméra** dans la barre d'outils de l'éditeur
3. Choisissez la source à capturer
4. L'éditeur s'ouvre avec l'image capturée

### Utilisation de l'éditeur

#### Barre d'outils (à gauche)

| Icône | Fonction | Description |
|-------|----------|-------------|
| Crop | Recadrage | Sélectionnez une zone à conserver |
| Flip | Retournement | Retourner l'image horizontalement/verticalement |
| Rotate | Rotation | Faire pivoter l'image |
| Draw | Dessin | Dessiner à main levée ou en lignes droites |
| Shape | Formes | Ajouter rectangles, cercles, triangles |
| Icon | Icônes | Ajouter des flèches et symboles |
| Text | Texte | Ajouter du texte avec mise en forme |
| Mask | Masque | Appliquer un masque à partir d'une image |
| Filter | Filtres | Appliquer des effets (blur, sharpen, etc.) |

#### Options de dessin

- **Free** : Dessin libre à main levée
- **Straight** : Lignes droites
- **Color** : Couleur du trait
- **Range** : Épaisseur du trait

#### Options de forme

- Rectangle, Cercle, Triangle
- Couleur de remplissage
- Couleur et épaisseur du contour

#### Options de texte

- Police et taille
- Couleur
- Gras, Italique, Souligné
- Alignement (gauche, centre, droite)

#### Filtres disponibles

- Grayscale (niveaux de gris)
- Sepia
- Blur (flou)
- Sharpen (netteté)
- Emboss (relief)
- Invert (inverser les couleurs)
- Et plus...

### Finalisation

1. Une fois l'édition terminée, cliquez sur **Insert Image**
2. L'image est automatiquement :
   - Insérée dans le champ RichText actif
   - Copiée dans le presse-papiers
3. Si l'insertion automatique échoue, utilisez **Ctrl+V** pour coller manuellement
4. Pour annuler, cliquez sur **Cancel** ou appuyez sur **Échap**

---

## Pages supportées

CapX Pro est disponible sur les pages suivantes :

- **RequirementDetails** (Détail d'exigence)
- **TestCaseDetails** (Détail de cas de test)
- **TestSetDetails** (Détail de jeu de tests)
- **IncidentDetails** (Détail d'incident)
- **TaskDetails** (Détail de tâche)
- **ReleaseDetails** (Détail de release)

---

## Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| **Échap** | Fermer l'éditeur sans sauvegarder |
| **Ctrl+Z** | Annuler (dans l'éditeur) |
| **Ctrl+Y** | Rétablir (dans l'éditeur) |

---

## Dépannage

### L'éditeur ne s'ouvre pas

1. Vérifiez que la SpiraApp est activée (Administration > SpiraApps)
2. Vérifiez la console du navigateur (F12) pour les erreurs
3. Assurez-vous que le navigateur supporte l'API Screen Capture

### La capture échoue

- **Erreur "Screen Capture API not supported"** : Utilisez un navigateur moderne (Chrome, Edge, Firefox)
- **L'utilisateur a annulé** : Normale si vous avez cliqué "Annuler" dans le dialogue de partage

### L'image ne s'insère pas

1. L'image est copiée dans le presse-papiers - utilisez **Ctrl+V**
2. Vérifiez que le curseur est dans un champ RichText avant de coller
3. Activez le mode Debug pour voir les logs détaillés

### Les icônes ne s'affichent pas correctement

- Videz le cache du navigateur (Ctrl+Shift+R)
- Vérifiez que le CSS est bien chargé (console F12, onglet Network)

---

## Compatibilité navigateurs

| Navigateur | Version minimale | Support |
|------------|------------------|---------|
| Chrome | 72+ | Complet |
| Edge | 79+ | Complet |
| Firefox | 66+ | Complet |
| Safari | 13+ | Partiel* |

*Safari peut avoir des limitations avec l'API Screen Capture.

---

## Architecture technique

### Librairies embarquées

- **Fabric.js** : Manipulation du canvas
- **tui-code-snippet** : Utilitaires TOAST UI
- **tui-color-picker** : Sélecteur de couleur
- **tui-image-editor** : Éditeur d'image principal

### Structure des fichiers

```
CapX/
├── manifest.yaml          # Configuration SpiraApp
├── capx.js               # Code principal (librairies + application)
├── build-embedded.ps1    # Script de build
├── test.html             # Page de test standalone
├── libs/                 # Librairies sources
│   ├── fabric.min.js
│   ├── tui-code-snippet.min.js
│   ├── tui-color-picker.min.js
│   ├── tui-color-picker.min.css
│   ├── tui-image-editor.min.js
│   └── tui-image-editor.min.css
└── README.md             # Ce fichier
```

---

## Changelog

### Version 1.0 (Janvier 2026)

- Version initiale
- Capture d'écran via Screen Capture API
- Éditeur TOAST UI Image Editor intégré
- Support des thèmes Light et Dark
- Injection automatique dans les toolbars RichText
- Menu SpiraApp pour capture rapide

---

## Support

Pour signaler un bug ou demander une fonctionnalité :
- GitHub : https://github.com/spiraapps/capx

---

## Licence

MIT License - Copyright 2026 SpiraApps Developer
