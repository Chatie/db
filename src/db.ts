import * as Wilddog from 'wilddog'

import {
  Brolog,
  Loggable,
  nullLogger,
}                   from 'brolog'

import * as UrlSafeBase64 from 'urlsafe-base64'

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

  private static claims: Wilddog.UserInfo | null

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
      this.claims = null
      await Wilddog.auth().signOut()
      return
    }

    // 1. use api to transform idToken to wilddogToken
    // tslint:disable-next-line:max-line-length
    const customToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ2IjoxLCJpYXQiOjE0OTQ4Mzk5NjIsInVpZCI6InppeGlhIiwiZXhwIjoxNDk0ODQzNTYyLCJhZG1pbiI6ZmFsc2UsImNsYWltcyI6eyJlbWFpbCI6InppeGlhQHppeGlhLm5ldCIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlfX0.JG5Jm0mV_vIYetVuDcPIGgGHFBDlqjeIOeEu9DTRezA'
    this.log.warn('Db', 'jwtAuth() TODO: jwtAuth need change to get from API. idToken length:', idToken && idToken.length)

    try {
      // userInfo is useless. See: https://forum.wilddog.com/topic/23/authwithcustomtoken
      await Wilddog.auth().signInWithCustomToken(customToken)

      const token = Wilddog.auth().currentUser.getToken()
      const claimsStr = UrlSafeBase64.decode(token.split('.')[1])
                                      .toString()
      this.claims = JSON.parse(claimsStr)

      this.log.silly('Db', 'jwtAuth() wilddog.auth().signInWithCustomToken() claims({email:%s})',
                            this.claims!.email)
    } catch (e) {
      this.log.error('Db', 'jwtAuth() exception:%s', e.message)
      this.claims = null
      Wilddog.auth().signOut()
    }

    return
  }

  public rootRef(): Wilddog.sync.Reference {
    this.log.verbose('Db', 'rootRef()')
    return Wilddog.sync().ref('/')
  }

  public currentUserEmail(): string {
    this.log.verbose('Db', 'currentUserEmail()')
    const email     = Db.claims && Db.claims.email
    // const verified  = Db.claims && Db.claims. email_verified
    if (!email) {
      throw new Error('email not exist')
    }
    return email.replace(/\./g, ',')
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
