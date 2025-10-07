#!/bin/bash

set -e

echo "========================================="
echo "Performance Testing Suite - Starting"
echo "========================================="

# Create results directory
mkdir -p results

if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "Environment variables loaded"
else
    echo "Warning: .env file not found, using defaults"
fi

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'
run_test() {
    local test_name=$1
    local test_file=$2
    
    echo ""
    echo -e "${BLUE}=========================================${NC}"
    echo -e "${BLUE}Running: $test_name${NC}"
    echo -e "${BLUE}=========================================${NC}"
    
    if k6 run "$test_file" --out json="results/${test_name}-raw.json"; then
        echo -e "${GREEN}$test_name completed successfully${NC}"
    else
        echo -e "${RED}$test_name failed${NC}"
    fi
}

echo ""
echo "========================================="
echo "PHASE 1: Individual Endpoint Tests"
echo "========================================="

run_test "login-endpoint" "tests/endpoints/login-test.js"
run_test "topics-endpoint" "tests/endpoints/topics-test.js"
run_test "courses-endpoint" "tests/endpoints/courses-test.js"
run_test "enroll-endpoint" "tests/endpoints/enroll-test.js"
run_test "quiz-complete-endpoint" "tests/endpoints/quiz-complete-test.js"
run_test "update-progress-endpoint" "tests/endpoints/update-progress-test.js"

echo ""
echo "========================================="
echo "PHASE 2: Load Testing Types"
echo "========================================="

run_test "load-test" "tests/load-test.js"
run_test "stress-test" "tests/stress-test.js"
run_test "soak-test" "tests/soak-test.js"
run_test "spike-test" "tests/spike-test.js"

echo ""
echo "========================================="
echo "PHASE 3: Workflow Tests"
echo "========================================="

run_test "course-completion-workflow" "tests/workflows/course-completion-workflow.js"

echo ""
echo "========================================="
echo "Generating Summary Report"
echo "========================================="

if command -v k6-html-report &> /dev/null; then
    echo "Generating HTML reports..."
    for json_file in results/*-raw.json; do
        if [ -f "$json_file" ]; then
            base_name=$(basename "$json_file" -raw.json)
            k6-html-report "$json_file" -o "results/${base_name}-report.html" || true
        fi
    done
    echo "HTML reports generated in results/ directory"
else
    echo "k6-html-report not installed. Skipping HTML report generation."
    echo "  Install with: npm install -g k6-html-reporter"
fi

echo ""
echo "========================================="
echo "All Tests Completed!"
echo "========================================="
echo "Results saved in: ./results/"
echo ""

