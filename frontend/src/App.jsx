import { useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import Sidebar from './components/Sidebar'
import VaultDashboard from './components/VaultDashboard'
import './App.css'

function App() {
  const { isConnected } = useAccount()
  const [activeSection, setActiveSection] = useState('dashboard')

  return (
    <div className="App">
      {isConnected && <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />}
      
      <header className="App-header">
        <div className="header-content">
          <h1>ETH Vault Dashboard</h1>
          <ConnectButton />
        </div>
      </header>

      <main className={`main-content ${isConnected ? 'with-sidebar' : ''}`}>
        {isConnected ? (
          <VaultDashboard activeSection={activeSection} />
        ) : (
          <div className="connect-prompt">
            <div className="welcome-container">
              <h1>Welcome to ETH Vault</h1>
              <p className="subtitle">Connect your wallet to start earning rewards on your ETH deposits</p>
              
              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon">🔒</div>
                  <h3>Secure</h3>
                  <p>Upgradeable smart contracts with comprehensive auditing</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">💰</div>
                  <h3>Earn Rewards</h3>
                  <p>Earn interest on your ETH deposits over time</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🧪</div>
                  <h3>Testnet Ready</h3>
                  <p>Test safely on Sepolia with free ETH from faucets</p>
                </div>
              </div>

              <div className="networks-section">
                <h2>🌐 Supported Networks</h2>
                <div className="networks-grid">
                  <div className="network-card">
                    <h4>Sepolia Testnet</h4>
                    <p>Free testing with faucet ETH</p>
                  </div>
                  <div className="network-card">
                    <h4>Hardhat Local</h4>
                    <p>Local development environment</p>
                  </div>
                </div>
              </div>

              <div className="connect-button-wrapper">
                <ConnectButton />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App