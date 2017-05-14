import * as Firebase  from 'firebase'
import { Loggable }   from 'brolog'
import {
  BehaviorSubject,
  Observable,
}                     from  'rxjs'

import { Db }         from './db'
import {
  Hostie,
}                     from './hostie-schema'
import { Store }      from './store'

export class HostieStore implements Store {

  private static $instance: HostieStore
  public static instance(
    rootRef?:   Firebase.database.Reference,
    userEmail?: (() => string),
  ): HostieStore {
    if (!this.$instance) {
      this.$instance = new HostieStore(rootRef, userEmail)
    } else if (rootRef || userEmail) {
      throw new Error('can not set singleton instance twice')
    }
    return this.$instance
  }

  private $data: BehaviorSubject<Hostie>
  public get data(): Observable<Hostie> { return this.$data.asObservable() }

  private log: Loggable

  private rootRef:      Firebase.database.Reference
  private emailGetter:  () => string

  private dbPathUserHosties:  string
  private dbPathHosties:      string

  constructor(
    rootRef?:     Firebase.database.Reference,
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

    this.rootRef.child(this.dbPathUserHosties)
                .on('value', snapshot => {
                  if (snapshot) {
                    this.log.silly('HostieStore', 'constructor() on(value, snapshot => %s)', snapshot.val())
                    this.$data.next(snapshot.val())
                  } else {
                    this.log.error('HostieStore', 'constructor() snapshot null')
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
                            .key
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

  public async find(id: string): Promise<Hostie> {
    this.log.verbose('HostieStore', 'find(%s)', id)
    return await this.rootRef
                      .child(this.dbPathHosties + '/' + id)
                      .once('value')
  }

  /**
   * update will only change the specified fields in documents it affects;
   * unspecified fields will be left untouched.
   * @param updateHostie
   */
  public async update(condition: object): Promise<Hostie> {
    this.log.verbose('HostieStore', 'update(%s)', JSON.stringify(condition))

    const id = condition['id']
    if (!id) {
      throw new Error('no id')
    }
    const updatedHostie = await this.find(id)
    Object.assign(updatedHostie, condition)
    const updates = {}
    updates[this.dbPathHosties      + '/' + id] = updatedHostie
    updates[this.dbPathUserHosties  + '/' + id] = updatedHostie

    await this.rootRef.update(updates)
    return updatedHostie
  }

}

export const hostieStore = HostieStore.instance()
