import { faker } from '@faker-js/faker'
import { OrderStatus, PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create Users (reduced to 6)
  const users = await prisma.$transaction(
    Array(6)
      .fill(null)
      .map(() =>
        prisma.user.create({
          data: {
            name: faker.person.fullName(),
            slug: faker.internet.userName(),
            role: faker.helpers.arrayElement(Object.values(UserRole)),
            email: faker.internet.email(),
            emailVerified: faker.date.past(),
            image: faker.image.avatar(),
            stripeCustomerId: faker.string.uuid(),
            stripeConnectedAccountId: faker.string.uuid(),
          },
        })
      )
  )

  // Create one Listing and AudioFile per user
  const listings = await Promise.all(
    users.map(async (user) => {
      const audioFile = await prisma.audioFile.create({
        data: {
          accountId: faker.string.uuid(),
          etag: faker.string.uuid(),
          fileUrl: faker.internet.url(),
          filePath: faker.system.filePath(),
          originalFileName: faker.system.fileName({ extensionCount: 1 }),
          size: faker.number.int({ min: 1000000, max: 10000000 }),
          mime: 'audio/mpeg',
          listing: {
            create: {
              title: faker.commerce.productName(),
              description: faker.commerce.productDescription(),
              price: faker.number.int({ min: 1, max: 1000 }),
              image: faker.image.url(),
              userId: user.id,
              isActive: false,
            },
          },
        },
      })

      return prisma.listing.update({
        where: { id: audioFile.listingId },
        data: { audioFileId: audioFile.id },
      })
    })
  )

  // Create Orders (one per listing)
  const ordersData = listings.map((listing) => ({
    listingId: listing.id,
    userId: users[Math.floor(Math.random() * users.length)].id,
    total: listing.price,
    status: faker.helpers.arrayElement(Object.values(OrderStatus)),
  }))

  await prisma.order.createMany({
    data: ordersData,
  })

  process.stdout.write(
    'Seed data created for users, listings, audio files, and orders.\n'
  )
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
