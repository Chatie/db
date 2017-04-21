#!/usr/bin/env ts-node

import { test } from 'tap'

import {
  Dockie,
  DockieStatus,
  DockieRuntime,
} from './dockie'

test('Dockie model with all values fulfilled', t => {
  const dockie: Dockie = {
    id:         'uuid',
    token:      'uuid',
    name:       'string',
    create_at: 1234567,
    update_at: 1234567,
    note:       'string',
    status:     DockieStatus.OFFLINE,
    version:    '0.7.41',
    runtime:    DockieRuntime.DOCKER,
  }
  dockie.status = DockieStatus.ONLINE

  t.ok(dockie, 'maximum values is ok')
  t.end()
})

test('Dockie model with minimum values fulfilled', t => {
  const dockie: Dockie = {
    id:         'uuid',
    token:      'uuid',
    name:       'string',
    create_at: 1234567,
    update_at: 1234567,
    status:     DockieStatus.OFFLINE,
  }

  t.ok(dockie, 'minimum values is ok')
  t.end()
})
