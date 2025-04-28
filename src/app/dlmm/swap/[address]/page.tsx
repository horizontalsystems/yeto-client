import Link from 'next/link'
import { DlmmSwap } from '@/components/dlmm/swap/dlmm-swap'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

export default async function DlmmSwapPage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params
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
            <BreadcrumbPage>Swap</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="rounded-lg border">
        <DlmmSwap poolAddress={address} />
      </div>
    </div>
  )
}
