import Link from 'next/link'
import { TvlChart } from '@/components/chart/tvl-chart'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Plus, Upload } from 'lucide-react'
import { ButtonClaim } from '@/components/button-claim'

export default async function Withdraw({ params }: { params: Promise<{ slug: string; positionAddress: string }> }) {
  const { slug, positionAddress } = await params

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
          <div className="bg-card rounded-xl p-5">
            <div className="flex justify-between">
              <div>
                <div>Price Range</div>
                <div>$926,497,170.32</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm">1D</Button>
                <Button size="sm" variant="outline" className="text-white">
                  30D
                </Button>
                <Button size="sm" variant="outline" className="text-white">
                  90D
                </Button>
                <Button size="sm" variant="outline" className="text-white">
                  All
                </Button>
              </div>
            </div>
            <TvlChart />
          </div>
          <div className="bg-card rounded-xl p-5">
            <div className="flex gap-2">
              <ButtonClaim poolAddress={slug} positionAddress={positionAddress} />
              <Button variant="light" className="cursor-pointer">
                <Plus /> Add liquidity
              </Button>
              <Link href={`/dlmm/${slug}/${positionAddress}/withdraw`}>
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
