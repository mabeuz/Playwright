import { test, expect, request } from '@playwright/test';
import tags from '../test-data/tags.json'

test.beforeEach(async({page})=>{
  //mock before the browser calls the APIs
  await page.route('*/**/api/tags', async route =>{
    await route.fulfill({
      body: JSON.stringify(tags)
    })
  })  

  await page.goto('https://conduit.bondaracademy.com/')
 
})

test('has title', async ({ page }) => {
  await page.route('*/**/api/articles*', async route =>{
    //returns the result
    const response = await route.fetch()
    const responseBody = await response.json()
    responseBody.articles[0].title = "This is a MOCK test title"
    responseBody.articles[0].description = "This is a MOCK description"

    await route.fulfill({
      body: JSON.stringify(responseBody)
    })
  })

  await page.getByText('Global Feed')
  await expect(page.locator('.navbar-brand')).toHaveText('conduit');
  await expect(page.locator('app-article-list h1').first()).toContainText('This is a MOCK test title')
  await expect(page.locator('app-article-list p').first()).toContainText('This is a MOCK description')
});

test('delete article', async({page, request})=>{
    
  //API to create the article
  const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
    data:{
      "article":{"title":"This is a test title","description":"this is a test description","body":"this is a test body","tagList":[]}
    }
  })
  expect(articleResponse.status()).toEqual(201)

  await page.getByText('Global Feed').click()
  await page.getByText('This is a test title').click()
  await page.getByRole('button', {name: "Delete Article"}).first().click()
  await page.getByText('Global Feed').click()

  await expect(page.locator('app-article-list h1').first()).not.toContainText('This is a test title')
})

test('create article', async({page, request})=>{
  await page.getByText('New Article').click()
  await page.getByRole('textbox', {name:'Article Title'}).fill('Playwright article')
  await page.getByRole('textbox', {name:'What\'s this article about?'}).fill('Playwright')
  await page.getByRole('textbox', {name:'Write your article (in markdown)'}).fill('we like to use Playwright for automation')
  await page.getByRole('button', {name: 'Publish Article'}).click()
  const articleResponse = await page.waitForResponse('https://conduit-api.bondaracademy.com/api/articles/')
  const articleResponseBody = await articleResponse.json()
  const slugId = articleResponseBody.article.slug
  console.log(articleResponseBody)
  await expect(page.locator('.article-page h1')).toContainText('Playwright article')

  await page.getByText('Home').click()
  await page.getByText('Global Feed').click()
  await expect(page.locator('app-article-list h1').first()).toContainText('Playwright article')

  const deleteArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slugId}`)
  console.log(slugId)
  expect(deleteArticleResponse.status()).toEqual(204)
})

