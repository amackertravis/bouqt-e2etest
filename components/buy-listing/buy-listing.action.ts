'use server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import stripe from '@/lib/stripe'
import { Listing, Order, User } from '@prisma/client'
import { redirect } from 'next/navigation'
import { Stripe } from 'stripe'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL as string

type ListingWithUser = Listing & { user: User }

interface BuyListingResult {
  messages: string[]
  orderId?: string
}

async function getAuthenticatedUser(): Promise<User> {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    throw new Error('Not logged in or invalid user ID')
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    throw new Error('User not found')
  }

  return user
}

async function findListing(listingId: string): Promise<ListingWithUser> {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { user: true },
  })
  if (!listing) {
    throw new Error('Listing not found')
  }
  return listing
}

async function createOrder(
  userId: string,
  listingId: string,
  price: number
): Promise<Order> {
  return await prisma.order.create({
    data: {
      total: price,
      userId,
      listingId,
      status: 'PENDING',
    },
  })
}

async function getOrCreateStripeCustomer(user: User): Promise<string> {
  if (user.stripeCustomerId) {
    return user.stripeCustomerId
  }

  const customer = await stripe.customers.create({ email: user.email! })
  await prisma.user.update({
    where: { id: user.id },
    data: { stripeCustomerId: customer.id },
  })

  return customer.id
}

async function createStripeCheckoutSession(
  customerId: string,
  listing: ListingWithUser,
  orderId: string,
  userId: string
): Promise<Stripe.Checkout.Session> {
  const success_url = `${BASE_URL}/?order=${orderId}&download=true`
  const cancel_url = `${BASE_URL}/?order=${orderId}&cancel=true`
  const destination = `${listing.user.stripeConnectedAccountId}`

  const stripeCheckoutSessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: listing.title,
            description: `ORDER_ID:${orderId}—${listing.description}`,
          },
          unit_amount: listing.price * 100,
        },
        quantity: 1,
      },
    ],
    payment_method_types: ['card'],
    customer: customerId,
    payment_intent_data: {
      application_fee_amount: Math.round(listing.price * 0.3 * 100),
      transfer_data: {
        destination,
      },
    },
    success_url,
    cancel_url,
    metadata: {
      customerId,
      orderId,
      userId,
    },
  }

  return await stripe.checkout.sessions.create(stripeCheckoutSessionParams)
}

export default async function buyListingAction(
  formData: FormData
): Promise<BuyListingResult> {
  let checkoutUrl = ''

  try {
    const user = await getAuthenticatedUser()

    const listingId = formData.get('id') as string
    if (!listingId) {
      throw new Error('Listing ID not found')
    }

    const listing = await findListing(listingId)

    if (!listing.user.stripeConnectedAccountId) {
      const errorMessage = 'This listing is not active.'
      redirect(
        `${BASE_URL}/${listing.user.slug}?error=${encodeURIComponent(errorMessage)}&listingId=${listing.id}`
      )
    }

    const newOrder = await createOrder(user.id, listingId, listing.price)
    const customerId = await getOrCreateStripeCustomer(user)

    const checkoutSession = await createStripeCheckoutSession(
      customerId,
      listing,
      newOrder.id,
      user.id
    )

    if (checkoutSession.url) {
      checkoutUrl = checkoutSession.url
    }
  } catch (error) {
    console.error('Error buying listing:', error)
    return {
      messages: [
        (error as Error).message ||
          'An error occurred while buying the listing',
      ],
    }
  }

  if (checkoutUrl) {
    redirect(checkoutUrl)
  } else {
    throw new Error('Checkout session not created')
  }
}
