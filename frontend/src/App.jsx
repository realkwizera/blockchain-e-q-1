import { useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import VaultDashboard from './components/VaultDashboard'
import './App.css'

function App() {
  const { isConnected } = useAccount()

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>🏦 ETH Vault Dashboard</h1>
          <ConnectButton />
        </div>
      </header>

      <main className="main-content">
        {isConnected ? (
          <VaultDashboard />
        ) : (
          <div className="connect-prompt">
            <h2>Welcome to ETH Vault</h2>
            <p>Connect your wallet to start earning rewards on your ETH deposits</p>
            <div className="features">
              <div className="feature">
                <h3>🔒 Secure</h3>
                <p>Upgradeable smart contracts with comprehensive auditing</p>
              </div>
              <div className="feature">
                <h3>💰 Earn Rewards</h3>
                <p>Earn interest on your ETH deposits over time</p>
              </div>
              <div className="feature">
                <h3>🧪 Testnet Ready</h3>
                <p>Test safely on Sepolia with free ETH from faucets</p>
              </div>
            </div>
            <div style={{ 
              marginTop: '2rem', 
              padding: '1.5rem', 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <h3 style={{ marginBottom: '1rem' }}>🌐 Supported Networks</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <h4>🧪 Sepolia Testnet</h4>
                  <p style={{ fontSize: '0.9rem', opacity: '0.8' }}>Free testing with faucet ETH</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h4>🏠 Hardhat Local</h4>
                  <p style={{ fontSize: '0.9rem', opacity: '0.8' }}>Local development environment</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App