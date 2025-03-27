'use client'

import { useEffect, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { Command, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { ApiCoinItem, searchCoins } from '@/lib/api'
import { cn } from '@/lib/utils'

const queryClient = new QueryClient()

export type SearchResponse = {
  items: ApiCoinItem[]
}

export type SearchProps = {
  selectedResult?: ApiCoinItem
  onSelectResult: (coin: ApiCoinItem) => void
}

type SelectCoinAutocompleteProps = {
  onSelect: (coin: ApiCoinItem) => void
  placeholder: string
  error?: string
  disabled?: boolean
}

export function SelectCoinAutocomplete({ onSelect, error, placeholder, disabled }: SelectCoinAutocompleteProps) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<ApiCoinItem | undefined>()
  const [triggerFetch, setTriggerFetch] = useState(false)

  const handleSetActive = (coin: ApiCoinItem) => {
    onSelect(coin)
    setSelected(coin)
    setOpen(false)
  }

  useEffect(() => {
    if (open) {
      setTriggerFetch(true)
    }
  }, [open])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className={cn({ 'border-red-400': error })} disabled={disabled}>
        <Button variant="outline" role="combobox" className="w-full justify-start">
          {selected ? (
            <>
              <img src={selected.logoURI} alt="" width="24" height="24" />
              <span>{selected.symbol}</span>
            </>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0" align="start">
        <QueryClientProvider client={queryClient}>
          {triggerFetch && <SelectCoinSearch selectedResult={selected} onSelectResult={handleSetActive} />}
        </QueryClientProvider>
      </PopoverContent>
    </Popover>
  )
}

function SelectCoinSearch({ selectedResult, onSelectResult }: SearchProps) {
  const [queryString, setQueryString] = useState('')
  const [debouncedQueryString] = useDebounce(queryString, 500)

  const fetchCoins = async () => {
    return debouncedQueryString ? searchCoins(debouncedQueryString) : searchCoins('*')
  }

  const { data, isLoading, isError } = useQuery<SearchResponse>({
    queryKey: ['search', debouncedQueryString || 'default'],
    queryFn: fetchCoins,
    staleTime: 1000 * 60 * 5,
    enabled: true
  })

  return (
    <Command shouldFilter={false} className="h-auto w-full">
      <CommandInput value={queryString} onValueChange={setQueryString} placeholder="Search..." />
      <CommandList>
        {isLoading && <div className="p-4 text-sm">Searching...</div>}
        {!isError && !isLoading && !data?.items.length && <div className="p-4 text-sm">No coin found</div>}
        {isError && <div className="p-4 text-sm">Something went wrong</div>}

        {data?.items.map(item => {
          return (
            <CommandItem key={item.address} onSelect={() => onSelectResult(item)} value={item.name}>
              <img src={item.logoURI} alt="" width="24" height="24" /> {item.symbol}
              <Check
                className={cn('ml-auto', selectedResult?.address === item.address ? 'opacity-100' : 'opacity-0')}
              />
            </CommandItem>
          )
        })}
      </CommandList>
    </Command>
  )
}
