# Global docs pull — herhangi bir proje klasorunden calisir.
# Ilk kurulum: ~/.website-logic-cache yoksa website-logic clone eder.
# Proje kokundeyse docs/, scripts/, .cursor/rules/ kurar.
# Tetikleyici: "bismillah docsa bak, guncel basla" / "clone edip incele"

param(
    [switch]$HubOnly
)

$ErrorActionPreference = "Stop"

$DefaultConfig = [PSCustomObject]@{
    centralRepo = "git@github.com:Hasan-Vural/website-logic.git"
    cachePath = "$env:USERPROFILE\.website-logic-cache"
    projects = @{
        "Edura-Academy/edura" = @{ key = "edura"; projectDocsPath = "public/edura"; visibility = "public" }
        "Hasan-Vural/hasanvuralcom" = @{ key = "hasanvuralcom"; projectDocsPath = "private/hasanvuralcom"; visibility = "private" }
        "Hasan-Vural/bhmcontrol" = @{ key = "bhmcontrol"; projectDocsPath = "private/bhmcontrol"; visibility = "private" }
        "Hasan-Vural/godiva-elix" = @{ key = "godiva-elix"; projectDocsPath = "private/godiva-elix"; visibility = "private" }
        "kutu-oyun/kutu-oyun-2-el" = @{ key = "kutuly"; projectDocsPath = "public/kutuly"; visibility = "public" }
    }
}

function Ensure-HubCacheGlobal {
    param([object]$Config)
    $cache = $Config.cachePath
    if (-not (Test-Path $cache)) {
        New-Item -ItemType Directory -Path (Split-Path $cache -Parent) -Force | Out-Null
        Write-Host "Ilk kurulum: website-logic clone ediliyor -> $cache"
        git clone $Config.centralRepo $cache
        if ($LASTEXITCODE -ne 0) { throw "Clone basarisiz." }
    }
    else {
        Push-Location $cache
        try { git pull --ff-only 2>&1 | Out-Null }
        finally { Pop-Location }
    }
    return $cache
}

function Copy-Tree {
    param([string]$Source, [string]$Destination)
    if (-not (Test-Path $Source)) { return }
    New-Item -ItemType Directory -Path $Destination -Force | Out-Null
    Copy-Item -Path (Join-Path $Source "*") -Destination $Destination -Recurse -Force
}

function Install-HubBootstrap {
    param([string]$ProjectRoot, [string]$HubRoot)
    $hubDocs = Join-Path $HubRoot "docs"
    if (-not (Test-Path $hubDocs)) { $hubDocs = $HubRoot }

    $cursorSrc = Join-Path $hubDocs "cursor-rules"
    if (Test-Path $cursorSrc) {
        $cursorDst = Join-Path $ProjectRoot ".cursor\rules"
        New-Item -ItemType Directory -Path $cursorDst -Force | Out-Null
        Copy-Item -Path (Join-Path $cursorSrc "*.mdc") -Destination $cursorDst -Force
        Write-Host "  OK cursor-rules -> .cursor/rules/"
    }

    $scriptsSrc = Join-Path $HubRoot "scripts"
    if (Test-Path $scriptsSrc) {
        $scriptsDst = Join-Path $ProjectRoot "scripts"
        New-Item -ItemType Directory -Path $scriptsDst -Force | Out-Null
        Copy-Item -Path (Join-Path $scriptsSrc "docs-*") -Destination $scriptsDst -Force
        Write-Host "  OK scripts/docs-*"
    }
}

function Get-RemoteSlug {
    $url = git remote get-url origin 2>$null
    if (-not $url) { return $null }
    if ($url -match '[:/]([^/]+)/([^/.]+?)(?:\.git)?$') {
        return "$($Matches[1])/$($Matches[2])"
    }
    return $null
}

$cache = Ensure-HubCacheGlobal -Config $DefaultConfig
$hubDocs = Join-Path $cache "docs"
if (-not (Test-Path $hubDocs)) { $hubDocs = $cache }

Write-Host "Hub guncel: $cache"

$slug = Get-RemoteSlug
$projectDocsPath = $null
if ($slug -and $DefaultConfig.projects.ContainsKey($slug)) {
    $projectDocsPath = $DefaultConfig.projects[$slug].projectDocsPath
    Write-Host "Proje: $slug -> $projectDocsPath"
}
else {
    Write-Host "Proje: (taninmadi) — genel docs okunacak"
}

$projectRoot = git rev-parse --show-toplevel 2>$null
if ($projectRoot -and -not $HubOnly) {
    $projectRoot = $projectRoot.Trim()
    $localDocs = Join-Path $projectRoot "docs"
    New-Item -ItemType Directory -Path $localDocs -Force | Out-Null

    foreach ($item in @("00-READ-FIRST.md", "projects-registry.md", "README.md", "docs-hub.config.json", "general", "public", "private", "stitch", "cursor-rules")) {
        $src = Join-Path $hubDocs $item
        $dst = Join-Path $localDocs $item
        if (Test-Path $src) {
            if (Test-Path $src -PathType Container) { Copy-Tree $src $dst }
            else { Copy-Item $src $dst -Force }
            Write-Host "  OK docs/$item"
        }
    }

    Install-HubBootstrap -ProjectRoot $projectRoot -HubRoot $cache
    Write-Host ""
    Write-Host "Proje kuruldu: docs/ + scripts/ + .cursor/rules/"
    Write-Host "Oku: $localDocs\00-READ-FIRST.md"
    if ($projectDocsPath) {
        Write-Host "Proje: $localDocs\$projectDocsPath"
    }
}
else {
    Write-Host ""
    Write-Host "--- Hub okuma yolu (proje kokunde degilsin) ---"
    Write-Host "1. $hubDocs\00-READ-FIRST.md"
    Write-Host "2. $hubDocs\projects-registry.md"
    if ($projectDocsPath) {
        Write-Host "3. $hubDocs\$projectDocsPath"
    }
}
