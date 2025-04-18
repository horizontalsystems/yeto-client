import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { DlmmWithdraw } from '@/components/withdraw/dlmm-withdraw'

export default async function Dlmm({ params }: { params: Promise<{ slug: string; positionAddress: string }> }) {
  const { slug, positionAddress } = await params

  return (
    <Dialog open>
      <DialogContent className="w-full sm:min-w-8/12">
        <VisuallyHidden>
          <DialogTitle>Withdraw</DialogTitle>
        </VisuallyHidden>
        <DlmmWithdraw poolAddress={slug} positionAddress={positionAddress} />
      </DialogContent>
    </Dialog>
  )
}
