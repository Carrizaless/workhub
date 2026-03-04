import clsx from 'clsx'

export default function Select({
  label,
  options = [],
  className = '',
  ...props
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <select
        className={clsx(
          'w-full rounded-xl border border-border bg-input-bg px-4 py-3 text-sm text-foreground outline-none transition-all focus:border-accent focus:bg-card focus:ring-2 focus:ring-accent/20',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
