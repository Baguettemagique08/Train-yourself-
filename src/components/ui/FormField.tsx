import { cn } from '@/lib/utils'
import type { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react'

interface FieldWrapperProps {
  label?: string
  error?: string
  required?: boolean
  hint?: string
  children: ReactNode
  className?: string
}

export function FieldWrapper({ label, error, required, hint, children, className }: FieldWrapperProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  wrapperClassName?: string
}

export function Input({ label, error, hint, wrapperClassName, className, required, ...props }: InputProps) {
  return (
    <FieldWrapper label={label} error={error} hint={hint} required={required} className={wrapperClassName}>
      <input
        className={cn('form-input', error && 'border-red-400 focus:ring-red-500', className)}
        required={required}
        {...props}
      />
    </FieldWrapper>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  wrapperClassName?: string
  rows?: number
}

export function Textarea({ label, error, hint, wrapperClassName, className, required, rows = 4, ...props }: TextareaProps) {
  return (
    <FieldWrapper label={label} error={error} hint={hint} required={required} className={wrapperClassName}>
      <textarea
        rows={rows}
        className={cn('form-textarea', error && 'border-red-400 focus:ring-red-500', className)}
        required={required}
        {...props}
      />
    </FieldWrapper>
  )
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  wrapperClassName?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export function SelectField({ label, error, hint, wrapperClassName, className, required, options, placeholder, ...props }: SelectFieldProps) {
  return (
    <FieldWrapper label={label} error={error} hint={hint} required={required} className={wrapperClassName}>
      <select
        className={cn('form-select', error && 'border-red-400 focus:ring-red-500', className)}
        required={required}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </FieldWrapper>
  )
}
