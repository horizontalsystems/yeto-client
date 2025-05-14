import { ExternalLink } from 'lucide-react'

export function linkToSolscan(signature: string) {
  return (
    <div className="flex flex-row items-center">
      <span>Solscan :</span>
      <a className="text-blue-400" target="_blank" href={`https://solscan.io/tx/${signature}`}>
        <ExternalLink size="18" />
      </a>
    </div>
  )
}
