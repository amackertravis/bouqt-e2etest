import type { Listing } from '@prisma/client'
import FormSubmitButton from '../form-submit'
import buyListingAction from './buy-listing.action'

export function BuyListing({ listing }: { listing: Listing }) {
  return (
    <form
      action={buyListingAction}
      className="relative flex h-full w-40 items-center"
    >
      <input type="hidden" name="id" value={listing.id} />
      <FormSubmitButton
        className="flex h-full w-full items-center justify-center rounded-none p-4 text-base font-normal"
        label="Buy"
        pendingLabel="Buying..."
        variant="ghost"
      />
    </form>
  )
}
