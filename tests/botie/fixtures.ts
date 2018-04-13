import {
  BotieStore,
}               from '../../src/botie/botie-store'

export async function createBotieFixture(
    botieStore: BotieStore,
    ownerId:    string,
) {
  const RAND_ID         = Math.random().toString().substr(2, 7)
  const EXPECTED_NAME   = `name-${RAND_ID}`
  const EXPECTED_TOKEN  = `token-${RAND_ID}`

  const botie = await botieStore.create({
    name:   EXPECTED_NAME,
    token:  EXPECTED_TOKEN,
    ownerId,
  })

  // issue #12
  // await new Promise(r => setImmediate(r))
  // await new Promise(r => setTimeout(r, 100))

  return {
    id:     botie.id,
    name:   EXPECTED_NAME,
    token:  EXPECTED_TOKEN,
  }
}
