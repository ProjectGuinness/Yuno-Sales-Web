import { useState } from 'react'
import html2canvas from 'html2canvas'
import styles from './SavingsCard.module.css'

export default function SavingsCard({ captureRef, results }) {
  const { netSavings } = results
  const [toast, setToast] = useState(false)
  const [capturing, setCapturing] = useState(false)

  async function handleSaveImage() {
    if (!captureRef.current || capturing) return
    setCapturing(true)
    try {
      const canvas = await html2canvas(captureRef.current, {
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
    const text = `Based on your current energy rates, switching to Yuno Energy could save you an estimated €${netSavings.toFixed(2)} a year. Get started at yunoenergy.ie/door-door`
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
