# Recherche Solutions - Injection Bouton Toolbar RichText SpiraPlan

## Problème à Résoudre

Injecter un bouton "Capture Screen" dans la toolbar de TOUS les champs RichText de SpiraPlan, comme le fait Helix ALM Web.

## Découverte Clé

**SpiraPlan utilise Telerik RadEditor** comme éditeur RichText (pas TinyMCE ou CKEditor).

---

## Solution 1: Injection via API Telerik RadEditor

### Accès à l'instance RadEditor

```javascript
// Telerik expose $find() pour accéder aux composants
var editor = $find("ctl00_cplMainContent_txtDescription");

// Ou chercher toutes les instances RadEditor
var editors = Telerik.Web.UI.RadEditor.get_editors();
```

### Ajout de commande custom

```javascript
// Définir une commande custom
Telerik.Web.UI.Editor.CommandList["CaptureScreen"] = function(commandName, editor, args) {
    // Déclencher la capture d'écran
    captureAndInsert(editor);
};

// Fonction de capture
function captureAndInsert(editor) {
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

                var dataUrl = canvas.toDataURL('image/png');
                var imgHtml = '<img src="' + dataUrl + '" style="max-width:100%;" />';

                // Insérer dans l'éditeur RadEditor
                editor.pasteHtml(imgHtml);
            }, 100);
        };
    });
}
```

### Problème

On ne peut pas ajouter un bouton à la toolbar d'un RadEditor déjà initialisé côté serveur sans accès au code ASP.NET.

---

## Solution 2: Injection DOM directe

### Détecter les toolbars RadEditor

```javascript
// Sélecteurs CSS pour RadEditor
var toolbars = document.querySelectorAll('.reToolbar, .RadEditor .reToolbar');

// Ou via la structure Telerik
var editorWrappers = document.querySelectorAll('.RadEditor');
```

### Injecter un bouton HTML

```javascript
function injectCaptureButton() {
    // Trouver toutes les toolbars RadEditor
    var toolbars = document.querySelectorAll('.reToolbar');

    toolbars.forEach(function(toolbar) {
        // Vérifier si le bouton existe déjà
        if (toolbar.querySelector('.sxc-capture-btn')) return;

        // Créer le bouton
        var btn = document.createElement('a');
        btn.className = 'reTool sxc-capture-btn';
        btn.title = 'Capture Screen';
        btn.innerHTML = '<span class="reToolIcon" style="background-image:url(data:image/svg+xml,...);"></span>';
        btn.href = 'javascript:void(0);';

        // Trouver l'éditeur associé
        var editorContainer = toolbar.closest('.RadEditor');
        var editorId = editorContainer ? editorContainer.id : null;

        btn.onclick = function(e) {
            e.preventDefault();
            var editor = editorId ? $find(editorId) : null;
            if (editor) {
                captureAndInsert(editor);
            }
        };

        // Insérer le bouton
        var firstGroup = toolbar.querySelector('.reToolbarWrapper');
        if (firstGroup) {
            firstGroup.appendChild(btn);
        }
    });
}
```

### Utiliser MutationObserver pour les éditeurs dynamiques

```javascript
// Observer les changements DOM pour détecter les nouveaux éditeurs
var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1) {
                if (node.classList && node.classList.contains('RadEditor')) {
                    setTimeout(injectCaptureButton, 500);
                }
                if (node.querySelectorAll) {
                    var editors = node.querySelectorAll('.RadEditor');
                    if (editors.length > 0) {
                        setTimeout(injectCaptureButton, 500);
                    }
                }
            }
        });
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
```

---

## Solution 3: Hook sur l'initialisation RadEditor

### Intercepter la création des éditeurs

```javascript
// Sauvegarder la fonction originale
var originalInit = Telerik.Web.UI.RadEditor.prototype.initialize;

// Remplacer par notre version
Telerik.Web.UI.RadEditor.prototype.initialize = function() {
    // Appeler l'original
    originalInit.apply(this, arguments);

    // Ajouter notre bouton après initialisation
    var self = this;
    setTimeout(function() {
        addCaptureButtonToEditor(self);
    }, 100);
};

function addCaptureButtonToEditor(editor) {
    var toolbar = editor.get_toolAdapter();
    // ... ajouter le bouton
}
```

---

## Solution 4: Utiliser l'API SpiraApps + DOM

