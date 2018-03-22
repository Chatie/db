import * as assert from 'assert'

import {
  HostieStore,
  Hostie,
}               from '../../src/hostie/hostie-store'

export async function createHostieFixture(
    hostieStore:  HostieStore,
    ownerId:      string,
): Promise<Hostie> {
  const RAND_ID       = Math.random().toString().substr(2, 7)
  const EXPECTED_NAME = `name-${RAND_ID}`
  const EXPECTED_KEY  = `key-${RAND_ID}`

  const hostie = await hostieStore.create({
    name: EXPECTED_NAME,
    key:  EXPECTED_KEY,
    ownerId,
  })

  assert(EXPECTED_KEY   === hostie.key,   'should create the hostie with EXPECTED_KEY')
  assert(EXPECTED_NAME  === hostie.name,  'should create the hostie with EXPECTED_NAME')

  return hostie
}
