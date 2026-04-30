import styles from './CustomerConfig.module.css'

function SegmentedRadio({ name, options, value, onChange }) {
  return (
    <div className={styles.segmented}>
      {options.map(opt => (
        <label
          key={opt.value}
          className={`${styles.segment} ${value === opt.value ? styles.segmentActive : ''}`}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
          />
          {opt.label}
        </label>
      ))}
    </div>
  )
}

function Toggle({ id, checked, onChange }) {
  return (
    <label className={styles.toggle} htmlFor={id}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className={styles.toggleInput}
      />
      <span className={`${styles.toggleTrack} ${checked ? styles.toggleTrackOn : ''}`}>
        <span className={styles.toggleThumb} />
      </span>
    </label>
  )
}

const FUEL_OPTIONS = [
  { value: 'single', label: 'Electricity Only' },
  { value: 'dual', label: 'Dual Fuel' },
]

const METER_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'daynight', label: 'Day / Night' },
  { value: 'smart', label: 'Smart' },
]

export default function CustomerConfig({ config, onChange }) {
  function set(key, value) {
    onChange({ ...config, [key]: value })
  }

  return (
    <div className={styles.section}>
      <p className={styles.kicker}>Plan Setup</p>

      <div className={styles.field}>
        <label className={styles.fieldLabel}>Fuel Type</label>
        <SegmentedRadio
          name="fuel-type"
          options={FUEL_OPTIONS}
          value={config.fuelType}
          onChange={v => set('fuelType', v)}
        />
      </div>

      <div className={styles.field}>
        <div className={styles.toggleRow}>
          <div>
            <label className={styles.fieldLabel} htmlFor="in-contract">
              Currently In Contract?
            </label>
            <span className={styles.helper}>Adds €50 early exit fee per fuel type</span>
          </div>
          <Toggle id="in-contract" checked={config.inContract} onChange={v => set('inContract', v)} />
        </div>
      </div>

      <div className={`${styles.field} ${styles.fieldLast}`}>
        <label className={styles.fieldLabel}>Electricity Meter Type</label>
        <SegmentedRadio
          name="meter-type"
          options={METER_OPTIONS}
          value={config.meterType}
          onChange={v => set('meterType', v)}
        />
      </div>
    </div>
  )
}
