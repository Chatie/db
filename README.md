# CHATIE DB

[![npm version](https://badge.fury.io/js/%40chatie%2Fdb.svg)](https://www.npmjs.com/package/@chatie/db)
[![Build Status](https://api.travis-ci.org/Chatie/db.svg?branch=master)](https://travis-ci.org/Chatie/db)
[![Greenkeeper badge](https://badges.greenkeeper.io/Chatie/db.svg)](https://greenkeeper.io/)

RealTime Database for [Chatie Service](https://www.chatie.io)

![RealTime Data](https://chatie.io/db/images/realtime-data.png)
> Picture Credit: [What is Real-time Data?](https://www.insightdata.co.uk/news/what-is-real-time-data/)

## FEATURES

1. RealTime Store Class for Hostie, Botie and Gitfie etc.
1. Backed by [@chatie/graphql](https://github.com/Chatie/graphql) which Powered By [GraphCool](https://www.graph.cool/).

## TESTING

### Generate Schemas

Generate schemas from the production graphql server:

```shell
npm run generate-schemas
```

### Unit Tests

Run unit tests on local server:

```shell
npm run graphcool:restart
npm run test:unit
```

## RESOURCES

### Angular Module

* [Transpile your libraries to Angular Package Format](http://spektrakel.de/ng-packagr/)
* [Angular Package Format (APF) v6.0](https://docs.google.com/document/d/1CZC2rcpxffTDfRDs6p1cfbmKNLA6x5O-NtkJglDaBVs/preview#)
* [Juri Strumpflohner - Create and publish Angular libs like a Pro](https://www.youtube.com/watch?v=K4YMmwxGKjY)

### Admin

![Chart](https://heroku-blog-files.s3.amazonaws.com/posts/1479328331-Kafka%20Twitter%20Dashboard.gif)
> <https://blog.heroku.com/kafka-data-pipelines-frp-node>

### Apollo Client

* [Apollo Client + TypeScript example](https://medium.com/@borekb/apollo-client-typescript-example-99febdaa18fa)

## CHANGE LOG

### v0.8 master (May 2018)

1. Upgrade RxJS version from 5 to 6
1. Force in `strict` TypeScript mode

### v0.5 (Apr 8, 2018)

**Angular Injection Support.**

1. use [ng-packagr](https://github.com/dherges/ng-packagr) to package `@chatie/db` to follow the [Angular Package Format (APF) v6.0](https://docs.google.com/document/d/1CZC2rcpxffTDfRDs6p1cfbmKNLA6x5O-NtkJglDaBVs/preview#)

### v0.4 (Apr 1, 2018)

**Integrate with Angular**

1. use `StateSwitch` to wait `ready()` for `Store`
1. integrate with `@chatie/app` in the Browser.

### v0.3 (18th, Feb, 2018)

Switch to [Graph.Cool](https://www.graph.cool) Serverless solution because Wilddog sucks.

1. use `@chatie/graphql` module to enable graphql backend.
1. unit testing with stores: Store, HostieStore, etc.

> 2018-03-17 Update: [因资金问题，“野狗”停止新用户注册](https://36kr.com/p/5124258.html)

### v0.2 (15th, May, 2017)

Switch to [Wilddog](https://www.wilddog.com/), because Firebase `Firebase.auth().signInWithCustomToken()` is still blocked in China by GFW.

### v0.1 (15th, May, 2017)

Switch to [Firebase](https://firebase.google.com/) because Ionic DB Sunset Done: `404 error` at 9th May 2017

1. Firebase server is not blocked in China any more.
1. Rename: from Dockie to Hostie(back).

### v0.0 (Mar, 2017)

Starting with Realtime Database: [Ionic DB](https://forum.ionicframework.com/t/ionic-db-shutdown/84677)

1. Limitation: does not support server JWT

## SEE ALSO

* [An enhanced GraphQL developer experience with TypeScript](https://dev-blog.apollodata.com/graphql-dx-d35bcf51c943)

## AUTHOR

[Huan LI](http://linkedin.com/in/zixia) \<zixia@zixia.net\>

<a href="https://stackexchange.com/users/265499">
  <img src="https://stackexchange.com/users/flair/265499.png" width="208" height="58" alt="profile for zixia on Stack Exchange, a network of free, community-driven Q&amp;A sites" title="profile for zixia on Stack Exchange, a network of free, community-driven Q&amp;A sites">
</a>

## COPYRIGHT & LICENSE

* Code & Docs © 2017-2018 Huan LI \<zixia@zixia.net\>
* Code released under the Apache-2.0 License
* Docs released under Creative Commons
