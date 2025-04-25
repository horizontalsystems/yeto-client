import { Skeleton } from '@/components/ui/skeleton'

export function PoolListSkeleton({ withSearchInput }: { withSearchInput: boolean }) {
  const items = Array.from({ length: 5 }).map((_, i) => (
    <div key={i} className="flex items-center justify-between border-t p-6">
      <Skeleton className="h-6 w-1/4" />
      <Skeleton className="h-6 w-1/6" />
      <Skeleton className="h-6 w-1/6" />
      <Skeleton className="h-6 w-1/6" />
    </div>
  ))

  if (withSearchInput) {
    return (
      <div className="mb-10 overflow-hidden rounded-3xl border">
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
