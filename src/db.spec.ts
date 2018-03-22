#!/usr/bin/env ts-node

import * as test  from 'blue-tape'

import 'rxjs/add/operator/first'

import {
  LocalServer,
}                 from '@chatie/graphql'

import { Db }     from './db'

const localServer = new LocalServer()

test('db', async t => {
  for await (const fixtures of localServer.fixtures()) {
    const db = new Db({
      token:      fixtures.USER.token,
      endpoints:  fixtures.ENDPOINTS,
    })

    const EXPECTED_COUNTER = 3
    let counter = 0
    db.apollo.subscribe(() => counter++)

    let apollo = await db.apollo.first().toPromise()
    t.notOk(apollo, 'should get a null apollo after construction')

    await db.open()
    apollo = await db.apollo.first().toPromise()
    t.ok(apollo, 'should get a instiaciated apollo after open')
    t.ok(apollo!.version, 'should had inited apollo client')

    await db.close()
    apollo = await db.apollo.first().toPromise()
    t.notOk(apollo, 'should get a null apollo after close()')

    t.pass('db.{open,close}() passed')

    t.equal(counter, EXPECTED_COUNTER, 'should subscribe 3 apollo events: null(constructor), apollo, null(close)')
  }
})
