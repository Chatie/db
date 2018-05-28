#!/usr/bin/env ts-node

import * as test  from 'blue-tape'
// import 'rxjs/add/operator/first'
// import { first } from 'rxjs/operators'
import {
  distinctUntilChanged,
  first,
}                         from 'rxjs/operators'

import {
  LocalServer,
}                 from '@chatie/graphql'

import {
  createBotieFixture,
}                       from '../../tests/botie/fixtures'
import {
  userDbFixture,
}                       from '../../tests/db.fixtures'

import {
  BotieStore,
}               from './botie-store'

const localServer = new LocalServer()

test('itemList', async t => {
  for await (const fixtures of localServer.fixtures()) {
    const db = userDbFixture(fixtures)
    const botieStore = new BotieStore(db)

    await db.open()
    // await botieStore.open()

    try {
      const itemList = await botieStore.itemList.pipe(first()).toPromise()

      t.ok(itemList, 'should get itemList')
      t.equal(itemList.length, 0, 'should get zero items for a fresh fixture')

      const newBotie = await createBotieFixture(botieStore, fixtures.USER.id)
      const itemList2 = await botieStore.itemList.pipe(first()).toPromise()
      t.equal(itemList2.length, 1, 'should get 1 items after creation')

      const item2 = itemList2.filter(i => i['id'] === newBotie.id)[0]
      t.equal(item2.name, newBotie.name, 'should create the new botie with the name')

    } catch (e) {
      t.fail(e)
    } finally {
      // await botieStore.close()
      await db.close()
    }
  }
})

test('create()', async t => {
  for await (const fixtures of localServer.fixtures()) {
    const db = userDbFixture(fixtures)
    const botieStore = new BotieStore(db)

    await db.open()
    // await botieStore.open()

    try {
      const EXPECTED_NAME = 'test name for create()'
      const EXPECTED_TOKEN = 'test token for create()'
      const botie = await botieStore.create({
        name:     EXPECTED_NAME,
        token:    EXPECTED_TOKEN,
        ownerId:  fixtures.USER.id,
      })

      t.equal(botie.name, EXPECTED_NAME,   'should create botie with EXPECTED_NAME')
      t.equal(botie.token, EXPECTED_TOKEN,     'should create botie with EXPECTED_NOTE')

    } catch (e) {
      t.fail(e)
    } finally {
      // await botieStore.close()
      await db.close()
    }
  }
})

test('read() with exist id', async t => {
  for await (const fixtures of localServer.fixtures()) {
    const db = userDbFixture(fixtures)
    const botieStore = new BotieStore(db)

    await db.open()
    // await botieStore.open()

    try {
      const HOSTIE_FIXTURE  = await createBotieFixture(botieStore, fixtures.USER.id)
      const botie          = await botieStore.read(HOSTIE_FIXTURE.id!)

      t.equal(botie.name,   HOSTIE_FIXTURE.name, 'should get the name of botie with the id')
      t.equal(botie.token,  HOSTIE_FIXTURE.token, 'should get the name of botie with the id')

    } catch (e) {
      t.fail(e)
    } finally {
      // await botieStore.close()
      await db.close()
    }
  }
})

test('read() with not exist id', async t => {
  for await (const fixtures of localServer.fixtures()) {
    const db = userDbFixture(fixtures)
    const botieStore = new BotieStore(db)

    await db.open()
    // await botieStore.open()

    try {
      const NOT_EXIST_ID = 'not exist id'

      await botieStore.read(NOT_EXIST_ID)
      .then(() => t.fail('should not be resolved'))
      .catch(() => t.pass('should reject for a NOT_EXIST_ID'))

    } catch (e) {
      t.fail(e)
    } finally {
      // await botieStore.close()
      await db.close()
    }
  }
})

test('update()', async t => {
  for await (const fixtures of localServer.fixtures()) {
    const db = userDbFixture(fixtures)
    const botieStore = new BotieStore(db)

    await db.open()
    // await botieStore.open()

    try {
      const HOSTIE_FIXTURE  = await createBotieFixture(botieStore, fixtures.USER.id)
      const botie          = await botieStore.read(HOSTIE_FIXTURE.id!)

      const EXPECTED_UPDATED_NAME = 'updated name'
      const EXPECTED_UPDATED_NOTE = 'updated note'

      const updatedBotie = await botieStore.update(botie.id!, {
        name: EXPECTED_UPDATED_NAME,
        note: EXPECTED_UPDATED_NOTE,
      })

      t.equal(updatedBotie.name, EXPECTED_UPDATED_NAME, 'should get the updated name for botie')
      t.equal(updatedBotie.note, EXPECTED_UPDATED_NOTE, 'should get the updated note for botie')

    } catch (e) {
      t.fail(e)
    } finally {
      // await botieStore.close()
      await db.close()
    }
  }
})

test('delete()', async t => {
  for await (const fixtures of localServer.fixtures()) {
    const db = userDbFixture(fixtures)
    const botieStore = new BotieStore(db)

    await db.open()
    // await botieStore.open()

    try {
      const HOSTIE_FIXTURE  = await createBotieFixture(botieStore, fixtures.USER.id)
      const botie          = await botieStore.delete(HOSTIE_FIXTURE.id!)

      t.ok(HOSTIE_FIXTURE.id,               'should get a botie fixture with id')
      t.equal(botie.id, HOSTIE_FIXTURE.id, 'should return the id of deleted botie')

    } catch (e) {
      t.fail(e)
    } finally {
      // await botieStore.close()
      await db.close()
    }
  }
})
