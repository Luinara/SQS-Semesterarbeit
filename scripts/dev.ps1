#requires -Version 5.1
param(
    [switch]$SkipInstall,
    [switch]$SkipBackendBuild,
    [switch]$OpenBrowser,
    [switch]$CheckOnly
)

$ErrorActionPreference = "Stop"

$RootDir = Resolve-Path (Join-Path $PSScriptRoot "..")
$FrontendDir = Join-Path $RootDir "frontend"

function Assert-Command {
    param([Parameter(Mandatory = $true)][string]$Name)

    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Required command '$Name' was not found. Please install it and run this script again."
    }
}

function Wait-Http {
    param(
        [Parameter(Mandatory = $true)][string]$Url,
        [Parameter(Mandatory = $true)][string]$Name,
        [int]$TimeoutSeconds = 120
    )

    $Deadline = (Get-Date).AddSeconds($TimeoutSeconds)

    do {
        try {
            $Response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
            if ($Response.StatusCode -lt 500) {
                Write-Host "OK  $Name is reachable at $Url"
                return
            }
        } catch {
            Start-Sleep -Seconds 2
        }
    } while ((Get-Date) -lt $Deadline)

    throw "$Name did not become reachable at $Url within $TimeoutSeconds seconds."
}

function Test-LocalPortAvailable {
    param([Parameter(Mandatory = $true)][int]$Port)

    $Listener = $null

    try {
        $Listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
        $Listener.Start()
        return $true
    } catch {
        return $false
    } finally {
        if ($Listener) {
            $Listener.Stop()
        }
    }
}

function Install-FrontendDependenciesIfNeeded {
    if ($SkipInstall) {
        return
    }

    $NodeModulesDir = Join-Path $FrontendDir "node_modules"
    $InstalledLock = Join-Path $NodeModulesDir ".package-lock.json"
    $ProjectLock = Join-Path $FrontendDir "package-lock.json"

    if (-not (Test-Path $NodeModulesDir)) {
        Write-Host "Installing frontend dependencies with npm ci..."
        npm.cmd ci
        return
    }

    if (
        -not (Test-Path $InstalledLock) -or
        ((Get-Item $ProjectLock).LastWriteTimeUtc -gt (Get-Item $InstalledLock).LastWriteTimeUtc)
    ) {
        Write-Host "Refreshing frontend dependencies..."
        npm.cmd install
    }
}

Write-Host ""
Write-Host "PokeHabit Dev Start"
Write-Host "==================="
Write-Host "Frontend: http://localhost:4200"
Write-Host "Backend:  http://localhost:8181"
Write-Host "Postgres: localhost:5433"
Write-Host ""

Assert-Command "docker"
Assert-Command "npm.cmd"
Assert-Command "node"

if (-not (Test-LocalPortAvailable -Port 4200)) {
    throw "Port 4200 is already in use. Stop the existing frontend server or free the port before running this script."
}

if ($CheckOnly) {
    Write-Host "Dev command check passed."
    return
}

Set-Location $RootDir

$ComposeArgs = @("compose", "up", "-d")
if (-not $SkipBackendBuild) {
    $ComposeArgs += "--build"
}
$ComposeArgs += @("db", "backend")

Write-Host "Starting database and backend via Docker Compose..."
& docker @ComposeArgs

Wait-Http -Url "http://localhost:8181/api/tasks" -Name "Backend"

Set-Location $FrontendDir

Install-FrontendDependenciesIfNeeded

if ($OpenBrowser) {
    Start-Process "http://localhost:4200"
}

Write-Host ""
Write-Host "Starting Angular dev server. Press Ctrl+C to stop the frontend."
Write-Host "Docker services keep running in the background. Stop them with: docker compose stop backend db"
Write-Host ""

npm.cmd start -- --host 127.0.0.1 --port 4200
