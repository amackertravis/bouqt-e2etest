import * as Bytescale from '@bytescale/sdk'
import { AudioFile, Listing, Order } from '@prisma/client'
import { ForceDownload } from './force-download-listing'

type ListingWithAudioFile = Listing & {
  audioFile: Partial<AudioFile> | null
}

interface ConfirmOrderProps {
  listing: ListingWithAudioFile | null
  order: Order | null
}

export const ConfirmOrder = ({
  listing,
  order,
}: ConfirmOrderProps): JSX.Element | null => {
  if (!order || !listing?.audioFile) {
    return null
  }

  const downloadUrl = getDownloadUrl(listing.audioFile.filePath as string)

  return <ForceDownload order={order} downloadUrl={downloadUrl} />
}

const getDownloadUrl = (filePath: string): string => {
  const accountId = process.env.NEXT_PUBLIC_BYTESCALE_ACCOUNT_ID

  if (!accountId) {
    throw new Error('NEXT_PUBLIC_BYTESCALE_ACCOUNT_ID is not defined')
  }

  return Bytescale.UrlBuilder.url({
    accountId,
    filePath,
  })
}
