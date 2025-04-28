import { Dlmm } from '@/components/dlmm/dlmm'

export default async function DlmmPage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params
  return <Dlmm address={address} />
}
