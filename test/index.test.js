const { describe, it } = require('mocha')
const assert = require('assert')
const Poll = require('../src/Poll')

const sampleData = {
  title: 'Test Title'
}

const poll = (new Poll(null, sampleData))

describe('Polls', () => {
  describe('unpublished', () => {
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
    poll.channel_id = '123'
    it('should have channel_id', () => {
      assert.notEqual(poll.channel_id, '')
    })
  })
})
