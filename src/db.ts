import * as Firebase    from 'firebase'

import {
  Brolog,
  Loggable,
  nullLogger,
}                       from 'brolog'

import {
  firebaseConfig,
}                       from './config'

/**
 * https://firebase.google.com/docs/database/
 * https://firebase.google.com/docs/auth/web/custom-auth
 * https://firebase.google.com/docs/auth/admin/create-custom-tokens
 */
Firebase.initializeApp(firebaseConfig)

export interface IDb {
  currentUserEmail: () => string,
  rootRef:          () => Firebase.database.Reference,
}

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
    this.log.verbose('Db', 'enableLogging(%s)', log)
  }

  private log: Loggable

  private constructor() {
    this.log = Db.log
    this.log.verbose('Db', 'constructor()')
  }

  public static async jwtAuth(enable: false):    Promise<void>
  public static async jwtAuth(idToken: string):  Promise<void>

  public static async jwtAuth(idToken: string | false):  Promise<void> {
    this.log.verbose('Db', 'jwtAuth(%s)', idToken)

    if (!idToken) {
      this.log.silly('Db', 'jwtAuth(%s) firebase signOut()', idToken)
      await Firebase.auth().signOut()
      return
    }

    // 1. use api to transform idToken to firebaseToken
    // tslint:disable-next-line:max-line-length
    const customToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGFpbXMiOnsicHJlbWl1bUFjY291bnQiOnRydWUsImVtYWlsIjoieml4aWFAeml4aWEubmV0In0sInVpZCI6InNvbWUtdWlkIiwiaWF0IjoxNDk0NDE0MDg0LCJleHAiOjE0OTQ0MTc2ODQsImF1ZCI6Imh0dHBzOi8vaWRlbnRpdHl0b29sa2l0Lmdvb2dsZWFwaXMuY29tL2dvb2dsZS5pZGVudGl0eS5pZGVudGl0eXRvb2xraXQudjEuSWRlbnRpdHlUb29sa2l0IiwiaXNzIjoiZmlyZWJhc2UtYWRtaW5zZGstY3NuaGhAd2VjaGF0eS1iby5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsInN1YiI6ImZpcmViYXNlLWFkbWluc2RrLWNzbmhoQHdlY2hhdHktYm8uaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20ifQ.qhf-AWrStlAvdnWInyDd_j_OYm1YV5MR7lb5IYAy_YI-mtbMS4EfH563CR5t3vzB-1F8XSXXBkr5EQxc0HFvMZME9GIqJiwVMZyWRuU1TMk_paqD4Ji1uqbNbeXTgjC_Aj8CNbiZMqTURTiZVjMJRw35KOKBFclv2zkfyzBUTkd1FbW2GM-OWyuhustc7lWzB-_unL5XTLKIVTRwyLyU1iARqqPN6dWyFWnSwgAeDaSYOMLeAo8zF_tsA0YTtWOgrlh5JZtr4Y8q0IzYeL5KxZfRrhQam2elWvQhwv2stygz9TFbjkchBrUzyQZcpwc-wEfhWysfr_70KmprNXg7ZQ'
    this.log.warn('Db', 'jwtAuth() TODO: jwtAuth need change to get from API. idToken length:', idToken && idToken.length)

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
      throw new Error('user/email/verfication not found:' + user)
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

export { Firebase }

export async function test() {
  const token = '1'
  const result = await firebase.auth().signInWithCustomToken(token)
  console.log('auth: %s', JSON.stringify(result))

  const root = firebase.database().ref()
  // root.on('value', snap => console.log(snap.val()));

  const zixia = root.child('zixia')
  zixia.on('value', snap => {
      console.log(snap!.key, snap!.val())
  })
  // zixia.update()
  await firebase.auth().signOut()

  await firebase.auth().signInAnonymously()
}

/**
 * https://firebase.google.com/docs/database/web/offline-capabilities
 *
 */
export function userPresenceSystem() {
    // since I can connect from multiple devices or browser tabs, we store each connection instance separately
    // any time that connectionsRef's value is null (i.e. has no children) I am offline
    const myConnectionsRef = firebase.database().ref('users/joe/connections');

    // stores the timestamp of my last disconnect (the last time I was seen online)
    const lastOnlineRef = firebase.database().ref('users/joe/lastOnline');

    const connectedRef = firebase.database().ref('.info/connected');
    connectedRef.on('value', function(snap) {
      if (snap!.val() === true) {
          // We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)

          // add this device to my connections list
          // this value could contain info about the device or a timestamp too
          const con = myConnectionsRef.push(true);

          // when I disconnect, remove this device
          con.onDisconnect().remove();

          // when I disconnect, update the last time I was seen online
          lastOnlineRef.onDisconnect().set(firebase.database.ServerValue.TIMESTAMP);
      }
    });
}

export function writeNewPost(uid, username, picture, title, body) {
  // A post entry.
  const postData = {
    author: username,
    uid: uid,
    body: body,
    title: title,
    starCount: 0,
    authorPic: picture,
  };

  // Get a key for a new Post.
  const newPostKey = firebase.database().ref().child('posts').push().key;

  // Write the new post's data simultaneously in the posts list and the user's post list.
  const updates = {};
  updates['/posts/' + newPostKey] = postData;
  updates['/user-posts/' + uid + '/' + newPostKey] = postData;

  return firebase.database().ref().update(updates);
}
