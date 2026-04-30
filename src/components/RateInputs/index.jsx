import NumberField from '../NumberField'
import styles from './RateInputs.module.css'

function SectionTitle({ children }) {
  return <h3 className={styles.sectionTitle}>{children}</h3>
}

function InputRow({ children }) {
  return <div className={styles.row}>{children}</div>
}

export default function RateInputs({
  meterType,
  fuelType,
  useNationalAverage,
  onUseNationalAverageChange,
  currentRates,
  onRateChange,
  usage,
  onUsageChange,
  errors,
}) {
  function r(key) { return currentRates[key] ?? '' }
  function u(key) { return usage[key] ?? '' }

  return (
    <div>
      {/* Usage toggle */}
      <div className={styles.usageToggle}>
        <p className={styles.kicker}>Usage Inputs</p>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={useNationalAverage}
            onChange={e => onUseNationalAverageChange(e.target.checked)}
            className={styles.checkbox}
          />
          <span>Use national average usage figures</span>
        </label>
        <p className={styles.usageHint}>
          {useNationalAverage
            ? 'National averages are being used. Untick to enter figures from the customer\'s bill.'
            : 'Enter the customer\'s exact annual usage from their bill.'}
        </p>
      </div>

      {/* Electricity section */}
      <div className={styles.inputSection}>
        <SectionTitle>Electricity Details</SectionTitle>

        {meterType === 'standard' && (
          <>
            <InputRow>
              <NumberField
                label="Current Unit Rate (c)"
                id="elec-std-rate"
                value={r('elecStdRate')}
                onChange={v => onRateChange('elecStdRate', v)}
                error={errors.elecStdRate}
              />
              {!useNationalAverage && (
                <NumberField
                  label="Annual Usage (kWh)"
                  id="elec-std-usage"
                  value={u('elecStd')}
                  onChange={v => onUsageChange('elecStd', v)}
                  error={errors.elecStd}
                  step="1"
                />
              )}
            </InputRow>
            <NumberField
              label="Current Annual Standing Charge (€)"
              id="elec-std-standing"
              value={r('elecStdStanding')}
              onChange={v => onRateChange('elecStdStanding', v)}
              error={errors.elecStdStanding}
            />
          </>
        )}

        {meterType === 'daynight' && (
          <>
            <InputRow>
              <NumberField
                label="Current Day Rate (c)"
                id="elec-dn-day-rate"
                value={r('elecDnDayRate')}
                onChange={v => onRateChange('elecDnDayRate', v)}
                error={errors.elecDnDayRate}
              />
              {!useNationalAverage && (
                <NumberField
                  label="Annual Day Usage (kWh)"
                  id="elec-dn-day-usage"
                  value={u('elecDnDay')}
                  onChange={v => onUsageChange('elecDnDay', v)}
                  error={errors.elecDnDay}
                  step="1"
                />
              )}
            </InputRow>
            <InputRow>
              <NumberField
                label="Current Night Rate (c)"
                id="elec-dn-night-rate"
                value={r('elecDnNightRate')}
                onChange={v => onRateChange('elecDnNightRate', v)}
                error={errors.elecDnNightRate}
              />
              {!useNationalAverage && (
                <NumberField
                  label="Annual Night Usage (kWh)"
                  id="elec-dn-night-usage"
                  value={u('elecDnNight')}
                  onChange={v => onUsageChange('elecDnNight', v)}
                  error={errors.elecDnNight}
                  step="1"
                />
              )}
            </InputRow>
            <NumberField
              label="Current Annual Standing Charge (€)"
              id="elec-dn-standing"
              value={r('elecDnStanding')}
              onChange={v => onRateChange('elecDnStanding', v)}
              error={errors.elecDnStanding}
            />
          </>
        )}

        {meterType === 'smart' && (
          <>
            <InputRow>
              <NumberField
                label="Current Day Rate (c)"
                id="elec-smart-day-rate"
                value={r('elecSmartDayRate')}
                onChange={v => onRateChange('elecSmartDayRate', v)}
                error={errors.elecSmartDayRate}
              />
              {!useNationalAverage && (
                <NumberField
                  label="Annual Day Usage (kWh)"
                  id="elec-smart-day-usage"
                  value={u('elecSmartDay')}
                  onChange={v => onUsageChange('elecSmartDay', v)}
                  error={errors.elecSmartDay}
                  step="1"
                />
              )}
            </InputRow>
            <InputRow>
              <NumberField
                label="Current Night Rate (c)"
                id="elec-smart-night-rate"
                value={r('elecSmartNightRate')}
                onChange={v => onRateChange('elecSmartNightRate', v)}
                error={errors.elecSmartNightRate}
              />
              {!useNationalAverage && (
                <NumberField
                  label="Annual Night Usage (kWh)"
                  id="elec-smart-night-usage"
                  value={u('elecSmartNight')}
                  onChange={v => onUsageChange('elecSmartNight', v)}
                  error={errors.elecSmartNight}
                  step="1"
                />
              )}
            </InputRow>
            <InputRow>
              <NumberField
                label="Current Peak Rate (c)"
                id="elec-smart-peak-rate"
                value={r('elecSmartPeakRate')}
                onChange={v => onRateChange('elecSmartPeakRate', v)}
                error={errors.elecSmartPeakRate}
              />
              {!useNationalAverage && (
                <NumberField
                  label="Annual Peak Usage (kWh)"
                  id="elec-smart-peak-usage"
                  value={u('elecSmartPeak')}
                  onChange={v => onUsageChange('elecSmartPeak', v)}
                  error={errors.elecSmartPeak}
                  step="1"
                />
              )}
            </InputRow>
            <NumberField
              label="Current Annual Standing Charge (€)"
              id="elec-smart-standing"
              value={r('elecSmartStanding')}
              onChange={v => onRateChange('elecSmartStanding', v)}
              error={errors.elecSmartStanding}
            />
          </>
        )}
      </div>

      {/* Gas section — only shown for dual fuel */}
      {fuelType === 'dual' && (
        <div className={styles.inputSection}>
          <hr className={styles.divider} />
          <SectionTitle>Gas Details</SectionTitle>
          <InputRow>
            <NumberField
              label="Current Gas Unit Rate (c)"
              id="gas-rate"
              value={r('gasRate')}
              onChange={v => onRateChange('gasRate', v)}
              error={errors.gasRate}
            />
            {!useNationalAverage && (
              <NumberField
                label="Annual Gas Usage (kWh)"
                id="gas-usage"
                value={u('gas')}
                onChange={v => onUsageChange('gas', v)}
                error={errors.gas}
                step="1"
              />
            )}
          </InputRow>
          <NumberField
            label="Current Annual Standing Charge (€)"
            id="gas-standing"
            value={r('gasStanding')}
            onChange={v => onRateChange('gasStanding', v)}
            error={errors.gasStanding}
          />
        </div>
      )}
    </div>
  )
}
