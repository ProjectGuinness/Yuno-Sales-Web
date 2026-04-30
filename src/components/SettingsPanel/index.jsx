import NumberField from '../NumberField'
import styles from './SettingsPanel.module.css'

export default function SettingsPanel({ settings, onChange, open, onToggle }) {
  function set(key, value) {
    const parsed = value === '' ? value : parseFloat(value)
    onChange({ ...settings, [key]: isNaN(parsed) ? value : parsed })
  }

  return (
    <div className={`${styles.panel} ${open ? styles.panelOpen : ''}`}>
      <button
        className={styles.header}
        onClick={onToggle}
        aria-expanded={open}
        type="button"
      >
        <div className={styles.headerLeft}>
          <svg className={styles.icon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <div>
            <span className={styles.badge}>REP ONLY</span>
            <span className={styles.title}>Plan Rates</span>
          </div>
        </div>
        <svg
          className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {!open && (
        <p className={styles.closedHint}>Set the current plan rates before heading out.</p>
      )}

      {open && (
        <div className={styles.content}>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionDot} style={{ background: '#f59e0b' }} />
              Gas
            </h3>
            <div className={styles.row}>
              <NumberField
                label="Unit Rate (c)"
                id="yuno-gas-rate"
                value={settings.gasRate}
                onChange={v => set('gasRate', v)}
              />
              <NumberField
                label="Annual Standing Charge (€)"
                id="yuno-gas-standing"
                value={settings.gasStanding}
                onChange={v => set('gasStanding', v)}
              />
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionDot} style={{ background: '#3b82f6' }} />
              Electricity — Standard 24hr
            </h3>
            <div className={styles.row}>
              <NumberField
                label="Unit Rate (c)"
                id="yuno-elec-std-rate"
                value={settings.elecStdRate}
                onChange={v => set('elecStdRate', v)}
              />
              <NumberField
                label="Standing Charge (€)"
                id="yuno-elec-std-standing"
                value={settings.elecStdStanding}
                onChange={v => set('elecStdStanding', v)}
              />
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionDot} style={{ background: '#8b5cf6' }} />
              Electricity — Day / Night
            </h3>
            <div className={styles.row}>
              <NumberField
                label="Day Rate (c)"
                id="yuno-elec-dn-day"
                value={settings.elecDnDayRate}
                onChange={v => set('elecDnDayRate', v)}
              />
              <NumberField
                label="Night Rate (c)"
                id="yuno-elec-dn-night"
                value={settings.elecDnNightRate}
                onChange={v => set('elecDnNightRate', v)}
              />
              <NumberField
                label="Standing Charge (€)"
                id="yuno-elec-dn-standing"
                value={settings.elecDnStanding}
                onChange={v => set('elecDnStanding', v)}
              />
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionDot} style={{ background: '#00A651' }} />
              Electricity — Smart (Day / Night / Peak)
            </h3>
            <div className={styles.row}>
              <NumberField
                label="Day Rate (c)"
                id="yuno-elec-smart-day"
                value={settings.elecSmartDayRate}
                onChange={v => set('elecSmartDayRate', v)}
              />
              <NumberField
                label="Night Rate (c)"
                id="yuno-elec-smart-night"
                value={settings.elecSmartNightRate}
                onChange={v => set('elecSmartNightRate', v)}
              />
              <NumberField
                label="Peak Rate (c)"
                id="yuno-elec-smart-peak"
                value={settings.elecSmartPeakRate}
                onChange={v => set('elecSmartPeakRate', v)}
              />
            </div>
            <div className={styles.row}>
              <NumberField
                label="Standing Charge (€)"
                id="yuno-elec-smart-standing"
                value={settings.elecSmartStanding}
                onChange={v => set('elecSmartStanding', v)}
              />
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionDot} style={{ background: '#f59e0b' }} />
              Cashback Offers
            </h3>
            <div className={styles.row}>
              <NumberField
                label="Electricity Only (any meter) (€)"
                id="yuno-cashback-elec-only"
                value={settings.elecOnlyCashback}
                onChange={v => set('elecOnlyCashback', v)}
              />
              <NumberField
                label="Dual Fuel — Standard / D-N (€)"
                id="yuno-cashback-dual-std"
                value={settings.dualFuelCashback}
                onChange={v => set('dualFuelCashback', v)}
              />
              <NumberField
                label="Dual Fuel — Smart (€)"
                id="yuno-cashback-dual-smart"
                value={settings.dualFuelSmartCashback}
                onChange={v => set('dualFuelSmartCashback', v)}
              />
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
