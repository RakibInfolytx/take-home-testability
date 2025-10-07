export const CONFIG = {
  BASE_URL: __ENV.BASE_URL || 'https://api.polanji.com',
  WEBSITE_URL: __ENV.WEBSITE_URL || 'https://www.polanji.com',
  USER_EMAIL: __ENV.USER_EMAIL || 'performancetest03@gmail.com',
  USER_PASSWORD: __ENV.USER_PASSWORD || 'user123456',
  DB_HOST: __ENV.DB_HOST || '206.189.138.9',
  DB_NAME: __ENV.DB_NAME || 'smart_learning',
  DB_USER: __ENV.DB_USER || 'postgres',
  DB_PASSWORD: __ENV.DB_PASSWORD || '5wyil5uYsr1W',
  VUS: parseInt(__ENV.VUS) || 10,
  DURATION: __ENV.DURATION || '2m',
  LOAD_TEST_VUS: parseInt(__ENV.LOAD_TEST_VUS) || 10,
  STRESS_TEST_VUS: parseInt(__ENV.STRESS_TEST_VUS) || 20,
  SOAK_TEST_VUS: parseInt(__ENV.SOAK_TEST_VUS) || 5,
  SPIKE_TEST_VUS: parseInt(__ENV.SPIKE_TEST_VUS) || 15,
  HTTP_REQ_DURATION_P95: parseInt(__ENV.HTTP_REQ_DURATION_P95) || 2000,
  HTTP_REQ_FAILED_RATE: parseFloat(__ENV.HTTP_REQ_FAILED_RATE) || 0.05,
};

export function getTestOptions(testType) {
  const baseThresholds = {
    'http_req_duration': [`p(95)<${CONFIG.HTTP_REQ_DURATION_P95}`],
    'http_req_failed': [`rate<${CONFIG.HTTP_REQ_FAILED_RATE}`],
  };

  switch (testType) {
    case 'load':
      return {
        stages: [
          { duration: '30s', target: CONFIG.LOAD_TEST_VUS },
          { duration: '1m', target: CONFIG.LOAD_TEST_VUS },
          { duration: '30s', target: 0 },
        ],
        thresholds: baseThresholds,
      };
    
    case 'stress':
      return {
        stages: [
          { duration: '30s', target: 5 },
          { duration: '30s', target: CONFIG.STRESS_TEST_VUS },
          { duration: '1m', target: CONFIG.STRESS_TEST_VUS },
          { duration: '30s', target: 0 },
        ],
        thresholds: baseThresholds,
      };
    
    case 'soak':
      return {
        stages: [
          { duration: '30s', target: CONFIG.SOAK_TEST_VUS },
          { duration: '2m', target: CONFIG.SOAK_TEST_VUS },
          { duration: '30s', target: 0 },
        ],
        thresholds: baseThresholds,
      };
    
    case 'spike':
      return {
        stages: [
          { duration: '10s', target: 2 },
          { duration: '10s', target: CONFIG.SPIKE_TEST_VUS },
          { duration: '1m', target: CONFIG.SPIKE_TEST_VUS },
          { duration: '10s', target: 2 },
          { duration: '10s', target: 0 },
        ],
        thresholds: baseThresholds,
      };
    
    default:
      return {
        vus: CONFIG.VUS,
        duration: CONFIG.DURATION,
        thresholds: baseThresholds,
      };
  }
}

export default CONFIG;

