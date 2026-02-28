import clsx from 'clsx'

export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-gray-100 bg-white p-6 shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
