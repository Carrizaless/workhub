import clsx from 'clsx'

export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
