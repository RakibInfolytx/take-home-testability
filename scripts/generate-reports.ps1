Write-Host "==========================================" -ForegroundColor Blue
Write-Host "Generating HTML Reports" -ForegroundColor Blue
Write-Host "==========================================" -ForegroundColor Blue

$jsonFiles = Get-ChildItem -Path "results" -Filter "*-raw.json" -ErrorAction SilentlyContinue

if ($jsonFiles.Count -eq 0) {
    Write-Host "No raw JSON files found in results/ directory" -ForegroundColor Yellow
    Write-Host "Please run tests first to generate results" -ForegroundColor Yellow
    exit 1
}

$reportCount = 0

foreach ($file in $jsonFiles) {
    $baseName = $file.BaseName -replace "-raw", ""
    $outputFile = "results\$baseName-report.html"
    
    Write-Host "Generating: $baseName-report.html" -ForegroundColor Cyan
    
    $generated = $false
    
    # Try our custom HTML generator first
    try {
        $summaryFile = $file.FullName -replace "-raw\.json$", "-summary.json"
        if (Test-Path $summaryFile) {
            node scripts/generate-simple-report.js $summaryFile $outputFile
            $generated = $true
        }
    } catch {
        Write-Host "  Custom generator failed, trying alternatives..." -ForegroundColor Yellow
    }

    if (-not $generated) {
        try {
            if (Get-Command k6-html-report -ErrorAction SilentlyContinue) {
                k6-html-report $file.FullName -o $outputFile
                $generated = $true
            }
        } catch {}

        if (-not $generated) {
            Write-Host "  k6-html-report not found. Trying npx..." -ForegroundColor Yellow
            try {
                npx --yes k6-html-reporter $file.FullName -o $outputFile
                $generated = $true
            } catch {}
        }
    }

    if ($generated) {
        $reportCount++
        Write-Host "  Created successfully" -ForegroundColor Green
    } else {
        Write-Host "  Failed to generate report. Install one of:" -ForegroundColor Red
        Write-Host "    npm install -g k6-html-reporter" -ForegroundColor Red
        Write-Host "    or use npx: npx k6-html-reporter <input> -o <output>" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "Report Generation Complete" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host "Generated $reportCount HTML reports in results/ directory" -ForegroundColor Cyan
Write-Host ""
Write-Host "To view reports, open:" -ForegroundColor Cyan
Write-Host "  results\*-report.html" -ForegroundColor White
Write-Host ""
