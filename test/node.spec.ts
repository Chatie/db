import * as WebSocket from 'ws'
import {
  IonicDB,
  IonicDBOptions,
}                     from '@ionic/db'

import {
  Db,
  // Hostie,
  // Botie,
}           from './'

const API_TOKEN = process.env.IONIC_API_TOKEN
const IONIC_APP_ID = 'f08d588e'

const options: IonicDBOptions = {
  app_id: IONIC_APP_ID,
  authType: 'authenticated',
  WebSocketCtor: WebSocket,
}

const ionicDb = new IonicDB(options)
ionicDb.setToken(API_TOKEN)
ionicDb.connect()

Db.forNode(ionicDb)

const db = Db.forNode()

const hosties = db.collection('hosties')
// const boties = db.collection('boties')

let i = 0
hosties
  .watch()
  .flatMap(doc => doc)
  .subscribe(doc => {
    console.log(i++ + ': ', doc)
  })


db.onConnected().subscribe(_ => {
  console.log("Connected to IonicDB!")
})

