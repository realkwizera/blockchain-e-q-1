# 🚀 ETH Vault Monitoring Stack - Running Steps

Complete guide for running all services with timing, dependencies, and troubleshooting.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start (Docker - Recommended)](#quick-start-docker--recommended)
3. [Manual Step-by-Step (Development)](#manual-step-by-step-development)
4. [Service Startup Timeline](#service-startup-timeline)
5. [Verification Checklist](#verification-checklist)
6. [Stopping Services](#stopping-services)
7. [Troubleshooting](#troubleshooting)

---

## 📦 Prerequisites

Before running anything, ensure you have:

- **Docker & Docker Compose** (for Docker approach)
  ```bash
  docker --version          # v20.10+
  docker-compose --version  # v2.0+
  ```

- **Node.js 18+** (for manual approach)
  ```bash
  node --version   # v18+
  npm --version    # v9+
  ```

- **Git** (to clone the repo)
  ```bash
  git --version
  ```

- **Open Ports**: 3000, 3002, 8080, 8545, 9090
  - Hardhat Node: **8545**
  - Vault Exporter: **8080**
  - Prometheus: **9090**
  - Grafana: **3002**
  - Frontend: **3000**

---

## 🐳 Quick Start (Docker - Recommended)

### For Windows (PowerShell/CMD):

```bash
# 1. Navigate to project root
cd eth-vault-monitoring-stack

# 2. Start all services with Docker Compose
docker-compose -f docker-compose.simple.yml up -d

# 3. Wait 60-90 seconds for all services to become healthy
# (Check: docker-compose ps)

# 4. Deploy the vault contract
cd contracts
npm install
npm run deploy:local

# 5. Access the services
# Grafana:     http://localhost:3002 (admin/admin)
# Prometheus:   
# Metrics:     http://localhost:8080/stats
# Hardhat:     http://localhost:8545
```

### For Mac/Linux:

```bash
# Same as above, just run the shell script
./start-docker.sh
```

---

## 🔧 Manual Step-by-Step (Development)

Use this approach when developing locally or debugging.

### **Step 1: Start Hardhat Local Blockchain** (Terminal 1)
**⏱️ Time: ~5 seconds | Depends on: Nothing**

```bash
cd contracts
npm install
npx hardhat node
```

**Expected Output:**
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
Accounts:
Account #0: 0x1234... (1000 ETH)
...
```

**✅ Checkpoint**: Hardhat is listening on `http://localhost:8545`

---

### **Step 2: Deploy Vault Contract** (Terminal 2)
**⏱️ Time: ~10 seconds | Depends on: Hardhat running**

```bash
cd contracts
npm run deploy:local
```

**Expected Output:**
```
Deploying VaultV1 implementation...
VaultV1 deployed to: 0x8A791620dd6260079BF849Dc5567aDC3F2FdC318
Deploying ERC1967Proxy...
Proxy deployed to: 0x...
```

**✅ Checkpoint**: Note the contract address (e.g., `0x8A791620dd6260079BF849Dc5567aDC3F2FdC318`)

---

### **Step 3: Start Metrics Exporter** (Terminal 3)
**⏱️ Time: ~3 seconds | Depends on: Hardhat + Contract deployed**

```bash
cd monitoring/exporter
npm install
npm start
```

**Expected Output:**
```
Vault Metrics Exporter listening on port 8080
Collecting metrics every 10 seconds
Connected to vault at 0x8A791620dd6260079BF849Dc5567aDC3F2FdC318
```

**✅ Checkpoint**: Verify metrics at `http://localhost:8080/metrics`

---

### **Step 4: Start Prometheus** (Terminal 4)
**⏱️ Time: ~2 seconds | Depends on: Metrics exporter running**

```bash
# Option A: Docker (easiest)
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -v $(pwd)/monitoring/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus \
  --config.file=/etc/prometheus/prometheus.yml \
  --storage.tsdb.path=/prometheus

# Option B: Local binary (if installed)
prometheus --config.file=monitoring/prometheus.yml
```

**Expected Output:**
```
level=info ts=... msg="Server started"
level=info ts=... msg="TSDB started"
```

**✅ Checkpoint**: Visit `http://localhost:9090` and check "Targets" (should show vault-exporter as UP)

---

### **Step 5: Start Grafana** (Terminal 5)
**⏱️ Time: ~3 seconds | Depends on: Prometheus running**

```bash
# Option A: Docker (easiest)
docker run -d \
  --name grafana \
  -p 3002:3000 \
  -e GF_SECURITY_ADMIN_PASSWORD=admin \
  -v $(pwd)/monitoring/grafana/provisioning:/etc/grafana/provisioning \
  -v $(pwd)/monitoring/grafana/dashboards:/var/lib/grafana/dashboards \
  grafana/grafana

# Option B: Local installation
grafana-server --config=/etc/grafana/grafana.ini
```

**Expected Output:**
```
HTTP Server Listen :3000 on tcp://127.0.0.1:3000
```

**✅ Checkpoint**: Visit `http://localhost:3002` (admin/admin)

---

### **Step 6: Start Frontend** (Terminal 6, Optional)
**⏱️ Time: ~5-10 seconds | Depends on: Hardhat + Contract**

```bash
cd frontend
npm install
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

**✅ Checkpoint**: Visit `http://localhost:5173` to see the frontend

---

## 📊 Service Startup Timeline

```
START
  │
  ├─→ Hardhat Node (Terminal 1)
  │   ⏱️  5 seconds
  │   Status: RPC listening on 8545
  │   │
  │   ├─→ Deploy Contract (Terminal 2)
  │   │   ⏱️  10 seconds (AFTER Hardhat starts)
  │   │   Status: Contract deployed
  │   │   │
  │   │   ├─→ Metrics Exporter (Terminal 3)
  │   │   │   ⏱️  3 seconds (AFTER contract deployed)
  │   │   │   Status: Exporter on 8080
  │   │   │   │
  │   │   │   ├─→ Prometheus (Terminal 4)
  │   │   │   │   ⏱️  2 seconds (AFTER exporter starts)
  │   │   │   │   Status: Scraping metrics on 9090
  │   │   │   │   │
  │   │   │   │   ├─→ Grafana (Terminal 5)
  │   │   │   │   │   ⏱️  3 seconds (AFTER Prometheus starts)
  │   │   │   │   │   Status: UI on 3002
  │   │   │   │   │
  │   │   │   │   └─→ Frontend (Terminal 6, Optional)
  │   │   │   │       ⏱️  10 seconds (AFTER contract deployed)
  │   │   │   │       Status: UI on 5173/3000
  │
  └─ TOTAL: ~30-40 seconds (all services ready)
```

---

## ✅ Verification Checklist

After starting services, verify everything is working:

### **1. Check All Services Running**

**Docker approach:**
```bash
docker-compose -f docker-compose.simple.yml ps
```

**Manual approach:**
```bash
# Terminal 1: Hardhat
curl http://localhost:8545
# Should return: 405 Method Not Allowed (connection works)

# Terminal 3: Metrics Exporter
curl http://localhost:8080/metrics
# Should return: Prometheus metrics in text format

# Terminal 4: Prometheus
curl http://localhost:9090/-/healthy
# Should return: 200 OK

# Terminal 5: Grafana
curl http://localhost:3002/api/health
# Should return: JSON with "ok": true
```

### **2. Verify Contract Deployment**

```bash
cd contracts
node -e "
const fs = require('fs');
const deployment = JSON.parse(fs.readFileSync('deployment-localhost.json'));
console.log('Vault Address:', deployment.vault);
console.log('Proxy Address:', deployment.proxy);
"
```

### **3. Check Metrics Collection**

Visit **http://localhost:8080/stats** in your browser

Should display JSON like:
```json
{
  "vault_total_eth_locked": 0,
  "vault_reward_multiplier": 100,
  "vault_total_depositors": 0,
  "vault_transaction_success_rate": 1.0
}
```

### **4. Verify Prometheus Targets**

Visit **http://localhost:9090/targets**

Should show:
- `vault-exporter` → **UP** ✅
- `prometheus` → **UP** ✅

### **5. Access Grafana Dashboard**

Visit **http://localhost:3002** (admin/admin)

Dashboard should show:
- 📊 11 panels with black/white theme
- ✅ "ETH Vault Real-Time Monitoring" title
- 💾 Real-time metric graphs

---

## 🛑 Stopping Services

### **Docker Approach:**

```bash
# Stop all containers
docker-compose -f docker-compose.simple.yml down

# Stop and remove volumes (clean slate)
docker-compose -f docker-compose.simple.yml down -v

# View running containers
docker-compose -f docker-compose.simple.yml ps
```

### **Manual Approach:**

```bash
# Terminal 1: Press Ctrl+C (Hardhat)
# Terminal 2: Press Ctrl+C (Deploy - auto-exits)
# Terminal 3: Press Ctrl+C (Metrics Exporter)
# Terminal 4: Press Ctrl+C (Prometheus)
# Terminal 5: Press Ctrl+C (Grafana)
# Terminal 6: Press Ctrl+C (Frontend)

# Clean up Docker containers if used
docker stop prometheus grafana 2>/dev/null || true
docker rm prometheus grafana 2>/dev/null || true
```

---

## 🔧 Troubleshooting

### **Port Already in Use**

```bash
# Find what's using port (e.g., 8545)
Windows:
  netstat -ano | findstr :8545
  taskkill /PID <PID> /F

Mac/Linux:
  lsof -i :8545
  kill -9 <PID>

# Or use different ports in docker-compose.simple.yml
```

### **Hardhat Node Won't Connect**

```bash
# Verify it's running
curl http://localhost:8545

# Restart it
cd contracts
npx hardhat node --hostname 0.0.0.0
```

### **Contract Deployment Fails**

```bash
# Clean and retry
cd contracts
npm run clean
npm run compile
npm run deploy:local
```

### **Metrics Exporter Not Collecting Data**

```bash
# Check logs
docker logs vault-exporter
# OR manually run with debug
cd monitoring/exporter
RPC_URL=http://localhost:8545 npm start

# Common issues:
# - Wrong RPC URL
# - Wrong contract address (must match deployment-localhost.json)
# - Contract not deployed yet
```

### **Prometheus Not Finding Targets**

```bash
# Check config file
cat monitoring/prometheus.yml

# Verify exporter is healthy
curl http://localhost:8080/health

# Restart Prometheus
docker restart prometheus
```

### **Grafana Won't Load Dashboard**

```bash
# Clear Grafana cache
docker exec grafana grafana-cli database reset

# Check dashboard file
cat monitoring/grafana/dashboards/vault-dashboard.json | jq empty
# If invalid JSON, fix it

# Restart Grafana
docker restart grafana
```

### **Docker Compose Won't Start**

```bash
# Check syntax
docker-compose -f docker-compose.simple.yml config

# View full logs
docker-compose -f docker-compose.simple.yml logs

# Remove orphaned containers
docker-compose -f docker-compose.simple.yml down --remove-orphans
docker-compose -f docker-compose.simple.yml up -d
```

---

## 📱 Access All Services

Once everything is running:

| Service | URL | Login | Purpose |
|---------|-----|-------|---------|
| **Grafana** | http://localhost:3002 | admin/admin | View dashboards |
| **Prometheus** | http://localhost:9090 | — | View metrics & targets |
| **Metrics Exporter** | http://localhost:8080/stats | — | Raw JSON metrics |
| **Hardhat RPC** | http://localhost:8545 | — | Blockchain node |
| **Frontend** | http://localhost:5173 | — | Vault UI |

---

## 💡 Pro Tips

1. **Watch logs in real-time:**
   ```bash
   docker-compose -f docker-compose.simple.yml logs -f
   ```

2. **Check service health:**
   ```bash
   docker-compose -f docker-compose.simple.yml ps
   ```

3. **Restart a single service:**
   ```bash
   docker-compose -f docker-compose.simple.yml restart prometheus
   ```

4. **View service dependencies:**
   ```bash
   docker-compose -f docker-compose.simple.yml config --services
   ```

5. **Keep 6 terminals open** (one per service) for development:
   - T1: Hardhat
   - T2: Deployment
   - T3: Metrics Exporter
   - T4: Prometheus
   - T5: Grafana
   - T6: Frontend (optional)

---

## ✨ Summary

**Fastest way to get running:**

```bash
# 1. Docker Compose (30 seconds)
docker-compose -f docker-compose.simple.yml up -d
sleep 10
cd contracts && npm install && npm run deploy:local

# 2. Access services
open http://localhost:3002  # Grafana
open http://localhost:9090  # Prometheus
open http://localhost:8080/stats  # Metrics
```

**Done! 🎉**

