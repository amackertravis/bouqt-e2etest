import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { SearchParams } from '@/lib/types'
import { Listing, Order } from '@prisma/client'
import { ListingItem } from './listing-item'

type ListingWithAudioFile = Listing & {
  audioFile: {
    id: string
    filePath: string
  } | null
}

const getListings = async (): Promise<ListingWithAudioFile[]> => {
  return await prisma.listing.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      audioFile: {
        select: {
          id: true,
          filePath: true,
        },
      },
    },
  })
}

export async function ListingsServer({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const session = await auth()
  const user = session?.user ? { id: session.user.id } : null

  let order: Order | null = null
  if ('order' in searchParams && 'download' in searchParams) {
    try {
      order = await prisma.order.findUnique({
        where: {
          id: searchParams.order?.toString(),
        },
      })
    } catch (error) {
      console.error('Error getting listing id from order:', error)
    }
  }

  const listings = await getListings()

  return (
    <>
      {listings.map((listing) => (
        <ListingItem
          key={listing.id}
          listing={listing}
          user={user}
          order={order}
        />
      ))}
    </>
  )
}
