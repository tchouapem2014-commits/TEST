# NextEditor - TinyMCE Settings Reference

Ce document liste tous les paramètres TinyMCE configurables via les productSettings de la SpiraApp NextEditor.

## Vue d'ensemble des catégories

| Catégorie | Description |
|-----------|-------------|
| **General** | Activation, mode, debug |
| **Editor Size** | Dimensions de l'éditeur |
| **UI & Toolbar** | Barre d'outils, menus, apparence |
| **Table** | Options des tableaux |
| **Content** | Police, styles, formatage |
| **Images** | Options d'insertion d'images |
| **Links** | Options des liens |
| **Lists** | Options des listes |
| **Plugins** | Activation des plugins |

---

## 1. GENERAL SETTINGS

| Setting | Type | Default | TinyMCE Option | Description |
|---------|------|---------|----------------|-------------|
| `enable_tinymce` | Boolean | `true` | - | Activer le remplacement de RadEditor par TinyMCE |
| `activation_mode` | String | `auto` | - | `auto` = remplacement automatique, `manual` = bouton toggle |
| `allow_toggle` | Boolean | `false` | - | Permettre de basculer entre TinyMCE et RadEditor |
| `debug_mode` | Boolean | `false` | - | Afficher les logs dans la console (F12) |
| `readonly` | Boolean | `false` | `readonly` | Mode lecture seule |
| `disabled` | Boolean | `false` | `disabled` | Désactiver toutes les interactions |
| `placeholder` | String | `""` | `placeholder` | Texte affiché quand l'éditeur est vide |
| `auto_focus` | Boolean | `false` | `auto_focus` | Focus automatique au chargement |

---

## 2. EDITOR SIZE SETTINGS

| Setting | Type | Default | TinyMCE Option | Description |
|---------|------|---------|----------------|-------------|
| `editor_height` | Number | `400` | `height` | Hauteur de l'éditeur en pixels |
| `editor_width` | String | `""` | `width` | Largeur (ex: `100%`, `800px`) |
| `min_height` | Number | `100` | `min_height` | Hauteur minimale en pixels |
| `max_height` | Number | `0` | `max_height` | Hauteur maximale (0 = illimitée) |
| `min_width` | Number | `0` | `min_width` | Largeur minimale en pixels |
| `max_width` | Number | `0` | `max_width` | Largeur maximale (0 = illimitée) |
| `resize` | String | `true` | `resize` | Redimensionnement: `true`, `false`, `both` |

---

## 3. UI & TOOLBAR SETTINGS

### 3.1 Menubar

| Setting | Type | Default | TinyMCE Option | Description |
|---------|------|---------|----------------|-------------|
| `show_menubar` | Boolean | `true` | `menubar` | Afficher la barre de menu |
| `menubar_items` | String | `""` | `menubar` | Menus à afficher: `file edit view insert format tools table help` |
| `removed_menuitems` | String | `""` | `removed_menuitems` | Items de menu à masquer |

### 3.2 Toolbar

| Setting | Type | Default | TinyMCE Option | Description |
|---------|------|---------|----------------|-------------|
| `toolbar_config` | String | `standard` | - | Preset: `minimal`, `standard`, `full`, `custom` |
| `custom_toolbar` | String | `""` | `toolbar` | Toolbar personnalisée (si `toolbar_config=custom`) |
| `toolbar_mode` | String | `floating` | `toolbar_mode` | Mode: `floating`, `sliding`, `scrolling`, `wrap` |
| `toolbar_location` | String | `auto` | `toolbar_location` | Position: `auto`, `top`, `bottom` |
| `toolbar_sticky` | Boolean | `false` | `toolbar_sticky` | Toolbar fixe lors du scroll |
| `toolbar_sticky_offset` | Number | `0` | `toolbar_sticky_offset` | Décalage en pixels pour toolbar sticky |

### 3.3 Statusbar

| Setting | Type | Default | TinyMCE Option | Description |
|---------|------|---------|----------------|-------------|
| `show_statusbar` | Boolean | `true` | `statusbar` | Afficher la barre de statut |
| `show_branding` | Boolean | `false` | `branding` | Afficher "Powered by TinyMCE" |
| `show_wordcount` | Boolean | `true` | - | Afficher le compteur de mots |
| `show_path` | Boolean | `true` | `elementpath` | Afficher le chemin des éléments |

