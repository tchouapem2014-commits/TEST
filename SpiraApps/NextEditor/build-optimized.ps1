# ============================================================
# NextEditor OPTIMIZED Build Script
# ============================================================
# Improvements over build-embedded.ps1:
# - Selective plugin inclusion (core vs optional)
# - Better CSS compression
# - Build size reporting
# - Faster execution with StringBuilder
# - Support for minification mode
# ============================================================
# Usage: .\build-optimized.ps1 [-Full] [-Minimal] [-Report]
# ============================================================

param(
    [switch]$Full,      # Include ALL plugins (larger but feature-complete)
    [switch]$Minimal,   # Only essential plugins (smallest size)
    [switch]$Report,    # Show detailed size report
    [switch]$NoPackage  # Skip .spiraapp package generation
)

$ErrorActionPreference = "Stop"
$startTime = Get-Date

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " NextEditor OPTIMIZED Build" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$projectDir = $PSScriptRoot
$libsDir = Join-Path $projectDir "libs"
$outputFile = Join-Path $projectDir "nexteditor.js"
$appCodeFile = Join-Path $projectDir "src\app.js"

# Plugin tiers for selective inclusion
$corePlugins = @(
    "table",        # Table editing - PRIMARY FEATURE
    "lists",        # List formatting - essential
    "link",         # Links - essential
    "image",        # Images - essential
    "autolink"      # Auto-detect links
)

$standardPlugins = @(
    "advlist",      # Advanced lists
    "anchor",       # Anchor links
    "charmap",      # Special characters
    "code",         # HTML source view
    "fullscreen",   # Fullscreen mode
    "searchreplace",# Find & replace
    "wordcount",    # Word count
    "quickbars"     # Quick toolbars
)

$extendedPlugins = @(
    "accordion",    # Collapsible sections
    "autoresize",   # Auto-resize
    "autosave",     # Auto-save drafts
    "insertdatetime", # Date/time
    "media",        # Video/audio
    "nonbreaking",  # Non-breaking spaces
    "preview",      # Preview mode
    "save",         # Save button
    "visualblocks"  # Show blocks
)

# Determine which plugins to include
if ($Minimal) {
    $selectedPlugins = $corePlugins
    $buildMode = "MINIMAL"
    Write-Host "[MODE] Minimal build - Core plugins only" -ForegroundColor Yellow
} elseif ($Full) {
    $selectedPlugins = $corePlugins + $standardPlugins + $extendedPlugins
    $buildMode = "FULL"
    Write-Host "[MODE] Full build - All plugins" -ForegroundColor Green
} else {
    # Default: Core + Standard (recommended)
    $selectedPlugins = $corePlugins + $standardPlugins
    $buildMode = "STANDARD"
    Write-Host "[MODE] Standard build - Core + Standard plugins" -ForegroundColor Cyan
}

Write-Host "[INFO] Plugins: $($selectedPlugins -join ', ')" -ForegroundColor Gray
Write-Host ""

# Validation
if (-not (Test-Path $libsDir)) {
    Write-Host "[ERROR] libs/ directory not found!" -ForegroundColor Red
    Write-Host "Run: .\download-tinymce.ps1" -ForegroundColor Yellow
    exit 1
}

$tinymcePath = Join-Path $libsDir "tinymce.min.js"
if (-not (Test-Path $tinymcePath)) {
    Write-Host "[ERROR] tinymce.min.js not found in libs/" -ForegroundColor Red
    exit 1
}

# Use StringBuilder for performance
$output = New-Object System.Text.StringBuilder

# Track sizes for report
$sizeReport = @{}

