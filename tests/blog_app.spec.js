const {test, describe, expect} = require('@playwright/test');

describe('Blog App', () => {
    test.beforeEach(async ({ page, request }) => {
        await request.post('http://localhost:3003/api/testing/reset')
        await request.post('http://localhost:3003/api/users', {
          data: {
            name: 'Matti Luukkainen',
            username: 'mluukkai',
            password: 'salainen'
          }
        })
    
        await page.goto('http://localhost:5173')
      })
    
      test('Login form is shown', async ({ page }) => {
        await page.locator('input[name="Username"]').fill('mluukkai');
        await page.locator('input[name="Password"]').fill('salainen');
        await page.locator('button[type="submit"]').click();

        await expect(page.getByText('Matti Luukkainen logged-in')).toBeVisible()

      })

      describe('Login', () => {
        test('succeeds with correct credentials', async ({ page }) => {
          await page.locator('input[name="Username"]').fill('mluukkai');
          await page.locator('input[name="Password"]').fill('salainen');
          await page.locator('button[type="submit"]').click();

          await expect(page.getByText('Matti Luukkainen logged-in')).toBeVisible()
        })
    
        test('fails with wrong credentials', async ({ page }) => {
          await page.locator('input[name="Username"]').fill('mluukkai');
          await page.locator('input[name="Password"]').fill('wrongpassword');
          await page.locator('button[type="submit"]').click();
    
          await expect(page.getByText('wrong username or password')).toBeVisible()
        })

        describe('when logged in', () => {
          test.beforeEach(async ({ page }) => {
            await page.locator('input[name="Username"]').fill('mluukkai');
            await page.locator('input[name="Password"]').fill('salainen');
            await page.locator('button[type="submit"]').click();
          })

          test('a new blog can be created', async ({ page}) => {
            await page.locator('button').filter({ hasText: 'Create new blog' }).click();
            await page.locator('input[name="Title"]').fill('Test Blog');
            await page.locator('input[name="Author"]').fill('Test Author');
            await page.locator('input[name="Url"]').fill('http://testblog.com');
            await page.locator('button[type="submit"]').click();

            await expect(page.locator('div[name="Title"]').filter({hasText: 'Test Blog'})).toBeVisible()

          })

          test('a blog can be liked', async ({ page }) => {
            await page.locator('button').filter({ hasText: 'Create new blog' }).click();
            await page.locator('input[name="Title"]').fill('Test Blog');
            await page.locator('input[name="Author"]').fill('Test Author');
            await page.locator('input[name="Url"]').fill('http://testblog.com');
            await page.locator('button[type="submit"]').click();

            await page.getByRole('button', { name: 'view' }).click();
            await page.getByRole('button', { name: 'like' }).click();

            await expect(page.locator('div[name="Likes"]').filter({ hasText: '1' })).toBeVisible()
          })

          test('a blog can be deleted', async ({ page }) => {
            await page.locator('button').filter({ hasText: 'Create new blog' }).click()
            await page.locator('input[name="Title"]').fill('Test Blog')
            await page.locator('input[name="Author"]').fill('Test Author')
            await page.locator('input[name="Url"]').fill('http://testblog.com')
            await page.locator('button[type="submit"]').click()

            await page.getByRole('button', { name: 'view' }).click()
            await page.getByRole('button', { name: 'remove' }).click()
            
          })
        })
      })
})
