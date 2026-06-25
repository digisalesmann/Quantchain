import React, { Suspense } from 'react'
import { getAllMarkets } from '../../lib/prices'
import MarketsExplorer from '../../components/market/MarketsExplorer'

export default async function MarketsPage() {
  const markets = await getAllMarkets()
  return (
    <div className="py-10">
      <Suspense>
        <MarketsExplorer markets={markets} />
      </Suspense>
    </div>
  )
}
