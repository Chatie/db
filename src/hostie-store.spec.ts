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
}                 from './db'
import {
  HostieStore,
}                 from './hostie-store'

const localServer = new LocalServer()

test('itemMap', async t => {
  for await (const fixtures of localServer.fixtures()) {
    const db = new Db(
      fixtures.USER.token,
      fixtures.ENDPOINTS,
    )
    await db.init()

    const store = new HostieStore(db)

    // store.itemMap.subscribe(im => {
    //   console.log('itemMap: ', im)
    // })
    await store.open()
    const itemMap = await store.itemMap.first().toPromise()
    await store.close()

    t.ok(itemMap, 'should get itemMap')
    t.equal(Object.keys(itemMap).length, 0, 'should get zero items for a fresh fixture')
  }
})
