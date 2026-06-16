#requires -Version 5.1
param(
    [string[]]$City = @("Berlin", "Los Angeles", "Tokyo", "Jakarta", "Hawaii"),
    [switch]$RawJson
)

$ErrorActionPreference = "Stop"

$PopulatedPlaceFeatureCodes = @("PPL", "PPLA", "PPLA2", "PPLA3", "PPLA4", "PPLC", "PPLX")

function Assert-Curl {
    if (-not (Get-Command "curl.exe" -ErrorAction SilentlyContinue)) {
        throw "curl.exe was not found. On Windows 10/11 it is usually available by default."
    }
}

function Escape-UrlPart {
    param([Parameter(Mandatory = $true)][string]$Value)

    return [uri]::EscapeDataString($Value)
}

function Normalize-GeocodingText {
    param([string]$Value)

    if (-not $Value) {
        return ""
    }

    $normalized = $Value.ToLowerInvariant().Normalize([Text.NormalizationForm]::FormD)
    $builder = [Text.StringBuilder]::new()

    foreach ($char in $normalized.ToCharArray()) {
        if ([Globalization.CharUnicodeInfo]::GetUnicodeCategory($char) -ne [Globalization.UnicodeCategory]::NonSpacingMark) {
            [void]$builder.Append($char)
        }
    }

    return (($builder.ToString() -replace "[^a-z0-9]+", " ").Trim() -replace "\s+", " ")
}

function Compact-GeocodingText {
    param([string]$Value)

    return $Value -replace "\s+", ""
}

function Get-GeocodingScore {
    param(
        [Parameter(Mandatory = $true)]$Result,
        [Parameter(Mandatory = $true)][string]$SearchTerm,
        [Parameter(Mandatory = $true)][int]$Index
    )

    $normalizedSearchTerm = Normalize-GeocodingText $SearchTerm
    $compactSearchTerm = Compact-GeocodingText $normalizedSearchTerm
    $featureCode = if ($Result.feature_code) { $Result.feature_code.ToUpperInvariant() } else { "" }
    $isPopulatedPlace = $PopulatedPlaceFeatureCodes -contains $featureCode
    $normalizedName = Normalize-GeocodingText $Result.name
    $normalizedAdmin1 = Normalize-GeocodingText ([string]$Result.admin1)
    $compactName = Compact-GeocodingText $normalizedName
    $score = if ($isPopulatedPlace) { 1000.0 } else { -500.0 }

    if ($featureCode -eq "PPLC") {
        $score += 900
    } elseif ($featureCode.StartsWith("PPLA")) {
        $score += 300
    }

    if ($normalizedName -eq $normalizedSearchTerm) {
        $score += if ($isPopulatedPlace) { 700 } else { 80 }
    } elseif ($compactName.StartsWith($compactSearchTerm)) {
        $score += 180
    } elseif ($compactName.Contains($compactSearchTerm)) {
        $score += 90
    }

    if ($normalizedAdmin1 -eq $normalizedSearchTerm) {
        $score += 650
    }

    if ($null -ne $Result.elevation) {
        $score += [Math]::Max(0, 1000 - [double]$Result.elevation) / 10
    }

    if ($null -ne $Result.population) {
        $score += [Math]::Min([double]$Result.population, 10000000) / 10000
    }

    return $score - $Index
}

function Get-LocationLabel {
    param([Parameter(Mandatory = $true)]$Result)

    $parts = @($Result.name, $Result.admin1, $Result.country) |
        Where-Object { $_ } |
        ForEach-Object { [string]$_ }

    return $parts -join ", "
}

function Invoke-CurlText {
    param([Parameter(Mandatory = $true)][string]$Url)

    $json = & curl.exe -s $Url

    if ($LASTEXITCODE -ne 0) {
        throw "curl.exe failed with exit code $LASTEXITCODE for $Url"
    }

    return $json
}

Assert-Curl

foreach ($cityName in $City) {
    $geocodingUrl = "https://geocoding-api.open-meteo.com/v1/search?name=$(Escape-UrlPart $cityName)&count=10&language=de&format=json"

    Write-Host ""
    Write-Host "============================================================"
    Write-Host "City: $cityName"

    $geocodingRawJson = Invoke-CurlText $geocodingUrl
    $geocoding = $geocodingRawJson | ConvertFrom-Json
    $results = @($geocoding.results)

    if ($results.Count -eq 0) {
        Write-Host "No geocoding results found."
        continue
    }

    $candidateRows = @(
        for ($index = 0; $index -lt $results.Count; $index++) {
            $result = $results[$index]
            [pscustomobject]@{
                Rank = $index + 1
                AppScore = [Math]::Round((Get-GeocodingScore -Result $result -SearchTerm $cityName -Index $index), 2)
                Label = Get-LocationLabel $result
                Feature = $result.feature_code
                ElevationM = $result.elevation
                Population = $result.population
                Latitude = $result.latitude
                Longitude = $result.longitude
            }
        }
    )
    $rankedResults = @($candidateRows | Sort-Object AppScore -Descending)

    $selected = $rankedResults[0]
    $weatherUrl = "https://api.open-meteo.com/v1/forecast?latitude=$($selected.Latitude)&longitude=$($selected.Longitude)&current=temperature_2m,weather_code,is_day&elevation=nan&timezone=auto"

    Write-Host "Selected location: $($selected.Label)"
    Write-Host "Coordinates: $($selected.Latitude), $($selected.Longitude)"

    Write-Host "Forecast curl:"
    Write-Host "curl.exe -s `"$weatherUrl`""

    $weatherRawJson = Invoke-CurlText $weatherUrl

    if ($RawJson) {
        Write-Host "Forecast JSON with temperature:"
        Write-Host $weatherRawJson
    }

    $weather = $weatherRawJson | ConvertFrom-Json
    $current = $weather.current

    Write-Host "Temperature result:"
    [pscustomobject]@{
        Location = $selected.Label
        TemperatureC = $current.temperature_2m
        WeatherCode = $current.weather_code
        IsDay = $current.is_day
        LocalTime = $current.time
        ElevationMode = "nan / grid-cell average"
    } | Format-List
}