### Approche hybride

1. SpiraApp charge le script sur toutes les pages
2. Le script détecte les RadEditors via DOM
3. Injecte un bouton dans chaque toolbar
4. Le bouton utilise l'API RadEditor pour insérer l'image

```javascript
// Dans capture.js (SpiraApp)

var SXC_INJECTED = false;

function initSXC() {
    if (SXC_INJECTED) return;

    // Attendre que Telerik soit chargé
    if (typeof Telerik === 'undefined' || !Telerik.Web || !Telerik.Web.UI) {
        setTimeout(initSXC, 500);
        return;
    }

    // Injecter les boutons
    injectCaptureButtons();

    // Observer pour les nouveaux éditeurs
    setupMutationObserver();

    SXC_INJECTED = true;
}

function injectCaptureButtons() {
    // Méthode 1: Via Telerik API
    var editors = Telerik.Web.UI.RadEditor.get_editors ?
                  Telerik.Web.UI.RadEditor.get_editors() : [];

    editors.forEach(function(editor) {
        addButtonToEditor(editor);
    });

    // Méthode 2: Via DOM si l'API ne fonctionne pas
    if (editors.length === 0) {
        injectButtonsViaDOM();
    }
}

function addButtonToEditor(editor) {
    // Créer l'outil custom
    var tool = new Telerik.Web.UI.EditorButton();
    tool.set_name("CaptureScreen");
    tool.set_text("Capture");

    // Définir la commande
    Telerik.Web.UI.Editor.CommandList["CaptureScreen"] = function(cmd, ed, args) {
        captureScreenAndInsert(ed);
    };
}

function injectButtonsViaDOM() {
    var toolbars = document.querySelectorAll('.reToolbar, .reToolbarWrapper');

    toolbars.forEach(function(toolbar) {
        if (toolbar.querySelector('[data-sxc-capture]')) return;

        var btn = createCaptureButton();

        // Trouver l'éditeur parent
        var editorEl = toolbar.closest('.RadEditor');
        if (editorEl) {
            btn.setAttribute('data-editor-id', editorEl.id);
        }

        // Insérer à la fin de la toolbar
        toolbar.appendChild(btn);
    });
}

function createCaptureButton() {
    var btn = document.createElement('a');
    btn.setAttribute('data-sxc-capture', 'true');
    btn.className = 'reTool';
    btn.href = 'javascript:void(0);';
    btn.title = 'Capture Screen (SXC)';
    btn.style.cssText = 'display:inline-block;width:26px;height:26px;cursor:pointer;';

    // Icône camera en SVG inline
    btn.innerHTML = '<span style="display:block;width:20px;height:20px;margin:3px;background:url(\'data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path fill=\"%23333\" d=\"M12 15.2c1.8 0 3.2-1.4 3.2-3.2S13.8 8.8 12 8.8 8.8 10.2 8.8 12s1.4 3.2 3.2 3.2zm7-9.2h-2.4l-1.4-1.6c-.2-.3-.6-.4-.9-.4H9.7c-.3 0-.7.1-.9.4L7.4 6H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z\"/></svg>\') center/contain no-repeat;"></span>';

    btn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();

        var editorId = btn.getAttribute('data-editor-id');
        var editor = editorId ? $find(editorId) : findNearestEditor(btn);

        if (editor && editor.pasteHtml) {
            captureScreenAndInsert(editor);
        } else {
            // Fallback: utiliser spiraAppManager
            captureScreenFallback();
        }
    };

    return btn;
}

function findNearestEditor(element) {
    var editorEl = element.closest('.RadEditor');
    if (!editorEl) return null;

    // Essayer différentes méthodes pour trouver l'instance
    if (typeof $find === 'function') {
        return $find(editorEl.id);
    }

    // Chercher via Telerik
    if (Telerik.Web.UI.RadEditor.get_editors) {
        var editors = Telerik.Web.UI.RadEditor.get_editors();
        for (var i = 0; i < editors.length; i++) {
            if (editors[i].get_element() === editorEl) {
                return editors[i];
            }
        }
    }

    return null;
}

function captureScreenAndInsert(editor) {
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

                stream.getTracks().forEach(function(track) {
                    track.stop();
                });

                var dataUrl = canvas.toDataURL('image/png');
                var imgHtml = '<img src="' + dataUrl + '" alt="Capture" style="max-width:100%;" />';

                // Insérer via RadEditor API
                editor.pasteHtml(imgHtml);

                // Notification
                if (typeof spiraAppManager !== 'undefined') {
                    spiraAppManager.displaySuccessMessage("[SXC] Image insérée!");
                }
            }, 100);
        };
    }).catch(function(err) {
        console.error('[SXC] Capture error:', err);
        if (typeof spiraAppManager !== 'undefined') {
            spiraAppManager.displayErrorMessage("[SXC] Erreur: " + err.message);
        }
    });
}

function setupMutationObserver() {
    var observer = new MutationObserver(function(mutations) {
        var shouldInject = false;

        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) {
                    if (node.classList && (
                        node.classList.contains('RadEditor') ||
                        node.classList.contains('reToolbar')
                    )) {
                        shouldInject = true;
                    }
                    if (node.querySelector && (
                        node.querySelector('.RadEditor') ||
                        node.querySelector('.reToolbar')
                    )) {
                        shouldInject = true;
                    }
                }
            });
        });

        if (shouldInject) {
            setTimeout(injectButtonsViaDOM, 300);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Lancer l'initialisation
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSXC);
} else {
    initSXC();
}
```

