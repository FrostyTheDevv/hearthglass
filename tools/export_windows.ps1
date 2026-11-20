<#
.SYNOPSIS
    Automated Windows Release Packaging & Portability Acceptance Pipeline for Hearthglass.
.DESCRIPTION
    Compiles the authoritative Rust battle rules engine, exports the Godot 4.3 project
    to a standalone PCK, bundles standalone Windows executables and canonical content,
    generates one-click launch scripts, and validates clean-directory portability outside the repository.
#>

param(
    [string]$OutputDirectory = "apps/game-client/build/windows",
    [switch]$RunAcceptanceTest = $false,
    [string]$TestCleanDirectory = "$env:TEMP/hearthglass_clean_export"
)

$ErrorActionPreference = "Stop"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   HEARTHGLASS: CONVERGENCE DUELS — WINDOWS RELEASE BUILD PIPELINE    " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

# 1. Resolve repository root
$repoRoot = (Resolve-Path "$PSScriptRoot/..").Path
Set-Location $repoRoot

# 2. Compile Authoritative Rust Battle Server Binary
Write-Host "`n[STEP 1/6] Compiling authoritative Rust battle-server engine..." -ForegroundColor Yellow
cargo build --manifest-path services/battle-server/Cargo.toml
$rustCandidates = @(
    (Join-Path $repoRoot "target/release/hearthglass-battle-server.exe"),
    (Join-Path $repoRoot "services/battle-server/target/release/hearthglass-battle-server.exe"),
    (Join-Path $repoRoot "target/debug/hearthglass-battle-server.exe"),
    (Join-Path $repoRoot "services/battle-server/target/debug/hearthglass-battle-server.exe")
)
$rustBinaryPath = $null
foreach ($cand in $rustCandidates) {
    if (Test-Path $cand) {
        $rustBinaryPath = $cand
        break
    }
}
if (-not $rustBinaryPath) {
    throw "Diagnostic Error: Failed to locate compiled Rust battle server binary in any standard build target directory."
}
Write-Host "  -> Authoritative battle-server binary located: $rustBinaryPath" -ForegroundColor Green

# 3. Locate Official Godot 4.3 Engine Executable
Write-Host "`n[STEP 2/6] Locating official Godot 4.3 engine executable..." -ForegroundColor Yellow
$godotConsole = $null
$godotGui = $null

$searchExecs = @(
    "godot_console.exe",
    "Godot_v4.3-stable_win64_console.exe",
    "godot.exe",
    "Godot_v4.3-stable_win64.exe"
)
foreach ($exe in $searchExecs) {
    $cmd = Get-Command $exe -ErrorAction SilentlyContinue
    if ($cmd) {
        if ($exe -like "*console*") {
            $godotConsole = $cmd.Source
        } else {
            $godotGui = $cmd.Source
        }
    }
}

# If not in PATH, check common installation paths
if (-not $godotConsole) {
    $commonDirs = @(
        (Join-Path $env:USERPROFILE ".cargo/bin"),
        (Join-Path $env:USERPROFILE "Downloads"),
        (Join-Path $env:ProgramFiles "Godot")
    )
    foreach ($dir in $commonDirs) {
        if (Test-Path $dir) {
            foreach ($exe in $searchExecs) {
                $p = Join-Path $dir $exe
                if (Test-Path $p) {
                    if ($exe -like "*console*") { $godotConsole = $p }
                    else { $godotGui = $p }
                }
            }
        }
    }
}

if (-not $godotConsole) {
    if ($godotGui) {
        $godotConsole = $godotGui
    } else {
        throw "Diagnostic Error: Godot 4.3 executable not found in PATH or standard installation folders. Please ensure Godot 4.3 is installed."
    }
}
Write-Host "  -> Using Godot engine CLI: $godotConsole" -ForegroundColor Green

# 4. Prepare Output Directory Structure
Write-Host "`n[STEP 3/6] Preparing standalone release directory at: $OutputDirectory" -ForegroundColor Yellow
$outPath = Join-Path $repoRoot $OutputDirectory
New-Item -ItemType Directory -Path $outPath -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $outPath "bin") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $outPath "target/debug") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $outPath "services/battle-server/target/debug") -Force | Out-Null

# 5. Export Godot PCK Package
Write-Host "`n[STEP 4/6] Exporting Godot 4.3 PCK package (Windows Desktop preset)..." -ForegroundColor Yellow
$pckOut = Join-Path $outPath "hearthglass.pck"
& $godotConsole --headless --path "$repoRoot/apps/game-client" --export-pack "Windows Desktop" $pckOut
if ($LASTEXITCODE -ne 0) {
    throw "Diagnostic Error: Godot PCK export failed with exit code $LASTEXITCODE"
}
Write-Host "  -> Exported PCK: $pckOut" -ForegroundColor Green

# 6. Bundle Standalone Release Binaries, Content Assets, and Launcher
Write-Host "`n[STEP 5/6] Bundling standalone release binaries and assets..." -ForegroundColor Yellow

