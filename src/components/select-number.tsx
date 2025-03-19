import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type SelectProps = {
  items: string[]
  placeholder?: string
  onChange: (value: number) => void
}

export function SelectNumber({ items, placeholder = 'Select', onChange }: SelectProps) {
  return (
    <Select onValueChange={(value: string) => onChange(parseFloat(value))}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
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
