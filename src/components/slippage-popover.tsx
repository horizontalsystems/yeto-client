import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useState } from "react"

interface SlippagePopoverProps {
  defaultValue?: string
  onChange: (value: string) => void
  title?: string
}

export function SlippagePopover({ 
  defaultValue = "0.5",
  onChange,
  title = "Liquidity Slippage"
}: SlippagePopoverProps) {
  const [slippage, setSlippage] = useState(defaultValue)
  const [customSlippage, setCustomSlippage] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const handleSlippageChange = (value: string) => {
    setSlippage(value)
    setCustomSlippage("")
    onChange(value)
  }

  const handleCustomSlippageChange = (value: string) => {
    setCustomSlippage(value)
    setSlippage(value)
    onChange(value)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          {slippage}%
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 mr-4 bg-background border-border">
        <div className="mb-4">
          <div className="text-lg">{title}</div>
          <div className="mt-2 h-px bg-border -mx-4" />
        </div>
        <div className="flex flex-col gap-4">
          <ToggleGroup 
            type="single" 
            variant="outline" 
            value={slippage} 
            onValueChange={handleSlippageChange}
            className="justify-start gap-2"
          >
            <ToggleGroupItem value="0.1" className="rounded-full px-4 [&:first-child]:rounded-full [&:last-child]:rounded-full">0.1%</ToggleGroupItem>
            <ToggleGroupItem value="0.5" className="rounded-full px-4 [&:first-child]:rounded-full [&:last-child]:rounded-full">0.5%</ToggleGroupItem>
            <ToggleGroupItem value="1.0" className="rounded-full px-4 [&:first-child]:rounded-full [&:last-child]:rounded-full">1.0%</ToggleGroupItem>
            <ToggleGroupItem value="1.5" className="rounded-full px-4 [&:first-child]:rounded-full [&:last-child]:rounded-full">1.5%</ToggleGroupItem>
          </ToggleGroup>
          
          <div>
            <div className="mb-2">Custom</div>
            <Input 
              type="text" 
              placeholder="0.0%" 
              value={customSlippage}
              className="mb-4 placeholder:text-muted-foreground"
              onChange={(e) => handleCustomSlippageChange(e.target.value)}
            />
            <Button 
              variant="secondary" 
              className="w-full bg-muted/80 hover:bg-muted"
              onClick={() => setIsOpen(false)}
            >
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
} 