### 3.4 Context Menu

| Setting | Type | Default | TinyMCE Option | Description |
|---------|------|---------|----------------|-------------|
| `contextmenu` | String | `link image table` | `contextmenu` | Items du menu contextuel |
| `contextmenu_never_use_native` | Boolean | `false` | `contextmenu_never_use_native` | Désactiver le menu natif du navigateur |

### 3.5 Skin & Theme

| Setting | Type | Default | TinyMCE Option | Description |
|---------|------|---------|----------------|-------------|
| `editor_skin` | String | `oxide` | `skin` | Thème: `oxide`, `oxide-dark` |
| `highlight_on_focus` | Boolean | `true` | `highlight_on_focus` | Bordure bleue au focus |
| `promotion` | Boolean | `false` | `promotion` | Afficher les promotions TinyMCE |

---

## 4. TABLE SETTINGS

### 4.1 Table Insertion Defaults

| Setting | Type | Default | TinyMCE Option | Description |
|---------|------|---------|----------------|-------------|
| `table_default_border` | Number | `1` | `table_default_attributes.border` | Bordure par défaut |
| `table_default_cellpadding` | Number | `5` | `table_default_attributes.cellpadding` | Padding des cellules |
| `table_default_cellspacing` | Number | `0` | `table_default_attributes.cellspacing` | Espacement des cellules |
| `table_default_styles` | String | `border-collapse: collapse; width: 100%;` | `table_default_styles` | Styles CSS par défaut |

### 4.2 Table Resizing

| Setting | Type | Default | TinyMCE Option | Description |
|---------|------|---------|----------------|-------------|
| `table_column_resizing` | Boolean | `true` | `table_column_resizing` | Activer le redimensionnement des colonnes |
| `table_resize_bars` | Boolean | `true` | `table_resize_bars` | Afficher les barres de redimensionnement |
| `table_sizing_mode` | String | `auto` | `table_sizing_mode` | Mode: `auto`, `fixed`, `relative`, `responsive` |

### 4.3 Table Dialogs

| Setting | Type | Default | TinyMCE Option | Description |
|---------|------|---------|----------------|-------------|
| `table_advtab` | Boolean | `true` | `table_advtab` | Onglet avancé dans propriétés tableau |
| `table_cell_advtab` | Boolean | `true` | `table_cell_advtab` | Onglet avancé dans propriétés cellule |
| `table_row_advtab` | Boolean | `true` | `table_row_advtab` | Onglet avancé dans propriétés ligne |
| `table_appearance_options` | Boolean | `true` | `table_appearance_options` | Options d'apparence dans le dialogue |

### 4.4 Table Behavior

| Setting | Type | Default | TinyMCE Option | Description |
|---------|------|---------|----------------|-------------|
| `table_use_colgroups` | Boolean | `true` | `table_use_colgroups` | Utiliser `<colgroup>` pour les largeurs |
| `table_tab_navigation` | Boolean | `true` | `table_tab_navigation` | Navigation Tab entre cellules |
| `table_header_type` | String | `section` | `table_header_type` | Type d'en-tête: `section`, `cells`, `sectionCells`, `auto` |

### 4.5 Table Toolbar

| Setting | Type | Default | TinyMCE Option | Description |
|---------|------|---------|----------------|-------------|
| `table_toolbar` | String | *(voir défaut)* | `table_toolbar` | Boutons de la toolbar contextuelle tableau |

**Défaut table_toolbar:**
```
tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol | tablemergecells tablesplitcells
```

---

## 5. CONTENT SETTINGS

### 5.1 Font & Typography

| Setting | Type | Default | TinyMCE Option | Description |
|---------|------|---------|----------------|-------------|
| `content_font_family` | String | `-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif` | `content_style` | Police par défaut |
| `content_font_size` | String | `14px` | `content_style` | Taille de police par défaut |
| `font_family_formats` | String | *(voir défaut)* | `font_family_formats` | Polices disponibles dans le menu |
| `font_size_formats` | String | `8pt 10pt 12pt 14pt 16pt 18pt 24pt 36pt 48pt` | `font_size_formats` | Tailles disponibles dans le menu |
| `line_height_formats` | String | `1 1.2 1.4 1.6 2` | `line_height_formats` | Interlignes disponibles |

