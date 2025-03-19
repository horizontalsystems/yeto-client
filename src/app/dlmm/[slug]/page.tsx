import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { TvlChart } from '@/components/chart/tvl-chart'
import { SwapVolumeChart } from '@/components/chart/swap-volume-chart'
import { toAmount, toPercent, truncate } from '@/lib/utils'

export default async function Dlmm({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const res = await fetch(`${process.env.NEXT_SERVER_API_URL}/clmm-api/pair/${slug}`, {
    headers: {
      Referer: `${process.env.NEXT_SERVER_API_URL}/dlmm/${slug}`
    }
  })

  if (!res.ok) {
    return 'There was an error'
  }

  const pair = await res.json()
  const [base, quote] = pair.name.split('-')

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
            <BreadcrumbPage>{pair.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-1 flex-col gap-4 pt-0">
        <div className="bg-card w-full rounded-xl p-6 pb-4">
          <div className="flex flex-row justify-between pb-6">
            <div className="text-foreground text-2xl uppercase">
              {base} / {quote}
            </div>
            <Link href="/dlmm/create">
              <Button variant="light" className="cursor-pointer">
                <Plus /> Add liquidity
              </Button>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4">
            <div>
              <div className="flex flex-col border-t py-2">
                <span className="text-muted-foreground text-sm">Total Value Locked</span>
                <span className="text-foreground font-semibold">{toAmount(pair.liquidity)}</span>
              </div>
              <div className="border-t py-2">
                <div>
                  <span className="text-muted-foreground text-sm">Bin Step</span>
                  <span className="ps-2 text-sm text-white">{pair.bin_step}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">Base</span>
                  <span className="ps-2 text-sm text-white">{toPercent(pair.base_fee_percentage)}</span>
                </div>
              </div>
            </div>
            <div>
              <div className="flex flex-col border-t py-2">
                <span className="text-muted-foreground text-sm">24H Fee/TVL</span>
                <span className="text-foreground font-semibold">{toPercent(pair.fee_tvl_ratio.hour_24)}</span>
              </div>
              <div className="border-t py-2">
                <div>
                  <span className="text-muted-foreground text-sm">Max Fee</span>
                  <span className="ps-2 text-sm text-white">{toPercent(pair.max_fee_percentage)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">Protocol Fee</span>
                  <span className="ps-2 text-sm text-white">{toPercent(pair.protocol_fee_percentage)}</span>
                </div>
              </div>
            </div>
            <div>
              <div className="flex flex-col border-t py-2">
                <span className="text-muted-foreground text-sm">Allocation {base}</span>
                <span className="text-foreground font-semibold">{toAmount(pair.reserve_x_amount)}</span>
              </div>
              <div className="border-t py-2">
                <div>
                  <span className="text-muted-foreground text-sm">Dynamic Fee</span>
                  <span className="ps-2 text-sm text-white">0.0023%</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">24H Fee</span>
                  <span className="ps-2 text-sm text-white">{toAmount(pair.fees_24h)}</span>
                </div>
              </div>
            </div>
            <div>
              <div className="flex flex-col border-t py-2">
                <span className="text-muted-foreground text-sm">Allocation {quote}</span>
                <span className="text-foreground font-semibold">{toAmount(pair.reserve_y_amount)}</span>
              </div>
              <div className="border-t py-2">
                <div>
                  <span className="text-muted-foreground text-sm">{base}</span>
                  <span className="ps-2 text-sm text-white">{truncate(pair.mint_x)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">{quote}</span>
                  <span className="ps-2 text-sm text-white">{truncate(pair.mint_y)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid auto-rows-min gap-4 md:grid-cols-2">
          <div className="bg-card aspect-5/2 rounded-xl p-6">
            <div className="flex justify-between">
              <div>
                <div>Total Value Locked</div>
                <div>{toAmount(pair.liquidity)}</div>
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
          <div className="bg-card aspect-5/2 rounded-xl">
            <div className="bg-card aspect-5/2 rounded-xl p-6">
              <div className="flex justify-between">
                <div>
                  <div>Swap Volume</div>
                  <div>{pair.cumulative_trade_volume}</div>
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
              <SwapVolumeChart />
            </div>
          </div>
        </div>
        <div className="bg-card min-h-[100vh] flex-1 rounded-xl p-6 md:min-h-min">Transactions</div>
      </div>
    </div>
  )
}
