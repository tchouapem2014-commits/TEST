# Build CapX with embedded libraries and CSS
$output = 'd:\RRRR\SpiraApps\CapX\capx.js'
$libs = @(
    'd:\RRRR\SpiraApps\CapX\libs\fabric.min.js',
    'd:\RRRR\SpiraApps\CapX\libs\tui-code-snippet.min.js',
    'd:\RRRR\SpiraApps\CapX\libs\tui-color-picker.min.js',
    'd:\RRRR\SpiraApps\CapX\libs\tui-image-editor.min.js'
)

$cssFiles = @(
    'd:\RRRR\SpiraApps\CapX\libs\tui-color-picker.min.css',
    'd:\RRRR\SpiraApps\CapX\libs\tui-image-editor.min.css'
)

# Read and escape CSS content
$cssContent = ""
foreach ($cssFile in $cssFiles) {
    $css = (Get-Content $cssFile -Raw)
    # Escape backslashes and quotes for JavaScript string
    $css = $css -replace '\\', '\\\\'
    $css = $css -replace '"', '\"'
    $css = $css -replace "`r`n", ' '
    $css = $css -replace "`n", ' '
    $cssContent += $css
}

# Header
$content = @"
/**
 * CAPX - Professional Screenshot Capture with tui.image-editor
 * Version 1.0 - All libraries embedded (with CSS injection)
 *
 * Includes: Fabric.js, tui-code-snippet, tui-color-picker, tui-image-editor
 */

// ============================================================
// CSS INJECTION (tui-color-picker + tui-image-editor)
// ============================================================
(function() {
    var cssId = 'capx-tui-styles';
    if (!document.getElementById(cssId)) {
        var style = document.createElement('style');
        style.id = cssId;
        style.textContent = "$cssContent";
        document.head.appendChild(style);
        console.log('[CapX] CSS styles injected');
    }
})();

// ============================================================
// EMBEDDED LIBRARIES START
// ============================================================

"@

# Add each library
foreach ($lib in $libs) {
    $name = [System.IO.Path]::GetFileName($lib)
    $content += "`n// === $name ===`n"
    $content += (Get-Content $lib -Raw)
    $content += "`n"
}

$content += @"

// ============================================================
// EMBEDDED LIBRARIES END
// ============================================================

"@

# Read the CapX application code with LIGHT THEME
$appCode = @"

// ============================================================
// CAPX APPLICATION CODE
// ============================================================

