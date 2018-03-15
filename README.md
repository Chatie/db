# CHATIE DB
[![Build Status](https://api.travis-ci.org/Chatie/db.svg?branch=master)](https://travis-ci.org/Chatie/db) [![npm version](https://badge.fury.io/js/%40chatie%2Fdb.svg)](https://www.npmjs.com/package/@chatie/db)

Database for Chatie System

* <https://blog.chatie.io>

# GRAPHQL BACKEND

https://github.com/Chatie/graphql

Powered by [Graph.cool](https://www.graph.cool/)

# RESOURCES

## Admin

![Chart](https://heroku-blog-files.s3.amazonaws.com/posts/1479328331-Kafka%20Twitter%20Dashboard.gif)
> https://blog.heroku.com/kafka-data-pipelines-frp-node

* [Introducing GraphQL Subscriptions](https://blog.graph.cool/introducing-graphql-subscriptions-86183029029a)

# CHANGE LOG

### v0.3 (18th, Feb, 2018)

Switch to [Graph.Cool](https://www.graph.cool) Serverless solution because Wilddog sucks.


### v0.2 (15th, May, 2017)

Switch to [Wilddog](https://www.wilddog.com/), because Firebase `Firebase.auth().signInWithCustomToken()` is still blocked in China by GFW.

### v0.1 (15th, May, 2017)

Switch to [Firebase](https://firebase.google.com/) because Ionic DB Sunset Done: `404 error` at 9th May 2017

1. Firebase server is not blocked in China any more
1. Rename: from Dockie to Hostie(back)

### v0.0 (Mar, 2017)

Starting with Realtime Database: [Ionic DB](https://forum.ionicframework.com/t/ionic-db-shutdown/84677)

1. Limitation: does not support server JWT

# AUTHOR

[Huan LI](http://linkedin.com/in/zixia) \<zixia@zixia.net\>

<a href="https://stackexchange.com/users/265499">
  <img src="https://stackexchange.com/users/flair/265499.png" width="208" height="58" alt="profile for zixia on Stack Exchange, a network of free, community-driven Q&amp;A sites" title="profile for zixia on Stack Exchange, a network of free, community-driven Q&amp;A sites">
</a>

# COPYRIGHT & LICENSE

* Code & Docs © 2017-2018 Huan LI \<zixia@zixia.net\>
* Code released under the Apache-2.0 License
* Docs released under Creative Commons


```ts
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

```
