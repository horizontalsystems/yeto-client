'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export function SearchInput({ onChangeValue }: { onChangeValue: (text: string) => void }) {
  return (
    <div className="relative flex grow-1">
      <Search className="absolute inset-y-2 left-0 ms-3" size={20} color="#4B4B4B" />
      <Input name="query" placeholder="Search Pools" className="ps-10" onChange={e => onChangeValue(e.target.value)} />
    </div>
  )
}
