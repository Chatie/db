#!/usr/bin/env ts-node

// import * as WebSocket from 'ws'
import * as test      from 'blue-tape'

import {
  // Db,
  HostieStore,
  // Botie,
}                     from '../'

test('IonicDB connect testing', t => {
  const hostieStore = new HostieStore()
  // const boties = db.collection('boties')

  let i = 0
  const dockiesSub = hostieStore
                      .limit(3)
                      .fetch()
                      .flatMap(doc => doc)
                      .subscribe(hostie => {
                        t.ok(dockie, 'Got #' + i++ + ' dockie from IonicDB')
                      })

  const connectedSub = db.onConnected().subscribe(_ => {
    t.pass('IonicDB connected.')
    db.disconnect()
    dockiesSub.unsubscribe()
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
