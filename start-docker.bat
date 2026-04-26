@echo off
setlocal enabledelayedexpansion

echo 🐳 Starting ETH Vault Docker Deployment...
echo ========================================

:: Check if Docker is running
echo [INFO] Checking Docker...
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker Desktop and try again.
    pause
    exit /b 1
)
echo [INFO] Docker is running ✅

:: Clean up existing containers
echo [STEP] Cleaning up existing containers...
docker-compose down --volumes --remove-orphans >nul 2>&1
echo [INFO] Cleanup completed ✅

:: Build and start services
echo [STEP] Building and starting services...
echo [INFO] This may take a few minutes on first run...

echo [INFO] Building Docker images...
docker-compose build --no-cache
if errorlevel 1 (
    echo [ERROR] Failed to build Docker images
    pause
    exit /b 1
)

echo [INFO] Starting services...
docker-compose up -d
if errorlevel 1 (
    echo [ERROR] Failed to start services
    pause
    exit /b 1
)
echo [INFO] Services started ✅

:: Wait a bit for services to initialize
echo [INFO] Waiting for services to initialize...
timeout /t 30 /nobreak >nul

:: Show service status
echo [STEP] Service Status:
docker-compose ps

:: Display access information
echo.
echo [STEP] 🎉 Deployment Complete!
echo.
echo 📱 Access your services:
echo    Frontend Dashboard:    http://localhost:3000
echo    Grafana Monitoring:    http://localhost:3001 (admin/admin)
echo    Prometheus Metrics:    http://localhost:9090
echo    Vault Metrics API:     http://localhost:8080/stats
echo    Hardhat Node RPC:      http://localhost:8545
echo.
echo 🔧 Useful commands:
echo    View logs:             docker-compose logs -f [service-name]
echo    Stop services:         docker-compose down
echo    Restart services:      docker-compose restart
echo    View service status:   docker-compose ps
echo.
echo 📊 The vault contract will be automatically deployed to the local Hardhat network.
echo 🎯 Connect MetaMask to http://localhost:8545 (Chain ID: 31337) to interact with the vault.
echo.
echo ⚡ Real-time monitoring is now active!
echo.
pause