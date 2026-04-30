import styles from './ResultsDisplay.module.css'

function fmt(value) {
  const abs = Math.abs(value)
  return `€${abs.toFixed(2)}`
}

function BreakdownItem({ label, value, variant }) {
  return (
    <div className={`${styles.breakdownItem} ${variant ? styles[variant] : ''}`}>
      <span>{label}</span>
      <span className={styles.breakdownValue}>{value}</span>
    </div>
  )
}

export default function ResultsDisplay({ results, config, isMonthly, onToggleMonthly }) {
  const { elecSavings, gasSavings, cashbackAmount, penaltyAmount, netSavings } = results
  const divider = isMonthly ? 12 : 1
  const period = isMonthly ? 'Monthly' : 'Annual'

  const elec = elecSavings / divider
  const gas = gasSavings / divider
  const cashback = cashbackAmount / divider
  const penalty = penaltyAmount / divider
  const net = netSavings / divider

  const isSaving = netSavings > 0

  return (
    <div className={`${styles.card} ${isSaving ? styles.positive : styles.neutral}`}>
      {/* Period toggle */}
      <div className={styles.periodToggle}>
        <button
          className={`${styles.periodBtn} ${!isMonthly ? styles.periodBtnActive : ''}`}
          onClick={() => isMonthly && onToggleMonthly()}
        >
          Annual
        </button>
        <button
          className={`${styles.periodBtn} ${isMonthly ? styles.periodBtnActive : ''}`}
          onClick={() => !isMonthly && onToggleMonthly()}
        >
          Monthly
        </button>
      </div>

      {isSaving ? (
        <>
          <p className={styles.heading}>Your Estimated {period} Savings</p>

          <div className={styles.breakdown}>
            <BreakdownItem label="Electricity Savings" value={fmt(elec)} />
            {config.fuelType === 'dual' && (
              <BreakdownItem label="Gas Savings" value={fmt(gas)} />
            )}
            {cashback > 0 && (
              <BreakdownItem label="Cashback" value={fmt(cashback)} variant="cashback" />
            )}
            {penalty > 0 && (
              <BreakdownItem label="Early Exit Fee" value={`−${fmt(penalty)}`} variant="penalty" />
            )}
          </div>

          <div className={styles.savingsAmount}>
            <span className={styles.currency}>€</span>
            {Math.abs(net).toFixed(2)}
          </div>
          <p className={styles.savingsLabel}>
            Net savings in Year 1{isMonthly ? ' (monthly)' : ''}
          </p>

          <a
            href="https://yunoenergy.ie/door-door"
            className={styles.cta}
            target="_blank"
            rel="noopener noreferrer"
          >
            Switch &amp; Start Saving →
          </a>

          <p className={styles.disclaimer}>
            This is an independent estimate and is not an official quote. Figures are based on
            information provided and exclude VAT. Actual savings may vary.
          </p>
          <p className={styles.rateValidity}>
            Rates used in this calculation were correct at the time this estimate was produced.
          </p>
        </>
      ) : (
        <>
          <div className={styles.notCompetitiveIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <p className={styles.notCompetitiveTitle}>Not currently competitive</p>
          <p className={styles.notCompetitiveMsg}>
            Based on these rates, switching may not save this customer money right now.
          </p>

          <div className={styles.breakdown}>
            <BreakdownItem label="Electricity Savings" value={fmt(elec)} variant={elec < 0 ? 'penalty' : undefined} />
            {config.fuelType === 'dual' && (
              <BreakdownItem label="Gas Savings" value={fmt(gas)} variant={gas < 0 ? 'penalty' : undefined} />
            )}
            {cashback > 0 && (
              <BreakdownItem label="Cashback" value={fmt(cashback)} variant="cashback" />
            )}
            {penalty > 0 && (
              <BreakdownItem label="Early Exit Fee" value={`−${fmt(penalty)}`} variant="penalty" />
            )}
          </div>

          <div className={`${styles.savingsAmount} ${styles.savingsAmountNegative}`}>
            <span className={styles.currency}>€</span>
            {Math.abs(net).toFixed(2)}
          </div>
          <p className={styles.savingsLabel}>
            Net {net < 0 ? 'cost' : 'savings'} in Year 1{isMonthly ? ' (monthly)' : ''}
          </p>

          <p className={styles.disclaimer}>
            This is an independent estimate and is not an official quote. Figures are based on
            information provided and exclude VAT. Actual savings may vary.
          </p>
          <p className={styles.rateValidity}>
            Rates used in this calculation were correct at the time this estimate was produced.
          </p>
        </>
      )}
    </div>
  )
}
