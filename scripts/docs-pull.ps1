# Merkezi website-logic reposundan bu projenin docs/ klasorune ceker.
# Kullanim: .\scripts\docs-pull.ps1
# Tetikleyici: "bismillah docsa bak, guncel basla"

param(
    [string]$Project
)

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\docs-hub-common.ps1"

$projectRoot = Get-ProjectRoot
$info = Resolve-ProjectInfo -ProjectRoot $projectRoot -ProjectKey $Project
$cache = Ensure-HubCache -Config $info.Config

$hubDocs = Join-Path $cache "docs"
if (-not (Test-Path $hubDocs)) {
    # Ilk kurulum: cache kokunde docs/ yoksa tum cache'i docs kabul et
    $hubDocs = $cache
}

$localDocs = Join-Path $projectRoot "docs"
New-Item -ItemType Directory -Path $localDocs -Force | Out-Null

Write-Host "Proje: $($info.Key) ($($info.Slug))"
Write-Host "Kaynak: $hubDocs"
Write-Host "Hedef:  $localDocs"

# Ortak dosyalar
$commonItems = @(
    "00-READ-FIRST.md",
    "projects-registry.md",
    "README.md",
    "docs-hub.config.json",
    "general",
    "public",
    "private",
    "stitch",
    "cursor-rules"
)

foreach ($item in $commonItems) {
    $src = Join-Path $hubDocs $item
    $dst = Join-Path $localDocs $item
    if (Test-Path $src) {
        if (Test-Path $src -PathType Container) {
            Copy-Tree -Source $src -Destination $dst
        }
        else {
            Copy-Item $src $dst -Force
        }
        Write-Host "  OK $item"
    }
}

$hubRoot = $cache
Install-HubBootstrap -ProjectRoot $projectRoot -HubRoot $hubRoot

Write-Host ""
Write-Host "Docs + cursor kurali guncellendi. Simdi docs/00-READ-FIRST.md oku."
