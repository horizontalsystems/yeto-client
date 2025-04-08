import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Skeleton } from '@/components/ui/skeleton'

export function DlmmPageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
      <Breadcrumb className="mt-10 mb-4">
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink asChild>
              <Link href="/">Pools</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <Skeleton className="mt-1 h-4 w-20" />
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-1 flex-col gap-4 pt-0">
        <div className="bg-card w-full rounded-xl p-6 pb-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <div className="flex space-x-3">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="bg-card rounded-xl p-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="mt-4 h-64 w-full rounded-md" />
          </div>
          <div className="bg-card rounded-xl p-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="mt-4 h-64 w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}
