export type ApiCoinItem = {
  address: string
  name: string
  symbol: string
  logoURI: string
}

export async function searchCoins(query: string) {
  const items = await fetch('https://search.jup.ag/multi_search', {
    method: 'POST',
    body: JSON.stringify({
      searches: [
        {
          query_by: 'symbol,name,address',
          sort_by: 'daily_volume:desc',
          per_page: 50,
          highlight_full_fields: 'symbol,name,address',
          collection: 'tokens',
          q: query,
          page: 1
        }
      ]
    }),
    next: { revalidate: 3600 }
  })
    .then(res => res.json())
    .then(res => {
      const results = res.results && res.results[0]
      if (!results) {
        return {}
      }

      const coinList = results.hits.map((item: { document: ApiCoinItem }) => {
        return {
          address: item.document.address,
          name: item.document.name,
          symbol: item.document.symbol,
          logoURI: item.document.logoURI
        }
      })
      // Todo: devnet token, for testing only, remove
      coinList.unshift({
        address: 'CpZKSV4mVAM7EjR5vYv5kLBr6cZCG5WyhHCw68SSwtUx',
        name: 'CpZ Devnet',
        symbol: 'CpZ',
        logoURI: 'https://statics.solscan.io/solscan-img/solana_icon.svg'
      })
      coinList.unshift({
        address: 'Zsu2MsbxVta1CiTyJod85j9UBrKLMJNvSeZX4HECbDG',
        name: 'M2',
        symbol: 'M2',
        logoURI: 'https://statics.solscan.io/solscan-img/solana_icon.svg'
      })

      return coinList
    })

  return {
    items
  }
}
