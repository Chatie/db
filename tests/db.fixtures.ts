import {
  ServerFixtures,
}                 from '@chatie/graphql'

import { Db } from '../src/db'

export function userDbFixture(fixtures: ServerFixtures) {
  const db = new Db({
    token:      fixtures.USER.token,
    endpoints:  fixtures.ENDPOINTS,
  })
  return db
}

export function rootDbFixture(fixtures: ServerFixtures) {
  const db = new Db({
    token:      fixtures.ROOT.token,
    endpoints:  fixtures.ENDPOINTS,
  })
  return db
}
