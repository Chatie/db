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

  console.log('############ clearing event loop tasks queue')
  await new Promise(r => setImmediate(r))
  await new Promise(r => setTimeout(r, 100))
  console.log('############ clear event loop tasks queue done')

  console.log('############ before create')
  const hostie = await hostieStore.create({
    name: EXPECTED_NAME,
    key:  EXPECTED_KEY,
    ownerId,
  })
  console.log('############ after create')

  // issue #12
  console.log('############ clearing event loop tasks queue')
  await new Promise(r => setImmediate(r))
  await new Promise(r => setTimeout(r, 100))
  console.log('############ clear event loop tasks queue done')

  const fixture = {
    id:   hostie.id,
    name: EXPECTED_NAME,
    key:  EXPECTED_KEY,
  }
  console.log(fixture)
  return fixture
}
