import { describe, it } from 'mocha'
import assert from 'assert'
import Poll from '../src/Poll.js'
import fs from 'node:fs'
import Database from '../src/Database.js'

const id = new Date().getTime()

const sampleData = {
  id,
  title: 'Test Title'
}

describe('Polls', function () {
  let database = null
  if (fs.existsSync('./config/config.json')) {
    database = new Database()
    database.Connect()
    this.timeout(200)
  }
  describe('unpublished', () => {
    const poll = (new Poll(null, sampleData))
    it('should have the title \'Test Title\'', () => {
      assert.equal(poll.title, 'Test Title')
    })
    it('should not have a channel_id', () => {
      assert.equal(poll.channel_id, '')
    })
    it('should not have a message_id', () => {
      assert.equal(poll.message_id, '')
    })
    it('should not be published', () => {
      assert.equal(poll.is_published, false)
    })
    it('ID should not equal 0', () => {
      assert.notEqual(poll.id, 0)
    })
  })
  describe('published', () => {
    const poll = (new Poll(null, sampleData))
    poll.channel_id = '123'
    poll.message_id = '123'
    poll.is_published = true
    it('should have channel_id', () => {
      assert.notEqual(poll.channel_id, '')
    })
    it('should have message_id', () => {
      assert.notEqual(poll.message_id, '')
    })
    it('should be published', () => {
      assert.equal(poll.is_published, true)
    })
  })
  describe('#AddOption', () => {
    const poll = (new Poll(null, sampleData))
    const err = poll.AddOption('Test')
    it('should not return a value', () => {
      assert.equal(err, null)
    })
    it('length of options should be 1', () => {
      assert.equal(poll.options.length, 1)
    })
    it('first value in options should be \'Test\'', () => {
      assert.equal(poll.options[0], 'Test')
    })
  })
  describe('#Save', () => {
    it('database should contain testing ID', async () => {
      if (!database) {
        return this.skip()
      }
      const poll = (new Poll(null, sampleData))
      poll.client = { db: database }
      poll.Save()
      const value = (await poll.client.db.session.query('SELECT * FROM polls WHERE id = $1', [poll.id])).rows
      assert.notEqual(value.length, 0)
    })
  })
  describe('#Vote', function () {
    if (!fs.existsSync('./config/config.json')) return

    const poll = (new Poll({ db: database }, sampleData))
    it('length of votes should be 1', function () {
      if (!database) {
        return this.skip()
      }
      poll.Vote('123', 'Test')
      assert.equal(poll.votes.length, 1)
    })
    it('should have a vote with the option of \'Test\'', function () {
      if (!database) {
        return this.skip()
      }
      assert.notEqual(poll.votes.find((vote) => vote.option === 'Test'), null)
    })
    it('should change vote to option of \'Test 2\'', function () {
      if (!database) {
        return this.skip()
      }
      poll.Vote('123', 'Test 2')
      assert.equal(poll.votes.length === 1 && poll.votes.find((vote) => vote.option === 'Test 2') != null, true)
    })
    it('should allow multiple responses in multiresponse mode', function () {
      if (!database) {
        return this.skip()
      }
      poll.allow_multiple = true
      poll.Vote('123', 'Test')
      assert.equal(poll.votes.length, 2)
    })
  })
  describe('#Remove', function () {
    it('properly delete database entries', async () => {
      if (!database) {
        return this.skip()
      }
      const poll = (new Poll(null, sampleData))
      poll.client = { db: database }
      poll.Remove()
      const value = (await poll.client.db.session.query('SELECT * FROM polls WHERE id = $1', [poll.id])).rows
      assert.equal(value.length, 0)
    })
  })
})
