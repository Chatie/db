import * as assert from 'assert'

import {
  HostieStore,
  Hostie,
}               from '../../src/hostie/hostie-store'

export async function createHostieFixture(
    hostieStore:  HostieStore,
    ownerId:      string,
): Promise<Hostie> {
  const RAND_ID         = Math.random().toString().substr(2, 7)
  const EXPECTED_NAME   = `name-${RAND_ID}`
  const EXPECTED_TOKEN  = `token-${RAND_ID}`

  const hostie = await hostieStore.create({
    name:   EXPECTED_NAME,
    token:  EXPECTED_TOKEN,
    ownerId,
  })

  assert(EXPECTED_TOKEN === hostie.token, 'should create the hostie with EXPECTED_TOKEN')
  assert(EXPECTED_NAME  === hostie.name,  'should create the hostie with EXPECTED_NAME')

  return hostie
}
