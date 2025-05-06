import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function DlmmListSkeleton({ withSearchInput }: { withSearchInput: boolean }) {
  const items = Array.from({ length: 5 }).map((_, i) => (
    <div key={i} className={cn('flex items-center justify-between p-6', { 'border-t': i !== 0 })}>
      <Skeleton className="h-6 w-1/4" />
      <Skeleton className="h-6 w-1/6" />
      <Skeleton className="h-6 w-1/6" />
      <Skeleton className="h-6 w-1/6" />
    </div>
  ))

  if (withSearchInput) {
    return (
      <div className="mb-10 overflow-hidden rounded-3xl">
        <div className="bg-card flex space-x-2 p-6">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-40 rounded-lg" />
        </div>

        {items}
      </div>
    )
  }

  return items
}
