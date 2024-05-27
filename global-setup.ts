import {request, expect} from '@playwright/test'
import user from '../pw-apitest-app/.auth/user.json'
import fs from 'fs'

async function globalSetup(){
    const authFile = '.auth/user.json'
    const context = await request.newContext()

    const responseToken = await context.post('https://conduit-api.bondaracademy.com/api/users/login', {
        data: {
            "user": {"email": "test@test.com", "password": "Password"}
        }
    })
    console.log(responseToken)
    const responseBody = await responseToken.json()
    const accessToken = responseBody.user.token
    user.origins[0].localStorage[0].value = accessToken
    fs.writeFileSync(authFile, JSON.stringify(user))

    process.env['ACCESS_TOKEN'] = accessToken

    const articleResponse = await context.post('https://conduit-api.bondaracademy.com/api/articles/', {
        data:{
            "article":{"title":"Global Likes test articles","description":"this is a test description","body":"this is a test body","tagList":[]}
        },
        headers:{
            Authorization: `Token ${process.env.ACCESS_TOKEN}`
        }
    })
    expect(articleResponse.status()).toEqual(201)
    const response = await articleResponse.json()
    const slugId = response.article.slug
    process.env['SLUGID'] = slugId
}

export default globalSetup;