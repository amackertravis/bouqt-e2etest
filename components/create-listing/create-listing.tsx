import { Button } from '@/components/ui/button' // Import Shadcn UI button
import { SearchParams } from '@/lib/types'
import createListingAction from './create-listing.action'
import { UploadDropzoneWidget } from './upload-dropzone'

export function CreateListing({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  return (
    <div className="relative flex h-full w-[12ch] items-center">
      <details
        className="absolute w-full bg-background"
        open={searchParams?.success ? searchParams?.success !== 'true' : false}
      >
        <Button asChild variant="outline">
          <summary className="cursor-pointer whitespace-nowrap">
            Create Listing
          </summary>
        </Button>
        <UploadDropzoneWidget onCompleteAction={createListingAction} />
      </details>
    </div>
  )
}