# ============================================================
# HEADER
# ============================================================
[void]$output.AppendLine("/**")
[void]$output.AppendLine(" * NextEditor - TinyMCE RichText Editor for SpiraPlan")
[void]$output.AppendLine(" * Version: 1.0")
[void]$output.AppendLine(" * Build: $buildMode")
[void]$output.AppendLine(" * Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
[void]$output.AppendLine(" * Plugins: $($selectedPlugins -join ', ')")
[void]$output.AppendLine(" */")
[void]$output.AppendLine("")

# ============================================================
# CSS EMBEDDING (optimized)
# ============================================================
Write-Host "[1/6] Embedding CSS..." -ForegroundColor Cyan

function Get-CompressedCss($path) {
    if (-not (Test-Path $path)) { return "" }
    $css = Get-Content $path -Raw -Encoding UTF8
    # Basic CSS compression
    $css = $css -replace '/\*[\s\S]*?\*/', ''  # Remove comments
    $css = $css -replace '\s+', ' '             # Collapse whitespace
    $css = $css -replace '\s*([{};:,])\s*', '$1' # Remove space around symbols
    $css = $css.Trim()
    return $css
}

function Escape-ForJs($str) {
    $str = $str -replace '\\', '\\\\'
    $str = $str -replace "'", "\'"
    $str = $str -replace "`r`n", ''
    $str = $str -replace "`n", ''
    $str = $str -replace "`r", ''
    return $str
}

$skinCss = Get-CompressedCss (Join-Path $libsDir "skins\ui\oxide\skin.min.css")
$contentCss = Get-CompressedCss (Join-Path $libsDir "skins\ui\oxide\content.min.css")
$contentDefaultCss = Get-CompressedCss (Join-Path $libsDir "skins\content\default\content.min.css")

$skinCssEscaped = Escape-ForJs $skinCss
$contentCssEscaped = Escape-ForJs $contentCss
$contentDefaultCssEscaped = Escape-ForJs $contentDefaultCss

$cssSize = $skinCss.Length + $contentCss.Length + $contentDefaultCss.Length
$sizeReport["CSS (compressed)"] = $cssSize
Write-Host "  - Total CSS: $([math]::Round($cssSize/1024, 1)) KB" -ForegroundColor Gray

# ============================================================
# TINYMCE CORE
# ============================================================
Write-Host "[2/6] Embedding TinyMCE core..." -ForegroundColor Cyan

$tinymceContent = Get-Content $tinymcePath -Raw -Encoding UTF8
$sizeReport["TinyMCE Core"] = $tinymceContent.Length
Write-Host "  - Size: $([math]::Round($tinymceContent.Length/1024, 1)) KB" -ForegroundColor Gray

[void]$output.AppendLine("// === TINYMCE CORE ===")
[void]$output.AppendLine($tinymceContent)
[void]$output.AppendLine("")

# ============================================================
# THEME
# ============================================================
Write-Host "[3/6] Embedding Silver theme..." -ForegroundColor Cyan

$themePath = Join-Path $libsDir "themes\silver\theme.min.js"
if (Test-Path $themePath) {
    $themeContent = Get-Content $themePath -Raw -Encoding UTF8
    $sizeReport["Theme (Silver)"] = $themeContent.Length
    Write-Host "  - Size: $([math]::Round($themeContent.Length/1024, 1)) KB" -ForegroundColor Gray
    [void]$output.AppendLine("// === THEME ===")
    [void]$output.AppendLine($themeContent)
    [void]$output.AppendLine("")
}

# ============================================================
# ICONS
# ============================================================
Write-Host "[4/6] Embedding icons..." -ForegroundColor Cyan

$iconsPath = Join-Path $libsDir "icons\default\icons.min.js"
if (Test-Path $iconsPath) {
    $iconsContent = Get-Content $iconsPath -Raw -Encoding UTF8
    $sizeReport["Icons"] = $iconsContent.Length
    Write-Host "  - Size: $([math]::Round($iconsContent.Length/1024, 1)) KB" -ForegroundColor Gray
    [void]$output.AppendLine("// === ICONS ===")
    [void]$output.AppendLine($iconsContent)
    [void]$output.AppendLine("")
}

# ============================================================
# MODEL
# ============================================================
$modelPath = Join-Path $libsDir "models\dom\model.min.js"
if (Test-Path $modelPath) {
    $modelContent = Get-Content $modelPath -Raw -Encoding UTF8
    $sizeReport["DOM Model"] = $modelContent.Length
    [void]$output.AppendLine("// === DOM MODEL ===")
    [void]$output.AppendLine($modelContent)
    [void]$output.AppendLine("")
}

# ============================================================
# PLUGINS (selective)
# ============================================================
Write-Host "[5/6] Embedding plugins ($($selectedPlugins.Count))..." -ForegroundColor Cyan

$pluginsDir = Join-Path $libsDir "plugins"
$totalPluginSize = 0

[void]$output.AppendLine("// === PLUGINS ===")

foreach ($plugin in $selectedPlugins) {
    $pluginPath = Join-Path $pluginsDir "$plugin\plugin.min.js"
    if (Test-Path $pluginPath) {
        $pluginContent = Get-Content $pluginPath -Raw -Encoding UTF8
        $pluginSize = $pluginContent.Length
        $totalPluginSize += $pluginSize
        $sizeReport["Plugin: $plugin"] = $pluginSize
        Write-Host "  - $plugin ($([math]::Round($pluginSize/1024, 1)) KB)" -ForegroundColor Gray
        [void]$output.AppendLine("// Plugin: $plugin")
        [void]$output.AppendLine($pluginContent)
        [void]$output.AppendLine("")
    } else {
        Write-Host "  - $plugin (NOT FOUND)" -ForegroundColor Yellow
    }
}

$sizeReport["Plugins Total"] = $totalPluginSize

# ============================================================
# CSS INJECTION
# ============================================================
Write-Host "[6/6] Adding CSS injection & application code..." -ForegroundColor Cyan

[void]$output.AppendLine("// === CSS INJECTION ===")
[void]$output.AppendLine("(function(){")
[void]$output.AppendLine("if(document.getElementById('nexteditor-skin'))return;")
[void]$output.AppendLine("var s=document.createElement('style');s.id='nexteditor-skin';")
[void]$output.AppendLine("s.textContent='$skinCssEscaped';document.head.appendChild(s);")
[void]$output.AppendLine("var c=document.createElement('style');c.id='nexteditor-content';")
[void]$output.AppendLine("c.textContent='$contentCssEscaped';document.head.appendChild(c);")
[void]$output.AppendLine("var d=document.createElement('style');d.id='nexteditor-content-default';")
[void]$output.AppendLine("d.textContent='$contentDefaultCssEscaped';document.head.appendChild(d);")
[void]$output.AppendLine("var x=document.createElement('style');x.id='nexteditor-custom';")
[void]$output.AppendLine("x.textContent='.ephox-snooker-resizer-bar{background:#2196F3!important;opacity:.6!important;cursor:col-resize!important;width:4px!important}.ephox-snooker-resizer-bar:hover{opacity:1!important;background:#1565C0!important}.ephox-snooker-resizer-rows-bar{cursor:row-resize!important;height:4px!important}';")
[void]$output.AppendLine("document.head.appendChild(x);")
[void]$output.AppendLine("})();")
[void]$output.AppendLine("")

# ============================================================
# APPLICATION CODE
# ============================================================
# Check if modular src exists, otherwise use embedded code
if (Test-Path $appCodeFile) {
    Write-Host "  - Loading from src/app.js" -ForegroundColor Gray
    $appCode = Get-Content $appCodeFile -Raw -Encoding UTF8
} else {
    Write-Host "  - Using embedded application code" -ForegroundColor Gray
    # Embedded application code (same as original but can be externalized)
    $appCode = @'
// === NEXTEDITOR APPLICATION ===
(function(){'use strict';
var VERSION='1.0',PREFIX='[NextEditor]';
var state={initialized:false,settings:{enableTinymce:true,activationMode:'auto',allowToggle:false,debugMode:false,placeholder:'',editorHeight:300,editorWidth:'',minHeight:200,maxHeight:600,resize:'vertical',showMenubar:false,menuConfig:'file edit view insert format table tools',toolbarConfig:'full',customToolbar:'',toolbarMode:'wrap',toolbarSticky:false,toolbarStickyOffset:0,statusbar:true,elementpath:true,wordcount:true,contextmenu:'link image table',quickbarsSelection:'',quickbarsInsert:'',tableDefaultBorder:1,tableDefaultCellPadding:5,tableDefaultCellSpacing:0,tableDefaultStyles:'border-collapse:collapse;width:100%',tableColumnResizing:true,tableResizeBars:true,tableAdvtab:true,tableCellAdvtab:true,tableRowAdvtab:true,tableStyleByCell:false,tableSizingMode:'relative',tableCloneElements:'strong em b i u',tableHeaderType:'section',tableUseColgroups:false,tableBorderWidths:'1px 2px 3px 4px 5px',tableBorderStyles:'solid dashed dotted double groove ridge',contentFontFamily:'Arial,Helvetica,sans-serif',contentFontSize:'12px',contentLineHeight:'1.4',fontFamilyFormats:'Arial=arial,helvetica,sans-serif;Courier New=courier new,courier,monospace;Georgia=georgia,palatino,serif;Tahoma=tahoma,arial,helvetica,sans-serif;Times New Roman=times new roman,times,serif;Verdana=verdana,geneva,sans-serif',fontSizeFormats:'8pt 10pt 11pt 12pt 14pt 18pt 24pt 36pt',lineHeightFormats:'1 1.2 1.4 1.6 2',pasteAsText:false,pasteRemoveStyles:false,pasteRemoveSpans:false,smartPaste:true,invalidElements:'script,object,embed,applet',extendedValidElements:'span[*],div[*],p[*],a[*],img[*],table[*],tr[*],td[*],th[*]',entityEncoding:'named',allowImages:true,imageAdvtab:true,imageCaption:true,imageDescription:true,imageTitle:true,imageDimensions:true,imageUploadUrl:'',allowLinks:true,linkDefaultTarget:'_self',linkDefaultProtocol:'https',linkAssumeExternalTargets:true,linkContextToolbar:true,linkQuicklink:true,linkTitle:true,allowCodeView:true,pluginFullscreen:true,pluginSearchreplace:true,pluginWordcount:true,pluginCharmap:true,pluginEmoticons:false,pluginInsertdatetime:false,pluginPreview:false,pluginAnchor:true,pluginVisualblocks:false,pluginVisualchars:false,pluginPagebreak:false,pluginNonbreaking:false,pluginCodesample:false,pluginDirectionality:false,pluginHelp:false},replacedEditors:[],tinymceInstances:[]};

function log(l,m,d){if(!state.settings.debugMode&&l==='DEBUG')return;var p=PREFIX+' '+l+':';d!==undefined?console.log(p,m,d):console.log(p,m)}

function getSetting(n,dv){try{if(typeof SpiraAppSettings!=='undefined'&&typeof APP_GUID!=='undefined'){var as=SpiraAppSettings[APP_GUID];if(as&&as[n]!==undefined&&as[n]!==null&&as[n]!=='')return as[n]}if(typeof spiraAppManager!=='undefined'){if(spiraAppManager.getProductSetting){var v=spiraAppManager.getProductSetting(n);if(v!==undefined&&v!==null&&v!=='')return v}if(spiraAppManager.getSystemSetting){var sv=spiraAppManager.getSystemSetting(n);if(sv!==undefined&&sv!==null&&sv!=='')return sv}}}catch(e){log('DEBUG','Error getting setting '+n,e)}return dv}

function getBoolSetting(n,dv){var v=getSetting(n,dv);if(typeof v==='boolean')return v;if(v==='true'||v==='1')return true;if(v==='false'||v==='0')return false;return dv}

function getIntSetting(n,dv){var v=getSetting(n,dv);var p=parseInt(v,10);return isNaN(p)?dv:p}

function loadSettings(){var s=state.settings;s.enableTinymce=getBoolSetting('enable_tinymce',true);s.activationMode=getSetting('activation_mode','auto');s.allowToggle=getBoolSetting('allow_toggle',false);s.debugMode=getBoolSetting('debug_mode',false);s.placeholder=getSetting('placeholder','');s.editorHeight=getIntSetting('editor_height',300);s.editorWidth=getSetting('editor_width','');s.minHeight=getIntSetting('min_height',200);s.maxHeight=getIntSetting('max_height',600);s.resize=getSetting('resize','vertical');s.showMenubar=getBoolSetting('show_menubar',true);s.menuConfig=getSetting('menu_config','file edit view insert format table tools');s.toolbarConfig=getSetting('toolbar_config','full');s.customToolbar=getSetting('custom_toolbar','');s.toolbarMode=getSetting('toolbar_mode','wrap');s.toolbarSticky=getBoolSetting('toolbar_sticky',false);s.toolbarStickyOffset=getIntSetting('toolbar_sticky_offset',0);s.statusbar=getBoolSetting('statusbar',true);s.elementpath=getBoolSetting('elementpath',true);s.wordcount=getBoolSetting('wordcount',true);s.contextmenu=getSetting('contextmenu','link image table');s.quickbarsSelection=getSetting('quickbars_selection','');s.quickbarsInsert=getSetting('quickbars_insert','');s.tableDefaultBorder=getIntSetting('table_default_border',1);s.tableDefaultCellPadding=getIntSetting('table_default_cell_padding',5);s.tableDefaultCellSpacing=getIntSetting('table_default_cell_spacing',0);s.tableDefaultStyles=getSetting('table_default_styles','border-collapse:collapse;width:100%');s.tableColumnResizing=getBoolSetting('table_column_resizing',true);s.tableResizeBars=getBoolSetting('table_resize_bars',true);s.tableAdvtab=getBoolSetting('table_advtab',true);s.tableCellAdvtab=getBoolSetting('table_cell_advtab',true);s.tableRowAdvtab=getBoolSetting('table_row_advtab',true);s.tableStyleByCell=getBoolSetting('table_style_by_cell',false);s.tableSizingMode=getSetting('table_sizing_mode','relative');s.tableCloneElements=getSetting('table_clone_elements','strong em b i u');s.tableHeaderType=getSetting('table_header_type','section');s.tableUseColgroups=getBoolSetting('table_use_colgroups',false);s.tableBorderWidths=getSetting('table_border_widths','1px 2px 3px 4px 5px');s.tableBorderStyles=getSetting('table_border_styles','solid dashed dotted double groove ridge');s.contentFontFamily=getSetting('content_font_family','Arial,Helvetica,sans-serif');s.contentFontSize=getSetting('content_font_size','12px');s.contentLineHeight=getSetting('content_line_height','1.4');s.fontFamilyFormats=getSetting('font_family_formats','Arial=arial,helvetica,sans-serif;Courier New=courier new,courier,monospace;Georgia=georgia,palatino,serif;Tahoma=tahoma,arial,helvetica,sans-serif;Times New Roman=times new roman,times,serif;Verdana=verdana,geneva,sans-serif');s.fontSizeFormats=getSetting('font_size_formats','8pt 10pt 11pt 12pt 14pt 18pt 24pt 36pt');s.lineHeightFormats=getSetting('line_height_formats','1 1.2 1.4 1.6 2');s.pasteAsText=getBoolSetting('paste_as_text',false);s.pasteRemoveStyles=getBoolSetting('paste_remove_styles',false);s.pasteRemoveSpans=getBoolSetting('paste_remove_spans',false);s.smartPaste=getBoolSetting('smart_paste',true);s.invalidElements=getSetting('invalid_elements','script,object,embed,applet');s.extendedValidElements=getSetting('extended_valid_elements','span[*],div[*],p[*],a[*],img[*],table[*],tr[*],td[*],th[*]');s.entityEncoding=getSetting('entity_encoding','named');s.allowImages=getBoolSetting('allow_images',true);s.imageAdvtab=getBoolSetting('image_advtab',true);s.imageCaption=getBoolSetting('image_caption',true);s.imageDescription=getBoolSetting('image_description',true);s.imageTitle=getBoolSetting('image_title',true);s.imageDimensions=getBoolSetting('image_dimensions',true);s.imageUploadUrl=getSetting('image_upload_url','');s.allowLinks=getBoolSetting('allow_links',true);s.linkDefaultTarget=getSetting('link_default_target','_self');s.linkDefaultProtocol=getSetting('link_default_protocol','https');s.linkAssumeExternalTargets=getBoolSetting('link_assume_external_targets',true);s.linkContextToolbar=getBoolSetting('link_context_toolbar',true);s.linkQuicklink=getBoolSetting('link_quicklink',true);s.linkTitle=getBoolSetting('link_title',true);s.allowCodeView=getBoolSetting('allow_code_view',true);s.pluginFullscreen=getBoolSetting('plugin_fullscreen',true);s.pluginSearchreplace=getBoolSetting('plugin_searchreplace',true);s.pluginWordcount=getBoolSetting('plugin_wordcount',true);s.pluginCharmap=getBoolSetting('plugin_charmap',true);s.pluginEmoticons=getBoolSetting('plugin_emoticons',false);s.pluginInsertdatetime=getBoolSetting('plugin_insertdatetime',false);s.pluginPreview=getBoolSetting('plugin_preview',false);s.pluginAnchor=getBoolSetting('plugin_anchor',true);s.pluginVisualblocks=getBoolSetting('plugin_visualblocks',false);s.pluginVisualchars=getBoolSetting('plugin_visualchars',false);s.pluginPagebreak=getBoolSetting('plugin_pagebreak',false);s.pluginNonbreaking=getBoolSetting('plugin_nonbreaking',false);s.pluginCodesample=getBoolSetting('plugin_codesample',false);s.pluginDirectionality=getBoolSetting('plugin_directionality',false);s.pluginHelp=getBoolSetting('plugin_help',false);log('DEBUG','Settings loaded',s)}

function findRadEditors(){var editors=[];try{if(typeof Telerik!=='undefined'&&Telerik.Web&&Telerik.Web.UI&&Telerik.Web.UI.RadEditor){var instances=Telerik.Web.UI.RadEditor.get_instances?Telerik.Web.UI.RadEditor.get_instances():[];if(instances&&instances.length>0){for(var i=0;i<instances.length;i++){editors.push({type:'telerik',instance:instances[i],element:instances[i].get_element?instances[i].get_element():null})}log('DEBUG','Found '+editors.length+' RadEditor instances via Telerik API');return editors}}}catch(e){log('DEBUG','Telerik API not available',e)}var radElements=document.querySelectorAll('.RadEditor,[id*="RadEditor"],[class*="RadEditor"]');log('DEBUG','Found '+radElements.length+' potential RadEditor elements');radElements.forEach(function(el){var wrapper=el.closest('.RadEditor')||el;if(!editors.some(function(e){return e.element===wrapper})){editors.push({type:'dom',instance:null,element:wrapper})}});return editors}

function getRadEditorHtml(editor){try{if(editor.type==='telerik'&&editor.instance){if(editor.instance.get_html)return editor.instance.get_html();if(editor.instance.GetHtml)return editor.instance.GetHtml()}var textarea=editor.element.querySelector('textarea');if(textarea)return textarea.value;var contentArea=editor.element.querySelector('.reContentArea,.reContentCell,iframe');if(contentArea){if(contentArea.tagName==='IFRAME'){var doc=contentArea.contentDocument||contentArea.contentWindow.document;return doc.body?doc.body.innerHTML:''}return contentArea.innerHTML}}catch(e){log('DEBUG','Error getting RadEditor HTML',e)}return''}

function setRadEditorHtml(editor,html){try{if(editor.type==='telerik'&&editor.instance){if(editor.instance.set_html){editor.instance.set_html(html);return}if(editor.instance.SetHtml){editor.instance.SetHtml(html);return}}var textarea=editor.element.querySelector('textarea');if(textarea){textarea.value=html;var event=new Event('change',{bubbles:true});textarea.dispatchEvent(event)}}catch(e){log('DEBUG','Error setting RadEditor HTML',e)}}

function syncToRadEditor(editor,tmce){var html=tmce.getContent();setRadEditorHtml(editor,html)}

function getToolbar(){var s=state.settings;if(s.customToolbar)return s.customToolbar;var toolbars={minimal:'undo redo | bold italic | bullist numlist | link',standard:'undo redo | blocks | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | table',full:'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image table | code fullscreen'};return toolbars[s.toolbarConfig]||toolbars.full}

function getPlugins(){var plugins=['lists','link','image','table','autolink'];var s=state.settings;if(s.pluginFullscreen)plugins.push('fullscreen');if(s.pluginSearchreplace)plugins.push('searchreplace');if(s.pluginWordcount)plugins.push('wordcount');if(s.pluginCharmap)plugins.push('charmap');if(s.pluginAnchor)plugins.push('anchor');if(s.allowCodeView)plugins.push('code');if(s.quickbarsSelection||s.quickbarsInsert)plugins.push('quickbars');plugins.push('advlist');return plugins.join(' ')}

function createTinyMCE(editor,index){var s=state.settings;var container=document.createElement('div');container.id='nexteditor-container-'+index;container.className='nexteditor-container';var containerWidth=s.editorWidth||'100%';container.style.cssText='width:'+containerWidth+';min-height:'+s.minHeight+'px;';var textarea=document.createElement('textarea');textarea.id='nexteditor-'+index;textarea.className='nexteditor-textarea';var initialHtml=getRadEditorHtml(editor);textarea.value=initialHtml;container.appendChild(textarea);editor.element.style.display='none';editor.element.parentNode.insertBefore(container,editor.element);state.replacedEditors.push({original:editor,container:container,index:index});var config={selector:'#nexteditor-'+index,height:s.editorHeight,min_height:s.minHeight,max_height:s.maxHeight,resize:s.resize==='both'?'both':(s.resize==='vertical'?true:false),menubar:s.showMenubar?s.menuConfig:false,toolbar:getToolbar(),toolbar_mode:s.toolbarMode,toolbar_sticky:s.toolbarSticky,toolbar_sticky_offset:s.toolbarStickyOffset,statusbar:s.statusbar,elementpath:s.elementpath,plugins:getPlugins(),contextmenu:s.contextmenu,placeholder:s.placeholder,skin:false,content_css:false,content_style:'body{font-family:'+s.contentFontFamily+';font-size:'+s.contentFontSize+';line-height:'+s.contentLineHeight+';}table{border-collapse:collapse;}table td,table th{border:'+s.tableDefaultBorder+'px solid #ccc;padding:'+s.tableDefaultCellPadding+'px;}',font_family_formats:s.fontFamilyFormats,font_size_formats:s.fontSizeFormats,line_height_formats:s.lineHeightFormats,paste_as_text:s.pasteAsText,invalid_elements:s.invalidElements,extended_valid_elements:s.extendedValidElements,entity_encoding:s.entityEncoding,table_default_attributes:{'border':String(s.tableDefaultBorder),'cellpadding':String(s.tableDefaultCellPadding),'cellspacing':String(s.tableDefaultCellSpacing)},table_default_styles:{'border-collapse':'collapse','width':'100%'},table_column_resizing:s.tableColumnResizing?'preservetable':'resizetable',table_resize_bars:s.tableResizeBars,table_advtab:s.tableAdvtab,table_cell_advtab:s.tableCellAdvtab,table_row_advtab:s.tableRowAdvtab,table_style_by_css:!s.tableStyleByCell,table_sizing_mode:s.tableSizingMode,table_clone_elements:s.tableCloneElements,table_header_type:s.tableHeaderType,table_use_colgroups:s.tableUseColgroups,image_advtab:s.imageAdvtab,image_caption:s.imageCaption,image_description:s.imageDescription,image_title:s.imageTitle,image_dimensions:s.imageDimensions,link_default_target:s.linkDefaultTarget,link_default_protocol:s.linkDefaultProtocol,link_assume_external_targets:s.linkAssumeExternalTargets,link_context_toolbar:s.linkContextToolbar,link_quicklink:s.linkQuicklink,link_title:s.linkTitle,promotion:false,branding:false,license_key:'gpl',setup:function(ed){ed.on('init',function(){log('INFO','TinyMCE initialized for editor '+index)});ed.on('change blur input',function(){syncToRadEditor(editor,ed)})}};if(s.quickbarsSelection)config.quickbars_selection_toolbar=s.quickbarsSelection;if(s.quickbarsInsert)config.quickbars_insert_toolbar=s.quickbarsInsert;tinymce.init(config).then(function(eds){if(eds&&eds[0]){state.tinymceInstances.push(eds[0]);log('DEBUG','TinyMCE instance created',eds[0].id)}})}

function replaceAllEditors(){var editors=findRadEditors();if(editors.length===0){log('INFO','No RadEditor instances found');return}log('INFO','Replacing '+editors.length+' RadEditor(s) with TinyMCE');editors.forEach(function(editor,index){createTinyMCE(editor,index)})}

function initialize(){if(state.initialized)return;loadSettings();if(!state.settings.enableTinymce){log('INFO','TinyMCE disabled');return}log('INFO','NextEditor v'+VERSION+' initializing...');if(state.settings.activationMode==='auto'){if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',replaceAllEditors)}else{setTimeout(replaceAllEditors,100)}}state.initialized=true}

window.NEXTEDITOR={version:VERSION,initialize:initialize,replaceAll:replaceAllEditors,getInstances:function(){return state.tinymceInstances},getSettings:function(){return state.settings},isInitialized:function(){return state.initialized}};

initialize();
})();
'@
}

$sizeReport["Application Code"] = $appCode.Length
[void]$output.AppendLine($appCode)

# ============================================================
# WRITE OUTPUT
# ============================================================
Write-Host ""
Write-Host "[WRITE] Saving to nexteditor.js..." -ForegroundColor Green

$finalOutput = $output.ToString()
[System.IO.File]::WriteAllText($outputFile, $finalOutput, [System.Text.Encoding]::UTF8)

$totalSize = (Get-Item $outputFile).Length
$endTime = Get-Date
$duration = ($endTime - $startTime).TotalSeconds

# ============================================================
# SIZE REPORT
# ============================================================
Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host " BUILD COMPLETE" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Output: $outputFile" -ForegroundColor White
Write-Host "Size:   $([math]::Round($totalSize/1024, 1)) KB ($([math]::Round($totalSize/1MB, 2)) MB)" -ForegroundColor White
Write-Host "Mode:   $buildMode" -ForegroundColor White
Write-Host "Time:   $([math]::Round($duration, 2)) seconds" -ForegroundColor White

if ($Report) {
    Write-Host ""
    Write-Host "Size Breakdown:" -ForegroundColor Cyan
    Write-Host "---------------" -ForegroundColor Cyan
    $sizeReport.GetEnumerator() | Sort-Object Value -Descending | ForEach-Object {
        $pct = [math]::Round(($_.Value / $totalSize) * 100, 1)
        Write-Host ("  {0,-25} {1,8} KB  ({2,5}%)" -f $_.Key, [math]::Round($_.Value/1024, 1), $pct) -ForegroundColor Gray
    }
}

# ============================================================
# PACKAGE GENERATION
# ============================================================
if (-not $NoPackage) {
    Write-Host ""
    Write-Host "[PACKAGE] Generating .spiraapp package..." -ForegroundColor Cyan

    $packageGenDir = Join-Path (Split-Path $projectDir -Parent) "spiraapp-package-generator"

    if (Test-Path $packageGenDir) {
        Push-Location $packageGenDir
        try {
            $result = & npm run build --input="$projectDir" 2>&1
            if ($LASTEXITCODE -eq 0) {
                # Move generated package
                $packages = Get-ChildItem -Filter "*.spiraapp" -ErrorAction SilentlyContinue
                foreach ($pkg in $packages) {
                    $destPath = Join-Path $projectDir $pkg.Name
                    Move-Item $pkg.FullName $destPath -Force
                    $pkgSize = (Get-Item $destPath).Length
                    Write-Host "[OK] Package: $($pkg.Name) ($([math]::Round($pkgSize/1MB, 2)) MB)" -ForegroundColor Green
                }
            } else {
                Write-Host "[WARN] Package generation failed" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "[WARN] Package generation error: $_" -ForegroundColor Yellow
        }
        Pop-Location
    } else {
        Write-Host "[SKIP] Package generator not found at: $packageGenDir" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
Write-Host ""
