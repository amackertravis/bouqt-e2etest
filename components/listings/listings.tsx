import { SearchParams } from '@/lib/types'
import { Suspense } from 'react'
import { ListingsFallback } from './listings.fallback'
import { ListingsServer } from './listings.server'

export function Listings({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="mx-auto w-full">
      <h2 className="sr-only">Listings</h2>
      <Suspense fallback={<ListingsFallback />}>
        <ListingsServer searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
