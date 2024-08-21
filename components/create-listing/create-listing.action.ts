'use server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import stripe from '@/lib/stripe'
import { AudioFile, Listing, User } from '@prisma/client'
import { revalidatePath } from 'next/cache'

interface ListingCreationResult {
  messages: string[]
  listingIds?: string[]
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

async function checkSellerCapabilities(
  stripeConnectedAccountId: string | null
) {
  if (!stripeConnectedAccountId) {
    throw new Error('Seller has not completed Stripe onboarding')
  }

  const account = await stripe.accounts.retrieve(stripeConnectedAccountId)
  const hasNecessaryCapabilities =
    account.capabilities?.transfers === 'active' ||
    account.capabilities?.card_payments === 'active' ||
    account.capabilities?.legacy_payments === 'active'

  if (!hasNecessaryCapabilities) {
    throw new Error('Seller account does not have necessary capabilities')
  }
}

function extractFilesFromFormData(
  formData: FormData
): Omit<AudioFile, 'id' | 'listingId' | 'createdAt' | 'updatedAt'>[] {
  return Array.from(formData.entries())
    .filter(([key]) => key.startsWith('file-'))
    .map(([, value]) => {
      try {
        return JSON.parse(value as string) as Omit<
          AudioFile,
          'id' | 'listingId' | 'createdAt' | 'updatedAt'
        >
      } catch (error) {
        throw new Error('Invalid file data')
      }
    })
}

async function createListingsWithAudioFiles(
  userId: string,
  files: Omit<AudioFile, 'id' | 'listingId' | 'createdAt' | 'updatedAt'>[]
): Promise<Listing[]> {
  return await prisma.$transaction(
    files.map((file) =>
      prisma.listing.create({
        data: {
          title: file.originalFileName || 'Untitled',
          description: `Uploaded file: ${file.originalFileName || 'Untitled'}`,
          price: 0,
          image: file.fileUrl,
          userId,
          audioFile: {
            create: {
              accountId: file.accountId,
              etag: file.etag,
              fileUrl: file.fileUrl,
              filePath: file.filePath,
              originalFileName: file.originalFileName,
              size: file.size,
              mime: file.mime,
            },
          },
        },
      })
    )
  )
}

export default async function createListingAction(
  formData: FormData
): Promise<ListingCreationResult> {
  try {
    const user = await getAuthenticatedUser()

    await checkSellerCapabilities(user.stripeConnectedAccountId)

    const files = extractFilesFromFormData(formData)

    if (files.length === 0) {
      return { messages: ['No files uploaded'] }
    }

    const createdListings = await createListingsWithAudioFiles(user.id, files)

    revalidatePath('/')

    return {
      messages: ['Listings created successfully'],
      listingIds: createdListings.map((listing) => listing.id),
    }
  } catch (error) {
    console.error('Error creating listings: ', error)
    return {
      messages: [
        (error as Error).message || 'An error occurred while creating listings',
      ],
    }
  }
}
