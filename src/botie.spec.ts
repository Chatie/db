#!/usr/bin/env ts-node

import { test } from 'tap'

import {
  Botie,
  BotieStatus,
} from './botie'

test('Botie model with all values fulfilled', t => {
  const botie: Botie = {
    id:         'string',
    name:       'string',
    note:       'string',
    createTime: 123,
    updateTime: 123,
    status:     BotieStatus.STANDBY,
    hostieId:   'string'
  }
  botie.status = BotieStatus.READY

  t.ok(botie, 'maximum values is ok')
  t.end()
})

test('Botie model with minimum values fulfilled', t => {
  const botie: Botie = {
    id:         'string',
    name:       'string',
    createTime: 123,
    updateTime: 123,
    status:     BotieStatus.STANDBY,
  }

  t.ok(botie, 'minimum values is ok')
  t.end()
})
