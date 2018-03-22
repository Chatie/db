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
  userDbFixture,
}                       from '../../tests/db.fixtures'

import {
  HostieStore,
}               from './hostie-store'

const localServer = new LocalServer()

test('itemList', async t => {
  for await (const fixtures of localServer.fixtures()) {
    const db = userDbFixture(fixtures)
    await db.open()
    const hostieStore = new HostieStore(db)
    await hostieStore.open()

    try {
      const itemList = await hostieStore.itemList.first().toPromise()

      t.ok(itemList, 'should get itemList')
      t.equal(itemList.length, 0, 'should get zero items for a fresh fixture')

      const newHostie = await createHostieFixture(hostieStore, fixtures.USER.id)
      const itemList2 = await hostieStore.itemList.first().toPromise()
      t.equal(itemList2.length, 1, 'should get 1 items after creation')

      const item2 = itemList2.filter(i => i['id'] === newHostie.id)[0]
      t.equal(item2.name, newHostie.name, 'should create the new hostie with the name')

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
    const db = userDbFixture(fixtures)
    await db.open()
    const hostieStore = new HostieStore(db)
    await hostieStore.open()

    try {
      const EXPECTED_NAME = 'test name for create()'
      const EXPECTED_KEY = 'test key for create()'
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
    const db = userDbFixture(fixtures)
    await db.open()
    const hostieStore = new HostieStore(db)
    await hostieStore.open()

    try {
      const HOSTIE_FIXTURE  = await createHostieFixture(hostieStore, fixtures.USER.id)
      const hostie          = await hostieStore.read(HOSTIE_FIXTURE.id!)

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
    const db = userDbFixture(fixtures)
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
    const db = userDbFixture(fixtures)
    await db.open()
    const hostieStore = new HostieStore(db)
    await hostieStore.open()

    try {
      const HOSTIE_FIXTURE  = await createHostieFixture(hostieStore, fixtures.USER.id)
      const hostie          = await hostieStore.read(HOSTIE_FIXTURE.id!)

      const EXPECTED_UPDATED_NAME = 'updated name'
      const EXPECTED_UPDATED_NOTE = 'updated note'

      const updatedHostie = await hostieStore.update(hostie.id!, {
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
    const db = userDbFixture(fixtures)
    await db.open()
    const hostieStore = new HostieStore(db)
    await hostieStore.open()

    try {
      const HOSTIE_FIXTURE  = await createHostieFixture(hostieStore, fixtures.USER.id)
      const hostie          = await hostieStore.delete(HOSTIE_FIXTURE.id!)

      t.ok(HOSTIE_FIXTURE.id,               'should get a hostie fixture with id')
      t.equal(hostie.id, HOSTIE_FIXTURE.id, 'should return the id of deleted hostie')

    } catch (e) {
      t.fail(e)
    } finally {
      await hostieStore.close()
      await db.close()
    }
  }
})