(function() {
    'use strict';

    var CAPX_VERSION = "1.0";
    var CAPX_PREFIX = "[CapX]";
    var CAPX_GUID = "b2c3d4e5-f6a7-8901-bcde-f23456789012";
    var CAPX_INJECTED_CLASS = 'capx-capture-injected';

    var TOOLBAR_SELECTORS = [
        '.reToolbar',
        '.reToolbarWrapper',
        '.RadEditor .reToolCell',
        '.tox-toolbar__primary',
        '.tox-toolbar',
        '.mce-toolbar',
        '.mce-toolbar-grp',
        '.cke_top',
        '.cke_toolbox',
        '.ck-toolbar',
        '[role="toolbar"]'
    ].join(', ');

    var EDITOR_SELECTORS = [
        '.RadEditor',
        '.tox-tinymce',
        '.mce-tinymce',
        '.cke',
        '.ck-editor'
    ].join(', ');

    var capxState = {
        settings: null,
        debugMode: true,
        captureQuality: 0.92,
        captureFormat: "png",
        autoTimestamp: true,
        editorTheme: "light",
        currentEditor: null,
        editorDialog: null,
        tuiEditor: null,
        capturedImage: null
    };

    function capxLog(level, message, data) {
        if (!capxState.debugMode && level !== "ERROR") return;
        var prefix = CAPX_PREFIX + " [" + level + "]";
        if (data !== undefined) {
            console.log(prefix, message, data);
        } else {
            console.log(prefix, message);
        }
    }

    console.log(CAPX_PREFIX + " CapX Pro v" + CAPX_VERSION + " - Loading...");

    function init() {
        console.log(CAPX_PREFIX + " Initializing...");
        loadSettings();
        injectCaptureButtons();
        setupMutationObserver();
        setTimeout(injectCaptureButtons, 1000);
        setTimeout(injectCaptureButtons, 3000);
        setTimeout(injectCaptureButtons, 5000);
        registerMenuHandler();
        console.log(CAPX_PREFIX + " Initialized successfully");
    }

    function loadSettings() {
        if (typeof SpiraAppSettings === 'undefined') {
            capxLog("DEBUG", "SpiraAppSettings not available");
            return;
        }
        capxState.settings = SpiraAppSettings[CAPX_GUID];
        if (!capxState.settings) return;
        capxState.debugMode = (capxState.settings.debug_mode === true || capxState.settings.debug_mode === "Y");
        var quality = parseFloat(capxState.settings.capture_quality);
        if (!isNaN(quality) && quality >= 0.1 && quality <= 1.0) {
            capxState.captureQuality = quality;
        }
        if (capxState.settings.capture_format === "jpeg") {
            capxState.captureFormat = "jpeg";
        }
        if (capxState.settings.editor_theme === "dark") {
            capxState.editorTheme = "dark";
        }
        capxLog("DEBUG", "Settings loaded:", capxState);
    }

    function registerMenuHandler() {
        if (typeof spiraAppManager === 'undefined') return;
        try {
            spiraAppManager.registerEvent_menuEntryClick(CAPX_GUID, "captureScreen", function() {
                startCapture(null);
            });
            spiraAppManager.registerEvent_menuEntryClick(CAPX_GUID, "captureArea", function() {
                startCapture(null);
            });
            capxLog("DEBUG", "Menu handlers registered");
        } catch (err) {
            capxLog("ERROR", "Failed to register menu handler", err);
        }
    }

    function injectCaptureButtons() {
        var toolbars = document.querySelectorAll(TOOLBAR_SELECTORS);
        var injectedCount = 0;
        toolbars.forEach(function(toolbar) {
            if (toolbar.querySelector('.capx-capture-btn')) return;
            if (toolbar.classList.contains(CAPX_INJECTED_CLASS)) return;
            toolbar.classList.add(CAPX_INJECTED_CLASS);
            var btn = createCaptureButton(toolbar);
            var wrapper = toolbar.querySelector('.reToolbarWrapper, .tox-toolbar__group, .mce-btn-group, .cke_toolgroup, .ck-toolbar__items');
            if (wrapper) {
                wrapper.appendChild(btn);
            } else {
                toolbar.appendChild(btn);
            }
            injectedCount++;
            capxLog("DEBUG", "Button injected in toolbar", toolbar);
        });
        if (injectedCount > 0) {
            capxLog("DEBUG", "Injected " + injectedCount + " capture button(s)");
        }
    }

    function createCaptureButton(toolbar) {
        var btn = document.createElement('button');
        btn.className = 'capx-capture-btn reTool';
        btn.setAttribute('type', 'button');
        btn.setAttribute('title', 'CapX - Professional Screenshot Capture');
        btn.setAttribute('data-capx', 'true');
        btn.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;margin:1px;padding:3px;border:1px solid #999;border-radius:3px;background:linear-gradient(180deg,#fff 0%,#e8e8e8 100%);cursor:pointer;vertical-align:middle;box-sizing:border-box';
        btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0066cc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>';
        btn.onmouseenter = function() {
            btn.style.background = 'linear-gradient(180deg,#e8f4fc 0%,#cce4f7 100%)';
            btn.style.borderColor = '#0078d4';
        };
        btn.onmouseleave = function() {
            btn.style.background = 'linear-gradient(180deg,#fff 0%,#e8e8e8 100%)';
            btn.style.borderColor = '#999';
        };
        btn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            var editorInfo = findEditorInstance(btn);
            capxState.currentEditor = editorInfo;
            startCapture(editorInfo);
        };
        return btn;
    }

    function findEditorInstance(element) {
        var editorContainer = element.closest(EDITOR_SELECTORS);
        if (!editorContainer) {
            var parent = element.parentElement;
            while (parent && parent !== document.body) {
                editorContainer = parent.querySelector(EDITOR_SELECTORS);
                if (editorContainer) break;
                parent = parent.parentElement;
            }
        }
        if (!editorContainer) {
            capxLog("DEBUG", "No editor container found");
            return null;
        }
        if (typeof `$find === 'function') {
            var radEditor = `$find(editorContainer.id);
            if (radEditor && radEditor.pasteHtml) {
                capxLog("DEBUG", "Found RadEditor via `$find:", editorContainer.id);
                return { type: 'radeditor', instance: radEditor, container: editorContainer };
            }
        }
        if (typeof Telerik !== 'undefined' && Telerik.Web && Telerik.Web.UI && Telerik.Web.UI.RadEditor) {
            if (Telerik.Web.UI.RadEditor.get_editors) {
                var editors = Telerik.Web.UI.RadEditor.get_editors();
                if (editors && editors.length > 0) {
                    capxLog("DEBUG", "Found RadEditor via get_editors");
                    return { type: 'radeditor', instance: editors[0], container: editorContainer };
                }
            }
        }
        capxLog("DEBUG", "No editor instance found, using fallback");
        return { type: 'fallback', instance: null, container: editorContainer };
    }

    function insertHtmlToEditor(editorInfo, html) {
        capxLog("DEBUG", "insertHtmlToEditor called");
        if (!editorInfo || !editorInfo.instance) {
            return insertFallback(editorInfo, html);
        }
        if (editorInfo.type === 'radeditor') {
            try {
                var radEd = editorInfo.instance;
                if (typeof radEd.pasteHtml === 'function') {
                    radEd.pasteHtml(html);
                    capxLog("DEBUG", "Inserted via RadEditor.pasteHtml");
                    return true;
                }
            } catch (e) {
                capxLog("ERROR", "RadEditor insert failed:", e);
            }
        }
        return insertFallback(editorInfo, html);
    }

    function insertFallback(editorInfo, html) {
        capxLog("DEBUG", "insertFallback called");
        if (typeof Telerik !== 'undefined' && Telerik.Web && Telerik.Web.UI && Telerik.Web.UI.RadEditor) {
            if (Telerik.Web.UI.RadEditor.get_editors) {
                var editors = Telerik.Web.UI.RadEditor.get_editors();
                if (editors && editors.length > 0) {
                    var editor = editors[0];
                    if (editor.pasteHtml) {
                        editor.pasteHtml(html);
                        capxLog("DEBUG", "Inserted via global RadEditor fallback");
                        return true;
                    }
                }
            }
        }
        capxLog("DEBUG", "All insert methods failed");
        return false;
    }

    function setupMutationObserver() {
        var observer = new MutationObserver(function(mutations) {
            var shouldInject = false;
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length === 0) return;
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType !== 1) return;
                    if (node.matches && node.matches(TOOLBAR_SELECTORS)) {
                        shouldInject = true;
                    }
                    if (node.querySelector && node.querySelector(TOOLBAR_SELECTORS)) {
                        shouldInject = true;
                    }
                });
            });
            if (shouldInject) {
                setTimeout(injectCaptureButtons, 300);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        capxLog("DEBUG", "MutationObserver setup complete");
    }

    function startCapture(editorInfo) {
        capxLog("DEBUG", "Starting capture...");
        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
            showNotification("Screen Capture API not supported", "error");
            return;
        }
        navigator.mediaDevices.getDisplayMedia({
            video: { mediaSource: 'screen', cursor: 'always' }
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
                    stream.getTracks().forEach(function(track) { track.stop(); });
                    capxState.capturedImage = canvas;
                    openTuiEditor(canvas, editorInfo);
                }, 100);
            };
        }).catch(function(err) {
            capxLog("ERROR", "Capture failed", err);
            if (err.name !== 'AbortError') {
                showNotification("Capture error: " + err.message, "error");
            }
        });
    }

    function openTuiEditor(canvas, editorInfo) {
        capxLog("DEBUG", "Opening tui.image-editor...");
        if (typeof tui === 'undefined' || !tui.ImageEditor) {
            capxLog("ERROR", "tui.ImageEditor not loaded!");
            showNotification("Editor failed to load", "error");
            return;
        }
        var dialog = createTuiDialog();
        document.body.appendChild(dialog);
        capxState.editorDialog = dialog;
        setTimeout(function() { initTuiEditor(canvas); }, 100);
    }

    function createTuiDialog() {
        var isLight = (capxState.editorTheme === 'light');
        var bgColor = isLight ? '#f6f6f6' : '#1e1e1e';
        var headerBg = isLight ? '#e8e8e8' : '#151515';
        var borderColor = isLight ? '#dddddd' : '#3c3c3c';
        var textColor = isLight ? '#333333' : '#ffffff';

        var overlay = document.createElement('div');
        overlay.className = 'capx-editor-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:999990;display:flex;align-items:center;justify-content:center';
        var dialog = document.createElement('div');
        dialog.className = 'capx-editor-dialog';
        dialog.style.cssText = 'background:' + bgColor + ';border-radius:8px;box-shadow:0 4px 30px rgba(0,0,0,0.5);width:95vw;height:95vh;display:flex;flex-direction:column;overflow:hidden';
        var header = document.createElement('div');
        header.style.cssText = 'padding:12px 16px;background:' + headerBg + ';border-bottom:1px solid ' + borderColor + ';display:flex;justify-content:space-between;align-items:center';
        var title = document.createElement('span');
        title.style.cssText = 'font-weight:bold;font-size:16px;color:' + textColor;
        title.textContent = 'CapX Pro - Screenshot Editor';
        var closeBtn = document.createElement('button');
        closeBtn.style.cssText = 'background:none;border:none;font-size:24px;cursor:pointer;color:' + (isLight ? '#666' : '#aaa') + ';padding:0 8px';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = closeTuiEditor;
        header.appendChild(title);
        header.appendChild(closeBtn);
        var editorContainer = document.createElement('div');
        editorContainer.id = 'capx-tui-editor';
        editorContainer.style.cssText = 'flex:1;overflow:hidden';
        var footer = document.createElement('div');
        footer.style.cssText = 'padding:12px 16px;background:' + headerBg + ';border-top:1px solid ' + borderColor + ';display:flex;justify-content:flex-end;gap:12px';
        var cancelBtn = document.createElement('button');
        cancelBtn.style.cssText = 'padding:10px 24px;border:1px solid ' + (isLight ? '#999' : '#555') + ';border-radius:4px;background:' + (isLight ? '#fff' : '#3d3d3d') + ';color:' + textColor + ';cursor:pointer;font-size:14px';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.onclick = closeTuiEditor;
        var insertBtn = document.createElement('button');
        insertBtn.style.cssText = 'padding:10px 24px;border:none;border-radius:4px;background:#0066cc;color:#fff;cursor:pointer;font-size:14px;font-weight:bold';
        insertBtn.textContent = 'Insert Image';
        insertBtn.onclick = insertTuiImage;
        footer.appendChild(cancelBtn);
        footer.appendChild(insertBtn);
        dialog.appendChild(header);
        dialog.appendChild(editorContainer);
        dialog.appendChild(footer);
        overlay.appendChild(dialog);
        document.addEventListener('keydown', handleEscapeKey);
        overlay.onclick = function(e) { if (e.target === overlay) closeTuiEditor(); };
        return overlay;
    }

    function initTuiEditor(sourceCanvas) {
        var container = document.getElementById('capx-tui-editor');
        if (!container) {
            capxLog("ERROR", "Editor container not found");
            return;
        }
        var imageDataUrl = sourceCanvas.toDataURL('image/png');

        // TOAST UI White/Light Theme (default)
        var lightTheme = {
            'common.bi.image': '',
            'common.bisize.width': '0',
            'common.bisize.height': '0',
            'common.backgroundImage': 'none',
            'common.backgroundColor': '#f6f6f6',
            'common.border': '0px',
            'header.backgroundImage': 'none',
            'header.backgroundColor': 'transparent',
            'header.border': '0px',
            'header.display': 'none',
            'loadButton.display': 'none',
            'downloadButton.display': 'none',
            'menu.iconSize.width': '24px',
            'menu.iconSize.height': '24px',
            'menu.normalIcon.color': '#555555',
            'menu.activeIcon.color': '#009688',
            'menu.disabledIcon.color': '#cccccc',
            'menu.hoverIcon.color': '#222222',
            'submenu.backgroundColor': '#ffffff',
            'submenu.partition.color': '#dddddd',
            'submenu.iconSize.width': '32px',
            'submenu.iconSize.height': '32px',
            'submenu.normalIcon.color': '#555555',
            'submenu.activeIcon.color': '#009688',
            'submenu.normalLabel.color': '#555555',
            'submenu.normalLabel.fontWeight': 'lighter',
            'submenu.activeLabel.color': '#009688',
            'submenu.activeLabel.fontWeight': 'lighter',
            'checkbox.border': '1px solid #cccccc',
            'checkbox.backgroundColor': '#ffffff',
            'range.pointer.color': '#009688',
            'range.bar.color': '#dddddd',
            'range.subbar.color': '#009688',
            'range.disabledPointer.color': '#cccccc',
            'range.disabledBar.color': '#f6f6f6',
            'range.disabledSubbar.color': '#cccccc',
            'range.value.color': '#333333',
            'range.value.fontWeight': 'lighter',
            'range.value.fontSize': '11px',
            'range.value.border': '1px solid #cccccc',
            'range.value.backgroundColor': '#ffffff',
            'range.title.color': '#333333',
            'range.title.fontWeight': 'lighter',
            'colorpicker.button.border': '1px solid #cccccc',
            'colorpicker.title.color': '#333333'
        };

        // Dark theme (alternative)
        var darkTheme = {
            'common.bi.image': '',
            'common.bisize.width': '0',
            'common.bisize.height': '0',
            'common.backgroundImage': 'none',
            'common.backgroundColor': '#1e1e1e',
            'common.border': '0px',
            'header.backgroundImage': 'none',
            'header.backgroundColor': 'transparent',
            'header.border': '0px',
            'header.display': 'none',
            'loadButton.display': 'none',
            'downloadButton.display': 'none',
            'menu.iconSize.width': '24px',
            'menu.iconSize.height': '24px',
            'menu.normalIcon.color': '#8a8a8a',
            'menu.activeIcon.color': '#555555',
            'menu.disabledIcon.color': '#434343',
            'menu.hoverIcon.color': '#e9e9e9',
            'submenu.backgroundColor': '#1e1e1e',
            'submenu.partition.color': '#3c3c3c',
            'submenu.iconSize.width': '32px',
            'submenu.iconSize.height': '32px',
            'submenu.normalIcon.color': '#8a8a8a',
            'submenu.activeIcon.color': '#e9e9e9',
            'submenu.normalLabel.color': '#8a8a8a',
            'submenu.normalLabel.fontWeight': 'lighter',
            'submenu.activeLabel.color': '#ffffff',
            'submenu.activeLabel.fontWeight': 'lighter',
            'checkbox.border': '0px',
            'checkbox.backgroundColor': '#ffffff',
            'range.pointer.color': '#ffffff',
            'range.bar.color': '#666666',
            'range.subbar.color': '#d1d1d1',
            'range.disabledPointer.color': '#414141',
            'range.disabledBar.color': '#282828',
            'range.disabledSubbar.color': '#414141',
            'range.value.color': '#ffffff',
            'range.value.fontWeight': 'lighter',
            'range.value.fontSize': '11px',
            'range.value.border': '1px solid #353535',
            'range.value.backgroundColor': '#151515',
            'range.title.color': '#ffffff',
            'range.title.fontWeight': 'lighter',
            'colorpicker.button.border': '1px solid #1e1e1e',
            'colorpicker.title.color': '#ffffff'
        };

        var selectedTheme = (capxState.editorTheme === 'dark') ? darkTheme : lightTheme;

        try {
            capxState.tuiEditor = new tui.ImageEditor('#capx-tui-editor', {
                includeUI: {
                    loadImage: { path: imageDataUrl, name: 'Screenshot' },
                    theme: selectedTheme,
                    menu: ['crop', 'flip', 'rotate', 'draw', 'shape', 'icon', 'text', 'mask', 'filter'],
                    initMenu: 'draw',
                    uiSize: { width: '100%', height: '100%' },
                    menuBarPosition: 'left'
                },
                cssMaxWidth: window.innerWidth * 0.9,
                cssMaxHeight: window.innerHeight * 0.8,
                usageStatistics: false
            });
            capxLog("DEBUG", "tui.ImageEditor initialized successfully with " + capxState.editorTheme + " theme");
        } catch (err) {
            capxLog("ERROR", "Failed to initialize tui.ImageEditor:", err);
            showNotification("Failed to initialize editor", "error");
        }
    }

    function handleEscapeKey(e) {
        if (e.key === 'Escape' && capxState.editorDialog) {
            closeTuiEditor();
        }
    }

    function closeTuiEditor() {
        if (capxState.tuiEditor) {
            capxState.tuiEditor.destroy();
            capxState.tuiEditor = null;
        }
        if (capxState.editorDialog) {
            capxState.editorDialog.remove();
            capxState.editorDialog = null;
        }
        capxState.capturedImage = null;
        document.removeEventListener('keydown', handleEscapeKey);
    }

    function insertTuiImage() {
        capxLog("DEBUG", "Inserting edited image...");
        if (!capxState.tuiEditor) {
            showNotification("No image to insert", "error");
            return;
        }
        var dataUrl;
        try {
            dataUrl = capxState.tuiEditor.toDataURL({
                format: capxState.captureFormat,
                quality: capxState.captureQuality
            });
        } catch (err) {
            capxLog("ERROR", "Failed to export image:", err);
            showNotification("Failed to export image", "error");
            return;
        }
        copyToClipboard(dataUrl);
        var imgHtml = '<img src="' + dataUrl + '" alt="Screenshot" style="max-width:100%;border:1px solid #ddd;margin:5px 0;" />';
        var success = insertHtmlToEditor(capxState.currentEditor, imgHtml);
        if (success) {
            showNotification("Image inserted and copied to clipboard", "success");
        } else {
            showNotification("Image copied to clipboard. Paste with Ctrl+V", "info");
        }
        closeTuiEditor();
    }

    function copyToClipboard(dataUrl) {
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
                        capxLog("ERROR", "Clipboard write failed", err);
                    });
                }
            });
        };
        img.src = dataUrl;
    }

    function showNotification(message, type) {
        if (typeof spiraAppManager !== 'undefined') {
            switch (type) {
                case 'success':
                    spiraAppManager.displaySuccessMessage(CAPX_PREFIX + ' ' + message);
                    break;
                case 'error':
                    spiraAppManager.displayErrorMessage(CAPX_PREFIX + ' ' + message);
                    break;
                default:
                    spiraAppManager.displayWarningMessage(CAPX_PREFIX + ' ' + message);
            }
            return;
        }
        var notif = document.createElement('div');
        notif.style.cssText = 'position:fixed;bottom:20px;right:20px;padding:12px 20px;background:' + (type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : '#2196F3') + ';color:white;border-radius:4px;z-index:999999;font-family:sans-serif;font-size:14px;box-shadow:0 2px 10px rgba(0,0,0,0.2)';
        notif.textContent = message;
        document.body.appendChild(notif);
        setTimeout(function() {
            notif.style.opacity = '0';
            notif.style.transition = 'opacity 0.3s';
            setTimeout(function() { notif.remove(); }, 300);
        }, 3000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.CAPX = {
        version: CAPX_VERSION,
        capture: function() { startCapture(null); },
        injectButtons: injectCaptureButtons,
        getState: function() { return capxState; }
    };

})();
"@

$content += $appCode

# Write the file
Set-Content -Path $output -Value $content -Encoding UTF8
Write-Host "CapX built successfully with CSS injection and light theme!"
Write-Host "File size:" (Get-Item $output).Length "bytes"
