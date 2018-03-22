import {
  HostieStore,
}               from '../../src/hostie/hostie-store'

export async function createHostieFixture(
    hostieStore:  HostieStore,
    ownerId:      string,
) {
  const RAND_ID       = Math.random().toString().substr(2, 7)
  const EXPECTED_NAME = `name-${RAND_ID}`
  const EXPECTED_KEY  = `key-${RAND_ID}`

  const hostie = await hostieStore.create({
    name: EXPECTED_NAME,
    key:  EXPECTED_KEY,
    ownerId,
  })

  // issue #12
  await new Promise(r => setImmediate(r))
  await new Promise(r => setTimeout(r, 100))

  return {
    id:   hostie.id,
    name: EXPECTED_NAME,
    key:  EXPECTED_KEY,
  }
}
