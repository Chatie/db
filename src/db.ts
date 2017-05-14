import * as Firebase    from 'firebase'

import {
  Brolog,
  Loggable,
  nullLogger,
}                       from 'brolog'

import {
  IDb,
  databaseURL,
}                       from './config'

export const firebaseConfig = {
  apiKey:             'AIzaSyB0oeZdda1zmCa1KusRDhVsN5sQROYrSEg',
  authDomain:         'wechaty-bo.firebaseapp.com',
  databaseURL,
  messagingSenderId:  '673602949542',
  projectId:          'wechaty-bo',
  storageBucket:      'wechaty-bo.appspot.com',
}

/**
 * https://firebase.google.com/docs/database/
 * https://firebase.google.com/docs/auth/web/custom-auth
 * https://firebase.google.com/docs/auth/admin/create-custom-tokens
 */
Firebase.initializeApp(firebaseConfig)

export class Db implements IDb {
  private static _instance: Db

  public static instance() {
    Db.log.verbose('Db', 'instance()')

    if (!this._instance) {
      this._instance = new Db()
    }
    return this._instance
  }

  public static log: Loggable = nullLogger
  public static enableLogging(log: boolean | Loggable ) {
    this.log = Brolog.enableLogging(log)
  }

  private log: Loggable

  private constructor() {
    this.log = Db.log
    this.log.verbose('Db', 'constructor()')
  }

  public async jwtAuth(enable: false):    Promise<void>
  public async jwtAuth(idToken: string):  Promise<void>

  public async jwtAuth(idToken: string | false):  Promise<void> {
    this.log.verbose('Db', 'jwtAuth(%s)', idToken)

    if (!idToken) {
      this.log.silly('Db', 'jwtAuth(%s) firebase signOut()', idToken)
      await Firebase.auth().signOut()
      return
    }

    // 1. use api to transform idToken to firebaseToken
    // tslint:disable-next-line:max-line-length
    const customToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGFpbXMiOnsicHJlbWl1bUFjY291bnQiOnRydWUsImVtYWlsIjoieml4aWFAeml4aWEubmV0In0sInVpZCI6InNvbWUtdWlkIiwiaWF0IjoxNDk0NDE0MDg0LCJleHAiOjE0OTQ0MTc2ODQsImF1ZCI6Imh0dHBzOi8vaWRlbnRpdHl0b29sa2l0Lmdvb2dsZWFwaXMuY29tL2dvb2dsZS5pZGVudGl0eS5pZGVudGl0eXRvb2xraXQudjEuSWRlbnRpdHlUb29sa2l0IiwiaXNzIjoiZmlyZWJhc2UtYWRtaW5zZGstY3NuaGhAd2VjaGF0eS1iby5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsInN1YiI6ImZpcmViYXNlLWFkbWluc2RrLWNzbmhoQHdlY2hhdHktYm8uaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20ifQ.qhf-AWrStlAvdnWInyDd_j_OYm1YV5MR7lb5IYAy_YI-mtbMS4EfH563CR5t3vzB-1F8XSXXBkr5EQxc0HFvMZME9GIqJiwVMZyWRuU1TMk_paqD4Ji1uqbNbeXTgjC_Aj8CNbiZMqTURTiZVjMJRw35KOKBFclv2zkfyzBUTkd1FbW2GM-OWyuhustc7lWzB-_unL5XTLKIVTRwyLyU1iARqqPN6dWyFWnSwgAeDaSYOMLeAo8zF_tsA0YTtWOgrlh5JZtr4Y8q0IzYeL5KxZfRrhQam2elWvQhwv2stygz9TFbjkchBrUzyQZcpwc-wEfhWysfr_70KmprNXg7ZQ'
    this.log.warn('Db', 'jwtAuth() TODO: jwtAuth need change to get from API', idToken && idToken.length)

    try {
      const userInfo = await Firebase.auth().signInWithCustomToken(customToken) as Firebase.UserInfo
      this.log.silly('Db', 'jwtAuth() firebase.auth().signInWithCustomToken() userInfo({email:%s})', userInfo.email)
    } catch (e) {
      this.log.error('Db', 'jwtAuth() exception:%s', e.message)
    }

    return
  }

  public rootRef(): Firebase.database.Reference {
    this.log.verbose('Db', 'rootRef()')
    return Firebase.database().ref('/')
  }

  public currentUserEmail(): string {
    this.log.verbose('Db', 'currentUser()')
    const user = Firebase.auth().currentUser
    if (!user || !user.email || !user.emailVerified) {
      throw new Error('user/email/verfication not found')
    }
    return user.email
  }

  public toggleStar(postRef, uid) {
    postRef.transaction(function(post) {
      if (post) {
        if (post.stars && post.stars[uid]) {
          post.starCount--
          post.stars[uid] = null
        } else {
          post.starCount++
          if (!post.stars) {
            post.stars = {}
          }
          post.stars[uid] = true
        }
      }
      return post
    })
  }
}
