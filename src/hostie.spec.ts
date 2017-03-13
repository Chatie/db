#!/usr/bin/env ts-node

import { test } from 'tap'

import {
  Hostie,
  HostieStatus,
} from './hostie'

test('Hostie model with all values fulfilled', t => {
  const hostie: Hostie = {
    id:         'uuid',
    token:      'uuid',
    name:       'string',
    createTime: 1234567,
    updateTime: 1234567,
    note:       'string',
    status:     HostieStatus.OFFLINE,
    version:    '0.7.41',
    runtime:    'docker',
  }
  hostie.status = HostieStatus.ONLINE

  t.ok(hostie, 'maximum values is ok')
  t.end()
})

test('Hostie model with minimum values fulfilled', t => {
  const hostie: Hostie = {
    id:         'uuid',
    token:      'uuid',
    name:       'string',
    createTime: 1234567,
    updateTime: 1234567,
    status:     HostieStatus.OFFLINE,
  }

  t.ok(hostie, 'minimum values is ok')
  t.end()
})
