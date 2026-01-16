# ============================================================
# NextEditor Build Script - Create All-in-One TinyMCE Bundle
# ============================================================
# Usage: .\build-embedded.ps1
# ============================================================

$ErrorActionPreference = "Stop"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " NextEditor Build Script - All-in-One Bundle" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$projectDir = $PSScriptRoot
$libsDir = Join-Path $projectDir "libs"
$outputFile = Join-Path $projectDir "nexteditor.js"

# Check if libs directory exists
if (-not (Test-Path $libsDir)) {
    Write-Host "[ERROR] libs/ directory not found!" -ForegroundColor Red
    Write-Host "Run: .\download-tinymce.ps1" -ForegroundColor Yellow
    exit 1
}

# Check for TinyMCE
$tinymcePath = Join-Path $libsDir "tinymce.min.js"
if (-not (Test-Path $tinymcePath)) {
    Write-Host "[ERROR] tinymce.min.js not found in libs/" -ForegroundColor Red
    exit 1
}

Write-Host "[INFO] Building nexteditor.js with embedded TinyMCE..." -ForegroundColor Green
Write-Host ""

# Start building the output
$outputLines = @()

# Add header
$outputLines += "/**"
$outputLines += " * NextEditor - TinyMCE RichText Editor for SpiraPlan"
$outputLines += " * Version: 1.0"
$outputLines += " * Build Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$outputLines += " *"
$outputLines += " * This file contains:"
$outputLines += " * 1. TinyMCE core library"
$outputLines += " * 2. TinyMCE theme (silver)"
$outputLines += " * 3. TinyMCE plugins (table, lists, link, etc.)"
$outputLines += " * 4. TinyMCE skins (CSS embedded)"
$outputLines += " * 5. NextEditor application code"
$outputLines += " */"
$outputLines += ""

# ============================================================
# EMBED CSS AS BASE64 DATA URLS
# ============================================================
Write-Host "[INFO] Embedding CSS skins..." -ForegroundColor Cyan

$skinCssPath = Join-Path $libsDir "skins\ui\oxide\skin.min.css"
$contentCssPath = Join-Path $libsDir "skins\ui\oxide\content.min.css"
$contentInlineCssPath = Join-Path $libsDir "skins\ui\oxide\content.inline.min.css"
$contentDefaultCssPath = Join-Path $libsDir "skins\content\default\content.min.css"

$skinCss = ""
$contentCss = ""
$contentInlineCss = ""
$contentDefaultCss = ""

if (Test-Path $skinCssPath) {
    $skinCss = Get-Content $skinCssPath -Raw -Encoding UTF8
    Write-Host "  - skin.min.css (UI)" -ForegroundColor Gray
}
if (Test-Path $contentCssPath) {
    $contentCss = Get-Content $contentCssPath -Raw -Encoding UTF8
    Write-Host "  - content.min.css (UI)" -ForegroundColor Gray
}
if (Test-Path $contentInlineCssPath) {
    $contentInlineCss = Get-Content $contentInlineCssPath -Raw -Encoding UTF8
    Write-Host "  - content.inline.min.css" -ForegroundColor Gray
}
if (Test-Path $contentDefaultCssPath) {
    $contentDefaultCss = Get-Content $contentDefaultCssPath -Raw -Encoding UTF8
    Write-Host "  - content/default/content.min.css (resize handles)" -ForegroundColor Gray
}

# Escape CSS for JavaScript string
function Escape-ForJs($str) {
    $str = $str -replace '\\', '\\\\'
    $str = $str -replace "'", "\'"
    $str = $str -replace "`r`n", '\n'
    $str = $str -replace "`n", '\n'
    $str = $str -replace "`r", '\n'
    return $str
}

$skinCssEscaped = Escape-ForJs $skinCss
$contentCssEscaped = Escape-ForJs $contentCss
$contentDefaultCssEscaped = Escape-ForJs $contentDefaultCss

# ============================================================
# EMBED TINYMCE CORE
# ============================================================
Write-Host "[INFO] Embedding TinyMCE core..." -ForegroundColor Cyan
$tinymceContent = Get-Content $tinymcePath -Raw -Encoding UTF8
$outputLines += "// ============================================================"
$outputLines += "// TINYMCE CORE LIBRARY"
$outputLines += "// ============================================================"
$outputLines += $tinymceContent
$outputLines += ""

# ============================================================
# EMBED THEME
# ============================================================
$themePath = Join-Path $libsDir "themes\silver\theme.min.js"
if (Test-Path $themePath) {
    Write-Host "[INFO] Embedding Silver theme..." -ForegroundColor Cyan
    $themeContent = Get-Content $themePath -Raw -Encoding UTF8
    $outputLines += "// ============================================================"
    $outputLines += "// TINYMCE SILVER THEME"
    $outputLines += "// ============================================================"
    $outputLines += $themeContent
    $outputLines += ""
}

# ============================================================
# EMBED ICONS
# ============================================================
$iconsPath = Join-Path $libsDir "icons\default\icons.min.js"
if (Test-Path $iconsPath) {
    Write-Host "[INFO] Embedding default icons..." -ForegroundColor Cyan
    $iconsContent = Get-Content $iconsPath -Raw -Encoding UTF8
    $outputLines += "// ============================================================"
    $outputLines += "// TINYMCE DEFAULT ICONS"
    $outputLines += "// ============================================================"
    $outputLines += $iconsContent
    $outputLines += ""
}

# ============================================================
# EMBED MODEL
# ============================================================
$modelPath = Join-Path $libsDir "models\dom\model.min.js"
if (Test-Path $modelPath) {
    Write-Host "[INFO] Embedding DOM model..." -ForegroundColor Cyan
    $modelContent = Get-Content $modelPath -Raw -Encoding UTF8
    $outputLines += "// ============================================================"
    $outputLines += "// TINYMCE DOM MODEL"
    $outputLines += "// ============================================================"
    $outputLines += $modelContent
    $outputLines += ""
}

# ============================================================
# EMBED ESSENTIAL PLUGINS
# ============================================================
Write-Host "[INFO] Embedding essential plugins..." -ForegroundColor Cyan
$pluginsDir = Join-Path $libsDir "plugins"

# Only embed essential plugins to keep file size reasonable
$essentialPlugins = @(
    "table",      # Table editing - CRITICAL
    "lists",      # List formatting
    "link",       # Links
    "image",      # Images
    "code",       # HTML source
    "fullscreen", # Fullscreen mode
    "searchreplace", # Find & replace
    "advlist",    # Advanced lists
    "autolink",   # Auto-detect links
    "charmap",    # Special characters
    "wordcount",  # Word count
    "anchor",     # Anchor links
    "quickbars",  # Quick toolbars for images/selection
    "visualblocks", # Show block elements (Word-like paragraph marks)
    "nonbreaking",  # Non-breaking spaces (Word-like)
    "insertdatetime", # Insert date/time (Word-like)
    "autoresize", # Auto-resize editor to fit content (Word-like)
    "autosave",   # Auto-save drafts to local storage (crash recovery)
    "save",       # Save button functionality
    "accordion",  # Collapsible FAQ sections
    "media"       # Video/audio embedding (YouTube, Vimeo, etc.)
)

$outputLines += "// ============================================================"
$outputLines += "// TINYMCE PLUGINS"
$outputLines += "// ============================================================"

foreach ($plugin in $essentialPlugins) {
    $pluginPath = Join-Path $pluginsDir "$plugin\plugin.min.js"
    if (Test-Path $pluginPath) {
        Write-Host "  - $plugin" -ForegroundColor Gray
        $pluginContent = Get-Content $pluginPath -Raw -Encoding UTF8
        $outputLines += "// Plugin: $plugin"
        $outputLines += $pluginContent
        $outputLines += ""
    }
}

# ============================================================
# INJECT CSS VIA JAVASCRIPT
# ============================================================
Write-Host "[INFO] Creating CSS injection code..." -ForegroundColor Cyan

$outputLines += "// ============================================================"
$outputLines += "// TINYMCE CSS INJECTION"
$outputLines += "// ============================================================"
$outputLines += "(function() {"
$outputLines += "    if (document.getElementById('nexteditor-tinymce-skin')) return;"
$outputLines += "    var style = document.createElement('style');"
$outputLines += "    style.id = 'nexteditor-tinymce-skin';"
$outputLines += "    style.textContent = '$skinCssEscaped';"
$outputLines += "    document.head.appendChild(style);"
$outputLines += ""
$outputLines += "    var contentStyle = document.createElement('style');"
$outputLines += "    contentStyle.id = 'nexteditor-tinymce-content';"
$outputLines += "    contentStyle.textContent = '$contentCssEscaped';"
$outputLines += "    document.head.appendChild(contentStyle);"
$outputLines += ""
$outputLines += "    // Content default CSS (required for image resize handles)"
$outputLines += "    var contentDefaultStyle = document.createElement('style');"
$outputLines += "    contentDefaultStyle.id = 'nexteditor-tinymce-content-default';"
$outputLines += "    contentDefaultStyle.textContent = '$contentDefaultCssEscaped';"
$outputLines += "    document.head.appendChild(contentDefaultStyle);"
$outputLines += ""
$outputLines += "    // Custom CSS for table resize cursors and bars"
$outputLines += "    var customStyle = document.createElement('style');"
$outputLines += "    customStyle.id = 'nexteditor-custom-styles';"
$outputLines += "    customStyle.textContent = '.ephox-snooker-resizer-bar { background-color: #2196F3 !important; opacity: 0.6 !important; cursor: col-resize !important; width: 4px !important; transition: opacity 0.15s, background-color 0.15s; } .ephox-snooker-resizer-bar:hover { opacity: 1 !important; background-color: #1565C0 !important; } .ephox-snooker-resizer-bar-dragging { background-color: #0D47A1 !important; opacity: 1 !important; } .ephox-snooker-resizer-rows-bar { cursor: row-resize !important; height: 4px !important; }';"
$outputLines += "    document.head.appendChild(customStyle);"
$outputLines += "})();"
$outputLines += ""

