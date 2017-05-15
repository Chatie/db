import * as Wilddog from 'wilddog'
import { Loggable } from 'brolog'
import {
  BehaviorSubject,
  Observable,
}                   from  'rxjs'

import { Db }       from './db'
import {
  Hostie,
}                   from './hostie-schema'
import { Store }    from './store'

export interface HostieMap {
  [id: string]: Hostie
}

export class HostieStore implements Store {

  private static $instance: HostieStore
  public static instance(
    rootRef?:   Wilddog.sync.Reference,
    userEmail?: (() => string),
  ): HostieStore {
    if (!this.$instance) {
      this.$instance = new HostieStore(rootRef, userEmail)
    } else if (rootRef || userEmail) {
      throw new Error('can not set singleton instance twice')
    }
    return this.$instance
  }

  private $data: BehaviorSubject<HostieMap>
  public get data(): Observable<HostieMap> { return this.$data.asObservable() }

  private rootRef:      Wilddog.sync.Reference
  private emailGetter:  () => string

  private dbPathUserHosties:  string
  private dbPathHosties:      string

  private log: Loggable

  constructor(
    rootRef?:     Wilddog.sync.Reference,
    emailGetter?: (() => string),
  ) {
    this.log = Db.log
    this.log.verbose('HostieStore', 'constructor()')

    this.rootRef = rootRef
                  ? rootRef
                  : Db.instance().rootRef()

    this.emailGetter = emailGetter
                      ? emailGetter
                      : () => Db.instance().currentUserEmail()

    // users/${zixia@zixia.ne}t/hosties/[id1,id2,...]
    this.dbPathUserHosties  = '/users'
                            + '/' + this.emailGetter()
                            + '/hosties'

    // hosties/${id}/email/zixia@zixia.net
    this.dbPathHosties      = '/hosties'

    this.init()
  }

  public init(): void {
    this.log.verbose('HostieStore', 'init()')

    this.$data = new BehaviorSubject<HostieMap>({})

    this.rootRef.child(this.dbPathUserHosties)
                .on('value', snapshot => {
                  if (snapshot) {
                    this.log.silly('HostieStore', 'init() on(value, snapshot => %s)', snapshot.val())
                    if (snapshot.val()) {
                      this.$data.next(snapshot.val())
                    } else {
                      this.log.warn('HostieStore', 'init() snapshot.val() is null')
                      this.$data.next({})
                    }
                  } else {
                    this.log.error('HostieStore', 'init() snapshot is null')
                  }
                })
  }

  /**
   * @todo confirm the return type of Observable
   * @param newHostie
   */
  public async add(newHostie: Hostie): Promise<void> {
    this.log.verbose('HostieStore', 'add({name:%s})', newHostie.name)
    newHostie.email = this.emailGetter()

    const id = this.rootRef.child(this.dbPathHosties)
                            .push()
                            .key()
    if (!id) {
      throw new Error('push key null')
    }
    newHostie.id = id

    const updates = {}
    updates[this.dbPathHosties      + '/' + id] = newHostie
    updates[this.dbPathUserHosties  + '/' + id] = newHostie

    await this.rootRef.update(updates)
  }

  /**
   * remove
   * @param id uuid
   */
  public async del(id: string): Promise<void> {
    this.log.verbose('HostieStore', 'del(%s)', id)

    const updates = {}
    updates[this.dbPathHosties      + '/' + id] = null
    updates[this.dbPathUserHosties  + '/' + id] = null

    await this.rootRef.update(updates)
  }

  /**
   * find
   * @param id
   */
  // public find(condition: object): Observable<any>
  // public find(value: string | object): Observable<any> {

  public async find(id: string): Promise<Hostie | null> {
    this.log.verbose('HostieStore', 'find(%s)', id)
    let snapshot: Wilddog.sync.DataSnapshot
    snapshot = await this.rootRef
                          .child(this.dbPathHosties + '/' + id)
                          .once('value')
    return snapshot.val()
  }

  /**
   * update will only change the specified fields in documents it affects;
   * unspecified fields will be left untouched.
   * @param updateHostie
   */
  public async update(condition: object): Promise<void> {
    this.log.verbose('HostieStore', 'update({id:%s})', condition['id'])

    const id = condition['id']
    if (!id) {
      throw new Error('no id')
    }
    const updatedHostie = await this.find(id)
    if (!updatedHostie) {
      throw new Error('update() id not found')
    }

    Object.assign(updatedHostie, condition)

    const updates = {}
    updates[this.dbPathHosties      + '/' + id] = updatedHostie
    updates[this.dbPathUserHosties  + '/' + id] = updatedHostie

    await this.rootRef.update(updates)
    return
  }
}

export * from './hostie-schema'
