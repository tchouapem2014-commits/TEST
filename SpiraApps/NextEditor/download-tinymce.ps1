# ============================================================
# Download TinyMCE for NextEditor
# ============================================================
# Usage: .\download-tinymce.ps1
# ============================================================

$ErrorActionPreference = "Stop"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " TinyMCE Download Script" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$projectDir = $PSScriptRoot
$libsDir = Join-Path $projectDir "libs"
$tempDir = Join-Path $env:TEMP "tinymce-download"
$zipFile = Join-Path $tempDir "tinymce.zip"

# TinyMCE version to download
$tinymceVersion = "6.8.2"
$downloadUrl = "https://download.tiny.cloud/tinymce/community/tinymce_$tinymceVersion.zip"

# Alternative: use npm
$useNpm = $false

# Create directories
if (-not (Test-Path $libsDir)) {
    New-Item -ItemType Directory -Path $libsDir -Force | Out-Null
}

if (-not (Test-Path $tempDir)) {
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
}

Write-Host "[INFO] Downloading TinyMCE v$tinymceVersion..." -ForegroundColor Green

try {
    # Method 1: Direct download
    Write-Host "[INFO] Attempting direct download..." -ForegroundColor Cyan

    # Use .NET WebClient for download
    $webClient = New-Object System.Net.WebClient
    $webClient.DownloadFile($downloadUrl, $zipFile)

    Write-Host "[OK] Download complete" -ForegroundColor Green

    # Extract
    Write-Host "[INFO] Extracting..." -ForegroundColor Cyan
    Expand-Archive -Path $zipFile -DestinationPath $tempDir -Force

    # Find tinymce.min.js
    $tinymceJs = Get-ChildItem -Path $tempDir -Filter "tinymce.min.js" -Recurse | Select-Object -First 1

    if ($tinymceJs) {
        Copy-Item $tinymceJs.FullName -Destination $libsDir -Force
        Write-Host "[OK] Copied tinymce.min.js to libs/" -ForegroundColor Green

        # Copy plugins
        $pluginsSource = Join-Path $tinymceJs.Directory.FullName "plugins"
        if (Test-Path $pluginsSource) {
            $pluginsDest = Join-Path $libsDir "plugins"
            Copy-Item $pluginsSource -Destination $pluginsDest -Recurse -Force
            Write-Host "[OK] Copied plugins/ to libs/" -ForegroundColor Green
        }

        # Copy skins
        $skinsSource = Join-Path $tinymceJs.Directory.FullName "skins"
        if (Test-Path $skinsSource) {
            $skinsDest = Join-Path $libsDir "skins"
            Copy-Item $skinsSource -Destination $skinsDest -Recurse -Force
            Write-Host "[OK] Copied skins/ to libs/" -ForegroundColor Green
        }

        # Copy themes
        $themesSource = Join-Path $tinymceJs.Directory.FullName "themes"
        if (Test-Path $themesSource) {
            $themesDest = Join-Path $libsDir "themes"
            Copy-Item $themesSource -Destination $themesDest -Recurse -Force
            Write-Host "[OK] Copied themes/ to libs/" -ForegroundColor Green
        }

        # Copy icons
        $iconsSource = Join-Path $tinymceJs.Directory.FullName "icons"
        if (Test-Path $iconsSource) {
            $iconsDest = Join-Path $libsDir "icons"
            Copy-Item $iconsSource -Destination $iconsDest -Recurse -Force
            Write-Host "[OK] Copied icons/ to libs/" -ForegroundColor Green
        }

        # Copy models
        $modelsSource = Join-Path $tinymceJs.Directory.FullName "models"
        if (Test-Path $modelsSource) {
            $modelsDest = Join-Path $libsDir "models"
            Copy-Item $modelsSource -Destination $modelsDest -Recurse -Force
            Write-Host "[OK] Copied models/ to libs/" -ForegroundColor Green
        }
    } else {
        throw "tinymce.min.js not found in archive"
    }

} catch {
    Write-Host "[ERROR] Direct download failed: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "[INFO] Trying npm fallback..." -ForegroundColor Yellow

    try {
        # Check if npm is available
        $npmVersion = npm --version 2>$null
        if ($npmVersion) {
            Push-Location $tempDir
            npm pack tinymce@$tinymceVersion
            $tgzFile = Get-ChildItem -Filter "tinymce-*.tgz" | Select-Object -First 1

            if ($tgzFile) {
                # Extract tgz
                tar -xzf $tgzFile.Name

                $packageDir = Join-Path $tempDir "package"
                if (Test-Path $packageDir) {
                    # Copy files
                    $tinymceJs = Join-Path $packageDir "tinymce.min.js"
                    if (Test-Path $tinymceJs) {
                        Copy-Item $tinymceJs -Destination $libsDir -Force
                        Write-Host "[OK] Copied tinymce.min.js from npm" -ForegroundColor Green
                    }

                    # Copy subdirectories
                    @("plugins", "skins", "themes", "icons", "models") | ForEach-Object {
                        $srcDir = Join-Path $packageDir $_
                        if (Test-Path $srcDir) {
                            Copy-Item $srcDir -Destination $libsDir -Recurse -Force
                            Write-Host "[OK] Copied $_/ from npm" -ForegroundColor Green
                        }
                    }
                }
            }
            Pop-Location
        } else {
            throw "npm not available"
        }
    } catch {
        Write-Host "[ERROR] npm fallback also failed: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please download TinyMCE manually:" -ForegroundColor Yellow
        Write-Host "1. Go to: https://www.tiny.cloud/get-tiny/self-hosted/" -ForegroundColor White
        Write-Host "2. Download TinyMCE Community" -ForegroundColor White
        Write-Host "3. Extract and copy to: $libsDir" -ForegroundColor White
        exit 1
    }
}

# Cleanup
Write-Host ""
Write-Host "[INFO] Cleaning up..." -ForegroundColor Cyan
Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue

# List downloaded files
Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host " Download Complete!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Files in libs/:" -ForegroundColor White
Get-ChildItem $libsDir -Recurse | Where-Object { -not $_.PSIsContainer } | ForEach-Object {
    $relativePath = $_.FullName.Replace($libsDir, "").TrimStart("\")
    $sizeKB = [math]::Round($_.Length / 1024, 1)
    Write-Host "  $relativePath ($sizeKB KB)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Next step: Run .\build-embedded.ps1 to build nexteditor.js" -ForegroundColor Cyan
Write-Host ""
