Write-Host "=========================================" -ForegroundColor Blue
Write-Host "Performance Testing Suite - Starting" -ForegroundColor Blue
Write-Host "=========================================" -ForegroundColor Blue

New-Item -ItemType Directory -Force -Path "results" | Out-Null
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
    Write-Host "Environment variables loaded" -ForegroundColor Green
} else {
    Write-Host "Warning: .env file not found, using defaults" -ForegroundColor Yellow
}

function Run-Test {
    param(
        [string]$TestName,
        [string]$TestFile
    )
    
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Blue
    Write-Host "Running: $TestName" -ForegroundColor Blue
    Write-Host "=========================================" -ForegroundColor Blue
    
    try {
        k6 run $TestFile --out "json=results/${TestName}-raw.json"
        Write-Host "Test $TestName completed successfully" -ForegroundColor Green
    } catch {
        Write-Host "Test $TestName failed" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "PHASE 1: Individual Endpoint Tests" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

Run-Test "login-endpoint" "tests/endpoints/login-test.js"
Run-Test "topics-endpoint" "tests/endpoints/topics-test.js"
Run-Test "courses-endpoint" "tests/endpoints/courses-test.js"
Run-Test "enroll-endpoint" "tests/endpoints/enroll-test.js"
Run-Test "quiz-complete-endpoint" "tests/endpoints/quiz-complete-test.js"
Run-Test "update-progress-endpoint" "tests/endpoints/update-progress-test.js"

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "PHASE 2: Load Testing Types" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

Run-Test "load-test" "tests/load-test.js"
Run-Test "stress-test" "tests/stress-test.js"
Run-Test "soak-test" "tests/soak-test.js"
Run-Test "spike-test" "tests/spike-test.js"

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "PHASE 3: Workflow Tests" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

Run-Test "course-completion-workflow" "tests/workflows/course-completion-workflow.js"

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "All Tests Completed!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host "Results saved in: .\results\" -ForegroundColor Cyan
Write-Host ""

