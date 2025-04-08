import { DlmmSwap } from '@/components/swap/dlmm-swap'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

export default async function Dlmm({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  return (
    <Dialog open>
      <DialogContent className="w-full sm:min-w-8/12">
        <VisuallyHidden>
          <DialogTitle>Swap</DialogTitle>
        </VisuallyHidden>
        <DlmmSwap poolAddress={slug} />
      </DialogContent>
    </Dialog>
  )
}
