export type ApiCoinItem = {
  address: string
  name: string
  symbol: string
  decimals: number
  logoURI: string
}

export async function getPools(query: string) {
  let apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/v1/dlmm/all_by_groups?page=0&limit=10&sort_key=liquidity&order_by=desc`
  if (query.length) {
    apiUrl += `&q=${encodeURIComponent(query)}`
  }

  const res = await fetch(apiUrl)

  if (!res.ok) {
    throw new Error('Failed to fetch pools')
  }

  const data = await res.json()

  return data.groups
}

export async function getPoolsByAddress(addresses: string[]) {
  if (!addresses.length) {
    return []
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/dlmm/by_address?addresses=${addresses.join(',')}`)

  if (!res.ok) {
    throw new Error('Failed to fetch pools')
  }

  return await res.json()
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
          decimals: item.document.decimals,
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
      coinList.unshift({
        address: '7KB5DZ2KptXSUzU5B9oyKGqg7kx68ESMa4p7anN1khUY',
        name: 'Solana Gold',
        symbol: 'GOLDSOL',
        decimals: 6,
        logoURI:
          'https://w7.pngwing.com/pngs/153/594/png-transparent-solana-coin-sign-icon-shiny-golden-symmetric-geometrical-design.png'
      })
      coinList.unshift({
        address: 'BoeHw5peaJ2krA1gf7KpLNCNwurvXZtytpTuEFUbvvC',
        name: 'Bonk token',
        symbol: 'BONK',
        decimals: 5,
        logoURI: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I'
      })
      coinList.unshift({
        address: '2qF61Uh1GTsktNW2Efw7pX2dvoR3i5GCnQAMg6igACk8',
        name: 'USDC',
        symbol: 'USDC',
        decimals: 6,
        logoURI:
          'https://w7.pngwing.com/pngs/153/594/png-transparent-solana-coin-sign-icon-shiny-golden-symmetric-geometrical-design.png'
      })
      return coinList
    })

  return {
    items
  }
}