**Défaut font_family_formats:**
```
Andale Mono=andale mono,times; Arial=arial,helvetica,sans-serif; Arial Black=arial black,avant garde; Book Antiqua=book antiqua,palatino; Comic Sans MS=comic sans ms,sans-serif; Courier New=courier new,courier; Georgia=georgia,palatino; Helvetica=helvetica; Impact=impact,chicago; Symbol=symbol; Tahoma=tahoma,arial,helvetica,sans-serif; Terminal=terminal,monaco; Times New Roman=times new roman,times; Trebuchet MS=trebuchet ms,geneva; Verdana=verdana,geneva; Webdings=webdings; Wingdings=wingdings,zapf dingbats
```

### 5.2 Content Appearance

| Setting | Type | Default | TinyMCE Option | Description |
|---------|------|---------|----------------|-------------|
| `visual` | Boolean | `true` | `visual` | Afficher les aides visuelles (bordures tableaux, ancres) |
| `visual_table_class` | String | `""` | `visual_table_class` | Classe CSS pour tables sans bordure |
| `visual_anchor_class` | String | `""` | `visual_anchor_class` | Classe CSS pour les ancres |
| `content_style` | String | `""` | `content_style` | CSS personnalisé pour le contenu |

### 5.3 Formatting Options

| Setting | Type | Default | TinyMCE Option | Description |
|---------|------|---------|----------------|-------------|
| `block_formats` | String | `Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6; Preformatted=pre` | `block_formats` | Formats de blocs disponibles |
| `style_formats` | String | `""` | `style_formats` | Formats de style personnalisés (JSON) |
| `indentation` | String | `40px` | `indentation` | Taille de l'indentation |
| `indent_use_margin` | Boolean | `false` | `indent_use_margin` | Utiliser margin au lieu de padding |

### 5.4 Paste & Cleanup

| Setting | Type | Default | TinyMCE Option | Description |
|---------|------|---------|----------------|-------------|
| `paste_as_text` | Boolean | `false` | `paste_as_text` | Coller en texte brut par défaut |
| `paste_merge_formats` | Boolean | `true` | `paste_merge_formats` | Fusionner les formats similaires |
| `paste_tab_spaces` | Number | `4` | `paste_tab_spaces` | Espaces par tabulation au collage |
| `paste_block_drop` | Boolean | `false` | `paste_block_drop` | Bloquer le drop de fichiers |
| `smart_paste` | Boolean | `true` | `smart_paste` | Collage intelligent (liens, embeds) |

### 5.5 Spell Check

| Setting | Type | Default | TinyMCE Option | Description |
|---------|------|---------|----------------|-------------|
| `browser_spellcheck` | Boolean | `false` | `browser_spellcheck` | Utiliser le correcteur du navigateur |

---

## 6. IMAGE SETTINGS

| Setting | Type | Default | TinyMCE Option | Description |
|---------|------|---------|----------------|-------------|
| `allow_images` | Boolean | `true` | - | Activer l'insertion d'images |
| `image_advtab` | Boolean | `false` | `image_advtab` | Onglet avancé dans dialogue image |
| `image_caption` | Boolean | `false` | `image_caption` | Activer les légendes (figure/figcaption) |
| `image_description` | Boolean | `true` | `image_description` | Champ description (alt) |
| `image_dimensions` | Boolean | `true` | `image_dimensions` | Champs largeur/hauteur |
| `image_title` | Boolean | `false` | `image_title` | Champ title |
| `image_class_list` | String | `""` | `image_class_list` | Classes CSS disponibles (JSON array) |
| `resize_img_proportional` | Boolean | `true` | `resize_img_proportional` | Conserver les proportions au redimensionnement |
| `object_resizing` | String | `table,img` | `object_resizing` | Éléments redimensionnables |

---

## 7. LINK SETTINGS

