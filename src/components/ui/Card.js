import clsx from 'clsx'

export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200',
        hover && 'hover:shadow-md hover:border-border/80 hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
