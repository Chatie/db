#!/usr/bin/env ts-node

import * as test  from 'blue-tape'
import 'rxjs/add/operator/first'

import {
  LocalServer,
}                 from '@chatie/graphql'

import {
  userDbFixture,
}                 from '../db.fixtures'
import {
  BotieStore,
}                 from '../../src/botie/botie-store'

import {
  createBotieFixture,
}                       from './fixtures'

const localServer = new LocalServer()

test('smoke testing', async t => {
  for await (const fixtures of localServer.fixtures()) {
    const db = userDbFixture(fixtures)
    await db.open()
    const botieStore = new BotieStore(db)
    await botieStore.open()

    try {
      let itemDict
      let resolverList = [] as Function[]
      let future: Promise<void>

      future = new Promise(r => resolverList.push(r))
      const subscription = botieStore.itemDict.subscribe(dict => {
        itemDict = dict
        resolverList.forEach(r => r())
        resolverList = []
      })
      await future

      t.ok(itemDict, 'should get itemDict')
      t.equal(Object.keys(itemDict).length, 0, 'should get zero items for a fresh fixture')

      future = new Promise(r => resolverList.push(r))
      const botie1 = await createBotieFixture(botieStore, fixtures.USER.id)
      await future
      t.equal(Object.keys(itemDict).length, 1, 'should get 1 botie after 1 creation')

      future = new Promise(r => resolverList.push(r))
      const botie2 = await createBotieFixture(botieStore, fixtures.USER.id)
      await future
      t.equal(Object.keys(itemDict).length, 2, 'should get 2 botie after another creation')

      const EXPECTED_UPDATE_NAME = 'expected update name'
      future = new Promise(r => resolverList.push(r))
      const updatedBotie1 = await botieStore.update(botie1.id, {
        name: EXPECTED_UPDATE_NAME,
      })
      await future
      t.equal(updatedBotie1.name, EXPECTED_UPDATE_NAME, 'should get updated name after update')
      t.equal(itemDict[botie1.id].name, EXPECTED_UPDATE_NAME, 'should updated itemDict to the updated name after update')

      future = new Promise(r => resolverList.push(r))
      await botieStore.delete(botie2.id)
      await future
      t.equal(Object.keys(itemDict).length, 1, 'should get 1 botie after delete botie2')

      future = new Promise(r => resolverList.push(r))
      await botieStore.delete(botie1.id)
      await future
      t.equal(Object.keys(itemDict).length, 0, 'should get 0 botie after delete botie1')

      subscription.unsubscribe()

    } catch (e) {
      t.fail(e)
    } finally {
      await botieStore.close()
      await db.close()
    }
  }
})
