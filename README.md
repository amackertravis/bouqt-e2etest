# Bouquet, v2

<details>

<summary>

## Meta Outline

</summary>

## /app

- layout.tsx

- api

  - auth/[...nextauth]/
    route.ts
  - stripe-webhook/
    route.ts
  - others are server actions, where possible

- page.tsx
  - header
    - home
    - login/account
      - Next.Auth
      - Resend
      - e2e test w/ playwright
  - footer
    - logout
  - library
    - search, filter, sort
    - different views
- [audioId]/
  - page.tsx
  - checkout/
    - page.tsx
  - download/
    - page.tsx
- settings/
  - page.tsx
  - billing
    - page.tsx
  - sales
    - page.tsx
  - listings
    - page.tsx
    - new
      - page.tsx
    - [listingId]/
      - page.tsx
      - edit/
        - page.tsx
  - profile
    - page.tsx
- help/
  - page.tsx
- contact/
  - page.tsx
- faq/
  - page.tsx
- terms/
  - page.tsx
- privacy/
  - page.tsx

## /lib

- next-auth
- prisma
- resend
- stripe
- utils
- logging

## /components

- ui/shad-cn

## /prisma

- schema.prisma
- seed.ts
- client.ts
- backup.ts
</details>

# other features

- Sentry
- Turbopack
- Stripe
