#!/bin/bash
# Test runner script for Docker environment

set -e

# Create logs directory
mkdir -p test-results/logs

# Set up log file with timestamp
LOG_FILE="test-results/logs/test-$(date +%Y%m%d-%H%M%S).log"

# Function to log to both console and file
log_output() {
    echo "$@" | tee -a "$LOG_FILE"
}

log_output "🧪 ShogiWebRoom Test Runner"
log_output "=========================="
log_output "Node version: $(node --version)"
log_output "NPM version: $(npm --version)"
log_output "Working directory: $(pwd)"
log_output "Test mode: ${TEST_MODE:-default}"
log_output ""

# Ensure dependencies are installed
if [ ! -d "node_modules" ]; then
    log_output "📦 Installing dependencies..."
    npm ci 2>&1 | tee -a "$LOG_FILE"
    log_output ""
fi

# Check if jest is available
if [ ! -f "node_modules/.bin/jest" ]; then
    log_output "❌ Jest not found in node_modules/.bin/"
    log_output "📦 Installing jest locally..."
    npm install jest@26.6.3 --no-save 2>&1 | tee -a "$LOG_FILE"
    log_output ""
fi

# Run the appropriate test command based on arguments
if [ $# -eq 0 ]; then
    log_output "🚀 Running quick tests..."
    log_output "Executing: npx jest --passWithNoTests --maxWorkers=2 --testTimeout=30000"
    
    # Run tests and capture output
    npx jest --passWithNoTests --maxWorkers=2 --testTimeout=30000 2>&1 | tee -a "$LOG_FILE"
    TEST_EXIT_CODE=${PIPESTATUS[0]}
else
    log_output "🚀 Running custom test command: $@"
    log_output "Executing: npx jest $@"
    
    # Run tests and capture output
    npx jest "$@" 2>&1 | tee -a "$LOG_FILE"
    TEST_EXIT_CODE=${PIPESTATUS[0]}
fi

log_output ""

if [ $TEST_EXIT_CODE -eq 0 ]; then
    log_output "✅ Test run completed successfully!"
else
    log_output "❌ Test run failed with exit code: $TEST_EXIT_CODE"
    log_output "📝 Full log saved to: $LOG_FILE"
fi

log_output "📁 Log file location: $LOG_FILE"
exit $TEST_EXIT_CODE