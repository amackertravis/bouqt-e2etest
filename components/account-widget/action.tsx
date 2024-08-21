'use server'

import { CustomSession } from '@/lib/auth'
import stripe from '@/lib/stripe'

export async function createBillingLinks(user: CustomSession['user']) {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
  if (!BASE_URL) throw new Error('BASE_URL undefined')

  let buyerLink = null
  let artistLink = null

  try {
    const buyerSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId || (await ensureStripeCustomerId(user)),
      return_url: `${BASE_URL}/?user=${user.id}`,
    })
    buyerLink = buyerSession.url

    if (user.role === 'ARTIST' && user.stripeConnectedAccountId) {
      const artistSession = await stripe.accountLinks.create({
        account: user.stripeConnectedAccountId,
        refresh_url: `${BASE_URL}/?user=${user.id}`,
        return_url: `${BASE_URL}/?user=${user.id}`,
        type: 'account_onboarding',
      })
      artistLink = artistSession.url
    }
  } catch (error) {
    console.error('Error creating billing links:', error)
  }

  return { buyerLink, artistLink }
}

async function ensureStripeCustomerId(
  user: CustomSession['user']
): Promise<string> {
  if (user.stripeCustomerId) return user.stripeCustomerId

  const customer = await stripe.customers.create({
    email: user.email || undefined,
    metadata: { userId: user.id },
  })

  // Note: Updating the user in the database should be done in a server action or API route
  // For now, we'll just return the new customer ID
  return customer.id
}
