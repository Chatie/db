#!/usr/bin/env ts-node

import * as test  from 'blue-tape'
// import 'rxjs/add/operator/first'

import {
  LocalServer,
}                 from '@chatie/graphql'

import {
  BotieStore,
}               from '../../src/botie'
import {
  userDbFixture,
}                 from '../db.fixtures'
import {
  createBotieFixture,
}                       from './fixtures'

const localServer = new LocalServer()

test('smoke testing', async t => {
  for await (const fixtures of localServer.fixtures()) {
    const db = userDbFixture(fixtures)
    const botieStore = new BotieStore(db)

    await db.open()
    // await botieStore.open()

    try {
      let itemList: undefined | any[]
      let resolverList = [] as Function[]
      let future: Promise<void>

      future = new Promise(r => resolverList.push(r))
      const subscription = botieStore.itemList.subscribe(list => {
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
      const botie1 = await createBotieFixture(botieStore, fixtures.USER.id)
      await future
      t.equal(itemList.length, 1, 'should get 1 botie after 1 creation')

      future = new Promise(r => resolverList.push(r))
      const botie2 = await createBotieFixture(botieStore, fixtures.USER.id)
      await future
      t.equal(itemList.length, 2, 'should get 2 botie after another creation')

      const EXPECTED_UPDATE_NAME = 'expected update name'
      future = new Promise(r => resolverList.push(r))
      const updatedBotie1 = await botieStore.update(botie1.id!, {
        name: EXPECTED_UPDATE_NAME,
      })
      await future
      t.equal(updatedBotie1.name, EXPECTED_UPDATE_NAME, 'should get updated name from the return value of update()')
      const item = itemList.filter(i => i['id'] === botie1.id)[0]
      t.equal(item.name, EXPECTED_UPDATE_NAME, 'should updated itemList to the updated name after update')

      future = new Promise(r => resolverList.push(r))
      await botieStore.delete(botie2.id!)
      await future
      t.equal(itemList.length, 1, 'should get 1 botie after delete botie2')

      future = new Promise(r => resolverList.push(r))
      await botieStore.delete(botie1.id!)
      await future
      t.equal(itemList.length, 0, 'should get 0 botie after delete botie1')

      subscription.unsubscribe()

    } catch (e) {
      t.fail(e)
    } finally {
      // await botieStore.close()
      await db.close()
    }
  }
})
