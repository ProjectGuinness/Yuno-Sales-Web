import styles from './NumberField.module.css'

export default function NumberField({
  label,
  id,
  value = '',
  onChange,
  error = false,
  step = '0.01',
  min = '0',
  placeholder = '',
}) {
  return (
    <div className={`${styles.field} ${error ? styles.hasError : ''}`}>
      <label htmlFor={id}>{label}</label>
      <input
        type="number"
        id={id}
        name={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        step={step}
        min={min}
        placeholder={placeholder}
        inputMode="decimal"
        autoComplete="off"
      />
    </div>
  )
}
