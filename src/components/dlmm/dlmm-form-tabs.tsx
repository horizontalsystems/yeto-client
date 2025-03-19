import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DlmmCreatePool } from '@/components/dlmm/dlmm-create-pool'
import { DlmmAddLiquidity } from '@/components/dlmm/dlmm-add-liquidity'

export function DlmmFormTabs() {
  return (
    <Tabs defaultValue="pool" className="">
      <TabsList>
        <div className="flex flex-row border-b">
          <TabsTrigger value="pool" className="p-6">
            1. Pool Creation
          </TabsTrigger>
          <TabsTrigger value="liquidity" className="p-6">
            2. Adding liquidity
          </TabsTrigger>
        </div>
      </TabsList>
      <TabsContent value="pool">
        <DlmmCreatePool />
      </TabsContent>
      <TabsContent value="liquidity">
        <DlmmAddLiquidity />
      </TabsContent>
    </Tabs>
  )
}
