import { DlmmPage } from '@/components/dlmm/dlmm-page'

export default async function Dlmm({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <DlmmPage address={slug} />
}
