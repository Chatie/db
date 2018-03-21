import {
  BotieStore,
}               from '../../src/botie/botie-store'

export async function createBotieFixture(
  botieStore:  BotieStore,
  ownerId:      string,
) {
  const RAND_ID       = Math.random().toString().substr(2, 7)
  const EXPECTED_NAME = `name-${RAND_ID}`
  const EXPECTED_KEY  = `key-${RAND_ID}`

  const botie = await botieStore.create({
    name: EXPECTED_NAME,
    key:  EXPECTED_KEY,
    ownerId,
  })

  return {
    id:   botie.id,
    name: EXPECTED_NAME,
    key: EXPECTED_KEY,
  }
}