# ============================================================
# NEXTEDITOR APPLICATION CODE
# ============================================================
Write-Host "[INFO] Adding NextEditor application code..." -ForegroundColor Cyan

$appCode = @'
// ============================================================
// NEXTEDITOR APPLICATION CODE
// ============================================================

(function() {
    'use strict';

    // ========================================
    // Configuration & State
    // ========================================
    var VERSION = '1.0';
    var PREFIX = '[NextEditor]';

    // Default settings - all configurable via SpiraApp productSettings
    // Defaults match SpiraPlan's RadEditor behavior
    var state = {
        initialized: false,
        settings: {
            // ===== GENERAL (position 1-9) =====
            enableTinymce: true,
            activationMode: 'auto',
            allowToggle: false,
            debugMode: false,
            placeholder: '',

            // ===== EDITOR SIZE (position 10-19) =====
            editorHeight: 300,
            editorWidth: '',
            minHeight: 200,
            maxHeight: 600,
            resize: 'vertical',

            // ===== UI & TOOLBAR (position 20-39) =====
            showMenubar: false,
            menuConfig: 'file edit view insert format table tools',
            toolbarConfig: 'full',
            customToolbar: '',
            toolbarMode: 'wrap',
            toolbarSticky: false,
            toolbarStickyOffset: 0,
            statusbar: true,
            elementpath: true,
            wordcount: true,
            contextmenu: 'link image table',
            quickbarsSelection: '',
            quickbarsInsert: '',

            // ===== TABLE (position 40-59) =====
            tableDefaultBorder: 1,
            tableDefaultCellPadding: 5,
            tableDefaultCellSpacing: 0,
            tableDefaultStyles: 'border-collapse: collapse; width: 100%;',
            tableColumnResizing: true,
            tableResizeBars: true,
            tableAdvtab: true,
            tableCellAdvtab: true,
            tableRowAdvtab: true,
            tableStyleByCell: false,
            tableSizingMode: 'relative',
            tableCloneElements: 'strong em b i u',
            tableHeaderType: 'section',
            tableUseColgroups: false,
            tableBorderWidths: '1px 2px 3px 4px 5px',
            tableBorderStyles: 'solid dashed dotted double groove ridge',

            // ===== CONTENT (position 60-79) =====
            contentFontFamily: 'Arial, Helvetica, sans-serif',
            contentFontSize: '12px',
            contentLineHeight: '1.4',
            fontFamilyFormats: 'Arial=arial,helvetica,sans-serif;Courier New=courier new,courier,monospace;Georgia=georgia,palatino,serif;Tahoma=tahoma,arial,helvetica,sans-serif;Times New Roman=times new roman,times,serif;Verdana=verdana,geneva,sans-serif',
            fontSizeFormats: '8pt 10pt 11pt 12pt 14pt 18pt 24pt 36pt',
            lineHeightFormats: '1 1.2 1.4 1.6 2',
            pasteAsText: false,
            pasteRemoveStyles: false,
            pasteRemoveSpans: false,
            smartPaste: true,
            invalidElements: 'script,object,embed,applet',
            extendedValidElements: 'span[*],div[*],p[*],a[*],img[*],table[*],tr[*],td[*],th[*]',
            entityEncoding: 'named',

            // ===== IMAGES (position 80-89) =====
            allowImages: true,
            imageAdvtab: true,
            imageCaption: true,
            imageDescription: true,
            imageTitle: true,
            imageDimensions: true,
            imageUploadUrl: '',

            // ===== LINKS (position 90-99) =====
            allowLinks: true,
            linkDefaultTarget: '_self',
            linkDefaultProtocol: 'https',
            linkAssumeExternalTargets: true,
            linkContextToolbar: true,
            linkQuicklink: true,
            linkTitle: true,

            // ===== PLUGINS (position 100-119) =====
            allowCodeView: true,
            pluginFullscreen: true,
            pluginSearchreplace: true,
            pluginWordcount: true,
            pluginCharmap: true,
            pluginEmoticons: false,
            pluginInsertdatetime: false,
            pluginPreview: false,
            pluginAnchor: true,
            pluginVisualblocks: false,
            pluginVisualchars: false,
            pluginPagebreak: false,
            pluginNonbreaking: false,
            pluginCodesample: false,
            pluginDirectionality: false,
            pluginHelp: false
        },
        replacedEditors: [],
        tinymceInstances: []
    };

    // ========================================
    // Logging
    // ========================================
    function log(level, message, data) {
        if (!state.settings.debugMode && level === 'DEBUG') return;

        var prefix = PREFIX + ' ' + level + ':';
        if (data !== undefined) {
            console.log(prefix, message, data);
        } else {
            console.log(prefix, message);
        }
    }

    // ========================================
    // Helper: Get setting with default
    // ========================================
    // SpiraPlan provides settings via SpiraAppSettings[APP_GUID].settingName
    // Both system settings (settings) and product settings (productSettings)
    // are merged into this single object.

    function getSetting(name, defaultValue) {
        try {
            // Method 1: SpiraAppSettings (standard SpiraPlan method)
            if (typeof SpiraAppSettings !== 'undefined' && typeof APP_GUID !== 'undefined') {
                var appSettings = SpiraAppSettings[APP_GUID];
                if (appSettings && appSettings[name] !== undefined && appSettings[name] !== null && appSettings[name] !== '') {
                    return appSettings[name];
                }
            }
            // Method 2: spiraAppManager (for testing/mock)
            if (typeof spiraAppManager !== 'undefined') {
                // Try getProductSetting first (for product-level settings)
                if (spiraAppManager.getProductSetting) {
                    var value = spiraAppManager.getProductSetting(name);
                    if (value !== undefined && value !== null && value !== '') {
                        return value;
                    }
                }
                // Try getSystemSetting (for system-level settings in test mode)
                if (spiraAppManager.getSystemSetting) {
                    var sysValue = spiraAppManager.getSystemSetting(name);
                    if (sysValue !== undefined && sysValue !== null && sysValue !== '') {
                        return sysValue;
                    }
                }
            }
        } catch (e) {
            log('DEBUG', 'Error getting setting ' + name, e);
        }
        return defaultValue;
    }

    // Aliases for semantic clarity (both use the same getSetting function)
    function getProductSetting(name, defaultValue) {
        return getSetting(name, defaultValue);
    }

    function getSystemSetting(name, defaultValue) {
        return getSetting(name, defaultValue);
    }

    // Boolean helper
    function getBoolSetting(name, defaultValue) {
        var value = getSetting(name, defaultValue);
        if (typeof value === 'boolean') return value;
        if (value === 'true' || value === '1') return true;
        if (value === 'false' || value === '0') return false;
        return defaultValue;
    }

    // Aliases for semantic clarity
    function getBoolProductSetting(name, defaultValue) {
        return getBoolSetting(name, defaultValue);
    }

    function getBoolSystemSetting(name, defaultValue) {
        return getBoolSetting(name, defaultValue);
    }

    // Integer helper
    function getIntSetting(name, defaultValue) {
        var value = getSetting(name, defaultValue);
        var parsed = parseInt(value, 10);
        return isNaN(parsed) ? defaultValue : parsed;
    }

    // Aliases for semantic clarity
    function getIntProductSetting(name, defaultValue) {
        return getIntSetting(name, defaultValue);
    }

    function getIntSystemSetting(name, defaultValue) {
        return getIntSetting(name, defaultValue);
    }

    // ========================================
    // Settings Loader
    // ========================================
    function loadSettings() {
        var s = state.settings;

        // =====================================================
        // PRODUCT-LEVEL SETTINGS (per-product configuration)
        // =====================================================

        // ===== ACTIVATION (position 1-5) =====
        s.enableTinymce = getBoolProductSetting('enable_tinymce', true);
        s.activationMode = getProductSetting('activation_mode', 'auto');
        s.allowToggle = getBoolProductSetting('allow_toggle', false);
        s.debugMode = getBoolProductSetting('debug_mode', false);
        s.placeholder = getProductSetting('placeholder', '');

        // ===== EDITOR SIZE (position 10-19) =====
        s.editorHeight = getIntProductSetting('editor_height', 300);
        s.editorWidth = getProductSetting('editor_width', '');
        s.minHeight = getIntProductSetting('min_height', 200);
        s.maxHeight = getIntProductSetting('max_height', 600);
        s.resize = getProductSetting('resize', 'vertical');

        // =====================================================
        // SYSTEM-LEVEL SETTINGS (global configuration)
        // =====================================================

        // ===== UI & TOOLBAR (position 1-19) =====
        s.showMenubar = getBoolSystemSetting('show_menubar', true);
        s.menuConfig = getSystemSetting('menu_config', 'file edit view insert format table tools');
        s.toolbarConfig = getSystemSetting('toolbar_config', 'full');
        s.customToolbar = getSystemSetting('custom_toolbar', '');
        s.toolbarMode = getSystemSetting('toolbar_mode', 'wrap');
        s.toolbarSticky = getBoolSystemSetting('toolbar_sticky', false);
        s.toolbarStickyOffset = getIntSystemSetting('toolbar_sticky_offset', 0);
        s.statusbar = getBoolSystemSetting('statusbar', true);
        s.elementpath = getBoolSystemSetting('elementpath', true);
        s.wordcount = getBoolSystemSetting('wordcount', true);
        s.contextmenu = getSystemSetting('contextmenu', 'link image table');
        s.quickbarsSelection = getSystemSetting('quickbars_selection', '');
        s.quickbarsInsert = getSystemSetting('quickbars_insert', '');

        // ===== TABLE SETTINGS (position 20-39) =====
        s.tableDefaultBorder = getIntSystemSetting('table_default_border', 1);
        s.tableDefaultCellPadding = getIntSystemSetting('table_default_cell_padding', 5);
        s.tableDefaultCellSpacing = getIntSystemSetting('table_default_cell_spacing', 0);
        s.tableDefaultStyles = getSystemSetting('table_default_styles', 'border-collapse: collapse; width: 100%;');
        s.tableColumnResizing = getBoolSystemSetting('table_column_resizing', true);
        s.tableResizeBars = getBoolSystemSetting('table_resize_bars', true);
        s.tableAdvtab = getBoolSystemSetting('table_advtab', true);
        s.tableCellAdvtab = getBoolSystemSetting('table_cell_advtab', true);
        s.tableRowAdvtab = getBoolSystemSetting('table_row_advtab', true);
        s.tableStyleByCell = getBoolSystemSetting('table_style_by_cell', false);
        s.tableSizingMode = getSystemSetting('table_sizing_mode', 'relative');
        s.tableCloneElements = getSystemSetting('table_clone_elements', 'strong em b i u');
        s.tableHeaderType = getSystemSetting('table_header_type', 'section');
        s.tableUseColgroups = getBoolSystemSetting('table_use_colgroups', false);
        s.tableBorderWidths = getSystemSetting('table_border_widths', '1px 2px 3px 4px 5px');
        s.tableBorderStyles = getSystemSetting('table_border_styles', 'solid dashed dotted double groove ridge');

        // ===== CONTENT SETTINGS (position 40-59) =====
        s.contentFontFamily = getSystemSetting('content_font_family', 'Arial, Helvetica, sans-serif');
        s.contentFontSize = getSystemSetting('content_font_size', '12px');
        s.contentLineHeight = getSystemSetting('content_line_height', '1.4');
        s.fontFamilyFormats = getSystemSetting('font_family_formats', 'Arial=arial,helvetica,sans-serif;Courier New=courier new,courier,monospace;Georgia=georgia,palatino,serif;Tahoma=tahoma,arial,helvetica,sans-serif;Times New Roman=times new roman,times,serif;Verdana=verdana,geneva,sans-serif');
        s.fontSizeFormats = getSystemSetting('font_size_formats', '8pt 10pt 11pt 12pt 14pt 18pt 24pt 36pt');
        s.lineHeightFormats = getSystemSetting('line_height_formats', '1 1.2 1.4 1.6 2');
        s.pasteAsText = getBoolSystemSetting('paste_as_text', false);
        s.pasteRemoveStyles = getBoolSystemSetting('paste_remove_styles', false);
        s.pasteRemoveSpans = getBoolSystemSetting('paste_remove_spans', false);
        s.smartPaste = getBoolSystemSetting('smart_paste', true);
        s.invalidElements = getSystemSetting('invalid_elements', 'script,object,embed,applet');
        s.extendedValidElements = getSystemSetting('extended_valid_elements', 'span[*],div[*],p[*],a[*],img[*],table[*],tr[*],td[*],th[*]');
        s.entityEncoding = getSystemSetting('entity_encoding', 'named');

        // ===== IMAGE SETTINGS (position 60-69) =====
        s.allowImages = getBoolSystemSetting('allow_images', true);
        s.imageAdvtab = getBoolSystemSetting('image_advtab', true);
        s.imageCaption = getBoolSystemSetting('image_caption', true);
        s.imageDescription = getBoolSystemSetting('image_description', true);
        s.imageTitle = getBoolSystemSetting('image_title', true);
        s.imageDimensions = getBoolSystemSetting('image_dimensions', true);
        s.imageUploadUrl = getSystemSetting('image_upload_url', '');

        // ===== LINK SETTINGS (position 70-79) =====
        s.allowLinks = getBoolSystemSetting('allow_links', true);
        s.linkDefaultTarget = getSystemSetting('link_default_target', '_self');
        s.linkDefaultProtocol = getSystemSetting('link_default_protocol', 'https');
        s.linkAssumeExternalTargets = getBoolSystemSetting('link_assume_external_targets', true);
        s.linkContextToolbar = getBoolSystemSetting('link_context_toolbar', true);
        s.linkQuicklink = getBoolSystemSetting('link_quicklink', true);
        s.linkTitle = getBoolSystemSetting('link_title', true);

        // ===== PLUGIN SETTINGS (position 80-99) =====
        s.allowCodeView = getBoolSystemSetting('allow_code_view', true);
        s.pluginFullscreen = getBoolSystemSetting('plugin_fullscreen', true);
        s.pluginSearchreplace = getBoolSystemSetting('plugin_searchreplace', true);
        s.pluginWordcount = getBoolSystemSetting('plugin_wordcount', true);
        s.pluginCharmap = getBoolSystemSetting('plugin_charmap', true);
        s.pluginEmoticons = getBoolSystemSetting('plugin_emoticons', false);
        s.pluginInsertdatetime = getBoolSystemSetting('plugin_insertdatetime', false);
        s.pluginPreview = getBoolSystemSetting('plugin_preview', false);
        s.pluginAnchor = getBoolSystemSetting('plugin_anchor', true);
        s.pluginVisualblocks = getBoolSystemSetting('plugin_visualblocks', false);
        s.pluginVisualchars = getBoolSystemSetting('plugin_visualchars', false);
        s.pluginPagebreak = getBoolSystemSetting('plugin_pagebreak', false);
        s.pluginNonbreaking = getBoolSystemSetting('plugin_nonbreaking', false);
        s.pluginCodesample = getBoolSystemSetting('plugin_codesample', false);
        s.pluginDirectionality = getBoolSystemSetting('plugin_directionality', false);
        s.pluginHelp = getBoolSystemSetting('plugin_help', false);
        s.pluginMathEquations = getBoolSystemSetting('plugin_math_equations', true);
        s.enableNumberedHeadings = getBoolSystemSetting('enable_numbered_headings', true);
        s.pluginAutosave = getBoolSystemSetting('plugin_autosave', true);
        s.autosaveInterval = getIntSystemSetting('autosave_interval', 30);
        s.pluginAccordion = getBoolSystemSetting('plugin_accordion', true);
        s.pluginMedia = getBoolSystemSetting('plugin_media', true);

        // ===== PAGE FORMAT / WORD EXPORT (position 100-109) =====
        s.pageModeEnabled = getBoolSystemSetting('page_mode_enabled', true);
        s.pageFormat = getSystemSetting('page_format', 'A4');
        s.pageOrientation = getSystemSetting('page_orientation', 'portrait');
        s.pageMarginTop = getIntSystemSetting('page_margin_top', 20);
        s.pageMarginBottom = getIntSystemSetting('page_margin_bottom', 20);
        s.pageMarginLeft = getIntSystemSetting('page_margin_left', 10);
        s.pageMarginRight = getIntSystemSetting('page_margin_right', 10);
        s.pageShowBreaks = getBoolSystemSetting('page_show_breaks', true);
        s.pageZoom = getIntSystemSetting('page_zoom', 100);
        s.pageZoomControls = getBoolSystemSetting('page_zoom_controls', true);

        log('DEBUG', 'Settings loaded', s);
    }

    // ========================================
    // Build Plugins List
    // ========================================
    function getPluginsList() {
        var s = state.settings;
        // Core plugins always included
        var plugins = ['advlist', 'autolink', 'lists', 'table'];

        // Feature-dependent plugins
        if (s.allowLinks) plugins.push('link');
        if (s.allowImages) plugins.push('image');
        if (s.allowCodeView) plugins.push('code');

        // Optional plugins based on settings
        if (s.pluginFullscreen) plugins.push('fullscreen');
        if (s.pluginSearchreplace) plugins.push('searchreplace');
        if (s.pluginWordcount) plugins.push('wordcount');
        if (s.pluginCharmap) plugins.push('charmap');
        if (s.pluginEmoticons) plugins.push('emoticons');
        if (s.pluginInsertdatetime) plugins.push('insertdatetime');
        if (s.pluginPreview) plugins.push('preview');
        if (s.pluginAnchor) plugins.push('anchor');
        if (s.pluginVisualblocks) plugins.push('visualblocks');
        if (s.pluginVisualchars) plugins.push('visualchars');
        if (s.pluginPagebreak) plugins.push('pagebreak');
        if (s.pluginNonbreaking) plugins.push('nonbreaking');
        if (s.pluginCodesample) plugins.push('codesample');
        if (s.pluginDirectionality) plugins.push('directionality');
        if (s.pluginHelp) plugins.push('help');
        if (s.pluginAccordion) plugins.push('accordion');
        if (s.pluginMedia) plugins.push('media');

        // Quickbars - always include for image/table contextual toolbar
        plugins.push('quickbars');

        // Word-like plugins always included
        plugins.push('visualblocks');  // Show paragraph marks like Word
        plugins.push('nonbreaking');   // Non-breaking spaces like Word
        plugins.push('insertdatetime'); // Insert date/time like Word
        plugins.push('autoresize');    // Auto-expand content area like Word
        if (s.pluginAutosave) {
            plugins.push('autosave');  // Auto-save drafts (crash recovery)
        }
        plugins.push('save');          // Save button

        return plugins.join(' ');
    }

    // ========================================
    // Toolbar Configurations
    // ========================================
    function getToolbarConfig() {
        var s = state.settings;

        // Custom toolbar takes priority
        if (s.toolbarConfig === 'custom' && s.customToolbar) {
            return s.customToolbar;
        }

        // Build optional buttons based on enabled features
        var linkBtn = s.allowLinks ? 'link' : '';
        var imageBtn = s.allowImages ? 'image' : '';
        var codeBtn = s.allowCodeView ? 'code' : '';
        var fullscreenBtn = s.pluginFullscreen ? 'fullscreen' : '';
        var searchBtn = s.pluginSearchreplace ? 'searchreplace' : '';
        var charmapBtn = s.pluginCharmap ? 'charmap' : '';
        var anchorBtn = s.pluginAnchor ? 'anchor' : '';
        var previewBtn = s.pluginPreview ? 'preview' : '';
        var emoticonsBtn = s.pluginEmoticons ? 'emoticons' : '';
        var insertdatetimeBtn = s.pluginInsertdatetime ? 'insertdatetime' : '';
        var visualblocksBtn = s.pluginVisualblocks ? 'visualblocks' : '';
        var visualcharsBtn = s.pluginVisualchars ? 'visualchars' : '';
        var pagebreakBtn = s.pluginPagebreak ? 'pagebreak' : '';
        var nonbreakingBtn = s.pluginNonbreaking ? 'nonbreaking' : '';
        var codesampleBtn = s.pluginCodesample ? 'codesample' : '';
        var ltrBtn = s.pluginDirectionality ? 'ltr' : '';
        var rtlBtn = s.pluginDirectionality ? 'rtl' : '';
        var helpBtn = s.pluginHelp ? 'help' : '';
        var mathBtn = s.pluginMathEquations ? 'mathequation' : '';
        var accordionBtn = s.pluginAccordion ? 'accordion' : '';
        var mediaBtn = s.pluginMedia ? 'media' : '';

        // Helper function to filter empty strings and join
        function join(items) {
            return items.filter(Boolean).join(' ');
        }

        // Zoom controls - only when page mode is enabled
        var zoomControls = (s.pageModeEnabled && s.pageZoomControls) ? 'zoomout zoommenu zoomin' : '';

        var configs = {
            minimal: 'undo redo | bold italic | bullist numlist',

            standard: join([
                'undo redo',
                '|',
                'blocks',
                '|',
                'bold italic underline strikethrough',
                '|',
                'bullist numlist',
                '|',
                'table',
                '|',
                join([linkBtn, imageBtn]),
                '|',
                join([codeBtn, fullscreenBtn]),
                zoomControls ? '|' : '',
                zoomControls
            ]),

            full: join([
                'undo redo',
                '|',
                'styles fontfamily fontsize lineheight',
                '|',
                'bold italic underline strikethrough subscript superscript',
                '|',
                'forecolor backcolor',
                '|',
                'alignleft aligncenter alignright alignjustify',
                '|',
                'bullist numlist outdent indent',
                '|',
                'table',
                '|',
                join([linkBtn, imageBtn, mediaBtn, anchorBtn]),
                '|',
                join([charmapBtn, emoticonsBtn, insertdatetimeBtn]),
                join([mathBtn, accordionBtn, nonbreakingBtn, 'hr']),
                '|',
                join([codeBtn, codesampleBtn, previewBtn]),
                '|',
                join([visualblocksBtn, visualcharsBtn, pagebreakBtn]),
                '|',
                join([ltrBtn, rtlBtn]),
                '|',
                join([searchBtn, fullscreenBtn, helpBtn]),
                zoomControls ? '|' : '',
                zoomControls,
                '|',
                'removeformat'
            ])
        };

        // Clean up double pipes
        var toolbar = configs[s.toolbarConfig] || configs.full;
        toolbar = toolbar.replace(/\|\s*\|/g, '|').replace(/^\s*\|\s*/, '').replace(/\s*\|\s*$/, '');
        return toolbar;
    }

    // ========================================
    // RadEditor Detection
    // ========================================
    function findRadEditors() {
        var editors = [];

        // Method 1: Telerik API
        if (window.Telerik && Telerik.Web.UI && Telerik.Web.UI.RadEditor) {
            try {
                var instances = Telerik.Web.UI.RadEditor.get_instances ?
                    Telerik.Web.UI.RadEditor.get_instances() : [];
                for (var i = 0; i < instances.length; i++) {
                    editors.push({
                        type: 'telerik',
                        instance: instances[i],
                        element: instances[i].get_element ? instances[i].get_element() : null
                    });
                }
                log('DEBUG', 'Found ' + editors.length + ' RadEditors via Telerik API');
            } catch (e) {
                log('DEBUG', 'Telerik API error', e);
            }
        }

        // Method 2: DOM detection
        if (editors.length === 0) {
            var containers = document.querySelectorAll('.RadEditor, [id*="RadEditor"]');
            containers.forEach(function(el) {
                var textarea = el.querySelector('textarea');
                if (textarea && !editors.some(function(e) { return e.textarea === textarea; })) {
                    editors.push({
                        type: 'dom',
                        element: el,
                        textarea: textarea
                    });
                }
            });
            log('DEBUG', 'Found ' + editors.length + ' RadEditors via DOM');
        }

        return editors;
    }

    // ========================================
    // Get/Set HTML from RadEditor
    // ========================================
    function getRadEditorHtml(editor) {
        try {
            if (editor.type === 'telerik' && editor.instance && editor.instance.get_html) {
                return editor.instance.get_html(true);
            }
            if (editor.textarea) {
                return editor.textarea.value || '';
            }
        } catch (e) {
            log('ERROR', 'Failed to get RadEditor HTML', e);
        }
        return '';
    }

    function setRadEditorHtml(editor, html) {
        try {
            if (editor.type === 'telerik' && editor.instance && editor.instance.set_html) {
                editor.instance.set_html(html);
            }
            if (editor.textarea) {
                editor.textarea.value = html;
            }
        } catch (e) {
            log('ERROR', 'Failed to set RadEditor HTML', e);
        }
    }

    // ========================================
    // Create TinyMCE Instance
    // ========================================
    function createTinyMCE(editor, index) {
        var s = state.settings;
        var containerId = 'nexteditor-container-' + index;
        var editorId = 'nexteditor-tinymce-' + index;

        // Create container
        var container = document.createElement('div');
        container.id = containerId;
        container.className = 'nexteditor-container';
        var containerWidth = s.editorWidth ? s.editorWidth : '100%';
        container.style.cssText = 'width:' + containerWidth + ';min-height:' + s.minHeight + 'px;margin:5px 0;';

        // Create textarea for TinyMCE
        var textarea = document.createElement('textarea');
        textarea.id = editorId;
        textarea.style.cssText = 'width:100%;min-height:' + s.minHeight + 'px;';
        container.appendChild(textarea);

        // Add toggle button if allowed
        if (s.allowToggle) {
            var toggleBtn = document.createElement('button');
            toggleBtn.type = 'button';
            toggleBtn.className = 'nexteditor-toggle-btn';
            toggleBtn.textContent = 'Switch to RadEditor';
            toggleBtn.style.cssText = 'margin:5px 0;padding:5px 10px;cursor:pointer;' +
                                      'background:#f0f0f0;border:1px solid #ccc;border-radius:3px;';
            toggleBtn.onclick = function() {
                toggleEditor(index);
            };
            container.insertBefore(toggleBtn, textarea);
        }

        // Hide RadEditor and insert TinyMCE container
        if (editor.element) {
            editor.element.style.display = 'none';
            editor.element.parentNode.insertBefore(container, editor.element);
        }

        // Get initial HTML content
        var initialHtml = getRadEditorHtml(editor);

        // Calculate page dimensions based on format
        var pageDimensions = {
            'A4': { width: 210, height: 297 },
            'Letter': { width: 216, height: 279 },
            'Legal': { width: 216, height: 356 },
            'A3': { width: 297, height: 420 },
            'A5': { width: 148, height: 210 }
        };
        var pageDim = pageDimensions[s.pageFormat] || pageDimensions['A4'];
        if (s.pageOrientation === 'landscape') {
            var temp = pageDim.width;
            pageDim.width = pageDim.height;
            pageDim.height = temp;
        }
        // Page dimensions - use full page width, padding will create margins
        var pageWidthMm = pageDim.width;
        var pageHeightMm = pageDim.height;

        // Build content style with all content settings (Word-like styling)
        var contentStyle = '';

        // Page mode: Word-like document view (TinyMCE best practices)
        // Based on: https://www.tiny.cloud/blog/build-an-online-word-processor-with-our-wysiwyg-editor/
        // IMPORTANT: Using body width/padding without margin to avoid resize handle offset issues
        if (s.pageModeEnabled) {
            contentStyle += '@media (min-width: 840px) { ' +
                'html { ' +
                'background: #eceef4; ' +  // Light gray workspace background
                'min-height: 100%; ' +
                '} ' +
                'body { ' +
                'background-color: #fff; ' +  // White page
                'box-shadow: 0 0 4px rgba(0,0,0,0.15); ' +  // Subtle shadow
                'box-sizing: border-box; ' +
                'margin: 0 auto; ' +  // Center horizontally, NO vertical margin (fixes resize handle offset)
                'width: ' + pageWidthMm + 'mm; ' +  // Fixed A4 width
                'min-height: 100%; ' +  // Fill iframe
                'padding: ' + s.pageMarginTop + 'mm ' + s.pageMarginRight + 'mm ' + s.pageMarginBottom + 'mm ' + s.pageMarginLeft + 'mm; ' +
                'font-family: ' + s.contentFontFamily + '; ' +
                'font-size: ' + s.contentFontSize + '; ' +
                'line-height: ' + s.contentLineHeight + '; ' +
                'word-wrap: break-word; ' +
                'counter-reset: chapter section subsection paragraph subparagraph; ' +
                '} ' +
                '} ' +
                // Responsive fallback for smaller screens
                '@media (max-width: 839px) { ' +
                'body { ' +
                'font-family: ' + s.contentFontFamily + '; ' +
                'font-size: ' + s.contentFontSize + '; ' +
                'line-height: ' + s.contentLineHeight + '; ' +
                'padding: 15px; ' +
                'margin: 0; ' +
                'counter-reset: chapter section subsection paragraph subparagraph; ' +
                '} ' +
                '} ' +
                // Remove top margin on first element
                'body > *:first-child { margin-top: 0; } ' +
                'p:first-child, h1:first-child, h2:first-child, h3:first-child, h4:first-child, h5:first-child, h6:first-child { margin-top: 0; } ';
        } else {
            contentStyle += 'body { ' +
                'font-family: ' + s.contentFontFamily + '; ' +
                'font-size: ' + s.contentFontSize + '; ' +
                'line-height: ' + s.contentLineHeight + '; ' +
                'padding: 15px 20px; ' +
                'max-width: 100%; ' +
                'word-wrap: break-word; ' +
                'counter-reset: chapter section subsection paragraph subparagraph; ' +
                '} ';
        }

        contentStyle +=
            // Table styling (Word-like)
            'table { border-collapse: collapse; margin: 10px 0; } ' +
            'table td, table th { border: 1px solid #ccc; padding: 5px 10px; vertical-align: top; } ' +
            'table th { background-color: #f5f5f5; font-weight: bold; } ' +
            // Image styling (Word-like) with resize handles
            'img { max-width: 100%; height: auto; cursor: pointer; } ' +
            'img:hover { outline: 2px solid #2196F3; } ' +
            'img[data-mce-selected] { outline: 3px solid #1565C0 !important; cursor: move; } ' +
            '.mce-resizehandle { position: absolute; width: 10px; height: 10px; background: #1565C0; border: 1px solid white; } ' +
            // Floated images (Word-like text wrapping)
            'img.align-left { float: left; margin: 0 15px 10px 0; } ' +
            'img.align-right { float: right; margin: 0 0 10px 15px; } ' +
            'img.align-center { display: block; margin: 10px auto; } ' +
            // Paragraph and heading spacing (Word-like)
            'p { margin: 0 0 10px 0; } ' +
            'h1, h2, h3, h4, h5, h6 { margin: 15px 0 10px 0; } ' +
            // List styling (Word-like)
            'ul, ol { margin: 10px 0; padding-left: 30px; } ' +
            'li { margin: 3px 0; } ' +
            // Horizontal rule (Word-like)
            'hr { border: none; border-top: 1px solid #ccc; margin: 15px 0; } ' +
            // Non-breaking space highlight for visualblocks
            '.mce-nbsp-wrap { background-color: #e0e0e0; } ' +
            // Custom styles for style_formats
            '.info-box { background: #e7f3ff; border-left: 4px solid #0066cc; padding: 15px; margin: 10px 0; border-radius: 0 4px 4px 0; } ' +
            '.warning-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 10px 0; border-radius: 0 4px 4px 0; } ' +
            '.success-box { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 10px 0; border-radius: 0 4px 4px 0; } ' +
            '.error-box { background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 10px 0; border-radius: 0 4px 4px 0; } ' +
            '.highlight { background-color: #ffff00; padding: 2px 4px; } ' +
            '.quote { border-left: 4px solid #ccc; padding-left: 15px; margin: 10px 0; color: #666; font-style: italic; } ' +
            'code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: monospace; } ' +
            'pre { background: #f4f4f4; padding: 15px; border-radius: 4px; overflow-x: auto; font-family: monospace; } ' +
            // Numbered headings with CSS counters (auto-numbering like Word)
            '.numbered-h1 { counter-reset: section subsection paragraph subparagraph; counter-increment: chapter; } ' +
            '.numbered-h1::before { content: counter(chapter) ". "; font-weight: bold; } ' +
            '.numbered-h2 { counter-reset: subsection paragraph subparagraph; counter-increment: section; } ' +
            '.numbered-h2::before { content: counter(chapter) "." counter(section) " "; font-weight: bold; } ' +
            '.numbered-h3 { counter-reset: paragraph subparagraph; counter-increment: subsection; } ' +
            '.numbered-h3::before { content: counter(chapter) "." counter(section) "." counter(subsection) " "; font-weight: bold; } ' +
            '.numbered-h4 { counter-reset: subparagraph; counter-increment: paragraph; } ' +
            '.numbered-h4::before { content: counter(chapter) "." counter(section) "." counter(subsection) "." counter(paragraph) " "; font-weight: bold; } ' +
            '.numbered-h5 { counter-increment: subparagraph; } ' +
            '.numbered-h5::before { content: counter(chapter) "." counter(section) "." counter(subsection) "." counter(paragraph) "." counter(subparagraph) " "; font-weight: bold; } ' +
            // Accordion styling
            'details.mce-accordion { border: 1px solid #ccc; border-radius: 4px; margin: 10px 0; padding: 0; } ' +
            'details.mce-accordion summary { background: #f5f5f5; padding: 10px 15px; cursor: pointer; font-weight: bold; border-radius: 4px 4px 0 0; } ' +
            'details.mce-accordion[open] summary { border-bottom: 1px solid #ccc; border-radius: 4px 4px 0 0; } ' +
            'details.mce-accordion > div { padding: 15px; } ' +
            // Media embeds
            '.mce-object-iframe { border: 1px solid #ccc; background: #f9f9f9; } ' +
            // Page break indicator (when pagebreak plugin used)
            '.mce-pagebreak { ' +
                'border-top: 2px dashed #999; ' +
                'margin: 20px 0; ' +
                'padding-top: 20px; ' +
                'page-break-before: always; ' +
            '} ' +
            '.mce-pagebreak::before { ' +
                'content: "--- Page Break ---"; ' +
                'display: block; ' +
                'text-align: center; ' +
                'color: #999; ' +
                'font-size: 11px; ' +
                'margin-top: -30px; ' +
                'background: white; ' +
                'width: 100px; ' +
                'margin-left: auto; ' +
                'margin-right: auto; ' +
            '}';

        // Build TinyMCE config from ALL settings
        var tinymceConfig = {
            selector: '#' + editorId,

            // ===== SIZE SETTINGS =====
            height: s.editorHeight,
            min_height: s.minHeight,
            max_height: s.maxHeight,
            resize: s.resize === 'false' ? false : (s.resize === 'both' || s.resize === 'vertical' || s.resize === true ? s.resize : true),

            // ===== UI & TOOLBAR SETTINGS =====
            menubar: s.showMenubar ? s.menuConfig : false,
            plugins: getPluginsList(),
            toolbar: getToolbarConfig(),
            toolbar_mode: s.toolbarMode,
            toolbar_sticky: s.toolbarSticky,
            toolbar_sticky_offset: s.toolbarStickyOffset,
            statusbar: s.statusbar,
            elementpath: s.elementpath,
            contextmenu: s.contextmenu,
            placeholder: s.placeholder,

            // Quickbars - contextual toolbars for selection, insert, and images
            quickbars_selection_toolbar: s.quickbarsSelection || 'bold italic | quicklink h2 h3 blockquote',
            quickbars_insert_toolbar: s.quickbarsInsert || false,
            quickbars_image_toolbar: 'alignleft aligncenter alignright | image',

            // ===== TABLE SETTINGS =====
            table_toolbar: 'tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | ' +
                          'tableinsertcolbefore tableinsertcolafter tabledeletecol | tablemergecells tablesplitcells | ' +
                          'tablecellprops tablerowprops tablecellborderwidth tablecellborderstyle tablecellbackgroundcolor',
            table_appearance_options: true,
            table_advtab: s.tableAdvtab,
            table_cell_advtab: s.tableCellAdvtab,
            table_row_advtab: s.tableRowAdvtab,
            table_column_resizing: s.tableColumnResizing ? 'resizetable' : false,  // 'resizetable' = only resized column changes, table width adjusts
            table_resize_bars: s.tableResizeBars,
            table_sizing_mode: s.tableSizingMode,
            table_style_by_cell: s.tableStyleByCell,
            table_clone_elements: s.tableCloneElements,
            table_header_type: s.tableHeaderType,
            table_use_colgroups: s.tableUseColgroups,
            table_default_styles: { 'border-collapse': 'collapse', 'width': '100%' },
            table_default_attributes: {
                border: s.tableDefaultBorder,
                cellpadding: s.tableDefaultCellPadding,
                cellspacing: s.tableDefaultCellSpacing
            },
            table_border_widths: s.tableBorderWidths.split(' ').map(function(w) { return { title: w, value: w }; }),
            table_border_styles: s.tableBorderStyles.split(' ').map(function(st) { return { title: st, value: st }; }),
            // Table cell background colors (same as text colors for consistency)
            table_background_color_map: [
                '000000', 'Black',
                '808080', 'Gray',
                'FFFFFF', 'White',
                'FF0000', 'Red',
                'FF6600', 'Orange',
                'FFFF00', 'Yellow',
                '00FF00', 'Lime',
                '00FFFF', 'Cyan',
                '0000FF', 'Blue',
                'FF00FF', 'Magenta',
                '800000', 'Maroon',
                '008000', 'Green',
                '000080', 'Navy',
                '800080', 'Purple',
                'FFCCCC', 'Light Red',
                'FFE6CC', 'Light Orange',
                'FFFFCC', 'Light Yellow',
                'CCFFCC', 'Light Green',
                'CCFFFF', 'Light Cyan',
                'CCE6FF', 'Light Blue',
                'E6CCFF', 'Light Purple',
                'F5F5F5', 'Light Gray',
                'FAFAFA', 'Almost White'
            ],

            // ===== DRAG & DROP / RESIZING =====
            object_resizing: true,  // Enable resizing for ALL objects (images, tables, media)
            resize_img_proportional: true,  // Keep image proportions when resizing
            draggable_modal: true,  // Make dialog windows draggable
            image_class_list: [
                { title: 'None', value: '' },
                { title: 'Align Left', value: 'align-left' },
                { title: 'Align Center', value: 'align-center' },
                { title: 'Align Right', value: 'align-right' }
            ],

            // Editimage plugin for alignment toolbar on images
            editimage_toolbar: 'alignleft aligncenter alignright | imageoptions',

            // ===== DRAG & DROP IMAGES (Word-like) =====
            paste_data_images: true,  // Allow pasting images from clipboard (like Word)
            automatic_uploads: false,  // Don't auto-upload, keep as base64 (unless upload URL set)
            images_reuse_filename: true,  // Reuse filenames for images

            // ===== WORD-LIKE EDITING FEATURES =====
            block_unsupported_drop: false,  // Allow dropping content
            paste_block_drop: false,  // Allow dropping pasted content
            paste_merge_formats: true,  // Merge similar formats when pasting
            paste_tab_spaces: 4,  // Convert tabs to 4 spaces when pasting
            paste_webkit_styles: 'color font-size font-family background-color',  // Preserve these styles from Word

            // ===== STYLES (Word-like style dropdown) =====
            style_formats: (function() {
                var formats = [
                    { title: 'Headings', items: [
                        { title: 'Heading 1', format: 'h1' },
                        { title: 'Heading 2', format: 'h2' },
                        { title: 'Heading 3', format: 'h3' },
                        { title: 'Heading 4', format: 'h4' },
                        { title: 'Heading 5', format: 'h5' },
                        { title: 'Heading 6', format: 'h6' }
                    ]}
                ];
                // Add numbered headings if enabled
                if (s.enableNumberedHeadings) {
                    formats.push({ title: 'Numbered Headings', items: [
                        { title: '1. Chapter', block: 'h1', classes: 'numbered-h1' },
                        { title: '1.1 Section', block: 'h2', classes: 'numbered-h2' },
                        { title: '1.1.1 Sub-section', block: 'h3', classes: 'numbered-h3' },
                        { title: '1.1.1.1 Paragraph', block: 'h4', classes: 'numbered-h4' },
                        { title: '1.1.1.1.1 Sub-paragraph', block: 'h5', classes: 'numbered-h5' }
                    ]});
                }
                formats.push(
                    { title: 'Blocks', items: [
                        { title: 'Paragraph', format: 'p' },
                        { title: 'Blockquote', block: 'blockquote', classes: 'quote', wrapper: true },
                        { title: 'Code Block', format: 'pre' },
                        { title: 'Div', format: 'div' }
                    ]},
                    { title: 'Text Styles', items: [
                        { title: 'Bold', format: 'bold' },
                        { title: 'Italic', format: 'italic' },
                        { title: 'Underline', format: 'underline' },
                        { title: 'Strikethrough', format: 'strikethrough' },
                        { title: 'Code', inline: 'code' },
                        { title: 'Superscript', format: 'superscript' },
                        { title: 'Subscript', format: 'subscript' }
                    ]},
                    { title: 'Custom Styles', items: [
                        { title: 'Info Box', block: 'div', classes: 'info-box', wrapper: true },
                        { title: 'Warning Box', block: 'div', classes: 'warning-box', wrapper: true },
                        { title: 'Success Box', block: 'div', classes: 'success-box', wrapper: true },
                        { title: 'Error Box', block: 'div', classes: 'error-box', wrapper: true },
                        { title: 'Highlight', inline: 'span', classes: 'highlight' },
                        { title: 'Small Text', inline: 'small' },
                        { title: 'Large Text', inline: 'span', styles: { 'font-size': '1.2em' } }
                    ]},
                    { title: 'Alignment', items: [
                        { title: 'Left', format: 'alignleft' },
                        { title: 'Center', format: 'aligncenter' },
                        { title: 'Right', format: 'alignright' },
                        { title: 'Justify', format: 'alignjustify' }
                    ]}
                );
                return formats;
            })(),
            style_formats_merge: false,
            style_formats_autohide: true,

            // ===== CONTENT SETTINGS =====
            font_family_formats: s.fontFamilyFormats,
            font_size_formats: s.fontSizeFormats,
            line_height_formats: s.lineHeightFormats,
            paste_as_text: s.pasteAsText,
            paste_remove_styles_if_webkit: s.pasteRemoveStyles,
            paste_remove_spans_if_webkit: s.pasteRemoveSpans,
            smart_paste: s.smartPaste,
            invalid_elements: s.invalidElements,
            extended_valid_elements: s.extendedValidElements,
            entity_encoding: s.entityEncoding,

            // ===== IMAGE SETTINGS =====
            image_advtab: s.imageAdvtab,
            image_caption: s.imageCaption,
            image_description: s.imageDescription,
            image_title: s.imageTitle,
            image_dimensions: s.imageDimensions,

            // File picker for local images - converts to base64 and fills all fields
            file_picker_types: 'image',
            file_picker_callback: function(callback, value, meta) {
                if (meta.filetype === 'image') {
                    var input = document.createElement('input');
                    input.setAttribute('type', 'file');
                    input.setAttribute('accept', 'image/*');
                    input.onchange = function() {
                        var file = this.files[0];
                        if (!file) return;
                        var reader = new FileReader();
                        reader.onload = function() {
                            var dataUrl = reader.result;
                            // Create image to get dimensions
                            var img = new Image();
                            img.onload = function() {
                                // Extract filename without extension for title
                                var fileName = file.name;
                                var titleName = fileName.replace(/\.[^/.]+$/, '');
                                // Call callback with all metadata (dimensions as strings)
                                callback(dataUrl, {
                                    alt: titleName,
                                    title: titleName,
                                    width: String(img.width),
                                    height: String(img.height)
                                });
                            };
                            img.src = dataUrl;
                        };
                        reader.readAsDataURL(file);
                    };
                    input.click();
                }
            },

            // ===== LINK SETTINGS =====
            link_default_target: s.linkDefaultTarget,
            link_default_protocol: s.linkDefaultProtocol,
            link_assume_external_targets: s.linkAssumeExternalTargets,
            link_context_toolbar: s.linkContextToolbar,
            link_quicklink: s.linkQuicklink,
            link_title: s.linkTitle,

            // ===== SKIN & CONTENT STYLE =====
            skin: false,
            content_css: false,
            content_style: contentStyle,

            // ===== UI OPTIONS =====
            promotion: false,
            branding: false,

            // ===== COLOR PICKER (for forecolor/backcolor) =====
            color_cols: 8,  // Number of columns in color picker
            color_map: [
                '000000', 'Black',
                '4D4D4D', 'Dark Gray',
                '808080', 'Gray',
                'B3B3B3', 'Light Gray',
                'FFFFFF', 'White',
                'FF0000', 'Red',
                'FF6600', 'Orange',
                'FFFF00', 'Yellow',
                '00FF00', 'Lime',
                '00FFFF', 'Cyan',
                '0000FF', 'Blue',
                'FF00FF', 'Magenta',
                '800000', 'Maroon',
                '804000', 'Brown',
                '808000', 'Olive',
                '008000', 'Green',
                '008080', 'Teal',
                '000080', 'Navy',
                '800080', 'Purple',
                'FF9999', 'Light Red',
                'FFCC99', 'Light Orange',
                'FFFF99', 'Light Yellow',
                '99FF99', 'Light Green',
                '99FFFF', 'Light Cyan',
                '9999FF', 'Light Blue',
                'FF99FF', 'Light Magenta',
                'E6E6E6', 'Very Light Gray',
                'F2F2F2', 'Almost White'
            ],
            custom_colors: true,  // Allow custom color picker

            // ===== AUTORESIZE (Word-like auto-expand) =====
            autoresize_bottom_margin: 20,
            autoresize_overflow_padding: 10,

            // ===== INSERTDATETIME (Word-like) =====
            insertdatetime_formats: ['%Y-%m-%d', '%H:%M:%S', '%Y-%m-%d %H:%M:%S', '%d/%m/%Y', '%d/%m/%Y %H:%M'],
            insertdatetime_dateformat: '%Y-%m-%d',
            insertdatetime_timeformat: '%H:%M:%S',

            // ===== NONBREAKING (Word-like) =====
            nonbreaking_force_tab: true,  // Tab key inserts non-breaking spaces like Word
            nonbreaking_wrap: true,  // Wrap non-breaking spaces in span

            // ===== AUTOSAVE (crash recovery) =====
            autosave_ask_before_unload: true,  // Warn user before leaving with unsaved changes
            autosave_interval: s.autosaveInterval + 's',  // Save every N seconds (from settings)
            autosave_retention: '1440m',  // Keep drafts for 24 hours
            autosave_restore_when_empty: true,  // Auto-restore if editor is empty

            // ===== BROWSER SPELL CHECK =====
            browser_spellcheck: true,  // Enable browser's native spell checker

            // ===== SMART PASTE (auto-detect URLs and images) =====
            smart_paste: true,  // Convert pasted URLs to links, image URLs to images

            // ===== SETUP & EVENTS =====
            setup: function(ed) {
                // Store current zoom level for this editor
                var currentZoom = s.pageZoom || 100;
                var zoomMenuApi = null;

                // Function to apply zoom to the editor content
                function applyZoom(zoomLevel) {
                    currentZoom = Math.max(50, Math.min(200, zoomLevel));
                    try {
                        var iframe = ed.getContentAreaContainer().querySelector('iframe');
                        if (iframe && iframe.contentDocument) {
                            var doc = iframe.contentDocument;
                            var html = doc.documentElement;
                            var body = doc.body;
                            if (s.pageModeEnabled && body) {
                                // Apply zoom as CSS transform on the body
                                body.style.transform = 'scale(' + (currentZoom / 100) + ')';
                                body.style.transformOrigin = 'top center';
                                // Adjust the html background to fill the gaps
                                html.style.minHeight = (body.scrollHeight * (currentZoom / 100) + 50) + 'px';
                            }
                        }
                    } catch (e) {
                        log('DEBUG', 'Zoom error', e);
                    }
                    // Update zoom menu button text
                    if (zoomMenuApi) {
                        zoomMenuApi.setText(currentZoom + '%');
                    }
                    log('DEBUG', 'Zoom applied: ' + currentZoom + '%');
                }

                // ===== ZOOM CONTROLS =====
                if (s.pageModeEnabled && s.pageZoomControls) {
                    // Zoom In button
                    ed.ui.registry.addIcon('zoom-in', '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/><path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z" fill="currentColor"/></svg>');
                    ed.ui.registry.addButton('zoomin', {
                        icon: 'zoom-in',
                        tooltip: 'Zoom In',
                        onAction: function() {
                            applyZoom(currentZoom + 10);
                        }
                    });

                    // Zoom Out button
                    ed.ui.registry.addIcon('zoom-out', '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/><path d="M7 9h5v1H7z" fill="currentColor"/></svg>');
                    ed.ui.registry.addButton('zoomout', {
                        icon: 'zoom-out',
                        tooltip: 'Zoom Out',
                        onAction: function() {
                            applyZoom(currentZoom - 10);
                        }
                    });

                    // Zoom dropdown menu
                    ed.ui.registry.addMenuButton('zoommenu', {
                        text: currentZoom + '%',
                        tooltip: 'Zoom Level',
                        fetch: function(callback) {
                            var items = [
                                { type: 'menuitem', text: '50%', onAction: function() { applyZoom(50); } },
                                { type: 'menuitem', text: '75%', onAction: function() { applyZoom(75); } },
                                { type: 'menuitem', text: '100%', onAction: function() { applyZoom(100); } },
                                { type: 'menuitem', text: '125%', onAction: function() { applyZoom(125); } },
                                { type: 'menuitem', text: '150%', onAction: function() { applyZoom(150); } },
                                { type: 'menuitem', text: '175%', onAction: function() { applyZoom(175); } },
                                { type: 'menuitem', text: '200%', onAction: function() { applyZoom(200); } }
                            ];
                            callback(items);
                        },
                        onSetup: function(api) {
                            zoomMenuApi = api;
                            return function() { zoomMenuApi = null; };
                        }
                    });
                }

                // ===== MATH EQUATION EDITOR BUTTON =====
                // Register custom icon for math (Sigma symbol)
                ed.ui.registry.addIcon('math-sigma', '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M18 6H8.83L14 12l-5.17 6H18v2H6v-1.5L11.67 12 6 5.5V4h12v2z" fill="currentColor"/></svg>');
                ed.ui.registry.addButton('mathequation', {
                    icon: 'math-sigma',
                    tooltip: 'Insert Math Equation',
                    onAction: function() {
                        ed.windowManager.open({
                            title: 'Insert Math Equation',
                            size: 'medium',
                            body: {
                                type: 'panel',
                                items: [
                                    {
                                        type: 'htmlpanel',
                                        html: '<div style="margin-bottom:10px;"><strong>Quick Symbols:</strong></div>' +
                                              '<div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:15px;">' +
                                              '<button type="button" class="math-sym" data-sym="&#177;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#177;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#215;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#215;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#247;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#247;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#8800;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#8800;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#8804;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#8804;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#8805;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#8805;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#8776;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#8776;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#8730;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#8730;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#8731;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#8731;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#8734;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#8734;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#960;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#960;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#952;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#952;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#945;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#945;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#946;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#946;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#947;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#947;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#948;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#948;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#916;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#916;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#955;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#955;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#956;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#956;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#963;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#963;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#931;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#931;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#928;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#928;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#8747;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#8747;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#8706;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#8706;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#8712;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#8712;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#8713;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#8713;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#8746;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#8746;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#8745;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#8745;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#8834;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#8834;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#8835;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#8835;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#8709;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#8709;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#8704;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#8704;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#8707;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#8707;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#8658;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#8658;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#8660;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#8660;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#176;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#176;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#8242;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#8242;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#8243;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#8243;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#8469;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#8469;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#8484;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#8484;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#8474;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#8474;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#8477;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#8477;</button>' +
                                              '<button type="button" class="math-sym" data-sym="&#8450;" style="padding:5px 10px;font-size:16px;cursor:pointer;">&#8450;</button>' +
                                              '</div>' +
                                              '<div style="margin-bottom:10px;"><strong>Fractions &amp; Structures:</strong></div>' +
                                              '<div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:15px;">' +
                                              '<button type="button" class="math-tpl" data-tpl="frac" style="padding:5px 10px;font-size:14px;cursor:pointer;">a/b</button>' +
                                              '<button type="button" class="math-tpl" data-tpl="sqrt" style="padding:5px 10px;font-size:14px;cursor:pointer;">&#8730;x</button>' +
                                              '<button type="button" class="math-tpl" data-tpl="pow" style="padding:5px 10px;font-size:14px;cursor:pointer;">x&#178;</button>' +
                                              '<button type="button" class="math-tpl" data-tpl="sub" style="padding:5px 10px;font-size:14px;cursor:pointer;">x&#8321;</button>' +
                                              '<button type="button" class="math-tpl" data-tpl="sum" style="padding:5px 10px;font-size:14px;cursor:pointer;">&#931;(i=1..n)</button>' +
                                              '<button type="button" class="math-tpl" data-tpl="prod" style="padding:5px 10px;font-size:14px;cursor:pointer;">&#928;(i=1..n)</button>' +
                                              '<button type="button" class="math-tpl" data-tpl="int" style="padding:5px 10px;font-size:14px;cursor:pointer;">&#8747;(a..b)</button>' +
                                              '<button type="button" class="math-tpl" data-tpl="lim" style="padding:5px 10px;font-size:14px;cursor:pointer;">lim</button>' +
                                              '</div>'
                                    },
                                    {
                                        type: 'textarea',
                                        name: 'equation',
                                        label: 'Equation (use superscript/subscript for powers)',
                                        placeholder: 'Type your equation here...',
                                        maximized: false
                                    }
                                ]
                            },
                            buttons: [
                                { type: 'cancel', text: 'Cancel' },
                                { type: 'submit', text: 'Insert', primary: true }
                            ],
                            onSubmit: function(api) {
                                var data = api.getData();
                                if (data.equation) {
                                    ed.insertContent('<span class="math-equation" style="font-family: Cambria Math, Latin Modern Math, STIX, serif; font-style: italic;">' + data.equation + '</span>');
                                }
                                api.close();
                            }
                        });
                        // Add click handlers for symbol buttons after dialog opens
                        setTimeout(function() {
                            var dialog = document.querySelector('.tox-dialog');
                            if (dialog) {
                                dialog.querySelectorAll('.math-sym').forEach(function(btn) {
                                    btn.onclick = function() {
                                        var textarea = dialog.querySelector('textarea');
                                        if (textarea) {
                                            var start = textarea.selectionStart;
                                            var end = textarea.selectionEnd;
                                            var text = textarea.value;
                                            textarea.value = text.substring(0, start) + btn.dataset.sym + text.substring(end);
                                            textarea.selectionStart = textarea.selectionEnd = start + btn.dataset.sym.length;
                                            textarea.focus();
                                            textarea.dispatchEvent(new Event('input', { bubbles: true }));
                                        }
                                    };
                                });
                                dialog.querySelectorAll('.math-tpl').forEach(function(btn) {
                                    btn.onclick = function() {
                                        var textarea = dialog.querySelector('textarea');
                                        if (textarea) {
                                            var templates = {
                                                'frac': '<sup>a</sup>\u2044<sub>b</sub>',
                                                'sqrt': '\u221A(x)',
                                                'pow': 'x<sup>2</sup>',
                                                'sub': 'x<sub>1</sub>',
                                                'sum': '\u03A3<sub>i=1</sub><sup>n</sup>',
                                                'prod': '\u03A0<sub>i=1</sub><sup>n</sup>',
                                                'int': '\u222B<sub>a</sub><sup>b</sup>',
                                                'lim': 'lim<sub>x\u2192\u221E</sub>'
                                            };
                                            var start = textarea.selectionStart;
                                            var end = textarea.selectionEnd;
                                            var text = textarea.value;
                                            var tpl = templates[btn.dataset.tpl] || '';
                                            textarea.value = text.substring(0, start) + tpl + text.substring(end);
                                            textarea.selectionStart = textarea.selectionEnd = start + tpl.length;
                                            textarea.focus();
                                            textarea.dispatchEvent(new Event('input', { bubbles: true }));
                                        }
                                    };
                                });
                            }
                        }, 100);
                    }
                });

                ed.on('init', function() {
                    ed.setContent(initialHtml);
                    log('DEBUG', 'TinyMCE initialized for editor ' + index);
                    // Apply initial zoom if page mode is enabled and zoom is not 100%
                    if (s.pageModeEnabled && currentZoom !== 100) {
                        setTimeout(function() {
                            applyZoom(currentZoom);
                        }, 100);
                    }
                });
                ed.on('change', function() {
                    syncToRadEditor(editor, ed);
                });
                ed.on('blur', function() {
                    syncToRadEditor(editor, ed);
                });
                // Input event for more responsive syncing
                ed.on('input', function() {
                    syncToRadEditor(editor, ed);
                });
            }
        };

        // Add image upload URL if configured
        if (s.imageUploadUrl) {
            tinymceConfig.images_upload_url = s.imageUploadUrl;
            tinymceConfig.automatic_uploads = true;
        }

        // Initialize TinyMCE
        if (typeof tinymce !== 'undefined') {
            tinymce.init(tinymceConfig).then(function(editors) {
                state.tinymceInstances[index] = editors[0];
                log('INFO', 'TinyMCE instance created for editor ' + index);
            });
        } else {
            log('ERROR', 'TinyMCE library not loaded');
        }

        // Store reference
        state.replacedEditors[index] = {
            original: editor,
            container: container,
            tinymceId: editorId,
            visible: 'tinymce'
        };
    }

    // ========================================
    // Sync TinyMCE content to RadEditor
    // ========================================
    function syncToRadEditor(radEditor, tinymceEditor) {
        try {
            var html = tinymceEditor.getContent();
            setRadEditorHtml(radEditor, html);
            log('DEBUG', 'Synced content to RadEditor');
        } catch (e) {
            log('ERROR', 'Sync failed', e);
        }
    }

    // ========================================
    // Toggle between editors
    // ========================================
    function toggleEditor(index) {
        var data = state.replacedEditors[index];
        if (!data) return;

        var toggleBtn = data.container.querySelector('.nexteditor-toggle-btn');

        if (data.visible === 'tinymce') {
            if (state.tinymceInstances[index]) {
                var html = state.tinymceInstances[index].getContent();
                setRadEditorHtml(data.original, html);
            }
            data.container.style.display = 'none';
            if (data.original.element) {
                data.original.element.style.display = '';
            }
            data.visible = 'radeditor';
            if (toggleBtn) toggleBtn.textContent = 'Switch to TinyMCE';
        } else {
            var html = getRadEditorHtml(data.original);
            if (state.tinymceInstances[index]) {
                state.tinymceInstances[index].setContent(html);
            }
            if (data.original.element) {
                data.original.element.style.display = 'none';
            }
            data.container.style.display = '';
            data.visible = 'tinymce';
            if (toggleBtn) toggleBtn.textContent = 'Switch to RadEditor';
        }
    }

    // ========================================
    // Replace all RadEditors
    // ========================================
    function replaceAllEditors() {
        var editors = findRadEditors();

        if (editors.length === 0) {
            log('INFO', 'No RadEditors found on this page');
            return;
        }

        log('INFO', 'Replacing ' + editors.length + ' RadEditor(s) with TinyMCE');

        editors.forEach(function(editor, index) {
            createTinyMCE(editor, index);
        });
    }

    // ========================================
    // Initialize
    // ========================================
    function initialize() {
        if (state.initialized) return;

        log('INFO', 'NextEditor v' + VERSION + ' initializing...');
        loadSettings();

        if (!state.settings.enableTinymce) {
            log('INFO', 'TinyMCE replacement disabled in settings');
            return;
        }

        if (typeof tinymce === 'undefined') {
            log('ERROR', 'TinyMCE library not found');
            return;
        }

        if (state.settings.activationMode === 'auto') {
            replaceAllEditors();
        }

        state.initialized = true;
        log('INFO', 'NextEditor initialized');
    }

    // ========================================
    // Public API
    // ========================================
    window.NEXTEDITOR = {
        version: VERSION,
        init: initialize,
        replaceAll: replaceAllEditors,
        getState: function() { return state; },
        toggle: toggleEditor
    };

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initialize, 500);
        });
    } else {
        setTimeout(initialize, 500);
    }

})();
'@

$outputLines += $appCode

# Write output file (UTF8 WITHOUT BOM - important for JavaScript)
$outputContent = $outputLines -join "`n"
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($outputFile, $outputContent, $utf8NoBom)

# Get file size
$fileSize = (Get-Item $outputFile).Length
$fileSizeKB = [math]::Round($fileSize / 1024, 2)
$fileSizeMB = [math]::Round($fileSize / 1024 / 1024, 2)

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host " Build Complete!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Output: $outputFile" -ForegroundColor White
Write-Host "Size: $fileSizeKB KB ($fileSizeMB MB)" -ForegroundColor White
Write-Host ""

# Syntax check
Write-Host "[INFO] Checking JavaScript syntax..." -ForegroundColor Cyan
try {
    $null = node -c $outputFile 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] JavaScript syntax is valid" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Syntax check returned non-zero" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[WARN] Node.js not available for syntax check" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Test: Open test.html in browser" -ForegroundColor White
Write-Host "2. Package: node ..\spiraapp-package-generator\index.js" -ForegroundColor White
Write-Host ""
