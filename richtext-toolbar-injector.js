/**
 * RichText Toolbar Injector
 * Injecte un bouton personnalisé dans n'importe quelle toolbar d'éditeur RichText
 * Compatible avec: TinyMCE, CKEditor, Quill, Froala, Medium Editor, ProseMirror, etc.
 */

(function() {
    'use strict';

    // ============================================================
    // 1. SÉLECTEURS CSS COMMUNS POUR DÉTECTER LES TOOLBARS
    // ============================================================

    const TOOLBAR_SELECTORS = {
        // TinyMCE (versions 4, 5, 6)
        tinymce: [
            '.tox-toolbar',
            '.tox-toolbar__primary',
            '.tox-toolbar__group',
            '.mce-toolbar',
            '.mce-btn-group',
            '.mce-container-body'
        ],

        // CKEditor (versions 4, 5)
        ckeditor: [
            '.cke_toolbox',
            '.cke_toolbar',
            '.ck-toolbar',
            '.ck-toolbar__items',
            '.cke_top'
        ],

        // Quill
        quill: [
            '.ql-toolbar',
            '.ql-formats'
        ],

        // Froala
        froala: [
            '.fr-toolbar',
            '.fr-btn-grp'
        ],

        // Medium Editor
        medium: [
            '.medium-editor-toolbar',
            '.medium-editor-toolbar-actions'
        ],

        // ProseMirror / Tiptap
        prosemirror: [
            '.ProseMirror-menubar',
            '.tiptap-toolbar',
            '[class*="editor-toolbar"]',
            '[class*="menubar"]'
        ],

        // Summernote
        summernote: [
            '.note-toolbar',
            '.note-btn-group'
        ],

        // Draft.js / Slate
        draftjs: [
            '[class*="DraftEditor"]',
            '[class*="toolbar"]',
            '[class*="RichTextEditor"]'
        ],

        // Génériques (attrape-tout)
        generic: [
            '[class*="toolbar"]',
            '[class*="Toolbar"]',
            '[class*="tool-bar"]',
            '[class*="editor-menu"]',
            '[class*="formatting"]',
            '[role="toolbar"]',
            '[aria-label*="format"]',
            '[aria-label*="toolbar"]'
        ]
    };

    // Sélecteurs pour les zones éditables
    const EDITABLE_SELECTORS = [
        // ContentEditable
        '[contenteditable="true"]',
        '[contenteditable=""]',

        // Textareas cachées derrière les éditeurs
        'textarea.mce-textbox',
        'textarea[id*="editor"]',
        'textarea[class*="editor"]',

        // Iframes des éditeurs
        'iframe[id*="editor"]',
        'iframe[class*="editor"]',
        '.mce-edit-area iframe',
        '.cke_wysiwyg_frame',

        // Zones spécifiques
        '.ql-editor',
        '.fr-element',
        '.ProseMirror',
        '.note-editable',
        '.medium-editor-element',
        '[class*="DraftEditor-root"]'
    ];

    // ============================================================
    // 2. CLASSE PRINCIPALE - TOOLBAR INJECTOR
    // ============================================================

    class RichTextToolbarInjector {
        constructor(options = {}) {
            this.options = {
                buttonText: options.buttonText || '✨ Custom',
                buttonTitle: options.buttonTitle || 'Mon bouton personnalisé',
                buttonIcon: options.buttonIcon || null, // SVG ou HTML
                onClick: options.onClick || this.defaultClickHandler,
                autoInject: options.autoInject !== false,
                debug: options.debug || false,
                ...options
            };

            this.injectedToolbars = new WeakSet();
            this.observer = null;

            if (this.options.autoInject) {
                this.init();
            }
        }

        // ============================================================
        // 3. MUTATION OBSERVER - DÉTECTION DYNAMIQUE
        // ============================================================

        init() {
            // Injecter dans les toolbars existantes
            this.scanAndInject();

            // Observer les changements du DOM pour les éditeurs créés dynamiquement
            this.setupMutationObserver();

            this.log('RichText Toolbar Injector initialisé');
        }

        setupMutationObserver() {
            this.observer = new MutationObserver((mutations) => {
                let shouldScan = false;

                for (const mutation of mutations) {
                    // Vérifier les nœuds ajoutés
                    if (mutation.addedNodes.length > 0) {
                        for (const node of mutation.addedNodes) {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                // Vérifier si c'est une toolbar ou contient une toolbar
                                if (this.isToolbarElement(node) || this.containsToolbar(node)) {
                                    shouldScan = true;
                                    break;
                                }
                            }
                        }
                    }

                    // Vérifier les changements d'attributs (ex: class ajoutée)
                    if (mutation.type === 'attributes' &&
                        (mutation.attributeName === 'class' || mutation.attributeName === 'role')) {
                        if (this.isToolbarElement(mutation.target)) {
                            shouldScan = true;
                        }
                    }

                    if (shouldScan) break;
                }

                if (shouldScan) {
                    // Debounce pour éviter les scans multiples
                    clearTimeout(this.scanTimeout);
                    this.scanTimeout = setTimeout(() => this.scanAndInject(), 100);
                }
            });

            this.observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class', 'role', 'aria-label']
            });
        }

        isToolbarElement(element) {
            if (!element || !element.matches) return false;

            const allSelectors = Object.values(TOOLBAR_SELECTORS).flat();
            return allSelectors.some(selector => {
                try {
                    return element.matches(selector);
                } catch (e) {
                    return false;
                }
            });
        }

        containsToolbar(element) {
            if (!element || !element.querySelector) return false;

            const allSelectors = Object.values(TOOLBAR_SELECTORS).flat();
            return allSelectors.some(selector => {
                try {
                    return element.querySelector(selector) !== null;
                } catch (e) {
                    return false;
                }
            });
        }

        // ============================================================
        // 4. DÉTECTION ET SCAN DES TOOLBARS
        // ============================================================

        scanAndInject() {
            const toolbars = this.findAllToolbars();

            for (const toolbar of toolbars) {
                if (!this.injectedToolbars.has(toolbar)) {
                    this.injectButton(toolbar);
                }
            }

            this.log(`Scan terminé: ${toolbars.length} toolbar(s) trouvée(s)`);
        }

        findAllToolbars() {
            const toolbars = new Set();
            const allSelectors = Object.values(TOOLBAR_SELECTORS).flat();

            for (const selector of allSelectors) {
                try {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(el => {
                        // Filtrer pour garder seulement les conteneurs de boutons
                        if (this.isValidToolbarContainer(el)) {
                            toolbars.add(el);
                        }
                    });
                } catch (e) {
                    // Sélecteur invalide, ignorer
                }
            }

            return Array.from(toolbars);
        }

        isValidToolbarContainer(element) {
            // Vérifier que l'élément est visible
            const style = window.getComputedStyle(element);
            if (style.display === 'none' || style.visibility === 'hidden') {
                return false;
            }

            // Vérifier qu'il contient des boutons ou éléments interactifs
            const hasButtons = element.querySelector('button, [role="button"], a, span[class*="btn"]');
            const hasMinWidth = element.offsetWidth > 50;

            return hasButtons || hasMinWidth;
        }

        // ============================================================
        // 5. INJECTION DU BOUTON PERSONNALISÉ
        // ============================================================

        injectButton(toolbar) {
            const editorType = this.detectEditorType(toolbar);
            const button = this.createButton(editorType, toolbar);

            if (button) {
                // Trouver le meilleur endroit pour insérer le bouton
                const insertionPoint = this.findInsertionPoint(toolbar, editorType);

                if (insertionPoint.container) {
                    if (insertionPoint.position === 'append') {
                        insertionPoint.container.appendChild(button);
                    } else if (insertionPoint.position === 'prepend') {
                        insertionPoint.container.prepend(button);
                    } else {
                        insertionPoint.container.insertBefore(button, insertionPoint.before);
                    }

                    this.injectedToolbars.add(toolbar);
                    this.log(`Bouton injecté dans toolbar ${editorType}`, toolbar);
                }
            }
        }

        detectEditorType(toolbar) {
            const classAndId = (toolbar.className || '') + ' ' + (toolbar.id || '');
            const parent = toolbar.closest('[class*="editor"], [class*="mce"], [class*="cke"], [class*="ql-"]');
            const context = classAndId + ' ' + (parent ? parent.className : '');

            if (context.includes('tox') || context.includes('mce') || context.includes('tinymce')) {
                return 'tinymce';
            }
            if (context.includes('cke') || context.includes('ck-')) {
                return 'ckeditor';
            }
            if (context.includes('ql-')) {
                return 'quill';
            }
            if (context.includes('fr-')) {
                return 'froala';
            }
            if (context.includes('medium-editor')) {
                return 'medium';
            }
            if (context.includes('note-')) {
                return 'summernote';
            }
            if (context.includes('ProseMirror') || context.includes('tiptap')) {
                return 'prosemirror';
            }

            return 'generic';
        }

        createButton(editorType, toolbar) {
            const buttonConfigs = {
                tinymce: () => this.createTinyMCEButton(toolbar),
                ckeditor: () => this.createCKEditorButton(toolbar),
                quill: () => this.createQuillButton(toolbar),
                froala: () => this.createFroalaButton(toolbar),
                medium: () => this.createMediumButton(toolbar),
                summernote: () => this.createSummernoteButton(toolbar),
                prosemirror: () => this.createProseMirrorButton(toolbar),
                generic: () => this.createGenericButton(toolbar)
            };

            const createFn = buttonConfigs[editorType] || buttonConfigs.generic;
            return createFn();
        }

        // ============================================================
        // 6. BOUTONS SPÉCIFIQUES PAR ÉDITEUR
        // ============================================================

        createTinyMCEButton(toolbar) {
            // TinyMCE 5/6 (tox)
            if (toolbar.classList.contains('tox-toolbar') || toolbar.closest('.tox')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'tox-toolbar__group';

                const button = document.createElement('button');
                button.className = 'tox-tbtn';
                button.type = 'button';
                button.title = this.options.buttonTitle;
                button.setAttribute('aria-label', this.options.buttonTitle);

                if (this.options.buttonIcon) {
                    button.innerHTML = `<span class="tox-icon">${this.options.buttonIcon}</span>`;
                } else {
                    button.innerHTML = `<span class="tox-tbtn__select-label">${this.options.buttonText}</span>`;
                }

                this.attachClickHandler(button, toolbar);
                wrapper.appendChild(button);
                return wrapper;
            }

            // TinyMCE 4 (mce)
            const button = document.createElement('div');
            button.className = 'mce-widget mce-btn';
            button.innerHTML = `
                <button type="button" class="mce-open" title="${this.options.buttonTitle}">
                    <span class="mce-txt">${this.options.buttonText}</span>
                </button>
            `;
            this.attachClickHandler(button.querySelector('button'), toolbar);
            return button;
        }

        createCKEditorButton(toolbar) {
            // CKEditor 5
            if (toolbar.classList.contains('ck-toolbar')) {
                const button = document.createElement('button');
                button.className = 'ck ck-button ck-off';
                button.type = 'button';
                button.title = this.options.buttonTitle;
                button.innerHTML = `
                    <span class="ck ck-button__label">${this.options.buttonText}</span>
                `;
                this.attachClickHandler(button, toolbar);
                return button;
            }

            // CKEditor 4
            const span = document.createElement('span');
            span.className = 'cke_toolgroup';
            span.innerHTML = `
                <a class="cke_button cke_button_off" title="${this.options.buttonTitle}" role="button">
                    <span class="cke_button_label">${this.options.buttonText}</span>
                </a>
            `;
            this.attachClickHandler(span.querySelector('a'), toolbar);
            return span;
        }

        createQuillButton(toolbar) {
            const container = document.createElement('span');
            container.className = 'ql-formats';

            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'ql-custom';
            button.title = this.options.buttonTitle;

            if (this.options.buttonIcon) {
                button.innerHTML = this.options.buttonIcon;
            } else {
                button.textContent = this.options.buttonText;
                button.style.cssText = 'width: auto; padding: 0 8px;';
            }

            this.attachClickHandler(button, toolbar);
            container.appendChild(button);
            return container;
        }

        createFroalaButton(toolbar) {
            const button = document.createElement('button');
            button.className = 'fr-command fr-btn';
            button.type = 'button';
            button.title = this.options.buttonTitle;
            button.setAttribute('data-cmd', 'customButton');
            button.innerHTML = this.options.buttonIcon || `<span>${this.options.buttonText}</span>`;

            this.attachClickHandler(button, toolbar);
            return button;
        }

        createMediumButton(toolbar) {
            const button = document.createElement('button');
            button.className = 'medium-editor-action';
            button.setAttribute('data-action', 'custom');
            button.title = this.options.buttonTitle;
            button.innerHTML = this.options.buttonIcon || this.options.buttonText;

            this.attachClickHandler(button, toolbar);
            return button;
        }

        createSummernoteButton(toolbar) {
            const wrapper = document.createElement('div');
            wrapper.className = 'note-btn-group btn-group';

            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'note-btn btn btn-light btn-sm';
            button.title = this.options.buttonTitle;
            button.setAttribute('data-toggle', 'tooltip');
            button.innerHTML = this.options.buttonIcon || this.options.buttonText;

            this.attachClickHandler(button, toolbar);
            wrapper.appendChild(button);
            return wrapper;
        }

        createProseMirrorButton(toolbar) {
            const button = document.createElement('button');
            button.className = 'ProseMirror-menuitem';
            button.type = 'button';
            button.title = this.options.buttonTitle;
            button.innerHTML = this.options.buttonIcon || this.options.buttonText;
            button.style.cssText = 'cursor: pointer; padding: 4px 8px; margin: 2px;';

            this.attachClickHandler(button, toolbar);
            return button;
        }

        createGenericButton(toolbar) {
            // Analyser les boutons existants pour copier leur style
            const existingButton = toolbar.querySelector('button, [role="button"], a[class*="btn"]');

            const button = document.createElement('button');
            button.type = 'button';
            button.title = this.options.buttonTitle;
            button.innerHTML = this.options.buttonIcon || this.options.buttonText;

            if (existingButton) {
                // Copier les classes du bouton existant
                const classes = Array.from(existingButton.classList)
                    .filter(c => !c.includes('active') && !c.includes('selected'));
                button.className = classes.join(' ');

                // Copier le style inline si présent
                const computedStyle = window.getComputedStyle(existingButton);
                button.style.cssText = `
                    cursor: pointer;
                    font-family: ${computedStyle.fontFamily};
                    font-size: ${computedStyle.fontSize};
                `;
            } else {
                button.style.cssText = `
                    cursor: pointer;
                    padding: 4px 8px;
                    margin: 2px;
                    border: 1px solid #ccc;
                    border-radius: 3px;
                    background: #f5f5f5;
                `;
            }

            this.attachClickHandler(button, toolbar);
            return button;
        }

        findInsertionPoint(toolbar, editorType) {
            // Chercher un groupe de boutons existant ou la fin de la toolbar
            const groupSelectors = {
                tinymce: '.tox-toolbar__group, .mce-btn-group',
                ckeditor: '.ck-toolbar__items, .cke_toolgroup',
                quill: '.ql-formats',
                froala: '.fr-btn-grp',
                summernote: '.note-btn-group',
                generic: '[class*="group"], [class*="Group"]'
            };

            const selector = groupSelectors[editorType] || groupSelectors.generic;
            const lastGroup = toolbar.querySelector(selector + ':last-of-type');

            if (lastGroup && editorType !== 'generic') {
                return { container: lastGroup.parentElement || toolbar, position: 'append' };
            }

            return { container: toolbar, position: 'append' };
        }

        // ============================================================
        // 7. GESTION DES ÉVÉNEMENTS
        // ============================================================

        attachClickHandler(button, toolbar) {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();

                // Trouver l'éditeur associé
                const editorInfo = this.findAssociatedEditor(toolbar);

                // Appeler le handler personnalisé
                this.options.onClick({
                    event,
                    button,
                    toolbar,
                    editor: editorInfo.editor,
                    editorType: editorInfo.type,
                    getContent: () => this.getEditorContent(editorInfo),
                    setContent: (content) => this.setEditorContent(editorInfo, content),
                    insertContent: (content) => this.insertContent(editorInfo, content),
                    getSelection: () => this.getSelection(editorInfo)
                });
            });

            // Gestion du hover pour le feedback visuel
            button.addEventListener('mouseenter', () => {
                button.style.opacity = '0.8';
            });

            button.addEventListener('mouseleave', () => {
                button.style.opacity = '1';
            });
        }

        // ============================================================
        // 8. TROUVER L'ÉDITEUR ASSOCIÉ À LA TOOLBAR
        // ============================================================

        findAssociatedEditor(toolbar) {
            let editor = null;
            let type = 'unknown';
            let instance = null;

            // Chercher dans les ancêtres
            const container = toolbar.closest(
                '[class*="editor"], [class*="mce"], [class*="cke"], [class*="ql-"], ' +
                '[class*="fr-"], [class*="note-"], [class*="ProseMirror"]'
            ) || toolbar.parentElement;

            // TinyMCE
            if (window.tinymce) {
                const mceContainer = toolbar.closest('.tox-tinymce, .mce-tinymce');
                if (mceContainer) {
                    const id = mceContainer.id?.replace('_parent', '').replace('_wrapper', '');
                    instance = tinymce.get(id) || tinymce.activeEditor;
                    if (instance) {
                        editor = instance.getBody() || instance.getElement();
                        type = 'tinymce';
                    }
                }
            }

            // CKEditor 5
            if (!editor && window.CKEDITOR && CKEDITOR.instances) {
                for (const name in CKEDITOR.instances) {
                    const ck = CKEDITOR.instances[name];
                    if (ck.container && ck.container.$.contains(toolbar)) {
                        instance = ck;
                        editor = ck.editable()?.$;
                        type = 'ckeditor';
                        break;
                    }
                }
            }

            // Quill
            if (!editor && window.Quill) {
                const qlContainer = toolbar.closest('.ql-container')?.parentElement ||
                                   container?.querySelector('.ql-container');
                if (qlContainer) {
                    editor = qlContainer.querySelector('.ql-editor');
                    // Essayer de trouver l'instance Quill
                    instance = qlContainer.__quill;
                    type = 'quill';
                }
            }

            // Recherche générique contenteditable
            if (!editor) {
                for (const selector of EDITABLE_SELECTORS) {
                    editor = container?.querySelector(selector) ||
                             document.querySelector(selector);
                    if (editor) {
                        type = 'contenteditable';
                        break;
                    }
                }
            }

            // Recherche dans les iframes
            if (!editor) {
                const iframe = container?.querySelector('iframe') ||
                              toolbar.parentElement?.querySelector('iframe');
                if (iframe) {
                    try {
                        editor = iframe.contentDocument?.body;
                        type = 'iframe';
                    } catch (e) {
                        // Cross-origin, impossible d'accéder
                    }
                }
            }

            return { editor, type, instance, container };
        }

        // ============================================================
        // 9. MANIPULATION DU CONTENU DE L'ÉDITEUR
        // ============================================================

        getEditorContent(editorInfo) {
            const { editor, type, instance } = editorInfo;

            if (instance) {
                // Utiliser l'API native si disponible
                if (type === 'tinymce' && instance.getContent) {
                    return instance.getContent();
                }
                if (type === 'ckeditor' && instance.getData) {
                    return instance.getData();
                }
                if (type === 'quill' && instance.root) {
                    return instance.root.innerHTML;
                }
            }

            if (editor) {
                return editor.innerHTML || editor.value || '';
            }

            return '';
        }

        setEditorContent(editorInfo, content) {
            const { editor, type, instance } = editorInfo;

            if (instance) {
                if (type === 'tinymce' && instance.setContent) {
                    instance.setContent(content);
                    return;
                }
                if (type === 'ckeditor' && instance.setData) {
                    instance.setData(content);
                    return;
                }
                if (type === 'quill' && instance.root) {
                    instance.root.innerHTML = content;
                    return;
                }
            }

            if (editor) {
                if (editor.tagName === 'TEXTAREA' || editor.tagName === 'INPUT') {
                    editor.value = content;
                } else {
                    editor.innerHTML = content;
                }
            }
        }

        insertContent(editorInfo, content) {
            const { editor, type, instance } = editorInfo;

            if (instance) {
                if (type === 'tinymce' && instance.insertContent) {
                    instance.insertContent(content);
                    return;
                }
                if (type === 'ckeditor' && instance.insertHtml) {
                    instance.insertHtml(content);
                    return;
                }
                if (type === 'quill' && instance.clipboard) {
                    const range = instance.getSelection(true);
                    instance.clipboard.dangerouslyPasteHTML(range.index, content);
                    return;
                }
            }

            // Fallback: insertion au point de sélection
            if (editor && editor.isContentEditable !== false) {
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    range.deleteContents();

                    const fragment = document.createRange().createContextualFragment(content);
                    range.insertNode(fragment);

                    // Placer le curseur après le contenu inséré
                    range.collapse(false);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }
        }

        getSelection(editorInfo) {
            const { editor, type, instance } = editorInfo;

            if (instance) {
                if (type === 'tinymce' && instance.selection) {
                    return instance.selection.getContent();
                }
                if (type === 'ckeditor' && instance.getSelection) {
                    return instance.getSelection().getSelectedText();
                }
                if (type === 'quill') {
                    const range = instance.getSelection();
                    if (range) {
                        return instance.getText(range.index, range.length);
                    }
                }
            }

            // Fallback
            const selection = window.getSelection();
            return selection.toString();
        }

        // ============================================================
        // 10. UTILITAIRES
        // ============================================================

        defaultClickHandler(context) {
            console.log('Bouton personnalisé cliqué!', context);
            alert(`Bouton cliqué!\n\nType d'éditeur: ${context.editorType}\nSélection: "${context.getSelection() || '(aucune)'}"`);
        }

        log(...args) {
            if (this.options.debug) {
                console.log('[RichText Injector]', ...args);
            }
        }

        // Nettoyer les observers
        destroy() {
            if (this.observer) {
                this.observer.disconnect();
                this.observer = null;
            }
            this.log('Injector détruit');
        }

        // Forcer un nouveau scan
        rescan() {
            this.scanAndInject();
        }
    }

    // ============================================================
    // 11. EXEMPLES D'UTILISATION
    // ============================================================

    /*
    // Exemple 1: Bouton simple
    const injector = new RichTextToolbarInjector({
        buttonText: '🔥 Mon Bouton',
        buttonTitle: 'Faire quelque chose de cool',
        onClick: (ctx) => {
            const selection = ctx.getSelection();
            if (selection) {
                ctx.insertContent(`<strong>${selection}</strong>`);
            } else {
                ctx.insertContent('<p>Texte inséré!</p>');
            }
        },
        debug: true
    });

    // Exemple 2: Bouton avec icône SVG
    const injectorWithIcon = new RichTextToolbarInjector({
        buttonIcon: '<svg width="16" height="16" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
        buttonTitle: 'Insérer un template',
        onClick: (ctx) => {
            ctx.insertContent('<div class="template">Mon template</div>');
        }
    });

    // Exemple 3: Bouton d'insertion de code
    const codeInjector = new RichTextToolbarInjector({
        buttonText: '</> Code',
        buttonTitle: 'Insérer un bloc de code',
        onClick: (ctx) => {
            const code = prompt('Entrez votre code:');
            if (code) {
                ctx.insertContent(`<pre><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`);
            }
        }
    });
    */

    // ============================================================
    // 12. EXPORT / EXPOSITION GLOBALE
    // ============================================================

    // Pour utilisation en userscript ou extension
    if (typeof window !== 'undefined') {
        window.RichTextToolbarInjector = RichTextToolbarInjector;
    }

    // Pour utilisation en module
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = RichTextToolbarInjector;
    }

    // Auto-démarrage si exécuté comme userscript
    if (typeof GM_info !== 'undefined' || document.currentScript?.src.includes('userscript')) {
        // Attendre que le DOM soit prêt
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.richTextInjector = new RichTextToolbarInjector({ debug: true });
            });
        } else {
            window.richTextInjector = new RichTextToolbarInjector({ debug: true });
        }
    }

})();
