# SpiraXCapture

> Capture screenshots and attach them to SpiraPlan artifacts

## Overview

SpiraXCapture (SXC) is a SpiraApp that allows users to capture screenshots directly from their browser and automatically attach them to the current artifact in SpiraPlan.

## Features

- **One-click capture**: Capture your screen with a single click
- **Multiple formats**: Support for PNG (lossless) and JPEG (compressed)
- **Automatic naming**: Optional timestamp in filename
- **Universal support**: Works on Requirements, Test Cases, Test Sets, Incidents, Tasks, and Releases

## Installation

1. Download the `.spiraapp` package
2. Go to SpiraPlan Administration > System > SpiraApps
3. Upload the package
4. Enable SpiraXCapture for your product(s)

## Configuration

### Product Settings

| Setting | Description | Default |
|---------|-------------|---------|
| Capture Quality | JPEG compression (0.1-1.0) | 0.8 |
| Format | Image format (png/jpeg) | png |
| Auto Timestamp | Add date/time to filename | Yes |
| Debug Mode | Enable console logging | No |

## Usage

1. Navigate to any artifact detail page (Requirement, Test Case, Incident, etc.)
2. Click the **SXC** button in the toolbar
3. Select **Capturer Ecran**
4. Choose what to share (entire screen, window, or tab)
5. The screenshot is automatically attached to the artifact

## Browser Support

| Browser | Supported |
|---------|-----------|
| Chrome 72+ | Yes |
| Firefox 66+ | Yes |
| Edge 79+ | Yes |
| Safari 13+ | Partial |

## Troubleshooting

### "Capture limitee" message

This appears when the Screen Capture API is not available. Try:
- Using a modern browser (Chrome, Firefox, Edge)
- Accessing SpiraPlan via HTTPS

### No capture dialog appears

- Check browser permissions for screen sharing
- Ensure you're using a supported browser

### Debug Mode

Enable debug mode in settings to see detailed logs in the browser console (F12).

```javascript
// Console commands for debugging
SXC_showState();    // Show current settings
SXC_captureNow();   // Force a capture
SXC_testUpload();   // Test upload with placeholder image
```

## Technical Details

- Uses the modern Screen Capture API (`getDisplayMedia`)
- Falls back to html2canvas for unsupported browsers
- Uploads via SpiraPlan REST API

## Version History

- **1.0.0** - Initial release

## License

MIT License

## Support

For issues and feature requests, please contact your SpiraPlan administrator.

---

*SpiraXCapture - A SpiraApp for SpiraPlan*
