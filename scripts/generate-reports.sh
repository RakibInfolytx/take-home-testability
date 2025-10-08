#!/bin/bash

echo "=========================================="
echo "Generating HTML Reports"
echo "=========================================="

if [ ! -d "results" ]; then
    echo "Results directory not found"
    echo "Please run tests first to generate results"
    exit 1
fi

json_files=$(ls results/*-raw.json 2>/dev/null)

if [ -z "$json_files" ]; then
    echo "No raw JSON files found in results/ directory"
    echo "Please run tests first to generate results"
    exit 1
fi

report_count=0

for json_file in results/*-raw.json; do
    if [ -f "$json_file" ]; then
        base_name=$(basename "$json_file" -raw.json)
        output_file="results/${base_name}-report.html"
        
        echo "Generating: ${base_name}-report.html"
        
        if k6-to-html "$json_file" -o "$output_file" 2>/dev/null; then
            report_count=$((report_count + 1))
            echo "  Created successfully"
        else
            echo "  Failed to generate report"
        fi
    fi
done

echo ""
echo "=========================================="
echo "Report Generation Complete"
echo "=========================================="
echo "Generated $report_count HTML reports in results/ directory"
echo ""
echo "To view reports, open:"
echo "  results/*-report.html"
echo ""

