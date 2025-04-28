import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { DlmmWithdraw } from '@/components/dlmm/withdraw/dlmm-withdraw'

export default async function DlmmWithdrawModal({
  params
}: {
  params: Promise<{ address: string; position_address: string }>
}) {
  const { address, position_address } = await params

  return (
    <Dialog open>
      <DialogContent className="w-full sm:min-w-8/12">
        <VisuallyHidden>
          <DialogTitle>Withdraw</DialogTitle>
        </VisuallyHidden>
        <DlmmWithdraw poolAddress={address} positionAddress={position_address} />
      </DialogContent>
    </Dialog>
  )
}
