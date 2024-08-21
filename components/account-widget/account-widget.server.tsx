import { auth, CustomSession } from '@/lib/auth'
import { SearchParams } from '@/lib/types'
import { redirect } from 'next/navigation'
import { CreateListing } from '../create-listing/create-listing'
import { AccountWidgetDropdown } from './account-widget-dropdown'
import { ArtistRegistrationAction } from './artist-registration-action'

export async function AccountWidgetServer({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const session = (await auth()) as CustomSession | null
  if (!session?.user) redirect('/api/auth/signin')

  const isArtist = ['ADMIN', 'ARTIST'].includes(session.user.role)

  return (
    <div className="flex items-center gap-4">
      {isArtist ? (
        <CreateListing searchParams={searchParams} />
      ) : (
        <ArtistRegistrationAction />
      )}
      <AccountWidgetDropdown user={session?.user} />
    </div>
  )
}
