import Link from 'next/link'
import { DlmmWithdraw } from '@/components/dlmm/withdraw/dlmm-withdraw'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

export default async function DlmmWithdrawPage({
  params
}: {
  params: Promise<{ address: string; position_address: string }>
}) {
  const { address, position_address } = await params

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
            <BreadcrumbPage>Withdraw</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="rounded-lg border">
        <DlmmWithdraw poolAddress={address} positionAddress={position_address} />
      </div>
    </div>
  )
}
