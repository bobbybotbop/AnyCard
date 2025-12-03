# PowerShell script to run the Docker container with environment variables
# Usage: .\docker-run.ps1

$envFile = ".env.docker"

# Check if .env.docker file exists
if (-not (Test-Path $envFile)) {
    Write-Host "Creating .env.docker file template..." -ForegroundColor Yellow
    @"
# Environment variables for Docker testing
# Fill in your actual values below

# Firebase Service Account (base64 encoded JSON)
# To encode: Get your Firebase service account JSON file, then run:
# Get-Content path\to\your-service-account.json | Out-String | ConvertTo-Base64
FIREBASE_SERVICE_ACCOUNT=your-base64-encoded-service-account-json-here

# Serper API Key
SERPER_API_KEY=your-serper-api-key-here

# OpenRouter API Key
OPENROUTER_API_KEY=your-openrouter-api-key-here

# Backend URL
BACKENDURL=http://localhost:8080

# Port (optional - defaults to 8080)
PORT=8080
"@ | Out-File -FilePath $envFile -Encoding utf8
    Write-Host "Created $envFile - please fill in your values and run this script again." -ForegroundColor Green
    exit
}

# Read environment variables from .env.docker file
$envVars = @{}
$currentKey = $null
$currentValue = @()

Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    
    # Skip empty lines and comments
    if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith('#')) {
        return
    }
    
    # Check if this is a new key-value pair
    if ($line -match '^([^=]+)=(.*)$') {
        # Save previous key-value if exists
        if ($currentKey) {
            $envVars[$currentKey] = ($currentValue -join '').Trim()
        }
        
        $currentKey = $matches[1].Trim()
        $valuePart = $matches[2].Trim()
        
        # Skip placeholder values
        if ($valuePart -eq "your-base64-encoded-service-account-json-here" -or $valuePart -match "^your-.*-here$") {
            $currentKey = $null
            $currentValue = @()
            return
        }
        
        $currentValue = @($valuePart)
    } else {
        # Continuation of previous value (for multi-line base64)
        if ($currentKey) {
            $currentValue += $line
        }
    }
}

# Save last key-value pair
if ($currentKey) {
    $envVars[$currentKey] = ($currentValue -join '').Trim()
}

# Build docker run command with environment variables
$dockerArgs = @("run", "-p", "8080:8080")

foreach ($key in $envVars.Keys) {
    $dockerArgs += "-e"
    $dockerArgs += "$key=$($envVars[$key])"
}

$dockerArgs += "anycard-backend:test"

Write-Host "Running Docker container with environment variables from $envFile..." -ForegroundColor Cyan
docker $dockerArgs

