import clsx from 'clsx'

const variants = {
  primary: 'bg-accent text-white hover:bg-accent-hover shadow-sm shadow-accent/25',
  secondary: 'bg-muted-bg text-foreground hover:bg-border',
  danger: 'bg-danger text-white hover:bg-danger-hover shadow-sm shadow-danger/25',
  success: 'bg-success text-white hover:bg-success-hover shadow-sm shadow-success/25',
  ghost: 'text-muted hover:bg-muted-bg hover:text-foreground',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-sm',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  ...props
}) {
  return (
    <button
      disabled={disabled}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
