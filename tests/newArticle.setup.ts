import {test as setup, expect} from '@playwright/test'

setup('create new article', async({request})=>{
    const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
        data:{
            "article":{"title":"Likes test articles","description":"this is a test description","body":"this is a test body","tagList":[]}
        }
    })
    expect(articleResponse.status()).toEqual(201)
    const response = await articleResponse.json()
    const slugId = response.article.slug
    process.env['SLUGID'] = slugId
})