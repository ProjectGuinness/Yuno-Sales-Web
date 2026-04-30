import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import styles from './SavingsCard.module.css'

function getPlanLabel(config) {
  const fuel = config.fuelType === 'dual' ? 'Dual Fuel' : 'Electricity Only'
  const meter =
    config.meterType === 'standard'
      ? 'Standard'
      : config.meterType === 'daynight'
      ? 'Day/Night'
      : 'Smart'
  return `${fuel} — ${meter}`
}

export default function SavingsCard({ results, config }) {
  const { elecSavings, gasSavings, cashbackAmount, penaltyAmount, netSavings } = results
  const cardRef = useRef(null)
  const [toast, setToast] = useState(false)
  const [capturing, setCapturing] = useState(false)

  const weekly = netSavings / 52
  const planLabel = getPlanLabel(config)

  async function handleSaveImage() {
    if (!cardRef.current || capturing) return
    setCapturing(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      })
      const link = document.createElement('a')
      link.download = 'my-energy-savings.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    } finally {
      setCapturing(false)
    }
  }

  async function handleShare() {
    const text = `I could save €${netSavings.toFixed(2)} a year (€${weekly.toFixed(2)} a week) on my energy bills. Check it out: yunoenergy.ie/door-door`
    if (navigator.share) {
      try {
        await navigator.share({ text })
      } catch {
        // user cancelled — no action needed
      }
    } else {
      try {
        await navigator.clipboard.writeText(text)
      } catch {
        // clipboard not available — silent fail
      }
      setToast(true)
      setTimeout(() => setToast(false), 2200)
    }
  }

  return (
    <div className={styles.wrapper}>
      <div ref={cardRef} className={styles.card}>
        <div className={styles.cardHeader}>
          <p className={styles.headerLabel}>Your Estimated Energy Savings</p>
        </div>

        <div className={styles.cardBody}>
          <div className={styles.mainAmount}>
            <span className={styles.currency}>€</span>
            <span className={styles.amount}>{netSavings.toFixed(2)}</span>
          </div>
          <p className={styles.weekly}>€{weekly.toFixed(2)} per week</p>

          <div className={styles.breakdown}>
            <div className={styles.row}>
              <span>Electricity Savings</span>
              <span>€{elecSavings.toFixed(2)}</span>
            </div>
            {config.fuelType === 'dual' && (
              <div className={styles.row}>
                <span>Gas Savings</span>
                <span>€{gasSavings.toFixed(2)}</span>
              </div>
            )}
            {cashbackAmount > 0 && (
              <div className={`${styles.row} ${styles.rowCashback}`}>
                <span>Cashback</span>
                <span>€{cashbackAmount.toFixed(2)}</span>
              </div>
            )}
            {penaltyAmount > 0 && (
              <div className={`${styles.row} ${styles.rowPenalty}`}>
                <span>Exit Fee</span>
                <span>−€{penaltyAmount.toFixed(2)}</span>
              </div>
            )}
          </div>

          <span className={styles.planLabel}>{planLabel}</span>

          <p className={styles.url}>yunoenergy.ie/door-door</p>

          <p className={styles.disclaimer}>
            Estimated savings based on figures provided. Actual savings may vary.
          </p>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.btnSave}
          onClick={handleSaveImage}
          disabled={capturing}
        >
          {capturing ? 'Saving…' : 'Save as Image'}
        </button>
        <button className={styles.btnShare} onClick={handleShare}>
          Share
        </button>
      </div>

      {toast && <div className={styles.toast}>Copied!</div>}
    </div>
  )
}
