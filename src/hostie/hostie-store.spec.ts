#!/usr/bin/env ts-node

import * as test  from 'blue-tape'
import 'rxjs/add/operator/first'

import {
  LocalServer,
}                 from '@chatie/graphql'

// import {
//   log,
// }                 from './config'
import {
  Db,
}                 from '../db'
import {
  HostieStore,
}                 from './hostie-store'

const localServer = new LocalServer()

test('itemDict', async t => {
  for await (const fixtures of localServer.fixtures()) {
    const db = new Db(
      fixtures.USER.token,
      fixtures.ENDPOINTS,
    )
    await db.open()
    const store = new HostieStore(db)
    await store.open()

    try {
      const itemDict = await store.itemDict.first().toPromise()

      t.ok(itemDict, 'should get itemDict')
      t.equal(Object.keys(itemDict).length, 0, 'should get zero items for a fresh fixture')

      t.pass('ok')
    } catch (e) {
      t.fail(e)
    } finally {
      await store.close()
      await db.close()
    }
  }
})
