export const dynamic = 'force-static'

export async function GET() {
  const result = await fetch('https://search.jup.ag/multi_search', {
    method: 'POST',
    body: JSON.stringify({
      searches: [
        {
          query_by: 'symbol,name,address',
          sort_by: 'daily_volume:desc',
          per_page: 250,
          highlight_full_fields: 'symbol,name,address',
          collection: 'tokens',
          q: '*',
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

      const items = results.hits.map(item => {
        return {
          address: item.document.address,
          name: item.document.name,
          symbol: item.document.symbol,
          logo: item.document.logoURI
        }
      })

      return { items }
    })

  return Response.json(result)
}
