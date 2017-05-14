# db
[![Build Status](https://api.travis-ci.org/Chatie/db.svg?branch=master)](https://travis-ci.org/Chatie/db) [![npm version](https://badge.fury.io/js/%40chatie%2Fdb.svg)](https://www.npmjs.com/package/@chatie/db)

Database for Chatie System

* <https://blog.chatie.io>
* <https://www.chatie.io>

## Reference

### Firebase

* [Firebase Realtime Database Introduction Documentation](https://firebase.google.com/docs/database/)

### Scaphold(Graphql)

* [How to add social authentication to Scaphold](https://scaphold.io/community/questions/scaphold-social-login/)

### Ionic DB

DEPRECATED and Sun Set at 9th May 2017

## Resources

### Admin

!(Chart)[https://heroku-blog-files.s3.amazonaws.com/posts/1479328331-Kafka%20Twitter%20Dashboard.gif]
> https://blog.heroku.com/kafka-data-pipelines-frp-node

### Firebase

* [Firebase Realtime Database](https://firebase.google.com/docs/database/)
* [Add the Firebase Admin SDK to your Server](https://firebase.google.com/docs/admin/setup)
* [Firebase API Reference](https://firebase.google.com/docs/reference/js/)

## Change History

### v0.1.x (master)

Switch to Firebase

1. Ionic DB Sunset Done: `404 error` at 9th May 2017
1. Firebase server is not blocked in China any more
1. Rename: from Dockie to Hostie(back)

### v0.0.x (Mar, 2017)

Starting with Realtime Database: Ionic DB

1. Limitation: does not support server JWT


db/
  hostie

await db.jwtAuth(fasf)
  uid
  email

  hostie.add({}, email?)

await db.jwtAuth(false)



///////////////////////////////////////////////
import { Db } from '@chatie/db'
Db.enableLogging(true)
await Db.jwtAuth(idToken)
await Db.jwtAuth(false)

const rootRef: Firebase.database.Reference = Db.database().ref('/')

const hostieStore = HostieStore.instance(rootRef)
hostieStore.hostieList.subscribe(l => console.log)
hostieStore.insert({}, uid)

///////////////////////////////////////////////
import { AdminDb } from '@chatie/db'

AdminDb.enableLogging(true)
await AdminDb.serviceAuth(serviceConfig)

const rootRef: Firebase.database.Reference = AdminDb.database().ref('/')

const hostieStore = HostieStore.instance(rootRef, email)
hostieStore.hostieList.subscribe(l => console.log)
hostieStore.insert({}, uid)