---

## Solution Retenue

**Solution 4 (Hybride)** est la plus robuste:

1. Fonctionne avec SpiraApps (chargement automatique sur les pages)
2. Détecte les RadEditors via l'API Telerik ET le DOM
3. Injecte un bouton visuellement cohérent dans la toolbar
4. Utilise l'API `editor.pasteHtml()` pour insérer directement dans l'éditeur
5. MutationObserver gère les éditeurs créés dynamiquement

---

## À Vérifier dans SpiraPlan

1. Structure exacte du DOM des toolbars RadEditor
2. ID/classes CSS utilisés
3. Disponibilité de `$find()` et `Telerik.Web.UI.RadEditor`
4. Format de l'ID des éditeurs (ex: `ctl00_cplMainContent_txtDescription`)

---

## Solution 5: Injection DOM Générique (Recommandée par Ralph)

Cette solution fonctionne avec N'IMPORTE QUEL éditeur RichText (TinyMCE, CKEditor, RadEditor, etc.)

### Principe

1. Détecter TOUTES les toolbars d'éditeur dans le DOM
2. Injecter un bouton HTML personnalisé
3. Trouver l'éditeur associé pour y insérer le contenu
4. MutationObserver pour les éditeurs dynamiques

### Code Universel

```javascript
(function() {
    'use strict';

    var SXC_INJECTED_CLASS = 'sxc-capture-injected';

    // Sélecteurs pour différents éditeurs
    var TOOLBAR_SELECTORS = [
        // Telerik RadEditor
        '.reToolbar',
        '.reToolbarWrapper',
        '.RadEditor .reToolCell',
        // TinyMCE 5/6
        '.tox-toolbar__primary',
        '.tox-toolbar',
        // TinyMCE 4
        '.mce-toolbar',
        '.mce-toolbar-grp',
        // CKEditor 4
        '.cke_top',
        '.cke_toolbox',
        // CKEditor 5
        '.ck-toolbar',
        // Générique
        '[role="toolbar"]'
    ].join(', ');

    // Sélecteurs pour trouver l'éditeur parent
    var EDITOR_SELECTORS = [
        '.RadEditor',
        '.tox-tinymce',
        '.mce-tinymce',
        '.cke',
        '.ck-editor'
    ].join(', ');

    function createCaptureButton() {
        var btn = document.createElement('button');
        btn.className = 'sxc-capture-btn';
        btn.setAttribute('type', 'button');
        btn.setAttribute('title', 'Capture Screen (SpiraXCapture)');
        btn.setAttribute('data-sxc', 'true');

        // Style universel
        btn.style.cssText = [
            'display: inline-flex',
            'align-items: center',
            'justify-content: center',
            'width: 28px',
            'height: 28px',
            'margin: 2px',
            'padding: 4px',
            'border: 1px solid #ccc',
            'border-radius: 4px',
            'background: linear-gradient(180deg, #fff 0%, #f0f0f0 100%)',
            'cursor: pointer',
            'vertical-align: middle'
        ].join(';');

        // Icône camera SVG
        btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>';

        // Hover effect
        btn.onmouseenter = function() {
            btn.style.background = 'linear-gradient(180deg, #e8f4fc 0%, #d0e8f8 100%)';
            btn.style.borderColor = '#0078d4';
        };
        btn.onmouseleave = function() {
            btn.style.background = 'linear-gradient(180deg, #fff 0%, #f0f0f0 100%)';
            btn.style.borderColor = '#ccc';
        };

        btn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            captureAndInsert(btn);
        };

        return btn;
    }

    function findEditorInstance(buttonElement) {
        var editorContainer = buttonElement.closest(EDITOR_SELECTORS);
        if (!editorContainer) return null;

        // Telerik RadEditor
        if (typeof $find === 'function' && editorContainer.id) {
            var radEditor = $find(editorContainer.id);
            if (radEditor && radEditor.pasteHtml) {
                return { type: 'radeditor', instance: radEditor };
            }
        }

        // TinyMCE
        if (typeof tinymce !== 'undefined') {
            var tmceId = editorContainer.querySelector('textarea')?.id;
            if (tmceId) {
                var tmce = tinymce.get(tmceId);
                if (tmce) return { type: 'tinymce', instance: tmce };
            }
            // Essayer avec l'éditeur actif
            if (tinymce.activeEditor) {
                return { type: 'tinymce', instance: tinymce.activeEditor };
            }
        }

        // CKEditor 4
        if (typeof CKEDITOR !== 'undefined' && CKEDITOR.instances) {
            var ckeId = editorContainer.querySelector('textarea')?.id;
            if (ckeId && CKEDITOR.instances[ckeId]) {
                return { type: 'ckeditor4', instance: CKEDITOR.instances[ckeId] };
            }
        }

        // Fallback: chercher un contenteditable
        var contentEditable = editorContainer.querySelector('[contenteditable="true"]');
        if (contentEditable) {
            return { type: 'contenteditable', instance: contentEditable };
        }

        return null;
    }

    function insertHtmlToEditor(editorInfo, html) {
        if (!editorInfo) return false;

        switch (editorInfo.type) {
            case 'radeditor':
                editorInfo.instance.pasteHtml(html);
                return true;

            case 'tinymce':
                editorInfo.instance.insertContent(html);
                return true;

            case 'ckeditor4':
                editorInfo.instance.insertHtml(html);
                return true;

            case 'contenteditable':
                document.execCommand('insertHTML', false, html);
                return true;

            default:
                return false;
        }
    }

    function captureAndInsert(buttonElement) {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
            alert('[SXC] Screen Capture API non supportée par ce navigateur');
            return;
        }

        navigator.mediaDevices.getDisplayMedia({
            video: { mediaSource: 'screen' }
        }).then(function(stream) {
            var video = document.createElement('video');
            video.srcObject = stream;

            video.onloadedmetadata = function() {
                video.play();

                setTimeout(function() {
                    // Créer canvas et capturer
                    var canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    canvas.getContext('2d').drawImage(video, 0, 0);

                    // Arrêter le stream
                    stream.getTracks().forEach(function(track) {
                        track.stop();
                    });

                    // Convertir en base64
                    var dataUrl = canvas.toDataURL('image/png');
                    var imgHtml = '<img src="' + dataUrl + '" alt="Screenshot" style="max-width:100%; border:1px solid #ddd; margin:5px 0;" />';

                    // Trouver l'éditeur et insérer
                    var editorInfo = findEditorInstance(buttonElement);
                    if (editorInfo) {
                        var success = insertHtmlToEditor(editorInfo, imgHtml);
                        if (success) {
                            showNotification('Image insérée avec succès!', 'success');
                        } else {
                            showNotification('Erreur lors de l\'insertion', 'error');
                        }
                    } else {
                        // Fallback: copier dans le presse-papiers
                        copyImageToClipboard(canvas);
                        showNotification('Image copiée! Collez avec Ctrl+V', 'info');
                    }
                }, 100);
            };
        }).catch(function(err) {
            console.error('[SXC] Capture error:', err);
            showNotification('Erreur: ' + err.message, 'error');
        });
    }

    function copyImageToClipboard(canvas) {
        canvas.toBlob(function(blob) {
            if (navigator.clipboard && navigator.clipboard.write) {
                navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]);
            }
        });
    }

    function showNotification(message, type) {
        // Utiliser l'API SpiraApps si disponible
        if (typeof spiraAppManager !== 'undefined') {
            if (type === 'success') {
                spiraAppManager.displaySuccessMessage('[SXC] ' + message);
            } else if (type === 'error') {
                spiraAppManager.displayErrorMessage('[SXC] ' + message);
            } else {
                spiraAppManager.displayWarningMessage('[SXC] ' + message);
            }
            return;
        }

        // Fallback: notification simple
        var notif = document.createElement('div');
        notif.style.cssText = [
            'position: fixed',
            'bottom: 20px',
            'right: 20px',
            'padding: 12px 20px',
            'background: ' + (type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : '#2196F3'),
            'color: white',
            'border-radius: 4px',
            'z-index: 999999',
            'font-family: sans-serif',
            'font-size: 14px',
            'box-shadow: 0 2px 10px rgba(0,0,0,0.2)'
        ].join(';');
        notif.textContent = message;
        document.body.appendChild(notif);

        setTimeout(function() {
            notif.remove();
        }, 3000);
    }

    function injectButtons() {
        var toolbars = document.querySelectorAll(TOOLBAR_SELECTORS);

        toolbars.forEach(function(toolbar) {
            // Éviter les doublons
            if (toolbar.querySelector('.sxc-capture-btn')) return;
            if (toolbar.classList.contains(SXC_INJECTED_CLASS)) return;

            // Marquer comme traité
            toolbar.classList.add(SXC_INJECTED_CLASS);

            // Créer et injecter le bouton
            var btn = createCaptureButton();

            // Trouver le meilleur endroit pour insérer
            var wrapper = toolbar.querySelector('.reToolbarWrapper, .tox-toolbar__group, .mce-btn-group, .cke_toolgroup, .ck-toolbar__items');
            if (wrapper) {
                wrapper.appendChild(btn);
            } else {
                toolbar.appendChild(btn);
            }

            console.log('[SXC] Bouton injecté dans toolbar:', toolbar);
        });
    }

    function setupObserver() {
        var observer = new MutationObserver(function(mutations) {
            var shouldInject = false;

            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) {
                            if (node.matches && node.matches(TOOLBAR_SELECTORS)) {
                                shouldInject = true;
                            }
                            if (node.querySelector && node.querySelector(TOOLBAR_SELECTORS)) {
                                shouldInject = true;
                            }
                        }
                    });
                }
            });

            if (shouldInject) {
                setTimeout(injectButtons, 300);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Initialisation
    function init() {
        console.log('[SXC] SpiraXCapture - Injection universelle');
        injectButtons();
        setupObserver();

        // Réessayer périodiquement pour les éditeurs chargés en retard
        setTimeout(injectButtons, 1000);
        setTimeout(injectButtons, 3000);
        setTimeout(injectButtons, 5000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
```

