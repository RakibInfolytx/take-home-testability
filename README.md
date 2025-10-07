# k6 Performance Testing Framework

## Overview

A modular and scalable performance testing framework built with k6 for testing REST APIs. Supports load, stress, soak, and spike testing with workflow-based scenarios.

## Endpoints Tested

- `/log_in` - User authentication
- `/topics` - Fetch topics
- `/courses` - Fetch all courses
- `/enroll` - Enroll user in a course
- `/courses/{course_id}/sections/{section_index}/quiz-complete` - Mark quiz as complete
- `/courses/update_progress` - Update course progress

## Features

- Modular architecture with reusable code
- Multiple test types: Load, Stress, Soak, Spike
- Workflow testing for user journeys
- Environment variables (no hardcoded credentials)
- Scalable design for 1000+ APIs
- Docker support
- CI/CD integration with GitHub Actions
- JSON and HTML reporting

## Prerequisites

- k6 (latest version)
- Docker & Docker Compose (optional)
- Node.js & npm (optional)

## Installation

### Local Setup

1. Clone the repository
```bash
git clone https://github.com/RakibInfolytx/take-home-testability.git
cd take-home-testability
```

2. Install k6
```bash
# Windows
choco install k6

# macOS
brew install k6

# Linux
# See https://k6.io/docs/getting-started/installation/
```

3. Create results directory
```bash
mkdir results
```

### Docker Setup

```bash
docker build -t k6-performance-tests .
```

## Configuration

All credentials are pre-configured in `config/config.js`. No setup needed to start testing.

To customize, create a `.env` file:

```env
BASE_URL=https://api.polanji.com
USER_EMAIL=performancetest03@gmail.com
USER_PASSWORD=user123456
VUS=10
DURATION=2m
```

## Running Tests

### Quick Start

```bash
# Test single endpoint
k6 run tests/endpoints/login-test.js

# Run load test
k6 run tests/load-test.js

# Run all tests
.\scripts\run-all-tests.ps1           # Windows
bash scripts/run-all-tests.sh         # Linux/Mac
```

### Individual Tests

```bash
# Endpoint tests
k6 run tests/endpoints/login-test.js
k6 run tests/endpoints/topics-test.js
k6 run tests/endpoints/courses-test.js
k6 run tests/endpoints/enroll-test.js
k6 run tests/endpoints/quiz-complete-test.js
k6 run tests/endpoints/update-progress-test.js

# Performance tests
k6 run tests/load-test.js
k6 run tests/stress-test.js
k6 run tests/soak-test.js
k6 run tests/spike-test.js

# Workflow
k6 run tests/workflows/course-completion-workflow.js
```

### Custom Parameters

```bash
k6 run tests/load-test.js --vus 20 --duration 5m
k6 run tests/load-test.js --out json=results/test.json
```

## Test Types

### Load Test
Tests normal load conditions (10 VUs, 2 minutes)

### Stress Test
Tests beyond capacity (20 VUs, 2.5 minutes)

### Soak Test
Tests extended duration (5 VUs, 3 minutes)

### Spike Test
Tests sudden traffic surge (15 VUs, 1.5 minutes)

## Workflow

Complete user journey: Login → Browse → Enroll → Progress → Complete quizzes → Mark complete

## Docker Support

```bash
# Build
docker build -t k6-performance-tests .

# Run
docker-compose up

# With monitoring (Grafana on port 3000)
docker-compose --profile monitoring up
```

## CI/CD

GitHub Actions pipeline runs automatically on push to main/develop branches.

Setup:
1. Push code to GitHub
2. Add secrets (optional): BASE_URL, USER_EMAIL, USER_PASSWORD
3. Pipeline runs tests in parallel
4. Results stored as artifacts

## Viewing Results

Results are displayed in the terminal and saved to `results/` directory as JSON files.

### Generate HTML Reports

```bash
npm install -g k6-to-html
k6-to-html results/load-test-raw.json -o results/report.html
```

### Grafana Dashboard

```bash
docker-compose --profile monitoring up -d
# Access at http://localhost:3000
k6 run tests/load-test.js --out influxdb=http://localhost:8086/k6
```

## Project Structure

```
take-home-testability/
├── config/                   
├── modules/                  
├── tests/
│   ├── endpoints/            
│   ├── workflows/            
│   └── *.js                  
├── utils/                    
├── scripts/                  
└── results/                  
```

## Performance Metrics

Key thresholds:
- P95 response time: < 2000ms
- Error rate: < 5%

See `PERFORMANCE_ANALYSIS.md` for bottleneck identification.

## Extending the Framework

Add new endpoints by creating a module in `modules/` and a test in `tests/endpoints/`.

Add new workflows in `tests/workflows/` by chaining existing module functions.

## Resources

- k6 Documentation: https://k6.io/docs/
- API Documentation: https://api.polanji.com/docs

## License

MIT License