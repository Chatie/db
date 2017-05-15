import * as Wilddog from 'wilddog'

import {
  Brolog,
  Loggable,
  nullLogger,
}                   from 'brolog'

import {
  wilddogConfig,
}                   from './config'

export interface IDb {
  currentUserEmail: () => string,
  rootRef:          () => Wilddog.sync.Reference,
}

Wilddog.initializeApp(wilddogConfig)

export class Db implements IDb {
  private static $instance: Db
  public  static instance() {
    Db.log.verbose('Db', 'instance()')

    if (!this.$instance) {
      this.$instance = new Db()
    }
    return this.$instance
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
      this.log.silly('Db', 'jwtAuth(%s) wilddog signOut()', idToken)
      await Wilddog.auth().signOut()
      return
    }

    // 1. use api to transform idToken to wilddogToken
    // tslint:disable-next-line:max-line-length
    const customToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ2IjoxLCJpYXQiOjE0OTQ4MjMzMzIsInVpZCI6InVpZDEiLCJleHAiOjE0OTQ4MjY5MzIsImFkbWluIjpmYWxzZSwiY2xhaW1zIjp7ImVtYWlsIjoieml4aWFAeml4aWEubmV0IiwiZW1haWxWZXJpZmllZCI6dHJ1ZX19.F1vsODb3WMPfJSXQC_M6trFvueDk1_GCNtzh1lcJtvM'
    this.log.warn('Db', 'jwtAuth() TODO: jwtAuth need change to get from API. idToken length:', idToken && idToken.length)

    try {
      const userInfo = await Wilddog.auth().signInWithCustomToken(customToken) as Wilddog.UserInfo
      this.log.silly('Db', 'jwtAuth() wilddog.auth().signInWithCustomToken() userInfo({email:%s})', userInfo.email)
      console.log(userInfo)
    } catch (e) {
      this.log.error('Db', 'jwtAuth() exception:%s', e.message)
    }

    return
  }

  public rootRef(): Wilddog.sync.Reference {
    this.log.verbose('Db', 'rootRef()')
    return Wilddog.sync().ref('/')
  }

  public currentUserEmail(): string {
    this.log.verbose('Db', 'currentUser()')
    const user = Wilddog.auth().currentUser
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

export { Wilddog }

export async function test() {
  const token = '1'
  const result = await Wilddog.auth().signInWithCustomToken(token)
  console.log('auth: %s', JSON.stringify(result))

  const root = Wilddog.sync().ref()
  // root.on('value', snap => console.log(snap.val()));

  const zixia = root.child('zixia')
  zixia.on('value', snap => {
      console.log(snap!.key, snap!.val())
  })
  // zixia.update()
  await Wilddog.auth().signOut()

  await Wilddog.auth().signInAnonymously()
}

/**
 * https://wilddog.google.com/docs/database/web/offline-capabilities
 *
 */
export function userPresenceSystem() {
    // since I can connect from multiple devices or browser tabs, we store each connection instance separately
    // any time that connectionsRef's value is null (i.e. has no children) I am offline
    const myConnectionsRef = Wilddog.sync().ref('users/joe/connections');

    // stores the timestamp of my last disconnect (the last time I was seen online)
    const lastOnlineRef = Wilddog.sync().ref('users/joe/lastOnline');

    const connectedRef = Wilddog.sync().ref('.info/connected');
    connectedRef.on('value', function(snap) {
      if (snap!.val() === true) {
          // We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)

          // add this device to my connections list
          // this value could contain info about the device or a timestamp too
          const con = myConnectionsRef.push(true);

          // when I disconnect, remove this device
          con.onDisconnect().remove();

          // when I disconnect, update the last time I was seen online
          lastOnlineRef.onDisconnect().set(Wilddog.sync().ServerValue.TIMESTAMP);
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
  const newPostKey = Wilddog.sync().ref().child('posts').push().key;

  // Write the new post's data simultaneously in the posts list and the user's post list.
  const updates = {};
  updates['/posts/' + newPostKey] = postData;
  updates['/user-posts/' + uid + '/' + newPostKey] = postData;

  return Wilddog.sync().ref().update(updates);
}
