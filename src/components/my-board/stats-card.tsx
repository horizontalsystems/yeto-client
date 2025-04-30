'use client'

interface StatsCardProps {
  unclaimedFee: number
  impermanentLoss: number
  averageApr: number
  aprChange: number
}

export function StatsCard({ 
  unclaimedFee = 0,
  impermanentLoss = 0,
  averageApr = 0,
  aprChange = 0
}: StatsCardProps) {
  return (
    <div className="rounded-[32px] p-2 flex flex-col gap-3">
      <div>
        <div className="text-gray text-l mb-1">Unclaimed Fee</div>
        <div className="text-leah text-[24px] leading-[30px] font-medium">${unclaimedFee.toFixed(2)}</div>
      </div>

      <div className="border-t border-bran pt-2">
        <div className="text-gray text-l mb-1">Impermanent Loss</div>
        <div className="text-leah text-[24px] leading-[30px] font-medium">${impermanentLoss.toFixed(2)}</div>
      </div>

      <div className="border-t border-bran pt-2">
        <div className="text-[#71767B] text-l mb-1">Average APR (24H)</div>
        <div className="flex items-baseline gap-2">
          <span className="text-leah text-[24px] leading-[30px] font-medium">{averageApr}%</span>
          <span className="text-[16px] leading-[20px] text-[#FF3B3B]">{aprChange}%</span>
        </div>
      </div>
    </div>
  )
} 