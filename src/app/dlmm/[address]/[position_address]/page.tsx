import Link from 'next/link'
import { TvlVolumeChart } from '@/components/chart/tvl-volume-chart'
import { Button } from '@/components/ui/button'
import { Plus, Upload } from 'lucide-react'
import { ButtonClaim } from '@/components/button-claim'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

export default async function DlmmPositionPage({
  params
}: {
  params: Promise<{ address: string; position_address: string }>
}) {
  const { address, position_address } = await params

  return (
    <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
      <Breadcrumb className="mt-10 mb-4">
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink asChild>
              <Link href="/my-board">My Board</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>USDC-CPz</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6 flex flex-1 flex-col gap-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-2">
          <TvlVolumeChart />
          <div className="bg-card rounded-xl p-5">
            <div className="flex gap-2">
              <ButtonClaim poolAddress={address} positionAddress={position_address} />
              <Button variant="light" className="cursor-pointer">
                <Plus /> Add liquidity
              </Button>
              <Link href={`/dlmm/${address}/${position_address}/withdraw`}>
                <Button variant="light" className="cursor-pointer">
                  <Upload /> Withdraw
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
