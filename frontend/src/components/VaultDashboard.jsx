import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { VAULT_ABI, getVaultAddress } from '../contracts/VaultABI'

const VaultDashboard = ({ activeSection = 'dashboard' }) => {
  const { address } = useAccount()
  const chainId = useChainId()
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [showDepositStatus, setShowDepositStatus] = useState(true)
  const [showWithdrawStatus, setShowWithdrawStatus] = useState(true)

  // Get the correct contract address for current network
  const vaultAddress = getVaultAddress(chainId)

  // Contract read hooks
  const { data: userBalance, refetch: refetchBalance } = useReadContract({
    address: vaultAddress,
    abi: VAULT_ABI,
    functionName: 'getBalance',
    args: [address],
  })

  const { data: userDeposit, refetch: refetchDeposit } = useReadContract({
    address: vaultAddress,
    abi: VAULT_ABI,
    functionName: 'deposits',
    args: [address],
  })

  const { data: pendingReward, refetch: refetchReward } = useReadContract({
    address: vaultAddress,
    abi: VAULT_ABI,
    functionName: 'calculateReward',
    args: [address],
  })

  const { data: totalEthLocked } = useReadContract({
    address: vaultAddress,
    abi: VAULT_ABI,
    functionName: 'totalEthLocked',
  })

  const { data: rewardMultiplier } = useReadContract({
    address: vaultAddress,
    abi: VAULT_ABI,
    functionName: 'rewardMultiplier',
  })

  const { data: contractVersion } = useReadContract({
    address: vaultAddress,
    abi: VAULT_ABI,
    functionName: 'version',
  })

  // Contract write hooks
  const {
    writeContract: deposit,
    data: depositHash,
    isPending: isDepositPending,
    error: depositError
  } = useWriteContract()

  const {
    writeContract: withdraw,
    data: withdrawHash,
    isPending: isWithdrawPending,
    error: withdrawError
  } = useWriteContract()

  // Transaction receipt hooks
  const {
    isLoading: isDepositConfirming,
    isSuccess: isDepositConfirmed
  } = useWaitForTransactionReceipt({
    hash: depositHash,
  })

  const {
    isLoading: isWithdrawConfirming,
    isSuccess: isWithdrawConfirmed
  } = useWaitForTransactionReceipt({
    hash: withdrawHash,
  })

  // Refetch data when transactions are confirmed
  useEffect(() => {
    if (isDepositConfirmed || isWithdrawConfirmed) {
      refetchBalance()
      refetchDeposit()
      refetchReward()
    }
  }, [isDepositConfirmed, isWithdrawConfirmed, refetchBalance, refetchDeposit, refetchReward])

  // Clear transaction status when switching views
  useEffect(() => {
    // Reset deposit form and status
    setDepositAmount('')
    setShowDepositStatus(false)

    // Reset withdraw form and status
    setWithdrawAmount('')
    setShowWithdrawStatus(false)
  }, [activeSection])

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return
    setShowDepositStatus(true)

    try {
      deposit({
        address: vaultAddress,
        abi: VAULT_ABI,
        functionName: 'deposit',
        value: parseEther(depositAmount),
      })
    } catch (error) {
      console.error('Deposit error:', error)
    }
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return
    setShowWithdrawStatus(true)

    try {
      const amount = withdrawAmount === 'all' ? 0n : parseEther(withdrawAmount)
      withdraw({
        address: vaultAddress,
        abi: VAULT_ABI,
        functionName: 'withdraw',
        args: [amount],
      })
    } catch (error) {
      console.error('Withdraw error:', error)
    }
  }

  const getTransactionStatus = () => {
    if (isDepositPending || isDepositConfirming) {
      return { type: 'pending', message: 'Deposit transaction pending...' }
    }
    if (isWithdrawPending || isWithdrawConfirming) {
      return { type: 'pending', message: 'Withdraw transaction pending...' }
    }
    if (isDepositConfirmed) {
      return { type: 'success', message: 'Deposit successful!' }
    }
    if (isWithdrawConfirmed) {
      return { type: 'success', message: 'Withdrawal successful!' }
    }
    if (depositError) {
      return { type: 'error', message: `Deposit failed: ${depositError.message}` }
    }
    if (withdrawError) {
      return { type: 'error', message: `Withdrawal failed: ${withdrawError.message}` }
    }
    return null
  }

  const status = getTransactionStatus()

  // Network names for display
  const getNetworkName = (chainId) => {
    switch (chainId) {
      case 11155111: return 'Sepolia Testnet'
      case 31337: return 'Hardhat Local'
      default: return `Unsupported Network (${chainId})`
    }
  }

  // Check if contract is deployed on current network
  const isContractDeployed = vaultAddress && vaultAddress !== '0x0000000000000000000000000000000000000000'

  // Check if network is supported
  const isSupportedNetwork = chainId === 11155111 || chainId === 31337

  if (!isSupportedNetwork) {
    return (
      <div className="unsupported-container">
        <div className="unsupported-message card">
          <h3>🚫 Unsupported Network</h3>
          <p>This vault only works on supported networks.</p>
          <p>Current network: {getNetworkName(chainId)}</p>
          <div className="info-box">
            <strong>✅ Supported Networks:</strong>
            <ul style={{ marginTop: '0.5rem' }}>
              <li>Sepolia Testnet - For testing with free ETH</li>
              <li>Hardhat Local - For local development</li>
            </ul>
          </div>
          <div className="info-box" style={{ marginTop: '1.5rem' }}>
            <strong>💡 To switch networks:</strong>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>1. Open MetaMask</p>
            <p style={{ fontSize: '0.9rem' }}>2. Click the network dropdown</p>
            <p style={{ fontSize: '0.9rem' }}>3. Select "Sepolia test network"</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isContractDeployed) {
    return (
      <div className="unsupported-container">
        <div className="unsupported-message card">
          <h3>⚠️ Contract Not Deployed</h3>
          <p>The vault contract is not deployed on {getNetworkName(chainId)}.</p>
          <div className="info-box">
            <strong>Contract address:</strong>
            <code>{vaultAddress || 'Not configured'}</code>
            <p style={{ marginTop: '1rem' }}>Please:</p>
            <ul>
              <li>Deploy the contract to this network, or</li>
              <li>Switch to Sepolia testnet</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  // Render different sections based on activeSection
  return (
    <div className="dashboard">
      {(activeSection === 'dashboard' || activeSection === 'rewards') && (
        <>
          {/* Network Info Card */}
          <div className="card">
            <h3>🌐 Network Information</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{getNetworkName(chainId)}</div>
                <div className="stat-label">Current Network</div>
              </div>
              <div className="stat-item">
                <div className="stat-value" style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>
                  {vaultAddress}
                </div>
                <div className="stat-label">Contract Address</div>
              </div>
            </div>
          </div>

          {/* Balance Card */}
          <div className="card">
            <h3>💰 Your Balance</h3>
            <div className="balance-display">
              {userBalance ? `${parseFloat(formatEther(userBalance)).toFixed(4)} ETH` : '0.0000 ETH'}
            </div>
            <div className="reward-display">
              Pending Rewards: {pendingReward ? `${parseFloat(formatEther(pendingReward)).toFixed(6)} ETH` : '0.000000 ETH'}
            </div>

            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">
                  {userDeposit ? `${parseFloat(formatEther(userDeposit[0] || 0n)).toFixed(4)}` : '0.0000'}
                </div>
                <div className="stat-label">Principal (ETH)</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {userDeposit && userDeposit[1] ? new Date(Number(userDeposit[1]) * 1000).toLocaleDateString() : 'N/A'}
                </div>
                <div className="stat-label">Deposit Date</div>
              </div>
            </div>
          </div>

          {/* Vault Stats Card */}
          <div className="card">
            <h3>📊 Vault Statistics</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">
                  {totalEthLocked ? `${parseFloat(formatEther(totalEthLocked)).toFixed(2)}` : '0.00'}
                </div>
                <div className="stat-label">Total ETH Locked</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {rewardMultiplier ? `${(Number(rewardMultiplier) / 100).toFixed(2)}%` : '0.00%'}
                </div>
                <div className="stat-label">APY</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{contractVersion || 'N/A'}</div>
                <div className="stat-label">Contract Version</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">UUPS</div>
                <div className="stat-label">Proxy Type</div>
              </div>
            </div>
          </div>
        </>
      )}

      {(activeSection === 'deposit' || activeSection === 'dashboard') && (
        /* Deposit Card */
        <div className="card">
          <h3>📥 Deposit ETH</h3>
          <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Deposit your ETH to start earning rewards in the vault
          </p>
          <div className="deposit-form">
            <div className="input-group">
              <label htmlFor="depositAmount">Amount (ETH)</label>
              <input
                id="depositAmount"
                type="number"
                step="0.001"
                placeholder="0.0"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                disabled={isDepositPending || isDepositConfirming}
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={handleDeposit}
              disabled={!depositAmount || parseFloat(depositAmount) <= 0 || isDepositPending || isDepositConfirming}
            >
              {isDepositPending || isDepositConfirming ? '⏳ Processing...' : '📥 Deposit ETH'}
            </button>
            {status?.type === 'success' && depositHash && showDepositStatus && (
              <div className={`transaction-status status-${status.type}`}>
                ✅ {status.message}
              </div>
            )}
            {status?.type === 'error' && depositError && showDepositStatus && (
              <div className={`transaction-status status-${status.type}`}>
                ❌ {status.message}
              </div>
            )}
          </div>
        </div>
      )}

      {(activeSection === 'withdraw' || activeSection === 'dashboard') && (
        /* Withdraw Card */
        <div className="card">
          <h3>📤 Withdraw ETH</h3>
          <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Withdraw your ETH and earned rewards from the vault
          </p>
          <div className="deposit-form">
            <div className="input-group">
              <label htmlFor="withdrawAmount">Amount (ETH or 'all')</label>
              <input
                id="withdrawAmount"
                type="text"
                placeholder="0.0 or 'all'"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                disabled={isWithdrawPending || isWithdrawConfirming}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-secondary"
                onClick={handleWithdraw}
                disabled={!withdrawAmount || isWithdrawPending || isWithdrawConfirming}
                style={{ flex: 1 }}
              >
                {isWithdrawPending || isWithdrawConfirming ? '⏳ Processing...' : '📤 Withdraw'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setWithdrawAmount('all')}
                disabled={isWithdrawPending || isWithdrawConfirming}
              >
                All
              </button>
            </div>
            {status?.type === 'success' && withdrawHash && showWithdrawStatus && (
              <div className={`transaction-status status-${status.type}`}>
                ✅ {status.message}
              </div>
            )}
            {status?.type === 'error' && withdrawError && showWithdrawStatus && (
              <div className={`transaction-status status-${status.type}`}>
                ❌ {status.message}
              </div>
            )}
          </div>
        </div>
      )}

      {activeSection === 'settings' && (
        /* Settings Card */
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3>⚙️ Settings</h3>
          <div style={{ marginTop: '1.5rem' }}>
            <div className="info-box">
              <strong>Network Settings</strong>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Current Network: {getNetworkName(chainId)}</p>
              <p style={{ fontSize: '0.9rem' }}>Contract Address: <code>{vaultAddress}</code></p>
            </div>
          </div>
          <div style={{ marginTop: '1.5rem' }}>
            <div className="info-box">
              <strong>Contract Information</strong>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Version: {contractVersion || 'N/A'}</p>
              <p style={{ fontSize: '0.9rem' }}>Proxy Type: UUPS (Upgradeable)</p>
              <p style={{ fontSize: '0.9rem' }}>Status: {isContractDeployed ? '✅ Deployed' : '❌ Not Deployed'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VaultDashboard