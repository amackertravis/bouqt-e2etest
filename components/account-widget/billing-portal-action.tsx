'use server'

import { auth, CustomSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import stripe from '@/lib/stripe'
import { redirect } from 'next/navigation'

export async function redirectToBillingPortal(userRole: 'BUYER' | 'ARTIST') {
  const session = await auth()
  const user = session?.user as CustomSession['user']
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
  if (!BASE_URL) throw new Error('BASE_URL undefined')
  let redirectUrl
  try {
    let session
    if (userRole === 'BUYER') {
      const stripeCustomerId = await ensureStripeCustomerId(user)
      session = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: `${BASE_URL}/?user=${user.id}`,
      })
      redirectUrl = session.url
    } else {
      if (!user.stripeConnectedAccountId || user.role !== 'ARTIST') {
        throw new Error(
          'No connected Stripe account found or user is not an artist'
        )
      }
      session = await stripe.accountLinks.create({
        account: user.stripeConnectedAccountId,
        refresh_url: `${BASE_URL}/?user=${user.id}`,
        return_url: `${BASE_URL}/?user=${user.id}`,
        type: 'account_onboarding',
      })

      redirectUrl = session.url
    }
  } catch (error) {
    console.error(`Error in redirectToBillingPortal for ${userRole}:`, error)
    throw new Error(`Failed to create Stripe billing session for ${userRole}`)
  }
  if (redirectUrl) {
    redirect(redirectUrl)
  }
}

async function ensureStripeCustomerId(
  user: CustomSession['user']
): Promise<string> {
  if (user.stripeCustomerId) return user.stripeCustomerId

  const customer = await stripe.customers.create({
    email: user.email || undefined,
    metadata: { userId: user.id },
  })

  await prisma.user.update({
    where: { id: user.id },
    data: { stripeCustomerId: customer.id },
  })

  return customer.id
}
