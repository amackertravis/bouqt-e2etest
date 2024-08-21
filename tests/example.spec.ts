import { test, expect } from '@playwright/test';

test('test_1', async ({ page }) => {
    // load playground app
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
    if (!BASE_URL) throw new Error('BASE_URL undefined')
    await page.goto(BASE_URL)
    await expect(page.getByRole('link')).toBeVisible();
})

test('test_2', async ({ page }) => {
    // load playground app
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
    if (!BASE_URL) throw new Error('BASE_URL undefined')
    await page.goto(BASE_URL)
    await expect(page.getByRole('link')).toBeVisible();
})