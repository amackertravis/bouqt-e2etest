import PurchaseConfirmationEmail from '@/emails/purchase-confirmation-email'
import { Listing, User } from '@prisma/client'
import { render } from '@react-email/render'
import { Resend } from 'resend'

type ListingWithUser = Listing & { user: User }

const AUTH_RESEND_KEY = process.env.AUTH_RESEND_KEY as string
const resend = new Resend(AUTH_RESEND_KEY)

export async function sendPurchaseConfirmationEmail(
  buyer: User,
  listing: ListingWithUser,
  checkoutUrl: string
) {
  const emailHtml = render(
    PurchaseConfirmationEmail({
      buyerName: buyer.name || 'Valued Customer',
      listingTitle: listing.title,
      checkoutUrl: checkoutUrl,
    })
  )

  await resend.emails.send({
    from: 'no-reply@bouqt.xyz',
    to: buyer.email!,
    subject: `Your purchase confirmation for ${listing.title}`,
    html: emailHtml,
  })
}
