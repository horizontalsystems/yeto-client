'use client'

import { Bar, BarChart, CartesianGrid } from 'recharts'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SelectCoin } from '@/components/select-coin'
import { SelectCoinAutocomplete } from '@/components/select-coin-autocomplete'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ChartContainer } from '@/components/ui/chart'
import { Slider } from '@/components/ui/slider'

export function PoolCreation() {
  const spotConfig = {
    spotA: { color: '#BE46FF' },
    spotB: { color: '#2848FF' }
  }

  const spotRangeA = Array(20).fill({ spotA: 40, spotB: 0 })
  const spotRangeB = Array(20).fill({ spotA: 0, spotB: 40 })
  const spotData = [...spotRangeA, { spotA: 20, spotB: 20 }, ...spotRangeB]

  const rangeConfig = {
    range: { color: '#808085' },
    rest: { color: '#4B4B4B' }
  }

  const rangeData = [
    ...Array(5).fill({ rest: 0, range: 35 }),
    ...Array(5).fill({ rest: 0, range: 37 }),
    ...Array(5).fill({ rest: 0, range: 33 }),
    ...Array(5).fill({ rest: 40, range: 0 }),
    ...Array(5).fill({ rest: 35, range: 0 }),
    ...Array(5).fill({ rest: 40, range: 0 }),
    ...Array(5).fill({ rest: 0, range: 32 }),
    ...Array(5).fill({ rest: 0, range: 37 }),
    ...Array(5).fill({ rest: 0, range: 35 })
  ]

  return (
    <Dialog open>
      <Tabs>
        <DialogContent className="w-full sm:min-w-2xl" aria-describedby="Pool creation">
          <DialogHeader className="border-b">
            <TabsList>
              <div className="flex flex-row">
                <TabsTrigger value="pool">
                  <DialogTitle className="p-6">1. Pool Creation</DialogTitle>
                </TabsTrigger>
                <TabsTrigger value="liquidity">
                  <DialogTitle className="p-6">2. Adding liquidity</DialogTitle>
                </TabsTrigger>
              </div>
            </TabsList>
          </DialogHeader>
          <TabsContent value="pool">
            <form className="p-6">
              <div className="mb-6 grid gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="base" className="mb-2">
                    Base Token
                  </Label>
                  <SelectCoinAutocomplete />
                </div>
                <div>
                  <Label htmlFor="quote" className="mb-2">
                    Quote Token
                  </Label>
                  <SelectCoinAutocomplete />
                </div>
                <div>
                  <Label htmlFor="base_fee" className="mb-2">
                    Base Fee
                  </Label>
                  <SelectCoin items={['0.01%', '0.02%', '0.03%', '0.04%', '0.05%', '0.06%']} />
                </div>
                <div>
                  <Label htmlFor="bit_step" className="mb-2">
                    Bin Step
                  </Label>
                  <SelectCoin items={['1', '5', '8', '10', '15', '25']} />
                </div>
              </div>
              <div className="mb-6">
                <Label htmlFor="input_price" className="mb-2">
                  Input price
                </Label>
                <Input type="number" id="input_price" defaultValue="0.0" />
              </div>
              <Button variant="light" type="submit">
                Create Pool
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="liquidity">
            <form className="p-6">
              <div className="mb-6 grid gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="base_amount" className="mb-2">
                    Base amount
                  </Label>
                  <Input type="number" id="base_amount" defaultValue="0.0" />
                </div>
                <div>
                  <Label htmlFor="quote_amount" className="mb-2">
                    Quote amount
                  </Label>
                  <Input type="number" id="quote_amount" defaultValue="0.0" />
                </div>
              </div>
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div className="">Set Price Range</div>
                  <div className="flex justify-between gap-2">
                    <Button variant="outline">Reset</Button>
                    <SelectCoin items={['Spot', 'Curve', 'Bid-Ask']} />
                    <ToggleGroup type="single" variant="outline">
                      <ToggleGroupItem value="sol" className="px-3">
                        SOl
                      </ToggleGroupItem>
                      <ToggleGroupItem value="usdc" className="px-3">
                        USDC
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                </div>
                <div className="my-4">
                  <ChartContainer config={spotConfig} className="h-20 w-full">
                    <BarChart accessibilityLayer data={spotData}>
                      <CartesianGrid vertical={false} />
                      <Bar isAnimationActive={false} dataKey="spotA" stackId="a" fill="var(--color-spotA)" radius={4} />
                      <Bar isAnimationActive={false} dataKey="spotB" stackId="a" fill="var(--color-spotB)" radius={4} />
                    </BarChart>
                  </ChartContainer>
                  <Slider value={[50]} max={100} step={1} className="w-full" />
                </div>

                <div className="my-4">
                  <ChartContainer config={rangeConfig} className="h-20 w-full">
                    <BarChart accessibilityLayer data={rangeData}>
                      <CartesianGrid vertical={false} />
                      <Bar isAnimationActive={false} dataKey="range" stackId="a" fill="var(--color-range)" radius={4} />
                      <Bar isAnimationActive={false} dataKey="rest" stackId="a" fill="var(--color-rest)" radius={4} />
                    </BarChart>
                  </ChartContainer>
                  <Slider value={[34, 66]} max={100} step={1} className="w-full" />
                </div>
              </div>
              <div className="mb-6 flex gap-2">
                <div className="w-full md:w-8/12">
                  <Label className="mb-2">Min Price</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div className="w-full md:w-8/12">
                  <Label className="mb-2">Max Price</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div className="w-full md:w-4/12">
                  <Label className="mb-2">Bins</Label>
                  <Input type="text" placeholder="1" />
                </div>
              </div>
              <Button variant="light" type="submit">
                Add Liquidity
              </Button>
            </form>
          </TabsContent>
        </DialogContent>
      </Tabs>
    </Dialog>
  )
}
