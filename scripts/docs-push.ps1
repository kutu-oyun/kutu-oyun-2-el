# Bu projenin docs degisikliklerini merkezi website-logic reposuna push eder.
# Kullanim: .\scripts\docs-push.ps1 -Message "VPS deploy notu"
# Tetikleyici: "elhamdulillah"

param(
    [Parameter(Mandatory = $true)]
    [string]$Message,
    [string]$Project
)

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\docs-hub-common.ps1"

$projectRoot = Get-ProjectRoot
$info = Resolve-ProjectInfo -ProjectRoot $projectRoot -ProjectKey $Project
$cache = Ensure-HubCache -Config $info.Config

$hubDocs = Join-Path $cache "docs"
if (-not (Test-Path $hubDocs)) {
    New-Item -ItemType Directory -Path $hubDocs -Force | Out-Null
}

$localDocs = Join-Path $projectRoot "docs"

Write-Host "Proje: $($info.Key)"
Write-Host "Hub:   $hubDocs"

# general + kok dosyalar + bu projenin klasoru
$commonItems = @(
    "00-READ-FIRST.md",
    "projects-registry.md",
    "README.md",
    "docs-hub.config.json",
    "general"
)

foreach ($item in $commonItems) {
    $src = Join-Path $localDocs $item
    $dst = Join-Path $hubDocs $item
    if (Test-Path $src) {
        if (Test-Path $src -PathType Container) {
            Copy-Tree -Source $src -Destination $dst
        }
        else {
            $parent = Split-Path $dst -Parent
            New-Item -ItemType Directory -Path $parent -Force | Out-Null
            Copy-Item $src $dst -Force
        }
        Write-Host "  -> $item"
    }
}

# Proje ozel klasor
$projectSrc = Join-Path $localDocs $info.ProjectDocsPath
$projectDst = Join-Path $hubDocs $info.ProjectDocsPath
if (Test-Path $projectSrc) {
    Copy-Tree -Source $projectSrc -Destination $projectDst
    Write-Host "  -> $($info.ProjectDocsPath)"
}

# Private repolarda private/ tamamini da gonderebilir; public repoda sadece kendi klasoru gitti
if ($info.Visibility -eq "private") {
    $privateRoot = Join-Path $localDocs "private"
    $privateDst = Join-Path $hubDocs "private"
    if (Test-Path $privateRoot) {
        Copy-Tree -Source $privateRoot -Destination $privateDst
        Write-Host "  -> private/ (private repo)"
    }
}

Push-Location $cache
try {
    git add -A
    $status = git status --porcelain
    if (-not $status) {
        Write-Host "Hub'da degisiklik yok."
        return
    }
    git commit -m "$Message ($($info.Key))"
    git push
    if ($LASTEXITCODE -ne 0) {
        throw "git push basarisiz."
    }
    Write-Host "Hub guncellendi: $($info.Config.centralRepo)"
}
finally {
    Pop-Location
}
