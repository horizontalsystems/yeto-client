import Link from 'next/link'
import { DlmmNew } from '@/components/dlmm/new/dlmm-new'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

export default async function DlmmNewPage({ searchParams }: { searchParams: Promise<{ pool?: string }> }) {
  const poolAddress = (await searchParams).pool

  return (
    <div className="mx-auto max-w-5xl px-2 sm:px-6 lg:px-8">
      <Breadcrumb className="mt-10 mb-4">
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink asChild>
              <Link href="/">Pools</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>Pool creation</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="rounded-lg border">
        <DlmmNew poolAddress={poolAddress} />
      </div>
    </div>
  )
}
