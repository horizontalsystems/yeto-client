'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export function SearchInput() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams)

    if (term) {
      params.set('query', term)
    } else {
      params.delete('query')
    }

    router.replace(`${pathname}?${params.toString()}`)
  }, 300)

  return (
    <div className="relative flex grow-1">
      <Search className="absolute inset-y-2 left-0 ms-3" size={20} color="#4B4B4B" />
      <Input
        name="query"
        placeholder="Search Pools"
        className="ps-10"
        onChange={e => handleSearch(e.target.value)}
        defaultValue={searchParams.get('query')?.toString()}
      />
    </div>
  )
}
