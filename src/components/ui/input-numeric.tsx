import * as React from 'react'

import { NumericFormat } from 'react-number-format'
import { cn } from '@/lib/utils'

type NumberInputProps = React.ComponentProps<'input'> & {
  value?: number | string | undefined
  onChangeValue?: (amount: number | undefined) => void
}

function InputNumeric({ className, value, onChangeValue, ...props }: NumberInputProps) {
  return (
    <NumericFormat
      value={value}
      thousandSeparator=","
      decimalSeparator="."
      placeholder={props.placeholder || '0.0'}
      onValueChange={v => onChangeValue?.(v.floatValue)}
      onChange={props.onChange}
      className={cn(
        'border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className
      )}
      {...{ disabled: props.disabled, required: props.required }}
    />
  )
}

export { InputNumeric }
