import { describe, it } from 'mocha'
import assert from 'assert'
import Poll from '../src/Poll.js'
import fs from 'node:fs'
import Database from '../src/Database.js'
import PartnyaClient from '../src/PartnyaClient.js'
import { IntentsBitField } from 'discord.js'

const sampleData = {
  guild_id: '123',
  title: 'Test Title'
}

describe('PollManager', function () {
  const client = new PartnyaClient({ intents: [IntentsBitField.Flags.Guilds] })

  client.polls.add(new Poll(client, sampleData))
  client.polls.add(new Poll(client, Object.assign(sampleData, { guild_id: '124' })))

  describe('#unpublished', function () {
    const polls = client.polls.unpublished('123')
    it('should have an array length of 1', function () {
      assert.equal(polls.length, 1)
    })
    it('first poll should belong to guild \'123\'', function () {
      assert.equal(polls[0].guild_id, '123')
    })
    it('first poll should have the title of \'Test Title\'', function () {
      assert.equal(polls[0].title, 'Test Title')
    })
    it('first poll should not have a channel_id', function () {
      assert.equal(polls[0].channel_id, '')
    })
    it('first poll should not have a message_id', function () {
      assert.equal(polls[0].message_id, '')
    })
    it('first poll should not be published', function () {
      assert.equal(polls[0].is_published, false)
    })
    it('first poll ID should not equal 0', function () {
      assert.notEqual(polls[0].id, 0)
    })
  })

  client.polls.get('Test Title', '124').is_published = true

  describe('#published', () => {
    const polls = client.polls.published('124')
    polls[0].channel_id = '123'
    polls[0].message_id = '123'
    // Attempt to test duplicating options
    polls[0].options.add('Test')
    polls[0].options.add('Test')
    it('should have an array length of 1', function () {
      assert.equal(polls.length, 1)
    })
    it('should have a channel_id of \'123\'', function () {
      assert.equal(polls[0].channel_id, '123')
    })
    it('should have a message_id of \'123\'', function () {
      assert.equal(polls[0].message_id, '123')
    })
    it('should have at least 1 option', function () {
      assert.equal(polls[0].options.all().length, 1)
    })
    it('first option should be \'Test\'', function () {
      assert.equal(polls[0].options.all()[0], 'Test')
    })
    it('should be published', function () {
      assert.equal(polls[0].is_published, true)
    })
  })

  describe('#get', function () {
    const pollTitle = client.polls.get('Test Title', '123')
    const pollId = client.polls.get(client.polls.all('123')[0].id, '123')

    it('should be able to get poll using the title', function () {
      assert.notEqual(pollTitle, null)
    })
    it('should be able to get poll using the ID', function () {
      assert.notEqual(pollId, null)
    })
    const pollWrong = client.polls.get('Test Title', '128')
    it('using the wrong guild ID should not yield results', function () {
      assert.equal(pollWrong, null)
    })
  })

  client.polls.add(new Poll(client, Object.assign(sampleData, { title: 'Tester', guild_id: '123' })))
  client.polls.add(new Poll(client, Object.assign(sampleData, { title: 'Tester 2', guild_id: '124' })))

  describe('#add', function () {
    it('should have an array length of 2', function () {
      assert.equal(client.polls.all('123').length, 2)
    })

    it('should have a poll with the title of \'Tester\'', function () {
      assert.notEqual(client.polls.get('Tester', '123'), null)
    })
  })

  client.polls.remove('Tester 2')

  describe('#remove', function () {
    it('should have an array length of 1', function () {
      assert.equal(client.polls.all('124').length, 1)
    })

    it('should not have a poll with the title of \'Tester 2\'', function () {
      assert.equal(client.polls.get('Tester 2', '124'), null)
    })
  })
})

describe('Poll', function () {
  const poll = new Poll(null, sampleData)

  describe('#embed', function () {
    const embed = poll.embed

    it('should have an identical title to original object', function () {
      assert.equal(embed.title, poll.title)
    })

    it('should have have no fields', function () {
      assert.equal(embed.fields.length, 0)
    })
  })

  describe('#close', function () {
    poll.close()
    it('should set is_closed to \'true\'', function () {
      assert.equal(poll.is_closed, true)
    })
  })
})
