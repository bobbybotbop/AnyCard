# PowerShell script to encode Firebase service account JSON to base64
# Usage: .\encode-firebase.ps1 [path-to-service-account.json]

param(
    [Parameter(Mandatory=$false)]
    [string]$JsonPath = "backend\secrets\ACFire.json"
)

if (-not (Test-Path $JsonPath)) {
    Write-Host "Error: File not found: $JsonPath" -ForegroundColor Red
    Write-Host "Usage: .\encode-firebase.ps1 [path-to-service-account.json]" -ForegroundColor Yellow
    exit 1
}

Write-Host "Reading Firebase service account JSON from: $JsonPath" -ForegroundColor Cyan

try {
    # Read the JSON file
    $jsonContent = Get-Content -Path $JsonPath -Raw -Encoding UTF8
    
    # Convert to base64
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonContent)
    $base64 = [Convert]::ToBase64String($bytes)
    
    Write-Host "`nBase64 encoded value:" -ForegroundColor Green
    Write-Host $base64 -ForegroundColor White
    
    Write-Host "`nCopy the above value and paste it into your .env.docker file as:" -ForegroundColor Yellow
    Write-Host "FIREBASE_SERVICE_ACCOUNT=$base64" -ForegroundColor White
    
} catch {
    Write-Host "Error encoding file: $_" -ForegroundColor Red
    exit 1
}

