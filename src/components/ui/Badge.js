import clsx from 'clsx'

export default function Badge({ children, className = '' }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium',
        className
      )}
    >
      {children}
    </span>
  )
}
