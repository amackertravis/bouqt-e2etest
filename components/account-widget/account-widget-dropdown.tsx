'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CustomSession } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { Ellipsis } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useState } from 'react'
import { Spinner } from '../spinner'
import { createBillingLinks } from './action'

export function AccountWidgetDropdown({
  user,
}: {
  user: CustomSession['user']
}) {
  const [billingLinks, setBillingLinks] = useState<{
    buyer: string | null
    artist: string | null
  }>({ buyer: null, artist: null })

  const [clickedLink, setClickedLink] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoadedLinks, setHasLoadedLinks] = useState(false)

  const loadBillingLinks = useCallback(async () => {
    if (hasLoadedLinks) return

    setIsLoading(true)
    try {
      const { buyerLink, artistLink } = await createBillingLinks(user)
      setBillingLinks({ buyer: buyerLink, artist: artistLink })
      setHasLoadedLinks(true)
    } catch (error) {
      console.error('Error loading billing links:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user, hasLoadedLinks])

  const handleDropdownOpen = (open: boolean) => {
    if (open && !hasLoadedLinks) {
      loadBillingLinks()
    }
  }

  const handleLinkClick = (linkId: string) => {
    setClickedLink(linkId)
    // Reset the clicked state after a short delay
    setTimeout(() => setClickedLink(null), 4000)
  }

  const GenericLink = ({
    href,
    children,
    linkId,
  }: {
    href: string
    children: React.ReactNode
    linkId: string
  }) => (
    <Link
      href={href}
      className={cn(
        'flex w-full items-center justify-between',
        clickedLink === linkId ? 'pointer-events-none opacity-50' : ''
      )}
      prefetch={linkId !== 'signout'}
      onClick={() => handleLinkClick(linkId)}
    >
      <span>{children}</span>
      {clickedLink === linkId && <Spinner className="h-4 w-4" />}
    </Link>
  )

  const BillingLink = ({ type }: { type: 'buyer' | 'artist' }) => (
    <GenericLink href={billingLinks[type] || ''} linkId={`${type}Billing`}>
      {type === 'buyer' ? 'Buyer' : 'Artist'} Billing
    </GenericLink>
  )

  return (
    <DropdownMenu onOpenChange={handleDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mr-2 mt-1">
        {user.role === 'ARTIST' && (
          <>
            <DropdownMenuItem>
              <GenericLink href="/sales" linkId="sales">
                Sales
              </GenericLink>
            </DropdownMenuItem>
            <DropdownMenuItem>
              {isLoading ? (
                <div className="flex w-full items-center justify-between">
                  <span>Artist Billing</span>
                  <Spinner className="h-4 w-4" />
                </div>
              ) : (
                <BillingLink type="artist" />
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem>
          <GenericLink href="/orders" linkId="orders">
            Orders
          </GenericLink>
        </DropdownMenuItem>
        <DropdownMenuItem>
          {isLoading ? (
            <div className="flex w-full items-center justify-between">
              <span>Buyer Billing</span>
              <Spinner className="h-4 w-4" />
            </div>
          ) : (
            <BillingLink type="buyer" />
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="pointer-events-none">
          {user.name || user.email}
        </DropdownMenuItem>
        <DropdownMenuItem className="pointer-events-none">
          {user.role}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <GenericLink href="/api/auth/signout" linkId="signout">
            Sign out
          </GenericLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
