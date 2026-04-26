#!/bin/bash

# ETH Vault Docker Deployment Script
set -e

echo "🐳 Starting ETH Vault Docker Deployment..."
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if Docker is running
check_docker() {
    print_header "Checking Docker..."
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop and try again."
        exit 1
    fi
    print_status "Docker is running ✅"
}

# Clean up any existing containers
cleanup() {
    print_header "Cleaning up existing containers..."
    docker-compose down --volumes --remove-orphans 2>/dev/null || true
    print_status "Cleanup completed ✅"
}

# Build and start services
start_services() {
    print_header "Building and starting services..."
    print_status "This may take a few minutes on first run..."
    
    # Build images first
    print_status "Building Docker images..."
    docker-compose build --no-cache
    
    # Start services in order
    print_status "Starting services..."
    docker-compose up -d
    
    print_status "Services started ✅"
}

# Wait for services to be healthy
wait_for_services() {
    print_header "Waiting for services to be ready..."
    
    services=("hardhat-node" "contract-deployer" "frontend" "vault-exporter" "prometheus" "grafana")
    
    for service in "${services[@]}"; do
        print_status "Waiting for $service..."
        timeout=300  # 5 minutes timeout
        elapsed=0
        
        while [ $elapsed -lt $timeout ]; do
            if docker-compose ps --services --filter "status=running" | grep -q "^$service$" 2>/dev/null; then
                print_status "$service is ready ✅"
                break
            fi
            
            sleep 5
            elapsed=$((elapsed + 5))
            
            if [ $elapsed -ge $timeout ]; then
                print_warning "$service took longer than expected to start"
                break
            fi
        done
    done
}

# Display service status
show_status() {
    print_header "Service Status:"
    docker-compose ps
    echo ""
}

# Display access information
show_access_info() {
    print_header "🎉 Deployment Complete!"
    echo ""
    echo "📱 Access your services:"
    echo "   Frontend Dashboard:    http://localhost:3000"
    echo "   Grafana Monitoring:    http://localhost:3001 (admin/admin)"
    echo "   Prometheus Metrics:    http://localhost:9090"
    echo "   Vault Metrics API:     http://localhost:8080/stats"
    echo "   Hardhat Node RPC:      http://localhost:8545"
    echo ""
    echo "🔧 Useful commands:"
    echo "   View logs:             docker-compose logs -f [service-name]"
    echo "   Stop services:         docker-compose down"
    echo "   Restart services:      docker-compose restart"
    echo "   View service status:   docker-compose ps"
    echo ""
    echo "📊 The vault contract will be automatically deployed to the local Hardhat network."
    echo "🎯 Connect MetaMask to http://localhost:8545 (Chain ID: 31337) to interact with the vault."
    echo ""
    echo "⚡ Real-time monitoring is now active!"
}

# Main execution
main() {
    check_docker
    cleanup
    start_services
    wait_for_services
    show_status
    show_access_info
}

# Handle Ctrl+C
trap 'echo -e "\n${YELLOW}Deployment interrupted by user${NC}"; exit 1' INT

# Run main function
main "$@"