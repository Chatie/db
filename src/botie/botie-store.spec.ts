#!/usr/bin/env ts-node

import * as test  from 'blue-tape'
import 'rxjs/add/operator/first'

import {
  LocalServer,
}                 from '@chatie/graphql'

import {
  createBotieFixture,
}                       from '../../tests/botie/fixtures'

import {
  Db,
}               from '../db'
import {
  BotieStore,
}               from './botie-store'

const localServer = new LocalServer()

test('itemDict', async t => {
  for await (const fixtures of localServer.fixtures()) {
    const db = new Db(
      fixtures.USER.token,
      fixtures.ENDPOINTS,
    )
    await db.open()
    const botieStore = new BotieStore(db)
    await botieStore.open()

    try {
      const itemDict = await botieStore.itemDict.first().toPromise()

      t.ok(itemDict, 'should get itemDict')
      t.equal(Object.keys(itemDict).length, 0, 'should get zero items for a fresh fixture')

    } catch (e) {
      t.fail(e)
    } finally {
      await botieStore.close()
      await db.close()
    }
  }
})

test('create()', async t => {
  for await (const fixtures of localServer.fixtures()) {
    const db = new Db(
      fixtures.USER.token,
      fixtures.ENDPOINTS,
    )
    await db.open()
    const botieStore = new BotieStore(db)
    await botieStore.open()

    try {
      const EXPECTED_NAME = 'test name'
      const EXPECTED_KEY = 'test note'
      const botie = await botieStore.create({
        name:     EXPECTED_NAME,
        key:      EXPECTED_KEY,
        ownerId:  fixtures.USER.id,
      })

      t.equal(botie.name, EXPECTED_NAME,   'should create botie with EXPECTED_NAME')
      t.equal(botie.key, EXPECTED_KEY,     'should create botie with EXPECTED_NOTE')

    } catch (e) {
      t.fail(e)
    } finally {
      await botieStore.close()
      await db.close()
    }
  }
})

test('read() with exist id', async t => {
  for await (const fixtures of localServer.fixtures()) {
    const db = new Db(
      fixtures.USER.token,
      fixtures.ENDPOINTS,
    )
    await db.open()
    const botieStore = new BotieStore(db)
    await botieStore.open()

    try {
      const HOSTIE_FIXTURE  = await createBotieFixture(botieStore, fixtures.USER.id)
      const botie          = await botieStore.read(HOSTIE_FIXTURE.id)

      t.equal(botie.name, HOSTIE_FIXTURE.name, 'should get the name of botie with the id')
      t.equal(botie.key, HOSTIE_FIXTURE.key, 'should get the name of botie with the id')

    } catch (e) {
      t.fail(e)
    } finally {
      await botieStore.close()
      await db.close()
    }
  }
})

test('read() with not exist id', async t => {
  for await (const fixtures of localServer.fixtures()) {
    const db = new Db(
      fixtures.USER.token,
      fixtures.ENDPOINTS,
    )
    await db.open()
    const botieStore = new BotieStore(db)
    await botieStore.open()

    try {
      const NOT_EXIST_ID = 'not exist id'

      await botieStore.read(NOT_EXIST_ID)
      .then(() => t.fail('should not be resolved'))
      .catch(() => t.pass('should reject for a NOT_EXIST_ID'))

    } catch (e) {
      t.fail(e)
    } finally {
      await botieStore.close()
      await db.close()
    }
  }
})

test('update()', async t => {
  for await (const fixtures of localServer.fixtures()) {
    const db = new Db(
      fixtures.USER.token,
      fixtures.ENDPOINTS,
    )
    await db.open()
    const botieStore = new BotieStore(db)
    await botieStore.open()

    try {
      const HOSTIE_FIXTURE  = await createBotieFixture(botieStore, fixtures.USER.id)
      const botie          = await botieStore.read(HOSTIE_FIXTURE.id)

      const EXPECTED_UPDATED_NAME = 'updated name'
      const EXPECTED_UPDATED_NOTE = 'updated note'

      const updatedBotie = await botieStore.update(botie.id, {
        name: EXPECTED_UPDATED_NAME,
        note: EXPECTED_UPDATED_NOTE,
      })

      t.equal(updatedBotie.name, EXPECTED_UPDATED_NAME, 'should get the updated name for botie')
      t.equal(updatedBotie.note, EXPECTED_UPDATED_NOTE, 'should get the updated note for botie')

    } catch (e) {
      t.fail(e)
    } finally {
      await botieStore.close()
      await db.close()
    }
  }
})

test('delete()', async t => {
  for await (const fixtures of localServer.fixtures()) {
    const db = new Db(
      fixtures.USER.token,
      fixtures.ENDPOINTS,
    )
    await db.open()
    const botieStore = new BotieStore(db)
    await botieStore.open()

    try {
      const HOSTIE_FIXTURE  = await createBotieFixture(botieStore, fixtures.USER.id)
      const botie          = await botieStore.delete(HOSTIE_FIXTURE.id)

      t.equal(botie.id, HOSTIE_FIXTURE.id, 'should return the id of deleted botie')

    } catch (e) {
      t.fail(e)
    } finally {
      await botieStore.close()
      await db.close()
    }
  }
})
