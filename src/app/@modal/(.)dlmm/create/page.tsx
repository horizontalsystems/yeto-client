import { DlmmFormTabs } from '@/components/dlmm/dlmm-form-tabs'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

export default async function Page({ searchParams }: { searchParams: Promise<{ pool?: string }> }) {
  const poolAddress = (await searchParams).pool

  return (
    <Dialog open>
      <DialogContent className="w-full sm:min-w-8/12">
        <VisuallyHidden>
          <DialogTitle>Pool creation</DialogTitle>
        </VisuallyHidden>
        <DlmmFormTabs poolAddress={poolAddress} />
      </DialogContent>
    </Dialog>
  )
}