---

## Résumé des Solutions

| Solution | Éditeur | Avantage | Inconvénient |
|----------|---------|----------|--------------|
| 1. API Telerik | RadEditor | Officielle | Limité serveur |
| 2. DOM directe | RadEditor | Fonctionne | Peut casser |
| 3. Hook init | RadEditor | Propre | Complexe |
| 4. Hybride | RadEditor | Flexible | Code complexe |
| **5. Universelle** | **TOUS** | **Fonctionne partout** | **Maintenance** |

**Recommandation: Solution 5 (Universelle)** car elle fonctionne avec tous les éditeurs RichText sans connaître le type exact utilisé par SpiraPlan.

---

## Sources

- [Telerik RadEditor - Add Your Own Buttons](https://docs.telerik.com/devtools/aspnet-ajax/controls/editor/functionality/toolbars/buttons/add-your-own-buttons)
- [Telerik RadEditor Custom Tools Demo](https://demos.telerik.com/aspnet-ajax/editor/examples/customtools/defaultcs.aspx)
- [TinyMCE Custom Toolbar Buttons](https://www.tiny.cloud/docs/tinymce/latest/custom-toolbarbuttons/)
- [CKEditor Creating Basic Plugin](https://ckeditor.com/docs/ckeditor4/latest/guide/plugin_sdk_sample.html)

---

*Document créé le 2026-01-14*
*Méthode: Recherche Ralph Wiggum*
*Agents utilisés: TinyMCE, CKEditor, DOM manipulation, SpiraPlan structure*
