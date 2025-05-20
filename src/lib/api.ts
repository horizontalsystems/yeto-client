export type ApiCoinItem = {
  address: string
  name: string
  symbol: string
  decimals: number
  logo_url: string
}

export async function getPools(query: string, page = 0, limit = 20) {
  let apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/v1/dlmm/all_by_groups?page=${page}&limit=${limit}&sort_key=liquidity&order_by=desc`
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

export async function getPoolTransactions(address: string) {
  if (!address) {
    return []
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/transactions/${address}`)

  if (!res.ok) {
    throw new Error('Failed to fetch transactions')
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

      return results.hits.map((item: { document: ApiCoinItem }) => {
        return {
          address: item.document.address,
          name: item.document.name,
          symbol: item.document.symbol,
          decimals: item.document.decimals,
          logo_url: item.document.logo_url
        }
      })
    })

  return {
    items
  }
}
