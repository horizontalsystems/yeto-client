'use client'

import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'

import { cn } from '@/lib/utils'

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () => (Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max]),
    [value, defaultValue, min, max]
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        'relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col',
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          'relative grow overflow-hidden rounded-full bg-[#4B4B4B] data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5'
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn('absolute bg-gray-500 data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full')}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
        >
          <svg width="22" height="12" viewBox="0 0 22 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" width="21" height="12" rx="6" fill="#F5F5F5"/>
            <rect x="8.5" y="4" width="1" height="4" fill="black"/>
            <rect x="10.5" y="4" width="1" height="4" fill="black"/>
            <rect x="12.5" y="4" width="1" height="4" fill="black"/>
          </svg>
        </SliderPrimitive.Thumb>
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
