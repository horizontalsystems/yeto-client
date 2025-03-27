import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Info } from 'lucide-react'

type SelectProps = {
  items: string[]
  placeholder?: string
  onChange: (value: number) => void
  infoText?: string
  defaultValue?: string,
  disabled?: boolean
}

export function SelectNumber({ items, placeholder, onChange, infoText, defaultValue, disabled }: SelectProps) {
  return (
    <Select onValueChange={(value: string) => onChange(parseFloat(value))} defaultValue={defaultValue} disabled={disabled}>
      <SelectTrigger className="w-full">
        <div className="relative flex grow-1 justify-between">
          <div className="text-muted-foreground flex items-center">
            {placeholder} {infoText && <Info className="text-muted-foreground ms-2" />}
          </div>
          <div className="ps-5">
            <SelectValue />
          </div>
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {items.map((item, i) => (
            <SelectItem key={i} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
