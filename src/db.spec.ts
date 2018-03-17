#!/usr/bin/env ts-node

import * as test  from 'blue-tape'

import {
  LocalServer,
}                 from '@chatie/graphql'

import { Db }     from './db'

const localServer = new LocalServer()

test('db', async t => {
  for await (const fixtures of localServer.fixtures()) {
    const db = new Db(
      fixtures.USER.token,
      fixtures.ENDPOINTS,
    )

    await db.open()
    t.ok(db.apollo.version, 'should had inited apollo client')
    await db.close()
    t.pass('db.{open,close}() passed')
  }
})
