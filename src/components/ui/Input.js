import clsx from 'clsx'

export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <input
        className={clsx(
          'w-full rounded-xl border border-border bg-input-bg px-4 py-3 text-sm text-foreground placeholder-muted outline-none transition-all focus:border-accent focus:bg-card focus:ring-2 focus:ring-accent/20',
          error && 'border-red-300 focus:border-red-500 focus:ring-red-500/20',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
