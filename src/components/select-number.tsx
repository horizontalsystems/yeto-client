import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Info } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

type SelectProps = {
  items: string[] | number[]
  placeholder?: string
  onChange: (value: number) => void
  infoText?: string
  defaultValue?: string
  value?: string
  disabled?: boolean
}

export function SelectNumber({ items, placeholder, onChange, infoText, defaultValue, value, disabled }: SelectProps) {
  return (
    <div className="relative flex w-full items-center rounded-md border border-input bg-background px-3 py-3">
      <div className="flex items-center text-gray text-sm">
        {placeholder}
        {infoText && (
          <Popover>
            <PopoverTrigger>
              <Info className="ms-2 h-4 w-4 cursor-pointer" />
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <p className="text-sm text-gray">{infoText}</p>
            </PopoverContent>
          </Popover>
        )}
      </div>
      <Select
        onValueChange={(val: string) => onChange(parseFloat(val))}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
      >
        <SelectTrigger className="ml-auto h-auto border-0 bg-transparent p-0 shadow-none hover:bg-transparent focus:ring-0">
          <SelectValue>{value}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {items.map((item, i) => (
              <SelectItem key={String(i)} value={String(item)}>
                {item}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
