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
            
            page.on('dialog', async dialog => {
              await dialog.accept()
            })
            
            await page.getByRole('button', { name: 'remove' }).click()

            await expect(page.locator('div[name="Title"]').filter({ hasText: 'Test Blog' })).not.toBeVisible()
            
          })

          test('only creator can delete a blog', async ({ page, request }) => {
            await page.locator('button').filter({ hasText: 'Create new blog' }).click()
            await page.locator('input[name="Title"]').fill('Test Blog')
            await page.locator('input[name="Author"]').fill('Test Author')
            await page.locator('input[name="Url"]').fill('http://testblog.com')
            await page.locator('button[type="submit"]').click()
            await page.locator('button').filter({ hasText: 'logout' }).click()
            await request.post('http://localhost:3003/api/users', {
              data: {
                name: 'Test User',
                username: 'testuser',
                password: 'password'
              }
            })
            await page.locator('input[name="Username"]').fill('testuser')
            await page.locator('input[name="Password"]').fill('password')
            await page.locator('button[type="submit"]').click()

            await page.getByRole('button', { name: 'view' }).click()

            await expect(page.locator('button').filter({ hasText: 'remove' })).not.toBeVisible()
          })

          test('blogs are ordered by likes', async ({ page }) => {
            await page.locator('button').filter({ hasText: 'Create new blog' }).click();
            await page.locator('input[name="Title"]').fill('Blog 1');
            await page.locator('input[name="Author"]').fill('Author 1');
            await page.locator('input[name="Url"]').fill('http://blog1.com');
            await page.locator('button[type="submit"]').click();

            await page.locator('button').filter({ hasText: 'Create new blog' }).click();
            await page.locator('input[name="Title"]').fill('Blog 2');
            await page.locator('input[name="Author"]').fill('Author 2');
            await page.locator('input[name="Url"]').fill('http://blog2.com');
            await page.locator('button[type="submit"]').click();

            await page.pause()
            await page.getByText('view').nth(1).click()
            await page.locator('button[name="Like"]').nth(0).click()

            await expect(page.locator('div[name="Likes"]').nth(0).filter({ hasText: '1' })).toBeVisible()
          })
        })
      })
})
