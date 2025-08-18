#!/bin/sh
# Test runner script for Docker environment

set -e

# Check for --log option
SAVE_LOG=false
JEST_ARGS=""
for arg in "$@"; do
    if [ "$arg" = "--log" ]; then
        SAVE_LOG=true
    else
        if [ -z "$JEST_ARGS" ]; then
            JEST_ARGS="$arg"
        else
            JEST_ARGS="$JEST_ARGS $arg"
        fi
    fi
done

# Create temp file for capturing output if logging is enabled
if [ "$SAVE_LOG" = true ]; then
    TEMP_OUTPUT=$(mktemp)
    trap "rm -f $TEMP_OUTPUT" EXIT
fi

echo "🧪 ShogiWebRoom Test Runner"
echo "=========================="
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Working directory: $(pwd)"
echo "Test mode: ${TEST_MODE:-default}"
if [ "$SAVE_LOG" = true ]; then
    echo "Logging: Enabled (use --log to save logs)"
fi
echo

# Ensure dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm ci
    echo
fi

# Check if jest is available
if [ ! -f "node_modules/.bin/jest" ]; then
    echo "❌ Jest not found in node_modules/.bin/"
    echo "📦 Installing jest locally..."
    npm install jest@26.6.3 --no-save
    echo
fi

# Run the appropriate test command based on arguments
if [ -z "$JEST_ARGS" ]; then
    echo "🚀 Running quick tests..."
    
    # Run tests (with or without capturing output)
    if [ "$SAVE_LOG" = true ]; then
        npx jest --passWithNoTests --maxWorkers=2 --testTimeout=30000 2>&1 | tee "$TEMP_OUTPUT"
        TEST_EXIT_CODE=$?
    else
        npx jest --passWithNoTests --maxWorkers=2 --testTimeout=30000
        TEST_EXIT_CODE=$?
    fi
else
    echo "🚀 Running custom test command: $JEST_ARGS"
    
    # Run tests (with or without capturing output)
    if [ "$SAVE_LOG" = true ]; then
        npx jest $JEST_ARGS 2>&1 | tee "$TEMP_OUTPUT"
        TEST_EXIT_CODE=$?
    else
        npx jest $JEST_ARGS
        TEST_EXIT_CODE=$?
    fi
fi

echo

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ Test run completed successfully!"
    
    # Save log file if --log option was used and tests passed
    if [ "$SAVE_LOG" = true ]; then
        mkdir -p tmp/logs
        LOG_FILE="tmp/logs/test-success-$(date +%Y%m%d-%H%M%S).log"
        
        {
            echo "🧪 ShogiWebRoom Test Runner - SUCCESS LOG"
            echo "=========================================="
            echo "Date: $(date)"
            echo "Node version: $(node --version)"
            echo "NPM version: $(npm --version)"
            echo "Working directory: $(pwd)"
            echo "Test mode: ${TEST_MODE:-default}"
            echo
            echo "Test Output:"
            echo "============"
            cat "$TEMP_OUTPUT"
        } > "$LOG_FILE"
        
        echo "📁 Log saved to: $LOG_FILE"
    fi
else
    echo "❌ Test run failed with exit code: $TEST_EXIT_CODE"
    
    # Always save log file on failure (if output was captured)
    if [ "$SAVE_LOG" = true ]; then
        mkdir -p tmp/logs
        LOG_FILE="tmp/logs/test-failure-$(date +%Y%m%d-%H%M%S).log"
        
        {
            echo "🧪 ShogiWebRoom Test Runner - FAILURE LOG"
            echo "=========================================="
            echo "Date: $(date)"
            echo "Node version: $(node --version)"
            echo "NPM version: $(npm --version)"
            echo "Working directory: $(pwd)"
            echo "Test mode: ${TEST_MODE:-default}"
            echo "Exit code: $TEST_EXIT_CODE"
            echo
            echo "Test Output:"
            echo "============"
            cat "$TEMP_OUTPUT"
        } > "$LOG_FILE"
        
        echo "📝 Failure log saved to: $LOG_FILE"
    else
        echo "💡 Tip: Use --log option to save test output to a file"
    fi
fi

exit $TEST_EXIT_CODE