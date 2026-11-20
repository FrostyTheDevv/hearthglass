<#
.SYNOPSIS
    Automated Windows Release Packaging Script for Hearthglass: Convergence Duels.
.DESCRIPTION
    Compiles the authoritative Rust rules engine binary, exports the Godot 4.3 project
    data to a standalone PCK, bundles the Windows executables, canonical card catalogue,
    and creates a self-contained, launchable release folder.
#>

param(
    [string]$OutputDirectory = "apps/game-client/build/windows"
)

$ErrorActionPreference = "Stop"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   HEARTHGLASS: CONVERGENCE DUELS — WINDOWS RELEASE BUILD PIPELINE    " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

# 1. Resolve repository root
$repoRoot = (Resolve-Path "$PSScriptRoot/..").Path
Set-Location $repoRoot

# 2. Compile Authoritative Rust Battle Server Binary
Write-Host "`n[STEP 1/5] Compiling authoritative Rust battle-server engine..." -ForegroundColor Yellow
cargo build --manifest-path services/battle-server/Cargo.toml
$rustBinaryPath = Join-Path $repoRoot "target/debug/hearthglass-battle-server.exe"
if (-not (Test-Path $rustBinaryPath)) {
    throw "Failed to locate compiled Rust battle server binary at: $rustBinaryPath"
}
Write-Host "  -> Authoritative battle-server binary built: $rustBinaryPath" -ForegroundColor Green

# 3. Locate or Install Godot 4.3 Executable
Write-Host "`n[STEP 2/5] Locating Godot 4.3 engine..." -ForegroundColor Yellow
$godotConsole = (Get-Command "godot_console.exe" -ErrorAction SilentlyContinue).Source
if (-not $godotConsole) {
    $godotConsole = (Get-Command "godot.exe" -ErrorAction SilentlyContinue).Source
}
if (-not $godotConsole) {
    throw "Godot 4.3 executable not found in PATH. Please install Godot 4.3 or add it to PATH."
}
Write-Host "  -> Using Godot engine executable: $godotConsole" -ForegroundColor Green

# 4. Prepare Output Directories
Write-Host "`n[STEP 3/5] Preparing output directory structure at: $OutputDirectory" -ForegroundColor Yellow
$outPath = Join-Path $repoRoot $OutputDirectory
New-Item -ItemType Directory -Path $outPath -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $outPath "target/debug") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $outPath "services/battle-server/target/debug") -Force | Out-Null

# 5. Export Godot PCK Data
Write-Host "`n[STEP 4/5] Exporting Godot 4.3 PCK package (Windows Desktop preset)..." -ForegroundColor Yellow
$pckOut = Join-Path $outPath "hearthglass.pck"
& $godotConsole --headless --path "$repoRoot/apps/game-client" --export-pack "Windows Desktop" $pckOut
if ($LASTEXITCODE -ne 0) {
    throw "Godot PCK export failed with exit code $LASTEXITCODE"
}
Write-Host "  -> Exported PCK: $pckOut" -ForegroundColor Green

# 6. Bundle Standalone Binaries and Content Assets
Write-Host "`n[STEP 5/5] Bundling standalone release binaries and assets..." -ForegroundColor Yellow

# Copy Godot executables
$godotDir = Split-Path -Parent $godotConsole
Copy-Item (Join-Path $godotDir "godot.exe") (Join-Path $outPath "hearthglass.exe") -Force
Copy-Item (Join-Path $godotDir "godot_console.exe") (Join-Path $outPath "hearthglass_console.exe") -Force

# Copy Rust battle-server binary
Copy-Item $rustBinaryPath (Join-Path $outPath "target/debug/hearthglass-battle-server.exe") -Force
Copy-Item $rustBinaryPath (Join-Path $outPath "services/battle-server/target/debug/hearthglass-battle-server.exe") -Force

# Copy Canonical content datasets
Copy-Item (Join-Path $repoRoot "content") -Destination $outPath -Recurse -Force

# Generate One-Click Launcher Batch File
$launcherPath = Join-Path $outPath "Launch_Hearthglass.bat"
Set-Content -Path $launcherPath -Value "@echo off
echo ======================================================================
echo    STARTING HEARTHGLASS: CONVERGENCE DUELS (WINDOWS RELEASE)          
echo ======================================================================
start """" ""%~dp0hearthglass.exe"" --main-pack ""%~dp0hearthglass.pck"""

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   WINDOWS RELEASE BUILD COMPLETED SUCCESSFULLY!                      " -ForegroundColor Green
Write-Host "   Output Directory: $outPath                                         " -ForegroundColor White
Write-Host "   Launch with:      $launcherPath                                    " -ForegroundColor White
Write-Host "======================================================================" -ForegroundColor Cyan
