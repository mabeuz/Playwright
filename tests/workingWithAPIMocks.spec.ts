import { test, expect } from '@playwright/test';
import tags from '../test-data/tags.json'
import exp from 'constants';

test.beforeEach(async({page})=>{
  //mock before the browser calls the APIs
  await page.route('*/**/api/tags', async route =>{
    await route.fulfill({
      body: JSON.stringify(tags)
    })
  })

  await page.route('*/**/api/articles*', async route =>{
    //returns the result
    const response = await route.fetch()
    const responseBody = await response.json()
    responseBody.articles[0].title = "This is a test title"
    responseBody.articles[0].description = "This is a description"

    await route.fulfill({
      body: JSON.stringify(responseBody)
    })
  })

  await page.goto('https://conduit.bondaracademy.com/')
})

test('has title', async ({ page }) => {
  await page.waitForTimeout(500)
  await expect(page.locator('.navbar-brand')).toHaveText('conduit');
  //await expect(page.locator('app-article-list h1').first()).toContainText('This is a test title')
  //await expect(page.locator('app-article-list p').first()).toContainText('This is a description')
  //if there are not assertions, bug in the Playwright framework before fulfill the request
  await page.waitForTimeout(1000)
});


