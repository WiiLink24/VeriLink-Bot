import { describe, it } from 'mocha'
import assert from 'assert'
import Poll from '../src/Poll.js'
import PartnyaClient from '../src/PartnyaClient.js'
import { IntentsBitField } from 'discord.js'

const sampleData = {
  guild_id: '123',
  title: 'Test Title'
}

const sampleData2 = {
  guild_id: '123',
  title: 'Test Title',
  options: ['Test 1', 'Test 2']
}

const sampleData3 = {
  guild_id: '123',
  title: 'Test Title',
  options: ['Test 1', 'Test 2']
}

describe('PollOptions', function () {
  const client = new PartnyaClient({ intents: [IntentsBitField.Flags.Guilds] })

  describe('#all', function () {
    const poll = new Poll(client, sampleData)
    it('should have an array size of 0', function () {
      assert.equal(poll.options.all(), 0)
    })
  })

  describe('#add', function () {
    const poll = new Poll(client, sampleData)
    poll.options.add('Test 1')

    it('should have an array size of 1', function () {
      assert.equal(poll.options._options.length, 1)
    })

    it('first entry should be \'Test 1\'', function () {
      assert.equal(poll.options._options[0], 'Test 1')
    })

    it('should not exceed a length of 1 with the same option', function () {
      poll.options.add('Test 1')
      assert.equal(poll.options._options.length, 1)
    })
  })

  describe('#remove', function () {
    const poll = new Poll(client, sampleData2)
    poll.options.remove('Test 1')

    it('should reduce array size of 1', function () {
      assert.equal(poll.options._options.length, 1)
    })

    it('first entry should be \'Test 2\'', function () {
      assert.equal(poll.options._options[0], 'Test 2')
    })
  })

  describe('#has', function () {
    const poll = new Poll(client, sampleData3)

    it('should return true for \'Test 1\'', function () {
      assert.equal(poll.options.has('Test 1'), true)
    })

    it('should return true for \'Test 2\'', function () {
      assert.equal(poll.options.has('Test 2'), true)
    })

    it('should return false for \'Test 3\'', function () {
      assert.equal(poll.options.has('Test 3'), false)
    })
  })
})
