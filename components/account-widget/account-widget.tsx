import { SearchParams } from '@/lib/types'
import { Suspense } from 'react'
import { AccountDropdownFallback } from './account-widget.fallback'
import { AccountWidgetServer } from './account-widget.server'

export function AccountWidget({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  return (
    <Suspense fallback={<AccountDropdownFallback key={Date.now()} />}>
      <AccountWidgetServer searchParams={searchParams} />
    </Suspense>
  )
}
