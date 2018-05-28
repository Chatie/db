#!/usr/bin/env ts-node

import * as test  from 'blue-tape'
// import 'rxjs/add/operator/first'

import {
  LocalServer,
}                 from '@chatie/graphql'

import {
  HostieStore,
}               from '../../src/hostie/hostie-store'
import {
  userDbFixture,
}                 from '../db.fixtures'
import {
  createHostieFixture,
}                       from './fixtures'

const localServer = new LocalServer()

test('smoke testing', async t => {
  for await (const fixtures of localServer.fixtures()) {
    const db = userDbFixture(fixtures)
    const hostieStore = new HostieStore(db)

    await db.open()
    // await hostieStore.open()

    try {
      let itemList: undefined | any[]
      let resolverList = [] as Function[]
      let future: Promise<void>

      future = new Promise(r => resolverList.push(r))
      const subscription = hostieStore.itemList.subscribe(list => {
        itemList = list
        resolverList.forEach(r => r())
        resolverList = []
      })
      await future

      t.ok(itemList, 'should get itemList')

      if (!itemList) {
        throw new Error('no itemList!')
      }

      t.equal(itemList.length, 0, 'should get zero items for a fresh fixture')

      future = new Promise(r => resolverList.push(r))
      const hostie1 = await createHostieFixture(hostieStore, fixtures.USER.id)
      await future
      t.equal(itemList.length, 1, 'should get 1 hostie after 1 creation')

      future = new Promise(r => resolverList.push(r))
      const hostie2 = await createHostieFixture(hostieStore, fixtures.USER.id)
      await future
      t.equal(itemList.length, 2, 'should get 2 hostie after another creation')

      const EXPECTED_UPDATE_NAME = 'expected update name'
      future = new Promise(r => resolverList.push(r))
      const updatedHostie1 = await hostieStore.update(hostie1.id!, {
        name: EXPECTED_UPDATE_NAME,
      })
      await future
      t.equal(updatedHostie1.name, EXPECTED_UPDATE_NAME, 'should get updated name from the return value of update()')
      const item = itemList.filter(i => i['id'] === hostie1.id)[0]
      t.equal(item.name, EXPECTED_UPDATE_NAME, 'should updated itemList to the updated name after update')

      future = new Promise(r => resolverList.push(r))
      await hostieStore.delete(hostie2.id!)
      await future
      t.equal(itemList.length, 1, 'should get 1 hostie after delete hostie2')

      future = new Promise(r => resolverList.push(r))
      await hostieStore.delete(hostie1.id!)
      await future
      t.equal(itemList.length, 0, 'should get 0 hostie after delete hostie1')

      subscription.unsubscribe()

    } catch (e) {
      t.fail(e)
    } finally {
      // await hostieStore.close()
      await db.close()
    }
  }
})
