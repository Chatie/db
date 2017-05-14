#!/usr/bin/env ts-node

import { test }   from 'tap'

import {
  Hostie,
  HostieStatus,
  HostieRuntime,
}                 from './hostie-schema'

test('Hostie model with all values fulfilled', t => {
  const hostie: Hostie = {
    email:      'zixia@zixia.net',
    id:         'uuid',
    token:      'uuid',
    name:       'string',
    create_at: 1234567,
    update_at: 1234567,
    note:       'string',
    status:     HostieStatus.OFFLINE,
    version:    '0.7.41',
    runtime:    HostieRuntime.DOCKER,
  }
  hostie.status = HostieStatus.ONLINE

  t.ok(hostie, 'maximum values is ok')
  t.end()
})

test('Hostie model with minimum values fulfilled', t => {
  const hostie: Hostie = {
    email:      'zixia@zixia.net',
    id:         'uuid',
    token:      'uuid',
    name:       'string',
    create_at: 1234567,
    update_at: 1234567,
    status:     HostieStatus.OFFLINE,
  }

  t.ok(hostie, 'minimum values is ok')
  t.end()
})
