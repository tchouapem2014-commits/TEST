/**
 * SPIRAXCAPTURE (SXC)
 * Version 2.0.0
 *
 * Capture d'ecran avec edition et insertion dans les champs RichText
 * Reproduit le comportement de Helix ALM Web
 *
 * Fonctionnalites:
 * - Injection bouton capture dans TOUTES les toolbars RichText
 * - Editeur d'image integre (crop, fleches, formes, texte)
 * - Insertion directe dans le champ RichText
 * - Upload en piece jointe (optionnel)
 */

(function() {
    'use strict';

    // ============================================================
    // CONSTANTES
    // ============================================================
    var SXC_VERSION = "2.0.0";
    var SXC_PREFIX = "[SXC]";
    var SXC_GUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
    var SXC_INJECTED_CLASS = 'sxc-capture-injected';

    // Selecteurs pour detecter les toolbars d'editeurs RichText
    var TOOLBAR_SELECTORS = [
        // Telerik RadEditor (utilise par SpiraPlan)
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
        // Generique
        '[role="toolbar"]'
    ].join(', ');

    // Selecteurs pour trouver l'editeur parent
    var EDITOR_SELECTORS = [
        '.RadEditor',
        '.tox-tinymce',
        '.mce-tinymce',
        '.cke',
        '.ck-editor'
    ].join(', ');

    // ============================================================
    // ETAT GLOBAL
    // ============================================================
    var sxcState = {
        settings: null,
        debugMode: false,
        captureQuality: 0.9,
        captureFormat: "png",
        autoTimestamp: true,
        currentEditor: null,
        editorDialog: null,
        fabricCanvas: null,
        capturedImage: null,
        selectedTool: 'select'
    };

    // ============================================================
    // LOGGING
    // ============================================================
    function sxcLog(level, message, data) {
        if (!sxcState.debugMode && level !== "ERROR") return;
        var prefix = SXC_PREFIX + " [" + level + "]";
        if (data !== undefined) {
            console.log(prefix, message, data);
        } else {
            console.log(prefix, message);
        }
    }

    // ============================================================
    // INITIALISATION
    // ============================================================
    console.log(SXC_PREFIX + " SpiraXCapture v" + SXC_VERSION + " - Loading...");

    function init() {
        console.log(SXC_PREFIX + " Initializing...");

        // Charger les settings si disponibles
        loadSettings();

        // Injecter les boutons dans les toolbars existantes
        injectCaptureButtons();

        // Observer les nouveaux editeurs (charges dynamiquement)
        setupMutationObserver();

        // Reinjecter periodiquement (pour les editeurs charges en retard)
        setTimeout(injectCaptureButtons, 1000);
        setTimeout(injectCaptureButtons, 3000);
        setTimeout(injectCaptureButtons, 5000);

        // Enregistrer le handler du menu SpiraApps (fallback)
        registerMenuHandler();

        console.log(SXC_PREFIX + " Initialized successfully");
    }

    function loadSettings() {
        if (typeof SpiraAppSettings === 'undefined') {
            sxcLog("DEBUG", "SpiraAppSettings not available");
            return;
        }

        sxcState.settings = SpiraAppSettings[SXC_GUID];
        if (!sxcState.settings) return;

        sxcState.debugMode = (sxcState.settings.debug_mode === true ||
                              sxcState.settings.debug_mode === "Y");

        var quality = parseFloat(sxcState.settings.capture_quality);
        if (!isNaN(quality) && quality >= 0.1 && quality <= 1.0) {
            sxcState.captureQuality = quality;
        }

        if (sxcState.settings.capture_format === "jpeg") {
            sxcState.captureFormat = "jpeg";
        }

        sxcLog("DEBUG", "Settings loaded:", sxcState);
    }

    function registerMenuHandler() {
        if (typeof spiraAppManager === 'undefined') return;

        try {
            var guid = (typeof APP_GUID !== 'undefined') ? APP_GUID : SXC_GUID;
            spiraAppManager.registerEvent_menuEntryClick(guid, "captureScreen", function() {
                startCapture(null);
            });
            sxcLog("DEBUG", "Menu handler registered");
        } catch (err) {
            sxcLog("ERROR", "Failed to register menu handler", err);
        }
    }

    // ============================================================
    // INJECTION DES BOUTONS DANS LES TOOLBARS
    // ============================================================
    function injectCaptureButtons() {
        var toolbars = document.querySelectorAll(TOOLBAR_SELECTORS);
        var injectedCount = 0;

        toolbars.forEach(function(toolbar) {
            // Eviter les doublons
            if (toolbar.querySelector('.sxc-capture-btn')) return;
            if (toolbar.classList.contains(SXC_INJECTED_CLASS)) return;

            // Marquer comme traite
            toolbar.classList.add(SXC_INJECTED_CLASS);

            // Creer et injecter le bouton
            var btn = createCaptureButton(toolbar);

            // Trouver le meilleur endroit pour inserer
            var wrapper = toolbar.querySelector(
                '.reToolbarWrapper, .tox-toolbar__group, .mce-btn-group, .cke_toolgroup, .ck-toolbar__items'
            );

            if (wrapper) {
                wrapper.appendChild(btn);
            } else {
                toolbar.appendChild(btn);
            }

            injectedCount++;
            sxcLog("DEBUG", "Button injected in toolbar", toolbar);
        });

        if (injectedCount > 0) {
            sxcLog("DEBUG", "Injected " + injectedCount + " capture button(s)");
        }
    }

    function createCaptureButton(toolbar) {
        var btn = document.createElement('button');
        btn.className = 'sxc-capture-btn reTool';
        btn.setAttribute('type', 'button');
        btn.setAttribute('title', 'Capture Screen (SpiraXCapture)');
        btn.setAttribute('data-sxc', 'true');

        // Style compatible avec RadEditor et autres editeurs
        btn.style.cssText = [
            'display: inline-flex',
            'align-items: center',
            'justify-content: center',
            'width: 26px',
            'height: 26px',
            'margin: 1px',
            'padding: 3px',
            'border: 1px solid #999',
            'border-radius: 3px',
            'background: linear-gradient(180deg, #fff 0%, #e8e8e8 100%)',
            'cursor: pointer',
            'vertical-align: middle',
            'box-sizing: border-box'
        ].join(';');

        // Icone camera SVG
        btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>';

        // Hover effect
        btn.onmouseenter = function() {
            btn.style.background = 'linear-gradient(180deg, #e8f4fc 0%, #cce4f7 100%)';
            btn.style.borderColor = '#0078d4';
        };
        btn.onmouseleave = function() {
            btn.style.background = 'linear-gradient(180deg, #fff 0%, #e8e8e8 100%)';
            btn.style.borderColor = '#999';
        };

        // Click handler
        btn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();

            // Trouver l'editeur associe a cette toolbar
            var editorInfo = findEditorInstance(btn);
            sxcState.currentEditor = editorInfo;

            startCapture(editorInfo);
        };

        return btn;
    }

    // ============================================================
    // DETECTION DE L'EDITEUR
    // ============================================================
    function findEditorInstance(element) {
        var editorContainer = element.closest(EDITOR_SELECTORS);
        if (!editorContainer) {
            // Essayer de remonter plus haut
            var parent = element.parentElement;
            while (parent && parent !== document.body) {
                editorContainer = parent.querySelector(EDITOR_SELECTORS);
                if (editorContainer) break;
                parent = parent.parentElement;
            }
        }

        if (!editorContainer) {
            sxcLog("DEBUG", "No editor container found");
            return null;
        }

        // Telerik RadEditor (SpiraPlan)
        if (typeof $find === 'function') {
            // Essayer avec l'ID du container
            var radEditor = $find(editorContainer.id);
            if (radEditor && radEditor.pasteHtml) {
                sxcLog("DEBUG", "Found RadEditor via $find:", editorContainer.id);
                return { type: 'radeditor', instance: radEditor, container: editorContainer };
            }

            // Chercher un ID d'editeur dans les enfants
            var editorElement = editorContainer.querySelector('[id*="Editor"], [id*="txt"]');
            if (editorElement) {
                radEditor = $find(editorElement.id);
                if (radEditor && radEditor.pasteHtml) {
                    sxcLog("DEBUG", "Found RadEditor in children:", editorElement.id);
                    return { type: 'radeditor', instance: radEditor, container: editorContainer };
                }
            }
        }

        // Telerik via namespace global
        if (typeof Telerik !== 'undefined' && Telerik.Web && Telerik.Web.UI && Telerik.Web.UI.RadEditor) {
            if (Telerik.Web.UI.RadEditor.get_editors) {
                var editors = Telerik.Web.UI.RadEditor.get_editors();
                for (var i = 0; i < editors.length; i++) {
                    var ed = editors[i];
                    if (ed.get_element && ed.get_element() === editorContainer) {
                        sxcLog("DEBUG", "Found RadEditor via get_editors");
                        return { type: 'radeditor', instance: ed, container: editorContainer };
                    }
                }
            }
        }

        // TinyMCE
        if (typeof tinymce !== 'undefined') {
            var textarea = editorContainer.querySelector('textarea');
            if (textarea && textarea.id) {
                var tmce = tinymce.get(textarea.id);
                if (tmce) {
                    sxcLog("DEBUG", "Found TinyMCE editor");
                    return { type: 'tinymce', instance: tmce, container: editorContainer };
                }
            }
            if (tinymce.activeEditor) {
                return { type: 'tinymce', instance: tinymce.activeEditor, container: editorContainer };
            }
        }

        // CKEditor 4
        if (typeof CKEDITOR !== 'undefined' && CKEDITOR.instances) {
            var textarea = editorContainer.querySelector('textarea');
            if (textarea && textarea.id && CKEDITOR.instances[textarea.id]) {
                sxcLog("DEBUG", "Found CKEditor 4");
                return { type: 'ckeditor4', instance: CKEDITOR.instances[textarea.id], container: editorContainer };
            }
        }

        // Fallback: contenteditable
        var contentEditable = editorContainer.querySelector('[contenteditable="true"]');
        if (contentEditable) {
            sxcLog("DEBUG", "Found contenteditable element");
            return { type: 'contenteditable', instance: contentEditable, container: editorContainer };
        }

        sxcLog("DEBUG", "No editor instance found, using fallback");
        return { type: 'fallback', instance: null, container: editorContainer };
    }

    // ============================================================
    // INSERTION DANS L'EDITEUR
    // ============================================================
    function insertHtmlToEditor(editorInfo, html) {
        if (!editorInfo || !editorInfo.instance) {
            sxcLog("DEBUG", "No editor instance, trying fallback methods");
            return insertFallback(editorInfo, html);
        }

        switch (editorInfo.type) {
            case 'radeditor':
                editorInfo.instance.pasteHtml(html);
                sxcLog("DEBUG", "Inserted via RadEditor.pasteHtml");
                return true;

            case 'tinymce':
                editorInfo.instance.insertContent(html);
                sxcLog("DEBUG", "Inserted via TinyMCE.insertContent");
                return true;

            case 'ckeditor4':
                editorInfo.instance.insertHtml(html);
                sxcLog("DEBUG", "Inserted via CKEditor.insertHtml");
                return true;

            case 'contenteditable':
                editorInfo.instance.focus();
                document.execCommand('insertHTML', false, html);
                sxcLog("DEBUG", "Inserted via execCommand");
                return true;

            default:
                return insertFallback(editorInfo, html);
        }
    }

    function insertFallback(editorInfo, html) {
        // Essayer via spiraAppManager.updateFormField si disponible
        if (typeof spiraAppManager !== 'undefined' && spiraAppManager.updateFormField) {
            // Trouver le field name
            var container = editorInfo ? editorInfo.container : null;
            if (container) {
                var fieldId = container.id || '';
                // Extraire le nom du champ (ex: ctl00_cplMainContent_txtDescription -> Description)
                var match = fieldId.match(/txt(\w+)$/);
                if (match) {
                    var fieldName = match[1];
                    try {
                        // Recuperer la valeur actuelle et ajouter l'image
                        var currentValue = spiraAppManager.getDataItemFieldValue(fieldName) || '';
                        spiraAppManager.updateFormField(fieldName, currentValue + html);
                        sxcLog("DEBUG", "Inserted via updateFormField:", fieldName);
                        return true;
                    } catch (e) {
                        sxcLog("ERROR", "updateFormField failed", e);
                    }
                }
            }
        }

        // Dernier recours: copier dans le presse-papiers
        sxcLog("DEBUG", "All insert methods failed, copying to clipboard");
        return false;
    }

    // ============================================================
    // MUTATION OBSERVER
    // ============================================================
    function setupMutationObserver() {
        var observer = new MutationObserver(function(mutations) {
            var shouldInject = false;

            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length === 0) return;

                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType !== 1) return;

                    // Verifier si c'est une toolbar
                    if (node.matches && node.matches(TOOLBAR_SELECTORS)) {
                        shouldInject = true;
                    }

                    // Verifier si contient une toolbar
                    if (node.querySelector && node.querySelector(TOOLBAR_SELECTORS)) {
                        shouldInject = true;
                    }

                    // Verifier les classes specifiques
                    if (node.classList) {
                        if (node.classList.contains('RadEditor') ||
                            node.classList.contains('reToolbar') ||
                            node.classList.contains('tox-tinymce')) {
                            shouldInject = true;
                        }
                    }
                });
            });

            if (shouldInject) {
                setTimeout(injectCaptureButtons, 300);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        sxcLog("DEBUG", "MutationObserver setup complete");
    }

    // ============================================================
    // CAPTURE D'ECRAN
    // ============================================================
    function startCapture(editorInfo) {
        sxcLog("DEBUG", "Starting capture...");

        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
            showNotification("Screen Capture API non supportee par ce navigateur", "error");
            return;
        }

        navigator.mediaDevices.getDisplayMedia({
            video: {
                mediaSource: 'screen',
                cursor: 'always'
            }
        }).then(function(stream) {
            var video = document.createElement('video');
            video.srcObject = stream;

            video.onloadedmetadata = function() {
                video.play();

                setTimeout(function() {
                    // Creer canvas avec les dimensions de la video
                    var canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    canvas.getContext('2d').drawImage(video, 0, 0);

                    // Arreter le stream
                    stream.getTracks().forEach(function(track) {
                        track.stop();
                    });

                    // Stocker l'image capturee
                    sxcState.capturedImage = canvas;

                    // Ouvrir l'editeur d'image
                    openImageEditor(canvas, editorInfo);

                }, 100);
            };
        }).catch(function(err) {
            sxcLog("ERROR", "Capture failed", err);
            if (err.name !== 'AbortError') {
                showNotification("Erreur de capture: " + err.message, "error");
            }
        });
    }

    // ============================================================
    // EDITEUR D'IMAGE (DIALOG)
    // ============================================================
    function openImageEditor(canvas, editorInfo) {
        sxcLog("DEBUG", "Opening image editor...");

        // Creer le dialog
        var dialog = createEditorDialog();
        document.body.appendChild(dialog);
        sxcState.editorDialog = dialog;

        // Initialiser le canvas d'edition
        initFabricCanvas(canvas);
    }

    function createEditorDialog() {
        var overlay = document.createElement('div');
        overlay.className = 'sxc-editor-overlay';
        overlay.style.cssText = [
            'position: fixed',
            'top: 0',
            'left: 0',
            'width: 100%',
            'height: 100%',
            'background: rgba(0,0,0,0.7)',
            'z-index: 999990',
            'display: flex',
            'align-items: center',
            'justify-content: center'
        ].join(';');

        var dialog = document.createElement('div');
        dialog.className = 'sxc-editor-dialog';
        dialog.style.cssText = [
            'background: #fff',
            'border-radius: 8px',
            'box-shadow: 0 4px 20px rgba(0,0,0,0.3)',
            'max-width: 95vw',
            'max-height: 95vh',
            'display: flex',
            'flex-direction: column',
            'overflow: hidden'
        ].join(';');

        // Header
        var header = document.createElement('div');
        header.className = 'sxc-editor-header';
        header.style.cssText = [
            'padding: 12px 16px',
            'background: #f5f5f5',
            'border-bottom: 1px solid #ddd',
            'display: flex',
            'justify-content: space-between',
            'align-items: center'
        ].join(';');

        var title = document.createElement('span');
        title.style.cssText = 'font-weight: bold; font-size: 16px;';
        title.textContent = 'SpiraXCapture - Edit Screenshot';

        var closeBtn = document.createElement('button');
        closeBtn.style.cssText = [
            'background: none',
            'border: none',
            'font-size: 24px',
            'cursor: pointer',
            'color: #666',
            'padding: 0 8px'
        ].join(';');
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = closeImageEditor;

        header.appendChild(title);
        header.appendChild(closeBtn);

        // Toolbar d'outils
        var toolbar = createToolbar();

        // Zone de canvas
        var canvasContainer = document.createElement('div');
        canvasContainer.className = 'sxc-canvas-container';
        canvasContainer.style.cssText = [
            'flex: 1',
            'overflow: auto',
            'padding: 20px',
            'background: #e0e0e0',
            'display: flex',
            'align-items: center',
            'justify-content: center'
        ].join(';');

        var canvasElement = document.createElement('canvas');
        canvasElement.id = 'sxc-fabric-canvas';
        canvasContainer.appendChild(canvasElement);

        // Footer avec boutons
        var footer = createFooter();

        dialog.appendChild(header);
        dialog.appendChild(toolbar);
        dialog.appendChild(canvasContainer);
        dialog.appendChild(footer);
        overlay.appendChild(dialog);

        // Fermer en cliquant sur l'overlay
        overlay.onclick = function(e) {
            if (e.target === overlay) {
                closeImageEditor();
            }
        };

        // Fermer avec Escape
        document.addEventListener('keydown', handleEscapeKey);

        return overlay;
    }

    function createToolbar() {
        var toolbar = document.createElement('div');
        toolbar.className = 'sxc-toolbar';
        toolbar.style.cssText = [
            'padding: 8px 16px',
            'background: #fafafa',
            'border-bottom: 1px solid #ddd',
            'display: flex',
            'gap: 8px',
            'flex-wrap: wrap',
            'align-items: center'
        ].join(';');

        var tools = [
            { id: 'select', icon: '&#x2B9E;', title: 'Select / Move' },
            { id: 'crop', icon: '&#x2702;', title: 'Crop' },
            { id: 'draw', icon: '&#x270F;', title: 'Free Draw' },
            { id: 'line', icon: '&#x2571;', title: 'Line' },
            { id: 'arrow', icon: '&#x2192;', title: 'Arrow' },
            { id: 'rect', icon: '&#x25A1;', title: 'Rectangle' },
            { id: 'ellipse', icon: '&#x25CB;', title: 'Ellipse' },
            { id: 'text', icon: 'T', title: 'Text' }
        ];

        tools.forEach(function(tool) {
            var btn = document.createElement('button');
            btn.className = 'sxc-tool-btn';
            btn.setAttribute('data-tool', tool.id);
            btn.setAttribute('title', tool.title);
            btn.style.cssText = [
                'width: 36px',
                'height: 36px',
                'border: 1px solid #ccc',
                'border-radius: 4px',
                'background: #fff',
                'cursor: pointer',
                'font-size: 18px',
                'display: flex',
                'align-items: center',
                'justify-content: center'
            ].join(';');
            btn.innerHTML = tool.icon;

            btn.onclick = function() {
                selectTool(tool.id);
                // Update button styles
                toolbar.querySelectorAll('.sxc-tool-btn').forEach(function(b) {
                    b.style.background = '#fff';
                    b.style.borderColor = '#ccc';
                });
                btn.style.background = '#e3f2fd';
                btn.style.borderColor = '#2196f3';
            };

            toolbar.appendChild(btn);
        });

        // Separateur
        var sep = document.createElement('span');
        sep.style.cssText = 'width: 1px; height: 24px; background: #ddd; margin: 0 8px;';
        toolbar.appendChild(sep);

        // Color picker
        var colorLabel = document.createElement('span');
        colorLabel.textContent = 'Color:';
        colorLabel.style.cssText = 'font-size: 14px; color: #666;';
        toolbar.appendChild(colorLabel);

        var colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.id = 'sxc-color-picker';
        colorPicker.value = '#ff0000';
        colorPicker.style.cssText = 'width: 36px; height: 36px; border: none; cursor: pointer;';
        toolbar.appendChild(colorPicker);

        // Stroke width
        var widthLabel = document.createElement('span');
        widthLabel.textContent = 'Width:';
        widthLabel.style.cssText = 'font-size: 14px; color: #666; margin-left: 8px;';
        toolbar.appendChild(widthLabel);

        var widthSlider = document.createElement('input');
        widthSlider.type = 'range';
        widthSlider.id = 'sxc-stroke-width';
        widthSlider.min = '1';
        widthSlider.max = '10';
        widthSlider.value = '3';
        widthSlider.style.cssText = 'width: 80px;';
        toolbar.appendChild(widthSlider);

        // Undo button
        var sep2 = document.createElement('span');
        sep2.style.cssText = 'width: 1px; height: 24px; background: #ddd; margin: 0 8px;';
        toolbar.appendChild(sep2);

        var undoBtn = document.createElement('button');
        undoBtn.className = 'sxc-tool-btn';
        undoBtn.title = 'Undo';
        undoBtn.style.cssText = [
            'width: 36px',
            'height: 36px',
            'border: 1px solid #ccc',
            'border-radius: 4px',
            'background: #fff',
            'cursor: pointer',
            'font-size: 18px'
        ].join(';');
        undoBtn.innerHTML = '&#x21B6;';
        undoBtn.onclick = undoAction;
        toolbar.appendChild(undoBtn);

        var deleteBtn = document.createElement('button');
        deleteBtn.className = 'sxc-tool-btn';
        deleteBtn.title = 'Delete Selected';
        deleteBtn.style.cssText = [
            'width: 36px',
            'height: 36px',
            'border: 1px solid #ccc',
            'border-radius: 4px',
            'background: #fff',
            'cursor: pointer',
            'font-size: 18px'
        ].join(';');
        deleteBtn.innerHTML = '&#x1F5D1;';
        deleteBtn.onclick = deleteSelected;
        toolbar.appendChild(deleteBtn);

        return toolbar;
    }

    function createFooter() {
        var footer = document.createElement('div');
        footer.className = 'sxc-editor-footer';
        footer.style.cssText = [
            'padding: 12px 16px',
            'background: #f5f5f5',
            'border-top: 1px solid #ddd',
            'display: flex',
            'justify-content: flex-end',
            'gap: 12px'
        ].join(';');

        var cancelBtn = document.createElement('button');
        cancelBtn.style.cssText = [
            'padding: 8px 20px',
            'border: 1px solid #ccc',
            'border-radius: 4px',
            'background: #fff',
            'cursor: pointer',
            'font-size: 14px'
        ].join(';');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.onclick = closeImageEditor;

        var insertBtn = document.createElement('button');
        insertBtn.style.cssText = [
            'padding: 8px 20px',
            'border: none',
            'border-radius: 4px',
            'background: #4CAF50',
            'color: #fff',
            'cursor: pointer',
            'font-size: 14px',
            'font-weight: bold'
        ].join(';');
        insertBtn.textContent = 'Insert Image';
        insertBtn.onclick = insertEditedImage;

        footer.appendChild(cancelBtn);
        footer.appendChild(insertBtn);

        return footer;
    }

    function handleEscapeKey(e) {
        if (e.key === 'Escape' && sxcState.editorDialog) {
            closeImageEditor();
        }
    }

    function closeImageEditor() {
        if (sxcState.editorDialog) {
            sxcState.editorDialog.remove();
            sxcState.editorDialog = null;
        }
        if (sxcState.fabricCanvas) {
            sxcState.fabricCanvas.dispose();
            sxcState.fabricCanvas = null;
        }
        sxcState.capturedImage = null;
        document.removeEventListener('keydown', handleEscapeKey);
    }

    // ============================================================
    // FABRIC.JS CANVAS (Simplified version sans dependance)
    // ============================================================
    function initFabricCanvas(sourceCanvas) {
        var canvasEl = document.getElementById('sxc-fabric-canvas');
        if (!canvasEl) return;

        // Calculer les dimensions pour tenir dans la fenetre
        var maxWidth = window.innerWidth * 0.85;
        var maxHeight = window.innerHeight * 0.65;

        var scale = Math.min(
            maxWidth / sourceCanvas.width,
            maxHeight / sourceCanvas.height,
            1
        );

        var displayWidth = Math.floor(sourceCanvas.width * scale);
        var displayHeight = Math.floor(sourceCanvas.height * scale);

        canvasEl.width = displayWidth;
        canvasEl.height = displayHeight;

        // Verifier si Fabric.js est disponible
        if (typeof fabric !== 'undefined') {
            initWithFabric(canvasEl, sourceCanvas, displayWidth, displayHeight);
        } else {
            // Version simplifiee sans Fabric.js
            initSimpleCanvas(canvasEl, sourceCanvas, displayWidth, displayHeight);
        }
    }

    function initWithFabric(canvasEl, sourceCanvas, width, height) {
        var fCanvas = new fabric.Canvas(canvasEl.id, {
            width: width,
            height: height,
            selection: true
        });

        // Ajouter l'image de fond
        fabric.Image.fromURL(sourceCanvas.toDataURL(), function(img) {
            img.scaleToWidth(width);
            fCanvas.setBackgroundImage(img, fCanvas.renderAll.bind(fCanvas));
        });

        sxcState.fabricCanvas = fCanvas;
        sxcState.canvasHistory = [];

        // Setup des outils
        setupFabricTools(fCanvas);
    }

    function initSimpleCanvas(canvasEl, sourceCanvas, width, height) {
        var ctx = canvasEl.getContext('2d');

        // Dessiner l'image source redimensionnee
        ctx.drawImage(sourceCanvas, 0, 0, width, height);

        // Stocker le contexte pour les annotations simples
        sxcState.simpleCanvas = {
            element: canvasEl,
            context: ctx,
            sourceCanvas: sourceCanvas,
            width: width,
            height: height,
            scale: width / sourceCanvas.width,
            annotations: [],
            isDrawing: false
        };

        setupSimpleCanvasTools(canvasEl, ctx);
    }

    function setupFabricTools(fCanvas) {
        var colorPicker = document.getElementById('sxc-color-picker');
        var strokeWidth = document.getElementById('sxc-stroke-width');

        fCanvas.on('mouse:down', function(opt) {
            if (sxcState.selectedTool === 'draw') {
                fCanvas.isDrawingMode = true;
                fCanvas.freeDrawingBrush.color = colorPicker.value;
                fCanvas.freeDrawingBrush.width = parseInt(strokeWidth.value);
            }
        });
    }

    function setupSimpleCanvasTools(canvasEl, ctx) {
        var colorPicker = document.getElementById('sxc-color-picker');
        var strokeWidth = document.getElementById('sxc-stroke-width');
        var state = sxcState.simpleCanvas;
        var startX, startY;

        canvasEl.onmousedown = function(e) {
            var rect = canvasEl.getBoundingClientRect();
            startX = e.clientX - rect.left;
            startY = e.clientY - rect.top;
            state.isDrawing = true;

            if (sxcState.selectedTool === 'text') {
                var text = prompt('Enter text:');
                if (text) {
                    ctx.fillStyle = colorPicker.value;
                    ctx.font = (parseInt(strokeWidth.value) * 5) + 'px Arial';
                    ctx.fillText(text, startX, startY);
                    saveAnnotation('text', { x: startX, y: startY, text: text });
                }
                state.isDrawing = false;
            }
        };

        canvasEl.onmousemove = function(e) {
            if (!state.isDrawing) return;
            if (sxcState.selectedTool !== 'draw') return;

            var rect = canvasEl.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;

            ctx.strokeStyle = colorPicker.value;
            ctx.lineWidth = parseInt(strokeWidth.value);
            ctx.lineCap = 'round';

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(x, y);
            ctx.stroke();

            startX = x;
            startY = y;
        };

        canvasEl.onmouseup = function(e) {
            if (!state.isDrawing) return;
            state.isDrawing = false;

            var rect = canvasEl.getBoundingClientRect();
            var endX = e.clientX - rect.left;
            var endY = e.clientY - rect.top;

            ctx.strokeStyle = colorPicker.value;
            ctx.lineWidth = parseInt(strokeWidth.value);

            switch (sxcState.selectedTool) {
                case 'line':
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                    ctx.stroke();
                    saveAnnotation('line', { x1: startX, y1: startY, x2: endX, y2: endY });
                    break;

                case 'arrow':
                    drawArrow(ctx, startX, startY, endX, endY);
                    saveAnnotation('arrow', { x1: startX, y1: startY, x2: endX, y2: endY });
                    break;

                case 'rect':
                    ctx.strokeRect(startX, startY, endX - startX, endY - startY);
                    saveAnnotation('rect', { x: startX, y: startY, w: endX - startX, h: endY - startY });
                    break;

                case 'ellipse':
                    drawEllipse(ctx, startX, startY, endX - startX, endY - startY);
                    saveAnnotation('ellipse', { x: startX, y: startY, w: endX - startX, h: endY - startY });
                    break;
            }
        };
    }

    function drawArrow(ctx, fromX, fromY, toX, toY) {
        var headLen = 15;
        var angle = Math.atan2(toY - fromY, toX - fromX);

        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
    }

    function drawEllipse(ctx, x, y, w, h) {
        var centerX = x + w / 2;
        var centerY = y + h / 2;
        var radiusX = Math.abs(w / 2);
        var radiusY = Math.abs(h / 2);

        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        ctx.stroke();
    }

    function saveAnnotation(type, data) {
        if (sxcState.simpleCanvas) {
            sxcState.simpleCanvas.annotations.push({ type: type, data: data });
        }
    }

    function selectTool(toolId) {
        sxcState.selectedTool = toolId;
        sxcLog("DEBUG", "Tool selected:", toolId);

        if (sxcState.fabricCanvas) {
            sxcState.fabricCanvas.isDrawingMode = (toolId === 'draw');
        }
    }

    function undoAction() {
        if (sxcState.fabricCanvas && sxcState.canvasHistory && sxcState.canvasHistory.length > 0) {
            var lastState = sxcState.canvasHistory.pop();
            sxcState.fabricCanvas.loadFromJSON(lastState);
        } else if (sxcState.simpleCanvas && sxcState.simpleCanvas.annotations.length > 0) {
            // Redessiner tout sauf la derniere annotation
            sxcState.simpleCanvas.annotations.pop();
            redrawSimpleCanvas();
        }
    }

    function redrawSimpleCanvas() {
        var state = sxcState.simpleCanvas;
        if (!state) return;

        var ctx = state.context;
        ctx.clearRect(0, 0, state.width, state.height);
        ctx.drawImage(state.sourceCanvas, 0, 0, state.width, state.height);

        // Redessiner les annotations
        var colorPicker = document.getElementById('sxc-color-picker');
        var strokeWidth = document.getElementById('sxc-stroke-width');

        ctx.strokeStyle = colorPicker ? colorPicker.value : '#ff0000';
        ctx.lineWidth = strokeWidth ? parseInt(strokeWidth.value) : 3;

        state.annotations.forEach(function(ann) {
            switch (ann.type) {
                case 'line':
                    ctx.beginPath();
                    ctx.moveTo(ann.data.x1, ann.data.y1);
                    ctx.lineTo(ann.data.x2, ann.data.y2);
                    ctx.stroke();
                    break;
                case 'arrow':
                    drawArrow(ctx, ann.data.x1, ann.data.y1, ann.data.x2, ann.data.y2);
                    break;
                case 'rect':
                    ctx.strokeRect(ann.data.x, ann.data.y, ann.data.w, ann.data.h);
                    break;
                case 'ellipse':
                    drawEllipse(ctx, ann.data.x, ann.data.y, ann.data.w, ann.data.h);
                    break;
                case 'text':
                    ctx.fillText(ann.data.text, ann.data.x, ann.data.y);
                    break;
            }
        });
    }

    function deleteSelected() {
        if (sxcState.fabricCanvas) {
            var active = sxcState.fabricCanvas.getActiveObject();
            if (active) {
                sxcState.fabricCanvas.remove(active);
            }
        }
    }

    // ============================================================
    // INSERTION DE L'IMAGE EDITEE
    // ============================================================
    function insertEditedImage() {
        sxcLog("DEBUG", "Inserting edited image...");

        var dataUrl;

        if (sxcState.fabricCanvas) {
            dataUrl = sxcState.fabricCanvas.toDataURL({
                format: sxcState.captureFormat,
                quality: sxcState.captureQuality
            });
        } else if (sxcState.simpleCanvas) {
            dataUrl = sxcState.simpleCanvas.element.toDataURL(
                'image/' + sxcState.captureFormat,
                sxcState.captureQuality
            );
        } else if (sxcState.capturedImage) {
            dataUrl = sxcState.capturedImage.toDataURL(
                'image/' + sxcState.captureFormat,
                sxcState.captureQuality
            );
        } else {
            showNotification("Aucune image a inserer", "error");
            return;
        }

        // Creer le HTML de l'image
        var imgHtml = '<img src="' + dataUrl + '" alt="Screenshot" style="max-width:100%; border:1px solid #ddd; margin:5px 0;" />';

        // Inserer dans l'editeur
        var success = insertHtmlToEditor(sxcState.currentEditor, imgHtml);

        if (success) {
            showNotification("Image inseree avec succes!", "success");
            closeImageEditor();
        } else {
            // Fallback: copier dans le presse-papiers
            copyToClipboard(dataUrl);
            showNotification("Image copiee dans le presse-papiers. Collez avec Ctrl+V", "info");
            closeImageEditor();
        }
    }

    function copyToClipboard(dataUrl) {
        // Essayer de copier l'image
        var canvas = document.createElement('canvas');
        var img = new Image();
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            canvas.getContext('2d').drawImage(img, 0, 0);

            canvas.toBlob(function(blob) {
                if (navigator.clipboard && navigator.clipboard.write) {
                    navigator.clipboard.write([
                        new ClipboardItem({ 'image/png': blob })
                    ]).catch(function(err) {
                        sxcLog("ERROR", "Clipboard write failed", err);
                    });
                }
            });
        };
        img.src = dataUrl;
    }

    // ============================================================
    // NOTIFICATIONS
    // ============================================================
    function showNotification(message, type) {
        // Utiliser l'API SpiraApps si disponible
        if (typeof spiraAppManager !== 'undefined') {
            switch (type) {
                case 'success':
                    spiraAppManager.displaySuccessMessage(SXC_PREFIX + ' ' + message);
                    break;
                case 'error':
                    spiraAppManager.displayErrorMessage(SXC_PREFIX + ' ' + message);
                    break;
                default:
                    spiraAppManager.displayWarningMessage(SXC_PREFIX + ' ' + message);
            }
            return;
        }

        // Fallback: notification HTML
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
            'box-shadow: 0 2px 10px rgba(0,0,0,0.2)',
            'animation: sxc-fadein 0.3s'
        ].join(';');
        notif.textContent = message;
        document.body.appendChild(notif);

        setTimeout(function() {
            notif.style.opacity = '0';
            notif.style.transition = 'opacity 0.3s';
            setTimeout(function() {
                notif.remove();
            }, 300);
        }, 3000);
    }

    // ============================================================
    // DEMARRAGE
    // ============================================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ============================================================
    // API PUBLIQUE (pour debug)
    // ============================================================
    window.SXC = {
        version: SXC_VERSION,
        capture: function() { startCapture(null); },
        injectButtons: injectCaptureButtons,
        getState: function() { return sxcState; }
    };

})();
