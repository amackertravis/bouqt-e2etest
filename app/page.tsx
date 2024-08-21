import { AccountWidget } from '@/components/account-widget/account-widget'
import { Listings } from '@/components/listings/listings'
import { ModeToggle } from '@/components/theme-toggle'
import prisma from '@/lib/prisma'
import { SearchParams } from '@/lib/types'
import { redirect } from 'next/navigation'
import { Logo } from './logo'

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  if (
    'user_id' in searchParams &&
    'connected_account_id' in searchParams &&
    'onboarding_success' in searchParams
  ) {
    try {
      await prisma.user.update({
        where: { id: searchParams.user_id as string },
        data: {
          role: 'ARTIST',
          stripeConnectedAccountId: searchParams.connected_account_id as string,
        },
      })
    } catch (error) {
      console.error('Error updating user role:', error)
    }

    redirect('/')
  }

  return (
    <div className="flex h-screen w-full flex-col">
      <Header searchParams={searchParams} />
      <main className="relative flex flex-1 flex-col items-center justify-between overflow-y-scroll">
        <div className="absolute h-full w-full">
          <div className="container mx-auto pb-20">
            <Listings searchParams={searchParams} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

const Header = ({ searchParams }: { searchParams: SearchParams }) => (
  <header className="flex items-center justify-between border-b">
    <a href="/" className="px-8 py-4">
      <Logo />
    </a>
    <div className="relative flex items-center gap-8 px-8 py-4">
      <AccountWidget searchParams={searchParams} />
    </div>
  </header>
)

const Footer = () => (
  <footer className="space-between flex items-center gap-8 border-t px-8 py-2">
    <ModeToggle />
  </footer>
)
