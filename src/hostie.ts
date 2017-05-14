
import {
  BehaviorSubject,
  Observable,
  Subscription,
}                     from  'rxjs'
import                      'rxjs/add/operator/map'

import { Brolog }     from 'brolog'

import { Db }         from './db'

import {
  Hostie,
  HostieRuntime,
  HostieStatus,
}                     from './hostie-schema'

import { Store }      from './store'

export class HostieStore implements Store<Hostie> {

  private static _instance: HostieStore

  public static instance() {
    Brolog.instance().verbose('HostieStore', 'instance()')

    if (!this._instance) {
      this._instance = new HostieStore()
    }
    return this._instance
  }

  private log: Brolog

  private user:   any
  private email:  string | null

  private subscription: Subscription|null = null

  private pathUserHostie: string
  private pathHostie:     string
  private hostiesRef:     firebase.database.Reference

  private hosties$:  BehaviorSubject<Hostie[]> = new BehaviorSubject([])
  public get hosties() {
    return this.hosties$.asObservable()
  }

  private constructor() {
    this.log = Brolog.instance()
    this.log.verbose('HostieStore', 'constructor()')

    if (HostieStore._instance) {
      throw new Error('HostieStore should be singleton')
    }

    /**
     * /hosties/id/email/zixia@zixia.net
     * /users/zixia@zixia.net/hosties/[id1,id2,...]
     */
    this.pathUserHostie = '/users'
                        + '/' + db.email()
                        + '/hosties'

    this.pathHostie = '/hosties'

    this.hostiesRef = db.database().ref(this.pathUserHostie)
  }

  /**
   * @todo confirm the return type of Observable
   * @param newHostie
   */
  public insert(newHostie: Hostie): Observable<Hostie> {
    this.log.verbose('HostieStore', 'insert()')
    newHostie.email = this.email || 'unknown@unknown.org'
    return this.collection.insert(newHostie)
  }

  /**
   * remove
   * @param id uuid
   */
  public remove(id: string) {
    this.log.verbose('HostieStore', 'remove()')
    return this.collection.remove(id)
  }

  /**
   * find
   * @param condition
   */
  public find(condition: object): Observable<any>
  public find(id: string):        Observable<any>

  public find(value: string | object): Observable<any> {
    this.log.verbose('HostieStore', 'find()')
    return this.collection
                .find(value)
                .fetch()
                .defaultIfEmpty()
  }

  /**
   * update will only change the specified fields in documents it affects;
   * unspecified fields will be left untouched.
   * @param updateHostie
   */
  public update(condition: object) {
    this.log.verbose('HostieStore', 'update(%s)', JSON.stringify(condition))
    return this.collection.update(condition)
  }

  public auth(email?: string | null) {
    this.log.verbose('HostieStore', 'auth(%s)', email)

    if (email) {
      this.email = email

      this.subscription = this.collection
          .findAll({ email: this.email })
          .limit(10)
          .watch() // TODO: watch for the specific user instead of all
          // .fetch()
          .defaultIfEmpty() // XXX: confirm the behaviour of this
          .subscribe((list: Hostie[]) => {
            this.log.silly('HostieStore', 'constructor() subscript() %s', list)
            this.hosties$.next(list)
          })

      this.log.silly('HostieStore', 'auth() subscribe() collection')

    } else {
      this.log.silly('HostieStore', 'auth() unsubscribe() collection')
      if (this.subscription) {
        this.subscription.unsubscribe()
        this.subscription = null
      }

      this.user = null
      this.email = null
    }
  }
}

export const hostieStore = HostieStore.instance()


async function test() {
    const result = await firebase.auth().signInWithCustomToken(token)
    console.log('auth: %s', JSON.stringify(result))

    const root = firebase.database().ref()
    // root.on('value', snap => console.log(snap.val()));

    const zixia = root.child('zixia')
    zixia.on('value', snap => {
        console.log(snap.key, snap.val())
    })
    // zixia.update()
    await firebase.auth().signOut()

    await firebase.auth().signInAnonymously()
}

/**
 * https://firebase.google.com/docs/database/web/offline-capabilities
 *
 */
function userPresenceSystem() {
    // since I can connect from multiple devices or browser tabs, we store each connection instance separately
    // any time that connectionsRef's value is null (i.e. has no children) I am offline
    var myConnectionsRef = firebase.database().ref('users/joe/connections');

    // stores the timestamp of my last disconnect (the last time I was seen online)
    var lastOnlineRef = firebase.database().ref('users/joe/lastOnline');

    var connectedRef = firebase.database().ref('.info/connected');
    connectedRef.on('value', function(snap) {
    if (snap.val() === true) {
        // We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)

        // add this device to my connections list
        // this value could contain info about the device or a timestamp too
        var con = myConnectionsRef.push(true);

        // when I disconnect, remove this device
        con.onDisconnect().remove();

        // when I disconnect, update the last time I was seen online
        lastOnlineRef.onDisconnect().set(firebase.database.ServerValue.TIMESTAMP);
    }
    });
}


function writeNewPost(uid, username, picture, title, body) {
  // A post entry.
  var postData = {
    author: username,
    uid: uid,
    body: body,
    title: title,
    starCount: 0,
    authorPic: picture
  };

  // Get a key for a new Post.
  var newPostKey = firebase.database().ref().child('posts').push().key;

  // Write the new post's data simultaneously in the posts list and the user's post list.
  var updates = {};
  updates['/posts/' + newPostKey] = postData;
  updates['/user-posts/' + uid + '/' + newPostKey] = postData;

  return firebase.database().ref().update(updates);
}
