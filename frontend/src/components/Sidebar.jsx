import { useState } from 'react'
import { useAccount } from 'wagmi'
import '../styles/Sidebar.css'

const Sidebar = ({ activeSection, setActiveSection }) => {
  const { address, isConnected } = useAccount()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'deposit', label: 'Deposit', icon: '💰' },
    { id: 'withdraw', label: 'Withdraw', icon: '🔄' },
    { id: 'rewards', label: 'Rewards', icon: '🎁' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">🏦</span>
          {!isCollapsed && <span className="logo-text">Vault</span>}
        </div>
        <button 
          className="toggle-btn" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => setActiveSection(item.id)}
            title={isCollapsed ? item.label : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {!isCollapsed && <span className="nav-label">{item.label}</span>}
          </button>
        ))}
      </nav>

      {!isCollapsed && isConnected && (
        <div className="sidebar-footer">
          <div className="wallet-info">
            <p className="wallet-label">Connected Wallet</p>
            <p className="wallet-address">
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
            </p>
          </div>
        </div>
      )}
    </aside>
  )
}

export default Sidebar
