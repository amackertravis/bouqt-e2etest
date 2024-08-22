import { test as setup, expect } from '@playwright/test'
import MailSlurp from 'mailslurp-client'
import { JSDOM } from 'jsdom'

const authFile = './guest.json'

setup('authenticate', async ({ page }) => {
  // load playground app
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
  if (!BASE_URL) throw new Error('BASE_URL undefined')
  await page.goto(BASE_URL)

  const apiKey = process.env.MAILSLURP_API_KEY
  if (!apiKey) throw new Error('apiKey undefined')
  const mailslurp = new MailSlurp({ apiKey })
  
  // create a new inbox
  // const { id, emailAddress } = await mailslurp.createInbox()
  const id = process.env.EMAIL_ID
  const emailAddress = process.env.EMAIL_ADDRESS

  // fill sign up form
  await page.getByPlaceholder('email@example.com').fill(emailAddress ?? '')
  await page.getByRole('button', { name: 'Sign in with email' }).click()

  // wait for verification code
  const email = await mailslurp.waitForLatestEmail(id)

  if (email.body) {
    const dom = new JSDOM(email.body)
    const document = dom.window.document

    // Extract the URL from the anchor tag
    const anchor = document.querySelector('a[href]')

    if (anchor) {
      const hrefValue = anchor.getAttribute('href') ?? BASE_URL
      // enter confirmation code
      await page.goto(hrefValue)
      await page.waitForURL(BASE_URL)
      // Alternatively, you can wait until the page reaches a state where all cookies are set.
      await expect(page.getByRole('link')).toBeVisible()

      // End of authentication steps.
      await page.context().storageState({ path: authFile })
    } else {
      console.error('No anchor tag with href found.')
    }
  } else {
    console.error('Any request is not sent.')
  }
})