| Setting | Type | Default | TinyMCE Option | Description |
|---------|------|---------|----------------|-------------|
| `allow_links` | Boolean | `true` | - | Activer l'insertion de liens |
| `link_default_target` | String | `""` | `link_default_target` | Target par défaut (`_blank`, `_self`, etc.) |
| `link_default_protocol` | String | `https` | `link_default_protocol` | Protocole par défaut |
| `link_assume_external_targets` | String | `false` | `link_assume_external_targets` | Préfixer automatiquement le protocole |
| `link_title` | Boolean | `true` | `link_title` | Champ title dans dialogue |
| `link_context_toolbar` | Boolean | `false` | `link_context_toolbar` | Toolbar contextuelle pour liens |
| `link_quicklink` | Boolean | `false` | `link_quicklink` | CTRL+K ouvre toolbar au lieu du dialogue |
| `link_class_list` | String | `""` | `link_class_list` | Classes CSS disponibles (JSON array) |
| `link_rel_list` | String | `""` | `link_rel_list` | Valeurs rel disponibles (JSON array) |
| `link_target_list` | String | `""` | `link_target_list` | Valeurs target disponibles (JSON array) |

---

## 8. LIST SETTINGS

| Setting | Type | Default | TinyMCE Option | Description |
|---------|------|---------|----------------|-------------|
| `lists_indent_on_tab` | Boolean | `true` | `lists_indent_on_tab` | Indenter avec Tab |

---

## 9. PLUGIN SETTINGS

### 9.1 Core Plugins (toujours chargés)

- `advlist` - Listes avancées
- `autolink` - Détection automatique des liens
- `lists` - Listes à puces et numérotées
- `table` - Support des tableaux

### 9.2 Optional Plugins

| Setting | Type | Default | Plugin | Description |
|---------|------|---------|--------|-------------|
| `plugin_fullscreen` | Boolean | `true` | `fullscreen` | Mode plein écran |
| `plugin_searchreplace` | Boolean | `true` | `searchreplace` | Rechercher/Remplacer |
| `plugin_wordcount` | Boolean | `true` | `wordcount` | Compteur de mots |
| `plugin_charmap` | Boolean | `true` | `charmap` | Caractères spéciaux |
| `plugin_code` | Boolean | `true` | `code` | Vue code source HTML |
| `plugin_link` | Boolean | `true` | `link` | Insertion de liens |
| `plugin_image` | Boolean | `true` | `image` | Insertion d'images |
| `plugin_anchor` | Boolean | `false` | `anchor` | Ancres/signets |
| `plugin_visualblocks` | Boolean | `false` | `visualblocks` | Afficher les blocs |
| `plugin_visualchars` | Boolean | `false` | `visualchars` | Afficher caractères invisibles |
| `plugin_preview` | Boolean | `false` | `preview` | Aperçu avant impression |
| `plugin_insertdatetime` | Boolean | `false` | `insertdatetime` | Insérer date/heure |
| `plugin_nonbreaking` | Boolean | `false` | `nonbreaking` | Espace insécable |
| `plugin_pagebreak` | Boolean | `false` | `pagebreak` | Saut de page |
| `plugin_quickbars` | Boolean | `false` | `quickbars` | Toolbars contextuelles rapides |
| `plugin_emoticons` | Boolean | `false` | `emoticons` | Emojis |
| `plugin_autoresize` | Boolean | `false` | `autoresize` | Redimensionnement auto |
| `plugin_autosave` | Boolean | `false` | `autosave` | Sauvegarde automatique |

---

## 10. TOOLBAR BUTTONS REFERENCE

### 10.1 Formatting Buttons

| Button | Description |
|--------|-------------|
| `bold` | Gras |
| `italic` | Italique |
| `underline` | Souligné |
| `strikethrough` | Barré |
| `subscript` | Indice |
| `superscript` | Exposant |
| `forecolor` | Couleur du texte |
| `backcolor` | Couleur de fond |
| `removeformat` | Supprimer le formatage |

### 10.2 Alignment Buttons

| Button | Description |
|--------|-------------|
| `alignleft` | Aligner à gauche |
| `aligncenter` | Centrer |
| `alignright` | Aligner à droite |
| `alignjustify` | Justifier |

### 10.3 List Buttons

| Button | Description |
|--------|-------------|
| `bullist` | Liste à puces |
| `numlist` | Liste numérotée |
| `outdent` | Désindenter |
| `indent` | Indenter |

### 10.4 Table Buttons

