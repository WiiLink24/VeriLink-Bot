import { describe, it } from 'mocha'
import assert from 'assert'
import DiscordUtils from '../src/WebHost/DiscordUtils.js'
import express from 'express'

const app = express()
const testData = {
  USER: [
    {
      success: false,
      error: 'Test'
    },
    {
      success: true,
      data: {
        username: 'testman',
        email: 'testman@gmail.com'
      }
    }
  ],
  ACCESS: [
    {
      success: false,
      error: 'Test error'
    },
    {
      success: true,
      access_token: '123'
    }
  ]
}

app.get('/tests/user/:index', (req, res) => {
  const { index } = req.params
  if (!testData.USER[index].success) return res.status(403).json({ error: 'No' })
  res.json(testData.USER[index].data)
})

app.post('/tests/token/:index', (req, res) => {
  const { index } = req.params
  if (!testData.ACCESS[index].success) return res.status(403).json({ error: 'No' })
  res.json(testData.ACCESS[index])
})

app.listen(3004)

describe('DiscordUtils', () => {
  describe('#getUser', function () {
    it('should return null when unsuccessful', async function () {
      const user = await DiscordUtils.getUser('123', 'http://localhost:3004/tests/user/0')
      assert.equal(user, null)
    })

    it('should return a valid object when successful', async function () {
      const user = await DiscordUtils.getUser('123', 'http://localhost:3004/tests/user/1')
      assert.deepEqual(user, testData.USER[1].data)
    })

    it('should return expected values on all requests', async function () {
      for (let i = 0; i < 2; i++) {
        const user = await DiscordUtils.getUser('123', `http://localhost:3004/tests/user/${i}`)
        const expectedValue = testData.USER[i].success ? testData.USER[i].data : null
        assert.deepEqual(user, expectedValue)
      }
    })
  })

  describe('#convertAccessCode', function () {
    it('should return expected value on all requests', async function () {
      for (let i = 0; i < 2; i++) {
        const user = await DiscordUtils.convertAccessCode('123', `http://localhost:3004/tests/token/${i}`)
        const expectedValue = testData.ACCESS[i].success ? testData.ACCESS[i].access_token : null
        assert.equal(user, expectedValue)
      }
    })
  })
})
