import { DlmmNew } from '@/components/dlmm/new/dlmm-new'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

export default async function DlmmNewModal({ searchParams }: { searchParams: Promise<{ pool?: string }> }) {
  const poolAddress = (await searchParams).pool

  return (
    <Dialog open>
      <DialogContent className="w-full sm:min-w-8/12">
        <VisuallyHidden>
          <DialogTitle>Pool creation</DialogTitle>
        </VisuallyHidden>
        <DlmmNew poolAddress={poolAddress} />
      </DialogContent>
    </Dialog>
  )
}
