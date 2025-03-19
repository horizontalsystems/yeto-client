import { DlmmFormTabs } from '@/components/dlmm/dlmm-form-tabs'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import Link from 'next/link'

export default function Page() {
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
            <BreadcrumbPage>Pool creation</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="rounded-lg border">
        <DlmmFormTabs />
      </div>
    </div>
  )
}
