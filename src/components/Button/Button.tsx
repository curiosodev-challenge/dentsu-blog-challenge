import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './Button.module.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  fullWidth?: boolean
  iconLeft?: ReactNode
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  iconLeft,
  className,
  type = 'button',
  children,
  ...buttonProps
}: ButtonProps) {
  const classes = [
    styles.button,
    variant === 'secondary' ? styles.secondary : styles.primary,
    fullWidth ? styles.fullWidth : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={classes} {...buttonProps}>
      {iconLeft && <span className={styles.icon}>{iconLeft}</span>}
      <span>{children}</span>
    </button>
  )
}
