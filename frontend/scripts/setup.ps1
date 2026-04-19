# Dieses Skript buendelt den lokalen Frontend-Setup fuer PowerShell.
# Gerade auf Windows wird dadurch ein reproduzierbarer Start ohne manuelle Einzelschritte einfacher.
$ErrorActionPreference = 'Stop'

$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendDirectory = Split-Path -Parent $scriptDirectory

function Invoke-NpmStep {
  param(
    [Parameter(Mandatory = $true)]
    [string] $Label,

    [Parameter(Mandatory = $true)]
    [string[]] $Arguments
  )

  Write-Host "==> $Label"

  $process = Start-Process -FilePath 'npm.cmd' -ArgumentList $Arguments -Wait -NoNewWindow -PassThru

  if ($process.ExitCode -ne 0) {
    throw "npm.cmd $($Arguments -join ' ') ist mit Exit-Code $($process.ExitCode) fehlgeschlagen."
  }
}

Write-Host '==> Wechsle in das Frontend-Verzeichnis...'
Set-Location $frontendDirectory

Invoke-NpmStep -Label 'Installiere npm-Abhaengigkeiten...' -Arguments @('install')
Invoke-NpmStep -Label 'Pruefe TypeScript-Typen...' -Arguments @('run', 'type-check')
Invoke-NpmStep -Label 'Erzeuge einen Produktions-Build zur Verifikation...' -Arguments @('run', 'build')

Write-Host '==> Frontend-Setup abgeschlossen.'
Write-Host '==> Starte die App anschliessend mit: npm start'
