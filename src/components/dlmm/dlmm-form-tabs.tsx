import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DlmmCreatePool } from '@/components/dlmm/dlmm-create-pool'
import { DlmmAddLiquidity } from '@/components/dlmm/dlmm-add-liquidity'

export async function DlmmFormTabs({ poolAddress }: { poolAddress?: string }) {
  let activeTab = 'pool'
  let pair = null
  if (poolAddress) {
    activeTab = 'liquidity'
    pair = await fetch(`${process.env.NEXT_SERVER_API_URL}/dev-clmm-api/pair/${poolAddress}`)
      .then(r => r.json())
      .catch(err => {
        console.log(err)
        return null
      })
  }

  return (
    <Tabs defaultValue={activeTab}>
      <TabsList>
        <div className="flex flex-row border-b">
          <TabsTrigger value="pool" className="p-6">
            1. Pool Creation
          </TabsTrigger>
          <TabsTrigger value="liquidity" className="p-6" disabled={!poolAddress}>
            2. Adding liquidity
          </TabsTrigger>
        </div>
      </TabsList>
      <TabsContent value="pool">
        <DlmmCreatePool />
      </TabsContent>
      <TabsContent value="liquidity">
        {pair ? (
          <DlmmAddLiquidity
            address={pair.address}
            name={pair.name}
            mintX={pair.mint_x}
            mintY={pair.mint_y}
            mintXUrl={pair.mint_x_url}
            mintYUrl={pair.mint_y_url}
          />
        ) : (
          'Pair not found'
        )}
      </TabsContent>
    </Tabs>
  )
}
