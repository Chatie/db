#!/usr/bin/env ts-node

import * as test  from 'blue-tape'
import 'rxjs/add/operator/first'

import {
  LocalServer,
}                 from '@chatie/graphql'

import {
  createHostieFixture,
}                       from '../../tests/hostie/fixtures'

import {
  Db,
}               from '../db'
import {
  HostieStore,
}               from './hostie-store'

const localServer = new LocalServer()

test('itemDict', async t => {
  for await (const fixtures of localServer.fixtures()) {
    const db = new Db(
      fixtures.USER.token,
      fixtures.ENDPOINTS,
    )
    await db.open()
    const hostieStore = new HostieStore(db)
    await hostieStore.open()

    try {
      const itemDict = await hostieStore.itemDict.first().toPromise()

      t.ok(itemDict, 'should get itemDict')
      t.equal(Object.keys(itemDict).length, 0, 'should get zero items for a fresh fixture')

    } catch (e) {
      t.fail(e)
    } finally {
      await hostieStore.close()
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
    const hostieStore = new HostieStore(db)
    await hostieStore.open()

    try {
      const EXPECTED_NAME = 'test name'
      const EXPECTED_KEY = 'test note'
      const hostie = await hostieStore.create({
        name:     EXPECTED_NAME,
        key:      EXPECTED_KEY,
        ownerId:  fixtures.USER.id,
      })

      t.equal(hostie.name, EXPECTED_NAME,   'should create hostie with EXPECTED_NAME')
      t.equal(hostie.key, EXPECTED_KEY,     'should create hostie with EXPECTED_NOTE')

    } catch (e) {
      t.fail(e)
    } finally {
      await hostieStore.close()
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
    const hostieStore = new HostieStore(db)
    await hostieStore.open()

    try {
      const HOSTIE_FIXTURE  = await createHostieFixture(hostieStore, fixtures.USER.id)
      const hostie          = await hostieStore.read(HOSTIE_FIXTURE.id)

      t.equal(hostie.name, HOSTIE_FIXTURE.name, 'should get the name of hostie with the id')
      t.equal(hostie.key, HOSTIE_FIXTURE.key, 'should get the name of hostie with the id')

    } catch (e) {
      t.fail(e)
    } finally {
      await hostieStore.close()
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
    const hostieStore = new HostieStore(db)
    await hostieStore.open()

    try {
      const NOT_EXIST_ID = 'not exist id'

      await hostieStore.read(NOT_EXIST_ID)
      .then(() => t.fail('should not be resolved'))
      .catch(() => t.pass('should reject for a NOT_EXIST_ID'))

    } catch (e) {
      t.fail(e)
    } finally {
      await hostieStore.close()
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
    const hostieStore = new HostieStore(db)
    await hostieStore.open()

    try {
      const HOSTIE_FIXTURE  = await createHostieFixture(hostieStore, fixtures.USER.id)
      const hostie          = await hostieStore.read(HOSTIE_FIXTURE.id)

      const EXPECTED_UPDATED_NAME = 'updated name'
      const EXPECTED_UPDATED_NOTE = 'updated note'

      const updatedHostie = await hostieStore.update(hostie.id, {
        name: EXPECTED_UPDATED_NAME,
        note: EXPECTED_UPDATED_NOTE,
      })

      t.equal(updatedHostie.name, EXPECTED_UPDATED_NAME, 'should get the updated name for hostie')
      t.equal(updatedHostie.note, EXPECTED_UPDATED_NOTE, 'should get the updated note for hostie')

    } catch (e) {
      t.fail(e)
    } finally {
      await hostieStore.close()
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
    const hostieStore = new HostieStore(db)
    await hostieStore.open()

    try {
      const HOSTIE_FIXTURE  = await createHostieFixture(hostieStore, fixtures.USER.id)
      const hostie          = await hostieStore.delete(HOSTIE_FIXTURE.id)

      t.equal(hostie.id, HOSTIE_FIXTURE.id, 'should return the id of deleted hostie')

    } catch (e) {
      t.fail(e)
    } finally {
      await hostieStore.close()
      await db.close()
    }
  }
})
