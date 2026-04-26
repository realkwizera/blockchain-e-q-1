# 🏦 ETH Vault Monitoring Stack

A comprehensive DeFi vault system with UUPS upgradeable smart contracts, real-time monitoring, and full Docker deployment.

## 🌟 Features

- **UUPS Upgradeable Vault**: Secure ETH deposit/withdrawal with yield rewards
- **Real-time Monitoring**: Grafana dashboards with Prometheus metrics
- **Security Auditing**: Automated Aderyn security analysis
- **Docker Deployment**: One-command containerized deployment
- **Frontend Integration**: React app with Wagmi Web3 integration
- **Tenderly Integration**: Upgrade simulation and testing

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Smart Contracts │    │   Monitoring    │
│                 │    │                 │    │                 │
│  • Wagmi/Viem   │◄──►│  • VaultV1.sol  │◄──►│  • Prometheus   │
│  • MetaMask     │    │  • VaultV2.sol  │    │  • Grafana      │
│  • TailwindCSS  │    │  • UUPS Proxy   │    │  • Custom       │
│                 │    │                 │    │    Exporter     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ Docker Compose  │
                    │                 │
                    │ • Hardhat Node  │
                    │ • All Services  │
                    │ • Networking    │
                    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Git

### 1. Clone & Setup
```bash
git clone https://github.com/GermainGihozo/eth-vault-monitoring-stack.git
cd eth-vault-monitoring-stack
```

### 2. Deploy with Docker
```bash
# Start all services
docker-compose -f docker-compose.simple.yml up -d

# Deploy vault contract
cd contracts
npm run deploy:local
```

### 3. Access Services
- **Grafana Dashboard**: http://localhost:3002 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Vault Metrics**: http://localhost:8080/stats
- **Hardhat RPC**: http://localhost:8545

## 📊 Monitoring Dashboard

The Grafana dashboard provides real-time insights:

- **Total ETH Locked**: Live vault deposits
- **Transaction Success Rate**: Operation reliability
- **Reward Multiplier**: Current yield rate
- **Block Height**: Network status
- **Contract Health**: System status

## 🔒 Smart Contract Security

### Audit Results
- **Aderyn Security Scan**: ✅ Passed
- **UUPS Implementation**: ✅ Secure
- **Reentrancy Protection**: ✅ Implemented
- **Access Controls**: ✅ Owner-only upgrades

### Contract Addresses
- **Sepolia Testnet**: `0xEAebE827C8A3A4E98dFA802FC719eeBe46f06276`
- **Local Network**: `0x8A791620dd6260079BF849Dc5567aDC3F2FdC318`

## 🛠️ Development

### Project Structure
```
eth-vault-monitoring-stack/
├── contracts/              # Smart contracts & deployment
│   ├── contracts/         # Solidity source files
│   ├── scripts/          # Deployment scripts
│   ├── test/             # Contract tests
│   └── aderyn_report.md  # Security audit report
├── frontend/              # React application
│   ├── src/              # Frontend source code
│   └── public/           # Static assets
├── monitoring/            # Monitoring infrastructure
│   ├── exporter/         # Custom Prometheus exporter
│   ├── grafana/          # Dashboard configurations
│   └── prometheus.yml    # Metrics collection config
└── docker-compose.yml    # Container orchestration
```

### Local Development

#### Smart Contracts
```bash
cd contracts
npm install
npm run compile
npm test
npm run deploy:local
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Monitoring
```bash
cd monitoring/exporter
npm install
npm start
```

## 🔄 Upgrade Process

The vault uses UUPS (Universal Upgradeable Proxy Standard) for safe upgrades:

1. **Deploy V2 Contract**
2. **Simulate on Tenderly**
3. **Verify State Preservation**
4. **Execute Upgrade**

```bash
# Upgrade to V2
npm run upgrade
```

## 📈 Key Metrics

| Metric | Description | Target |
|--------|-------------|---------|
| Total ETH Locked | Vault deposits | Real-time tracking |
| Success Rate | Transaction reliability | >99% |
| Gas Efficiency | Deployment cost | <0.01 ETH |
| Upgrade Safety | State preservation | 100% |

## 🐳 Docker Services

| Service | Port | Description |
|---------|------|-------------|
| hardhat-node | 8545 | Local blockchain |
| vault-exporter | 8080 | Custom metrics |
| prometheus | 9090 | Metrics collection |
| grafana | 3002 | Visualization |
| frontend | 3000 | Web interface |

## 🧪 Testing

### Smart Contract Tests
```bash
cd contracts
npm test
```

### Security Audit
```bash
npm run audit
```

### Integration Tests
```bash
# Test full deployment
./start-docker.bat
```

## 📝 Configuration

### Environment Variables
```bash
# contracts/.env
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.gateway.tenderly.co
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Network Configuration
- **Local**: Chain ID 31337, RPC http://localhost:8545
- **Sepolia**: Chain ID 11155111, Tenderly Gateway
- **Mainnet**: Production deployment ready

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenZeppelin**: Upgradeable contract framework
- **Hardhat**: Development environment
- **Aderyn**: Security auditing tool
- **Grafana**: Monitoring dashboards
- **Prometheus**: Metrics collection

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/GermainGihozo/eth-vault-monitoring-stack/issues)
- **Discussions**: [GitHub Discussions](https://github.com/GermainGihozo/eth-vault-monitoring-stack/discussions)

---

**⭐ Star this repository if you find it helpful!**