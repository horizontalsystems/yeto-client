import { Skeleton } from '@/components/ui/skeleton'

export function DlmmWithdrawSkeleton() {
  return (
    <div className="mx-auto w-full p-6">
      <Skeleton className="h-5 w-30" />

      <Skeleton className="mt-2 h-4 w-1/3" />
      <div className="mt-4 flex space-x-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>

      <div className="mt-6">
        <Skeleton className="mt-2 h-4 w-30" />
        <Skeleton className="mt-2 h-20 w-full" />
      </div>

      <Skeleton className="mt-6 h-8 w-20 rounded-full" />
    </div>
  )
}
