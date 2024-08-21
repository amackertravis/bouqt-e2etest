import prisma from '@/lib/prisma'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { Account, Listing, Order, Session } from '@prisma/client'
import NextAuth from 'next-auth'
import Resend from 'next-auth/providers/resend'

export type CustomSession = Session & {
  user: {
    id: string
    name?: string
    email: string
    role: string
    emailVerified?: Date
    image?: string
    stripeCustomerId?: string
    stripeConnectedAccountId?: string
    accounts?: Partial<Account>[]
    sessions?: Partial<Session>[]
    listings?: Partial<Listing>[]
    orders?: Partial<Order>[]
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Resend({ from: 'no-reply@bouqt.xyz', name: 'email' })],
  callbacks: {
    authorized: async ({ auth }) => {
      return !!auth
    },
  },
  trustHost: true,
})
