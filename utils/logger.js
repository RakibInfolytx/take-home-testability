import { group } from 'k6';

export function logSuccess(endpoint, status, duration) {
  console.log(`[SUCCESS] ${endpoint} - Status: ${status} - Duration: ${duration.toFixed(2)}ms`);
}

export function logError(endpoint, status, body) {
  console.error(`[ERROR] ${endpoint} - Status: ${status} - Error: ${body.substring(0, 200)}`);
}

export function logInfo(message) {
  console.log(`[INFO] ${message}`);
}

export function logWarning(message) {
  console.warn(`[WARNING] ${message}`);
}

export function formatSummary(data) {
  return `
========================================
Performance Test Summary
========================================
Total Requests: ${data.http_reqs.count}
Failed Requests: ${data.http_req_failed.fails}
Success Rate: ${(100 - (data.http_req_failed.fails / data.http_reqs.count * 100)).toFixed(2)}%
Avg Response Time: ${data.http_req_duration.avg.toFixed(2)}ms
P95 Response Time: ${data.http_req_duration['p(95)'].toFixed(2)}ms
P99 Response Time: ${data.http_req_duration['p(99)'].toFixed(2)}ms
Min Response Time: ${data.http_req_duration.min.toFixed(2)}ms
Max Response Time: ${data.http_req_duration.max.toFixed(2)}ms
========================================
`;
}

export default {
  logSuccess,
  logError,
  logInfo,
  logWarning,
  formatSummary,
};

