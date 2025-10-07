# Multi-stage Docker build for k6 performance testing

FROM grafana/k6:latest

# Set working directory
WORKDIR /tests

# Copy test files
COPY config/ /tests/config/
COPY modules/ /tests/modules/
COPY tests/ /tests/tests/
COPY utils/ /tests/utils/
COPY scripts/ /tests/scripts/

# Copy environment example
COPY .env.example /tests/.env.example

# Make scripts executable
RUN chmod +x /tests/scripts/*.sh

# Create results directory
RUN mkdir -p /tests/results

# Set environment variables (can be overridden at runtime)
ENV BASE_URL=https://api.polanji.com
ENV USER_EMAIL=performancetest03@gmail.com
ENV USER_PASSWORD=user123456

# Default command - run all tests
CMD ["run", "tests/load-test.js"]

