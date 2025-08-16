#!/bin/bash

# ShogiWebRoom Development Helper Script
# Simplifies common Docker Compose operations for development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
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

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to check if .env file exists
check_env() {
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from .env.example..."
        if [ -f .env.example ]; then
            cp .env.example .env
            print_success ".env file created from .env.example"
            print_info "Please review and update .env file with your configuration"
        else
            print_error ".env.example file not found. Please create .env file manually."
            exit 1
        fi
    fi
}

# Function to start services
start_services() {
    print_info "Starting ShogiWebRoom development environment..."
    docker compose up --build -d
    print_success "Services started successfully!"
    print_info "Web application: http://localhost:3000"
    print_info "Redis: localhost:6379"
}

# Function to stop services
stop_services() {
    print_info "Stopping ShogiWebRoom development environment..."
    docker compose down
    print_success "Services stopped successfully!"
}

# Function to view logs
view_logs() {
    local service=${1:-""}
    if [ -z "$service" ]; then
        print_info "Showing logs for all services..."
        docker compose logs -f
    else
        print_info "Showing logs for $service..."
        docker compose logs -f "$service"
    fi
}

# Function to clean up everything
clean_all() {
    print_warning "This will remove all containers, volumes, and cached data. Continue? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_info "Cleaning up Docker environment..."
        docker compose down -v --remove-orphans
        docker system prune -f
        print_success "Cleanup completed!"
    else
        print_info "Cleanup cancelled."
    fi
}

# Function to restart services
restart_services() {
    print_info "Restarting ShogiWebRoom development environment..."
    docker compose restart
    print_success "Services restarted successfully!"
}

# Function to rebuild services
rebuild_services() {
    print_info "Rebuilding ShogiWebRoom development environment..."
    docker compose down
    docker compose up --build -d
    print_success "Services rebuilt and started successfully!"
}

# Function to show service status
show_status() {
    print_info "Service status:"
    docker compose ps
    echo ""
    print_info "Service health:"
    docker compose exec web wget --no-verbose --tries=1 --spider http://localhost:3000/ >/dev/null 2>&1 && print_success "Web service is healthy" || print_error "Web service is not responding"
    docker compose exec redis redis-cli ping >/dev/null 2>&1 && print_success "Redis service is healthy" || print_error "Redis service is not responding"
}

# Function to execute commands in containers
exec_command() {
    local service=$1
    shift
    local command="$*"
    
    if [ -z "$service" ] || [ -z "$command" ]; then
        print_error "Usage: $0 exec <service> <command>"
        print_info "Example: $0 exec web npm install"
        exit 1
    fi
    
    print_info "Executing '$command' in $service container..."
    docker compose exec "$service" $command
}

# Function to show help
show_help() {
    echo "ShogiWebRoom Development Helper"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  start          Start development environment"
    echo "  stop           Stop development environment"
    echo "  restart        Restart services"
    echo "  rebuild        Rebuild and restart services"
    echo "  logs [service] View logs (optional: specify service)"
    echo "  status         Show service status and health"
    echo "  clean          Clean up all Docker resources"
    echo "  exec <service> <command>  Execute command in container"
    echo "  help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start                    # Start all services"
    echo "  $0 logs web                 # View web service logs"
    echo "  $0 exec web npm install     # Install packages in web container"
    echo "  $0 exec redis redis-cli     # Access Redis CLI"
}

# Main script logic
main() {
    check_docker
    
    case "${1:-help}" in
        start)
            check_env
            start_services
            ;;
        stop)
            stop_services
            ;;
        restart)
            restart_services
            ;;
        rebuild)
            check_env
            rebuild_services
            ;;
        logs)
            view_logs "$2"
            ;;
        status)
            show_status
            ;;
        clean)
            clean_all
            ;;
        exec)
            shift
            exec_command "$@"
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"