$godotDir = Split-Path -Parent $godotConsole
if (Test-Path (Join-Path $godotDir "godot.exe")) {
    Copy-Item (Join-Path $godotDir "godot.exe") (Join-Path $outPath "hearthglass.exe") -Force
}
if (Test-Path (Join-Path $godotDir "godot_console.exe")) {
    Copy-Item (Join-Path $godotDir "godot_console.exe") (Join-Path $outPath "hearthglass_console.exe") -Force
}

# Package Rust battle engine at intentional stable runtime paths
Copy-Item $rustBinaryPath (Join-Path $outPath "hearthglass-battle-server.exe") -Force
Copy-Item $rustBinaryPath (Join-Path $outPath "bin/hearthglass-battle-server.exe") -Force
Copy-Item $rustBinaryPath (Join-Path $outPath "target/debug/hearthglass-battle-server.exe") -Force
Copy-Item $rustBinaryPath (Join-Path $outPath "services/battle-server/target/debug/hearthglass-battle-server.exe") -Force

# Package Canonical content datasets
Copy-Item (Join-Path $repoRoot "content") -Destination $outPath -Recurse -Force

# Generate One-Click Launcher Batch File
$launcherPath = Join-Path $outPath "Launch_Hearthglass.bat"
$launcherContent = @"
@echo off
echo ======================================================================
echo    STARTING HEARTHGLASS: CONVERGENCE DUELS (WINDOWS RELEASE)          
echo ======================================================================
echo Modes:
echo   - Offline Campaign Profile: 100% self-contained, no server needed.
echo   - Online Authenticated Account: Requires platform API running at 127.0.0.1:4173.
echo.
start "" "%~dp0hearthglass.exe" --main-pack "%~dp0hearthglass.pck"
"@
Set-Content -Path $launcherPath -Value $launcherContent

# Generate Release Documentation
$readmePath = Join-Path $outPath "README_RELEASE.txt"
$readmeContent = @"
======================================================================
   HEARTHGLASS: CONVERGENCE DUELS — WINDOWS STANDALONE DISTRIBUTION
======================================================================

OVERVIEW:
Hearthglass is an original isometric card-battling RPG powered by Godot 4.3
and an authoritative Rust rules engine (hearthglass-battle-server.exe).

HOW TO RUN:
1. Double-click 'Launch_Hearthglass.bat' or run 'hearthglass.exe'.
2. The game will launch into the Main Menu.

SYSTEM REQUIREMENTS:
- Windows 10/11 64-bit
- Vulkan 1.2+ capable GPU (Forward+ or Mobile rendering)
- No Node.js, Rust, or Python is required on the user's computer for offline play!

OFFLINE VS. ONLINE MODES:
- Offline Campaign Mode (Default):
  Fully self-contained. Card collection, quest progression, deck building,
  and NPC duels operate locally and are verified by the bundled Rust rules engine.
- Online Authenticated Mode:
  To connect to competitive multiplayer and cloud account synchronization,
  start the platform API server (services/api: npm start) at http://127.0.0.1:4173.
"@
Set-Content -Path $readmePath -Value $readmeContent

Write-Host "  -> Release bundle successfully created at: $outPath" -ForegroundColor Green

# 7. Clean-Directory Portability Acceptance Test
if ($RunAcceptanceTest) {
    Write-Host "`n[STEP 6/6] Executing Clean-Directory Portability Acceptance Test..." -ForegroundColor Yellow
    Write-Host "  -> Target isolated test folder: $TestCleanDirectory" -ForegroundColor White

    if (Test-Path $TestCleanDirectory) {
        Remove-Item -Path $TestCleanDirectory -Recurse -Force | Out-Null
    }
    New-Item -ItemType Directory -Path $TestCleanDirectory -Force | Out-Null

    # Copy bundle to isolated directory outside repository
    Copy-Item -Path "$outPath/*" -Destination $TestCleanDirectory -Recurse -Force
    Write-Host "  -> Bundle copied outside repository to isolated directory." -ForegroundColor Green

    # Run verification test inside the clean directory using packaged console executable
    $testExe = Join-Path $TestCleanDirectory "hearthglass_console.exe"
    $testPck = Join-Path $TestCleanDirectory "hearthglass.pck"

    Write-Host "  -> Launching packaged build in clean outside directory..." -ForegroundColor White
    $testProcess = Start-Process -FilePath $testExe -ArgumentList @("--headless", "--main-pack", $testPck, "scenes/tests/smoke_test_runner.tscn") -Wait -PassThru -NoNewWindow

    if ($testProcess.ExitCode -eq 0) {
        Write-Host "  [OK] Clean-Directory Portability Test PASSED! Exit Code: 0" -ForegroundColor Green
    } else {
        throw "Diagnostic Failure: Standalone clean directory execution failed with exit code $($testProcess.ExitCode)"
    }
}

Write-Host "`n======================================================================" -ForegroundColor Cyan
Write-Host "   WINDOWS RELEASE BUILD COMPLETED SUCCESSFULLY!                      " -ForegroundColor Green
Write-Host "   Output Directory: $outPath                                         " -ForegroundColor White
Write-Host "   Launch with:      $launcherPath                                    " -ForegroundColor White
Write-Host "======================================================================" -ForegroundColor Cyan
