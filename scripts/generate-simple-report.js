const fs = require('fs');
const path = require('path');

function generateHTMLReport(jsonFile, outputFile) {
  try {
    // Read and parse NDJSON format
    const content = fs.readFileSync(jsonFile, 'utf8');
    const lines = content.trim().split('\n');
    
    // Parse the summary data (last line should contain the summary)
    let summaryData = null;
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const parsed = JSON.parse(lines[i]);
        if (parsed.metrics && parsed.state) {
          summaryData = parsed;
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!summaryData) {
      throw new Error('Could not find summary data in JSON file');
    }
    
    const data = summaryData;
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>k6 Performance Test Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .metric-card {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
        }
        .metric-card h3 {
            margin: 0 0 10px 0;
            color: #495057;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .metric-card .value {
            font-size: 2em;
            font-weight: bold;
            color: #007bff;
        }
        .metric-card .unit {
            font-size: 0.8em;
            color: #6c757d;
            margin-left: 5px;
        }
        .section {
            margin-bottom: 30px;
        }
        .section h2 {
            color: #343a40;
            border-bottom: 2px solid #007bff;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .thresholds {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            border-radius: 8px;
            padding: 20px;
        }
        .thresholds h3 {
            margin: 0 0 15px 0;
            color: #155724;
        }
        .threshold-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #c3e6cb;
        }
        .threshold-item:last-child {
            border-bottom: none;
        }
        .threshold-name {
            font-weight: 500;
        }
        .threshold-status {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: bold;
        }
        .threshold-pass {
            background: #d4edda;
            color: #155724;
        }
        .threshold-fail {
            background: #f8d7da;
            color: #721c24;
        }
        .summary-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .summary-table th,
        .summary-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #dee2e6;
        }
        .summary-table th {
            background: #f8f9fa;
            font-weight: 600;
            color: #495057;
        }
        .summary-table tr:hover {
            background: #f8f9fa;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            border-top: 1px solid #dee2e6;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>k6 Performance Test Report</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="content">
            <div class="metrics-grid">
                <div class="metric-card">
                    <h3>Total Requests</h3>
                    <div class="value">${data.metrics.http_reqs.values.count.toLocaleString()}</div>
                </div>
                <div class="metric-card">
                    <h3>Failed Requests</h3>
                    <div class="value">${data.metrics.http_req_failed.values.fails}</div>
                </div>
                <div class="metric-card">
                    <h3>Success Rate</h3>
                    <div class="value">${((1 - data.metrics.http_req_failed.values.rate) * 100).toFixed(2)}<span class="unit">%</span></div>
                </div>
                <div class="metric-card">
                    <h3>Avg Response Time</h3>
                    <div class="value">${data.metrics.http_req_duration.values.avg.toFixed(2)}<span class="unit">ms</span></div>
                </div>
                <div class="metric-card">
                    <h3>P95 Response Time</h3>
                    <div class="value">${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}<span class="unit">ms</span></div>
                </div>
                <div class="metric-card">
                    <h3>Max Response Time</h3>
                    <div class="value">${data.metrics.http_req_duration.values.max.toFixed(2)}<span class="unit">ms</span></div>
                </div>
                <div class="metric-card">
                    <h3>Virtual Users</h3>
                    <div class="value">${data.metrics.vus_max.values.max}</div>
                </div>
                <div class="metric-card">
                    <h3>Test Duration</h3>
                    <div class="value">${(data.state.testRunDurationMs / 1000).toFixed(1)}<span class="unit">s</span></div>
                </div>
            </div>

            <div class="section">
                <h2>Performance Thresholds</h2>
                <div class="thresholds">
                    <h3>Threshold Results</h3>
                    ${Object.entries(data.metrics.http_req_duration.thresholds || {})
                      .map(([key, result]) => `
                        <div class="threshold-item">
                            <span class="threshold-name">${key}</span>
                            <span class="threshold-status ${result.ok ? 'threshold-pass' : 'threshold-fail'}">
                                ${result.ok ? 'PASS' : 'FAIL'}
                            </span>
                        </div>
                      `).join('')}
                    ${Object.entries(data.metrics.http_req_failed.thresholds || {})
                      .map(([key, result]) => `
                        <div class="threshold-item">
                            <span class="threshold-name">${key}</span>
                            <span class="threshold-status ${result.ok ? 'threshold-pass' : 'threshold-fail'}">
                                ${result.ok ? 'PASS' : 'FAIL'}
                            </span>
                        </div>
                      `).join('')}
                </div>
            </div>

            <div class="section">
                <h2>Detailed Metrics</h2>
                <table class="summary-table">
                    <thead>
                        <tr>
                            <th>Metric</th>
                            <th>Value</th>
                            <th>Unit</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Total Iterations</td>
                            <td>${data.metrics.iterations.values.count}</td>
                            <td>iterations</td>
                        </tr>
                        <tr>
                            <td>Data Sent</td>
                            <td>${(data.metrics.data_sent.values.count / 1024).toFixed(2)}</td>
                            <td>KB</td>
                        </tr>
                        <tr>
                            <td>Data Received</td>
                            <td>${(data.metrics.data_received.values.count / 1024).toFixed(2)}</td>
                            <td>KB</td>
                        </tr>
                        <tr>
                            <td>Checks Passed</td>
                            <td>${data.metrics.checks.values.passes}</td>
                            <td>checks</td>
                        </tr>
                        <tr>
                            <td>Checks Failed</td>
                            <td>${data.metrics.checks.values.fails}</td>
                            <td>checks</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="footer">
            <p>Generated by k6 Performance Testing Framework</p>
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync(outputFile, html);
    console.log(`HTML report generated: ${outputFile}`);
    return true;
  } catch (error) {
    console.error(`Error generating HTML report: ${error.message}`);
    return false;
  }
}

// Command line usage
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('Usage: node generate-simple-report.js <input.json> <output.html>');
    process.exit(1);
  }
  
  const [inputFile, outputFile] = args;
  generateHTMLReport(inputFile, outputFile);
}

module.exports = { generateHTMLReport };
