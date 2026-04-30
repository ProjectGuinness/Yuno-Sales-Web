import { useState, useRef, useEffect } from 'react'
import SettingsPanel from './components/SettingsPanel'
import CustomerConfig from './components/CustomerConfig'
import RateInputs from './components/RateInputs'
import ResultsDisplay from './components/ResultsDisplay'
import { calculateSavings, DEFAULT_YUNO_SETTINGS, NATIONAL_AVERAGES } from './utils/calculations'
import styles from './App.module.css'

const INITIAL_CONFIG = { fuelType: 'single', inContract: false, meterType: 'standard' }

function validateRates({ config, currentRates, usage, useNationalAverage }) {
  const errors = {}
  const { meterType, fuelType } = config

  const check = (key, val) => {
    const n = parseFloat(val)
    if (val === '' || val === undefined || isNaN(n) || n < 0) errors[key] = true
  }

  if (meterType === 'standard') {
    check('elecStdRate', currentRates.elecStdRate)
    check('elecStdStanding', currentRates.elecStdStanding)
    if (!useNationalAverage) check('elecStd', usage.elecStd)
  } else if (meterType === 'daynight') {
    check('elecDnDayRate', currentRates.elecDnDayRate)
    check('elecDnNightRate', currentRates.elecDnNightRate)
    check('elecDnStanding', currentRates.elecDnStanding)
    if (!useNationalAverage) {
      check('elecDnDay', usage.elecDnDay)
      check('elecDnNight', usage.elecDnNight)
    }
  } else if (meterType === 'smart') {
    check('elecSmartDayRate', currentRates.elecSmartDayRate)
    check('elecSmartNightRate', currentRates.elecSmartNightRate)
    check('elecSmartPeakRate', currentRates.elecSmartPeakRate)
    check('elecSmartStanding', currentRates.elecSmartStanding)
    if (!useNationalAverage) {
      check('elecSmartDay', usage.elecSmartDay)
      check('elecSmartNight', usage.elecSmartNight)
      check('elecSmartPeak', usage.elecSmartPeak)
    }
  }

  if (fuelType === 'dual') {
    check('gasRate', currentRates.gasRate)
    check('gasStanding', currentRates.gasStanding)
    if (!useNationalAverage) check('gas', usage.gas)
  }

  return errors
}

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [yunoSettings, setYunoSettings] = useState({ ...DEFAULT_YUNO_SETTINGS })
  const [config, setConfig] = useState({ ...INITIAL_CONFIG })
  const [useNationalAverage, setUseNationalAverage] = useState(true)
  const [usage, setUsage] = useState({ ...NATIONAL_AVERAGES })
  const [currentRates, setCurrentRates] = useState({})
  const [results, setResults] = useState(null)
  const [isMonthly, setIsMonthly] = useState(false)
  const [errors, setErrors] = useState({})
  const resultsRef = useRef(null)

  useEffect(() => {
    if (results && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [results])

  function handleUseNationalAverageChange(checked) {
    setUseNationalAverage(checked)
    if (checked) setUsage({ ...NATIONAL_AVERAGES })
    setErrors({})
  }

  function handleRateChange(key, value) {
    setCurrentRates(r => ({ ...r, [key]: value }))
    if (errors[key]) setErrors(e => { const n = { ...e }; delete n[key]; return n })
  }

  function handleUsageChange(key, value) {
    setUsage(u => ({ ...u, [key]: value }))
    if (errors[key]) setErrors(e => { const n = { ...e }; delete n[key]; return n })
  }

  function handleCalculate() {
    const newErrors = validateRates({ config, currentRates, usage, useNationalAverage })
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    const parsedRates = Object.fromEntries(
      Object.entries(currentRates).map(([k, v]) => [k, parseFloat(v)])
    )
    const parsedUsage = Object.fromEntries(
      Object.entries(usage).map(([k, v]) => [k, parseFloat(v)])
    )

    const result = calculateSavings({
      config,
      currentRates: parsedRates,
      usage: parsedUsage,
      yunoSettings,
    })

    setResults(result)
    setIsMonthly(false)
  }

  function handleReset() {
    setCurrentRates({})
    setUsage({ ...NATIONAL_AVERAGES })
    setUseNationalAverage(true)
    setConfig({ ...INITIAL_CONFIG })
    setResults(null)
    setIsMonthly(false)
    setErrors({})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const hasErrors = Object.keys(errors).length > 0

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.brandName}>yuno</span>
          <span className={styles.brandTag}>energy</span>
        </div>
        <h1 className={styles.title}>Savings Calculator</h1>
        <p className={styles.subtitle}>See how much you could save by switching to Yuno.</p>
      </header>

      <div className={styles.content}>
        <SettingsPanel
          settings={yunoSettings}
          onChange={setYunoSettings}
          open={settingsOpen}
          onToggle={() => setSettingsOpen(o => !o)}
        />

        <div className={styles.card}>
          <CustomerConfig config={config} onChange={setConfig} />

          <hr className={styles.divider} />

          <RateInputs
            meterType={config.meterType}
            fuelType={config.fuelType}
            useNationalAverage={useNationalAverage}
            onUseNationalAverageChange={handleUseNationalAverageChange}
            currentRates={currentRates}
            onRateChange={handleRateChange}
            usage={usage}
            onUsageChange={handleUsageChange}
            errors={errors}
          />

          {hasErrors && (
            <p className={styles.errorBanner}>
              Please fill in all highlighted fields with valid positive numbers.
            </p>
          )}

          <div className={styles.actions}>
            <button className={styles.btnCalculate} onClick={handleCalculate}>
              Calculate My Savings
            </button>
            <button className={styles.btnReset} onClick={handleReset}>
              Clear
            </button>
          </div>
        </div>

        {results && (
          <div ref={resultsRef}>
            <ResultsDisplay
              results={results}
              config={config}
              isMonthly={isMonthly}
              onToggleMonthly={() => setIsMonthly(m => !m)}
            />
          </div>
        )}
      </div>

      <footer className={styles.footer}>
        <p>
          These calculations are estimates based on the figures provided. Actual savings may vary
          depending on usage, taxes, VAT, and PSO levies.
        </p>
      </footer>
    </div>
  )
}
