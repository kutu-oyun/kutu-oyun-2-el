# Shared helpers for docs-pull / docs-push

function Expand-ConfigPath {
    param([string]$Path)
    return [Environment]::ExpandEnvironmentVariables($Path)
}

function Get-ProjectRoot {
    $root = git rev-parse --show-toplevel 2>$null
    if (-not $root) {
        throw "Git repo bulunamadi. Proje kok dizininde calistirin."
    }
    return $root.Trim()
}

function Get-RemoteSlug {
    param([string]$ProjectRoot)
    Push-Location $ProjectRoot
    try {
        $url = git remote get-url origin 2>$null
        if (-not $url) { return $null }
        if ($url -match '[:/]([^/]+)/([^/.]+?)(?:\.git)?$') {
            return "$($Matches[1])/$($Matches[2])"
        }
        return $null
    }
    finally {
        Pop-Location
    }
}

function Get-HubConfig {
    param([string]$ProjectRoot)
    $configPath = Join-Path $ProjectRoot "docs\docs-hub.config.json"
    if (-not (Test-Path $configPath)) {
        throw "docs/docs-hub.config.json bulunamadi: $configPath"
    }
    return Get-Content $configPath -Raw | ConvertFrom-Json
}

function Resolve-ProjectInfo {
    param(
        [string]$ProjectRoot,
        [string]$ProjectKey
    )
    $config = Get-HubConfig -ProjectRoot $ProjectRoot
    $slug = Get-RemoteSlug -ProjectRoot $ProjectRoot

    if ($ProjectKey) {
        foreach ($prop in $config.projects.PSObject.Properties) {
            if ($prop.Value.key -eq $ProjectKey) {
                return [PSCustomObject]@{
                    Config = $config
                    Slug = $prop.Name
                    Key = $prop.Value.key
                    ProjectDocsPath = $prop.Value.projectDocsPath
                    Visibility = $prop.Value.visibility
                }
            }
        }
        throw "Bilinmeyen proje anahtari: $ProjectKey"
    }

    if (-not $slug -or -not $config.projects.$slug) {
        throw "Git remote ($slug) docs-hub.config.json icinde tanimli degil."
    }

    $entry = $config.projects.$slug
    return [PSCustomObject]@{
        Config = $config
        Slug = $slug
        Key = $entry.key
        ProjectDocsPath = $entry.projectDocsPath
        Visibility = $entry.visibility
    }
}

function Ensure-HubCache {
    param(
        [object]$Config
    )
    $cache = Expand-ConfigPath $Config.cachePath
    if (-not (Test-Path $cache)) {
        New-Item -ItemType Directory -Path $cache -Force | Out-Null
        Write-Host "Hub cache olusturuluyor: $cache"
        git clone $Config.centralRepo $cache
        if ($LASTEXITCODE -ne 0) {
            throw "Central repo clone basarisiz. Once Hasan-Vural/website-logic olusturun veya centralRepo URL kontrol edin."
        }
    }
    else {
        Push-Location $cache
        try {
            git pull --ff-only 2>&1 | Out-Null
            if ($LASTEXITCODE -ne 0) {
                Write-Warning "git pull basarisiz; mevcut cache kullaniliyor."
            }
        }
        finally {
            Pop-Location
        }
    }
    return $cache
}

function Copy-Tree {
    param(
        [string]$Source,
        [string]$Destination
    )
    if (-not (Test-Path $Source)) { return }
    New-Item -ItemType Directory -Path $Destination -Force | Out-Null
    Copy-Item -Path (Join-Path $Source "*") -Destination $Destination -Recurse -Force
}

function Install-HubBootstrap {
    param(
        [string]$ProjectRoot,
        [string]$HubRoot
    )
    $hubDocs = Join-Path $HubRoot "docs"
    if (-not (Test-Path $hubDocs)) { $hubDocs = $HubRoot }

    # Cursor kurallari: docs/cursor-rules/ -> .cursor/rules/
    $cursorSrc = Join-Path $hubDocs "cursor-rules"
    if (Test-Path $cursorSrc) {
        $cursorDst = Join-Path $ProjectRoot ".cursor\rules"
        New-Item -ItemType Directory -Path $cursorDst -Force | Out-Null
        Copy-Item -Path (Join-Path $cursorSrc "*.mdc") -Destination $cursorDst -Force
        Write-Host "  OK cursor-rules -> .cursor/rules/"
    }

    # Sync scriptleri: hub/scripts/ -> proje/scripts/
    $scriptsSrc = Join-Path $HubRoot "scripts"
    if (Test-Path $scriptsSrc) {
        $scriptsDst = Join-Path $ProjectRoot "scripts"
        New-Item -ItemType Directory -Path $scriptsDst -Force | Out-Null
        Copy-Item -Path (Join-Path $scriptsSrc "docs-*") -Destination $scriptsDst -Force
        Write-Host "  OK scripts/docs-*"
    }
}
