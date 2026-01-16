# NextEditor - SpiraApp Development Prompt

## Project Overview

**NextEditor** is a SpiraApp that replaces SpiraPlan's default RadEditor (Telerik) with TinyMCE for all RichText fields. The goal is to provide a superior editing experience, especially for tables.

## Requirements

### Functional Requirements

1. **Replace ALL RadEditor instances** on supported pages with TinyMCE
2. **Configurable activation** via product settings:
   - `enable_tinymce` (boolean): Enable/disable the replacement
   - `activation_mode` (string): "auto" (replace on load) or "manual" (toggle button)
   - `allow_toggle` (boolean): Allow users to switch back to RadEditor
3. **Seamless data sync**: HTML content must sync between TinyMCE and the hidden RadEditor textarea
4. **Preserve SpiraPlan save functionality**: SpiraPlan reads from the original textarea on save

### Technical Requirements

1. **TinyMCE loading**: Load from CDN (https://cdn.tiny.cloud/1/no-api-key/tinymce/6/tinymce.min.js)
2. **Plugins required**: table, lists, link, image, code, fullscreen, searchreplace
3. **Table features**: merge cells, split cells, cell properties, row/column operations
4. **Theme**: Default to "silver" skin, match SpiraPlan's UI

### Supported Pages (pageIds)

- 9: RequirementDetails
- 10: TestCaseDetails
- 11: TestSetDetails
- 14: IncidentDetails
- 15: TaskDetails
- 16: ReleaseDetails

### RadEditor Detection Strategy

```javascript
// Method 1: Telerik API
if (window.Telerik && Telerik.Web.UI.RadEditor) {
    var editors = Telerik.Web.UI.RadEditor.get_instances();
}

// Method 2: DOM selectors
var containers = document.querySelectorAll('.RadEditor, [id*="RadEditor"], .reContentCell');

// Method 3: Find underlying textareas
var textareas = document.querySelectorAll('textarea[id*="Description"], textarea[id*="Notes"]');
```

### Data Flow

```
Load:
1. SpiraPlan loads RadEditor with existing HTML
2. NextEditor detects RadEditor instances
3. Get HTML: radEditor.get_html() or textarea.value
4. Hide RadEditor (display:none)
5. Create TinyMCE in same location
6. Load HTML: tinymce.setContent(html)

Edit:
7. User edits in TinyMCE
8. onChange: sync to hidden textarea

Save:
9. SpiraPlan reads textarea.value (already synced)
10. Normal server-side save
```

## File Structure

```
NextEditor/
├── manifest.yaml          # SpiraApp configuration
├── nexteditor.js          # Main JavaScript code (with embedded TinyMCE after build)
├── PROMPT.md              # This file
├── ralph.bat              # Development loop script
├── build-embedded.ps1     # Build script to embed TinyMCE
├── download-tinymce.ps1   # Script to download TinyMCE
├── test.html              # Standalone test page
└── libs/                  # TinyMCE source files
    ├── tinymce.min.js
    ├── plugins/
    ├── skins/
    ├── themes/
    └── icons/
```

## Build Process

1. Download TinyMCE: `.\download-tinymce.ps1`
2. Build embedded JS: `.\build-embedded.ps1`
3. Test: Open `test.html` in browser
4. Package: Use spiraapp-package-generator

**IMPORTANT**: TinyMCE must be embedded in nexteditor.js (not loaded from CDN)
because SpiraApps require all code in a single file.

## Current Task

Build the complete SpiraApp with:
1. `manifest.yaml` with proper pageContents and productSettings
2. `nexteditor.js` that:
   - Loads TinyMCE from CDN
   - Detects and replaces RadEditor instances
   - Syncs content bidirectionally
   - Respects product settings
3. `test.html` for standalone testing

## Completion Criteria

When the following are complete, output: `<promise>COMPLETE</promise>`

1. All files created and syntactically valid
2. TinyMCE loads successfully in test.html
3. RadEditor replacement logic implemented
4. Content sync working
5. Settings respected (enable, mode, toggle)

## Notes

- Use vanilla JavaScript (no build tools)
- Code must be compatible with SpiraPlan v7.0+
- Follow the same patterns as CapX SpiraApp in the parent folder
- TinyMCE is GPL v2+ licensed (free for self-hosted use)
