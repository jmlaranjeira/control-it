#!/bin/bash

# ControlIT Deployment Script
# Handles deployment to different environments

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Environment variables
ENVIRONMENT="${1:-staging}"
DOCKER_IMAGE="${2:-controlit-app:latest}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Pre-deployment checks
pre_deployment_checks() {
    log_info "Running pre-deployment checks..."

    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker is not running"
        exit 1
    fi

    # Check if required environment file exists
    if [ ! -f "${PROJECT_DIR}/.env.${ENVIRONMENT}" ]; then
        log_warn "Environment file .env.${ENVIRONMENT} not found, using .env"
    fi

    # Validate Docker image exists
    if ! docker image inspect "$DOCKER_IMAGE" >/dev/null 2>&1; then
        log_error "Docker image $DOCKER_IMAGE not found locally"
        exit 1
    fi

    log_info "Pre-deployment checks passed"
}

# Backup current deployment
backup_current_deployment() {
    log_info "Creating backup of current deployment..."

    BACKUP_TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_DIR="${PROJECT_DIR}/backups/pre_deploy_${ENVIRONMENT}_${BACKUP_TIMESTAMP}"

    mkdir -p "$BACKUP_DIR"

    # Backup environment files
    if [ -f "${PROJECT_DIR}/.env.${ENVIRONMENT}" ]; then
        cp "${PROJECT_DIR}/.env.${ENVIRONMENT}" "$BACKUP_DIR/"
    fi

    # Backup docker-compose files
    if [ -f "${PROJECT_DIR}/docker-compose.${ENVIRONMENT}.yml" ]; then
        cp "${PROJECT_DIR}/docker-compose.${ENVIRONMENT}.yml" "$BACKUP_DIR/"
    fi

    log_info "Backup created at: $BACKUP_DIR"
}

# Deploy to environment
deploy_to_environment() {
    log_info "Deploying to $ENVIRONMENT environment..."

    cd "$PROJECT_DIR"

    # Select appropriate docker-compose file
    COMPOSE_FILE="docker-compose.yml"
    if [ -f "docker-compose.${ENVIRONMENT}.yml" ]; then
        COMPOSE_FILE="docker-compose.${ENVIRONMENT}.yml"
    fi

    # Set environment file
    ENV_FILE=".env"
    if [ -f ".env.${ENVIRONMENT}" ]; then
        ENV_FILE=".env.${ENVIRONMENT}"
    fi

    # Stop existing containers
    log_info "Stopping existing containers..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down || true

    # Pull latest images if deploying from registry
    if [[ "$DOCKER_IMAGE" == *":"* ]] && [[ "$DOCKER_IMAGE" != "controlit-app:"* ]]; then
        log_info "Pulling Docker image: $DOCKER_IMAGE"
        docker pull "$DOCKER_IMAGE"
    fi

    # Start containers
    log_info "Starting containers..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d

    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    sleep 30

    # Health check
    if health_check; then
        log_info "Deployment successful!"
        post_deployment_tasks
    else
        log_error "Health check failed!"
        rollback_deployment
        exit 1
    fi
}

# Health check
health_check() {
    log_info "Running health checks..."

    # Try to connect to the application
    local max_attempts=10
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        log_info "Health check attempt $attempt/$max_attempts"

        if curl -f -s "http://localhost:3000/health" >/dev/null 2>&1; then
            log_info "Application health check passed"
            return 0
        fi

        sleep 10
        ((attempt++))
    done

    log_error "Application health check failed after $max_attempts attempts"
    return 1
}

# Post-deployment tasks
post_deployment_tasks() {
    log_info "Running post-deployment tasks..."

    # Run database migrations if needed
    # docker-compose exec app npm run migrate 2>/dev/null || true

    # Clear application cache
    # docker-compose exec app npm run cache:clear 2>/dev/null || true

    log_info "Post-deployment tasks completed"
}

# Rollback deployment
rollback_deployment() {
    log_error "Rolling back deployment..."

    cd "$PROJECT_DIR"

    # Stop failed deployment
    docker-compose down || true

    # Find and start previous deployment if backup exists
    # This would require more sophisticated backup/restore logic

    log_error "Rollback completed. Manual intervention may be required."
}

# Main deployment process
main() {
    log_info "Starting deployment to $ENVIRONMENT environment"
    log_info "Docker image: $DOCKER_IMAGE"

    pre_deployment_checks
    backup_current_deployment
    deploy_to_environment

    log_info "Deployment process completed successfully!"
}

# Show usage
usage() {
    echo "Usage: $0 [environment] [docker-image]"
    echo ""
    echo "Arguments:"
    echo "  environment    Target environment (staging, production) - default: staging"
    echo "  docker-image   Docker image to deploy - default: controlit-app:latest"
    echo ""
    echo "Examples:"
    echo "  $0 staging"
    echo "  $0 production controlit-app:v1.2.3"
    echo "  $0 production myregistry.com/controlit-app:latest"
}

# Parse arguments
case "$1" in
    -h|--help)
        usage
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac