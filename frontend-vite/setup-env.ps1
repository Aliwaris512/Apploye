# PowerShell script to set up environment variables
$envContent = @"
# API Configuration
VITE_API_URL=http://localhost:9000

# App Configuration
VITE_APP_NAME="Activity Tracker"
VITE_APP_ENV=development
VITE_APP_VERSION=1.0.0
"@

$envPath = ".\.env"

# Check if .env file already exists
if (-not (Test-Path $envPath)) {
    try {
        # Create .env file with default values
        $envContent | Out-File -FilePath $envPath -Encoding utf8
        Write-Host "Created $envPath with default values" -ForegroundColor Green
    } catch {
        Write-Host "Error creating $envPath : $_" -ForegroundColor Red
    }
} else {
    Write-Host "$envPath already exists" -ForegroundColor Yellow
}

# Display the content of the .env file
Write-Host "`nCurrent .env content:" -ForegroundColor Cyan
Get-Content $envPath | ForEach-Object { Write-Host "  $_" }
