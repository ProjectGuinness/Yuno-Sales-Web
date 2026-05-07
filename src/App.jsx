import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import SettingsPanel from './components/SettingsPanel'
import CustomerConfig from './components/CustomerConfig'
import RateInputs from './components/RateInputs'
import ResultsDisplay from './components/ResultsDisplay'
import SavingsCard from './components/SavingsCard'
import { calculateSavings, DEFAULT_YUNO_SETTINGS, NATIONAL_AVERAGES } from './utils/calculations'
import styles from './App.module.css'

const INITIAL_CONFIG = { fuelType: 'single', inContract: false, meterType: 'standard' }

const RATE_FIELD_KEYS = new Set([
  'elecStdRate', 'elecDnDayRate', 'elecDnNightRate',
  'elecSmartDayRate', 'elecSmartNightRate', 'elecSmartPeakRate',
  'gasRate',
])

function validateRates({ config, currentRates, usage, useNationalAverage }) {
  const errors = {}
  const { meterType, fuelType } = config

  const check = (key, val) => {
    const n = parseFloat(val)
    if (val === '' || val === undefined || isNaN(n) || n < 0) errors[key] = true
  }

  const checkRate = (key, val) => {
    const n = parseFloat(val)
    if (val === '' || val === undefined || isNaN(n) || n <= 0) errors[key] = true
  }

  if (meterType === 'standard') {
    checkRate('elecStdRate', currentRates.elecStdRate)
    check('elecStdStanding', currentRates.elecStdStanding)
    if (!useNationalAverage) check('elecStd', usage.elecStd)
  } else if (meterType === 'daynight') {
    checkRate('elecDnDayRate', currentRates.elecDnDayRate)
    checkRate('elecDnNightRate', currentRates.elecDnNightRate)
    check('elecDnStanding', currentRates.elecDnStanding)
    if (!useNationalAverage) {
      check('elecDnDay', usage.elecDnDay)
      check('elecDnNight', usage.elecDnNight)
    }
  } else if (meterType === 'smart') {
    checkRate('elecSmartDayRate', currentRates.elecSmartDayRate)
    checkRate('elecSmartNightRate', currentRates.elecSmartNightRate)
    checkRate('elecSmartPeakRate', currentRates.elecSmartPeakRate)
    check('elecSmartStanding', currentRates.elecSmartStanding)
    if (!useNationalAverage) {
      check('elecSmartDay', usage.elecSmartDay)
      check('elecSmartNight', usage.elecSmartNight)
      check('elecSmartPeak', usage.elecSmartPeak)
    }
  }

  if (fuelType === 'dual') {
    checkRate('gasRate', currentRates.gasRate)
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
  const captureRef = useRef(null)

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
  const hasRateErrors = Object.keys(errors).some(k => RATE_FIELD_KEYS.has(k))

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Savings Calculator</h1>
        <p className={styles.subtitle}>See how much you could save on your energy bills.</p>
      </header>

      <div className={styles.content}>
        <div className={styles.leftCol}>
          <SettingsPanel
            settings={yunoSettings}
            onChange={setYunoSettings}
            open={settingsOpen}
            onToggle={() => setSettingsOpen(o => !o)}
          />

          <motion.div 
            className={styles.card}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
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

            <AnimatePresence>
              {hasErrors && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className={styles.errorBanner}
                >
                  <AlertCircle size={20} />
                  <span>
                    {hasRateErrors
                      ? 'Please enter your current rates to calculate savings.'
                      : 'Please fill in all highlighted fields with valid positive numbers.'}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className={styles.actions}>
              <button className={styles.btnCalculate} onClick={handleCalculate}>
                Calculate My Savings
              </button>
              <button className={styles.btnReset} onClick={handleReset}>
                Clear
              </button>
            </div>
          </motion.div>
        </div>

        <div className={styles.rightCol}>
          <AnimatePresence mode="wait">
            {results ? (
              <motion.div 
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
                ref={resultsRef}
              >
                <div ref={captureRef}>
                  <ResultsDisplay
                    results={results}
                    config={config}
                    isMonthly={isMonthly}
                    onToggleMonthly={() => setIsMonthly(m => !m)}
                  />
                </div>
                {results.netSavings > 0 && (
                  <SavingsCard captureRef={captureRef} results={results} />
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={styles.card}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: 'var(--text-muted)', textAlign: 'center', height: '100%' }}
              >
                <p>Fill in the details on the left to see your potential savings.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <footer className={styles.footer}>
        <p>
          These calculations are estimates based on the figures provided. Actual savings may vary
          depending on usage, taxes, VAT, and PSO levies.
        </p>
        <p className={styles.footerNotice}>No personal data is collected or stored by this tool.</p>
      </footer>
    </div>
  )
}
