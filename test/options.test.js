import { describe, it } from 'mocha'
import assert from 'assert'
import Poll from '../src/Poll.js'
import PartnyaClient from '../src/PartnyaClient.js'
import { IntentsBitField } from 'discord.js'

const sampleData = {
  guild_id: '123',
  title: 'Test Title'
}

describe('PollOptions', function () {
  const client = new PartnyaClient({ intents: [IntentsBitField.Flags.Guilds] })


})
