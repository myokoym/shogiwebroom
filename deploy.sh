#!/bin/bash

# Fly.io deployment script for shogiwebroom
# This script sets up secrets and deploys the application

set -e

echo "🚀 Starting deployment for shogiwebroom..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    print_error "flyctl is not installed. Please install it first:"
    echo "curl -L https://fly.io/install.sh | sh"
    exit 1
fi

# Check if logged in to Fly.io
if ! flyctl auth whoami &> /dev/null; then
    print_warning "Not logged in to Fly.io. Please login first:"
    echo "flyctl auth login"
    exit 1
fi

print_status "Checking if app exists..."

# Check if app exists, if not create it
if ! flyctl apps list | grep -q "shogiwebroom"; then
    print_warning "App 'shogiwebroom' not found. Creating new app..."
    flyctl apps create shogiwebroom --org personal
    print_success "App created successfully"
else
    print_status "App 'shogiwebroom' already exists"
fi

print_status "Setting up secrets..."

# Set Redis URL secret (Upstash Redis)
REDIS_URL="redis://default:AX1HAAIncDFkMTJiYTJhZDBjZDA0MmU1OTY0NTZjNjgyMWRlM2Q3ZHAxMzIwNzE@welcome-termite-32071.upstash.io:32071"

# Set secrets
print_status "Setting REDIS_URL secret..."
echo "$REDIS_URL" | flyctl secrets set REDIS_URL=-

# Optional: Set other secrets if they exist in environment
if [ -n "$SESSION_SECRET" ]; then
    print_status "Setting SESSION_SECRET..."
    echo "$SESSION_SECRET" | flyctl secrets set SESSION_SECRET=-
fi

print_success "Secrets configured successfully"

# Verify secrets (don't show values for security)
print_status "Verifying secrets..."
flyctl secrets list

print_status "Building and deploying application..."

# Deploy the application
flyctl deploy --remote-only

# Check deployment status
if [ $? -eq 0 ]; then
    print_success "Deployment completed successfully!"
    
    print_status "Getting app info..."
    flyctl info
    
    print_status "Checking app status..."
    flyctl status
    
    print_success "🎉 Your app is deployed!"
    echo ""
    echo "App URL: https://shogiwebroom.fly.dev"
    echo "Health Check: https://shogiwebroom.fly.dev/api/health"
    echo ""
    echo "To monitor your app:"
    echo "  flyctl logs"
    echo "  flyctl status"
    echo "  flyctl info"
    echo ""
    echo "To scale your app:"
    echo "  flyctl scale count 1"
    echo "  flyctl scale memory 512"
else
    print_error "Deployment failed!"
    echo ""
    echo "To troubleshoot:"
    echo "  flyctl logs"
    echo "  flyctl status"
    echo ""
    echo "To try deploying again:"
    echo "  ./deploy.sh"
    exit 1
fi