import { auth } from '@/lib/auth'
import stripe from '@/lib/stripe'
import { redirect } from 'next/navigation'
import { Stripe } from 'stripe'
import FormSubmitButton from '../form-submit'

export async function ArtistRegistrationAction() {
  async function registerArtist() {
    'use server'

    const session = await auth()
    const user = session?.user

    const userId = user?.id
    if (!userId) throw new Error('Unauthorized')

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
    if (!BASE_URL) throw new Error('BASE_URL undefined')

    const account: Stripe.Account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: true },
        acss_debit_payments: { requested: true },
        cashapp_payments: { requested: true },
        link_payments: { requested: true },
        us_bank_account_ach_payments: { requested: true },
        us_bank_transfer_payments: { requested: true },
      },
      business_type: 'individual',
      business_profile: {
        url: `http://bouqt.xyz/?artist=${userId}`,
        mcc: '5735',
        product_description:
          'Digital audio recordings and special edition music content',
      },
      individual: {
        email: user.email || undefined,
        first_name: user.name?.split(' ')[0] || 'TEST',
        last_name: user.name?.split(' ').slice(1).join(' ') || 'USER',
      },
      settings: {
        payouts: {
          schedule: {
            interval: 'manual',
          },
        },
      },
    })

    const { url }: Stripe.AccountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${BASE_URL}/?user_id=${userId}&connected_account_id=${account.id}&refresh=true`,
      return_url: `${BASE_URL}/?user_id=${userId}&connected_account_id=${account.id}&onboarding_success=true`,
      type: 'account_onboarding',
      collect: 'eventually_due',
    })

    redirect(url)
  }

  return (
    <form action={registerArtist}>
      <FormSubmitButton
        type="submit"
        className="flex w-[16ch] items-center justify-center"
        hoverReveal={false}
      >
        Become a Seller
      </FormSubmitButton>
    </form>
  )
}
