#!/usr/bin/env ts-node

import * as WebSocket from 'ws'
import {
  IonicDB,
  IonicDBOptions,
}                     from '@ionic/db'
import { test }       from 'tap'

import {
  // Db,
  Hostie,
  // Botie,
}                     from '../'

test('IonicDB connect testing', t => {
  const API_TOKEN = process.env.IONIC_API_TOKEN
  const IONIC_APP_ID = 'f08d588e'

  const options: IonicDBOptions = {
    app_id: IONIC_APP_ID,
    authType: 'authenticated',
    WebSocketCtor: WebSocket,
  }

  const db = new IonicDB(options)
  db.setToken(API_TOKEN)

  const hosties = db.collection('hosties')
  // const boties = db.collection('boties')

  let i = 0
  const hostiesSub = hosties
                      .limit(3)
                      .fetch()
                      .flatMap(doc => doc)
                      .subscribe((hostie: Hostie) => {
                        t.ok(hostie, 'Got #' + i++ + ' hostie from IonicDB')
                      })

  const connectedSub = db.onConnected().subscribe(_ => {
    t.pass('IonicDB connected.')
    db.disconnect()
    hostiesSub.unsubscribe()
    connectedSub.unsubscribe()
    t.end()
  })
  db.connect()
})

/*
import { Database } from '@ionic/cloud-angular'
@Component( ... )
export class MyPage {
  public chats: Array<string>;

  constructor(public db: Database) {
    this.db.connect();
    this.db.collection('chats').watch().subscribe( (chats) => {
      this.chats = chats;
    }, (error) => {
      console.error(error);
    });
  }

  sendMessage(message: string) {
    this.db.collection('chats').store({text: message, time: Date.now()});
  }
}
*/
