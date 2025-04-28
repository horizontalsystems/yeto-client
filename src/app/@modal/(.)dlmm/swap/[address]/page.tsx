import { DlmmSwap } from '@/components/dlmm/swap/dlmm-swap'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

export default async function DlmmSwapModal({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params

  return (
    <Dialog open>
      <DialogContent className="w-full sm:min-w-8/12">
        <VisuallyHidden>
          <DialogTitle>Swap</DialogTitle>
        </VisuallyHidden>
        <DlmmSwap poolAddress={address} />
      </DialogContent>
    </Dialog>
  )
}