| Button | Description |
|--------|-------------|
| `table` | Insérer tableau |
| `tabledelete` | Supprimer tableau |
| `tableprops` | Propriétés tableau |
| `tablerowprops` | Propriétés ligne |
| `tablecellprops` | Propriétés cellule |
| `tableinsertrowbefore` | Insérer ligne avant |
| `tableinsertrowafter` | Insérer ligne après |
| `tabledeleterow` | Supprimer ligne |
| `tableinsertcolbefore` | Insérer colonne avant |
| `tableinsertcolafter` | Insérer colonne après |
| `tabledeletecol` | Supprimer colonne |
| `tablemergecells` | Fusionner cellules |
| `tablesplitcells` | Diviser cellules |

### 10.5 Other Buttons

| Button | Description |
|--------|-------------|
| `undo` | Annuler |
| `redo` | Rétablir |
| `link` | Insérer lien |
| `unlink` | Supprimer lien |
| `image` | Insérer image |
| `code` | Code source HTML |
| `fullscreen` | Plein écran |
| `searchreplace` | Rechercher/Remplacer |
| `charmap` | Caractères spéciaux |
| `hr` | Ligne horizontale |
| `blockquote` | Citation |
| `blocks` | Format de bloc (dropdown) |
| `fontfamily` | Police (dropdown) |
| `fontsize` | Taille (dropdown) |
| `lineheight` | Interligne (dropdown) |
| `copy` | Copier |
| `cut` | Couper |
| `paste` | Coller |
| `pastetext` | Coller en texte |
| `selectall` | Tout sélectionner |
| `print` | Imprimer |

---

## 11. TOOLBAR PRESETS

### 11.1 Minimal

```
undo redo | bold italic | bullist numlist
```

### 11.2 Standard

```
undo redo | blocks | bold italic underline strikethrough | bullist numlist | table | link image | code fullscreen
```

### 11.3 Full

```
undo redo | blocks fontfamily fontsize | bold italic underline strikethrough forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | table tabledelete | tableprops tablerowprops tablecellprops | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol | tablemergecells tablesplitcells | link image | code fullscreen searchreplace charmap | removeformat
```

---

## 12. MENU ITEMS REFERENCE

### 12.1 File Menu

| Item | Description |
|------|-------------|
| `newdocument` | Nouveau document |
| `preview` | Aperçu |
| `print` | Imprimer |

### 12.2 Edit Menu

| Item | Description |
|------|-------------|
| `undo` | Annuler |
| `redo` | Rétablir |
| `cut` | Couper |
| `copy` | Copier |
| `paste` | Coller |
| `pastetext` | Coller en texte |
| `selectall` | Tout sélectionner |
| `searchreplace` | Rechercher/Remplacer |

### 12.3 View Menu

| Item | Description |
|------|-------------|
| `code` | Code source |
| `visualaid` | Aides visuelles |
| `visualblocks` | Blocs visuels |
| `visualchars` | Caractères invisibles |
| `fullscreen` | Plein écran |

### 12.4 Insert Menu

| Item | Description |
|------|-------------|
| `image` | Image |
| `link` | Lien |
| `anchor` | Ancre |
| `charmap` | Caractère spécial |
| `hr` | Ligne horizontale |
| `insertdatetime` | Date/heure |
| `nonbreaking` | Espace insécable |
| `pagebreak` | Saut de page |

### 12.5 Format Menu

| Item | Description |
|------|-------------|
| `bold` | Gras |
| `italic` | Italique |
| `underline` | Souligné |
| `strikethrough` | Barré |
| `subscript` | Indice |
| `superscript` | Exposant |
| `forecolor` | Couleur texte |
| `backcolor` | Couleur fond |
| `formats` | Formats |
| `blocks` | Blocs |
| `fontfamily` | Police |
| `fontsize` | Taille |
| `align` | Alignement |
| `lineheight` | Interligne |
| `removeformat` | Supprimer formatage |

### 12.6 Table Menu

| Item | Description |
|------|-------------|
| `inserttable` | Insérer tableau |
| `tableprops` | Propriétés tableau |
| `deletetable` | Supprimer tableau |
| `cell` | Cellule |
| `row` | Ligne |
| `column` | Colonne |

### 12.7 Tools Menu

| Item | Description |
|------|-------------|
| `wordcount` | Compteur de mots |
| `code` | Code source |

---

*Document généré pour NextEditor v1.0*
*Basé sur TinyMCE v6.x*
