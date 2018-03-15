import {
  BehaviorSubject,
}                   from  'rxjs/BehaviorSubject'
import {
  Observable,
}                   from 'rxjs/Observable'

import { log }      from './config'
import { Db }       from './db'
import {
  Hostie,
}                   from './hostie-schema'
import { Store }    from './store'

export interface HostieMap {
  [id: string]: Hostie
}

export class HostieStore implements Store {

  private $itemList: BehaviorSubject<HostieMap>
  public get itemList(): Observable<HostieMap> {
    return this.$itemList.asObservable()
  }

  constructor(
    public db: Db,
  ) {
    log.verbose('HostieStore', 'constructor()')
  }

  public async init(): Promise<void> {
    log.verbose('HostieStore', 'init()')

    this.$itemList = new BehaviorSubject<HostieMap>({})

    this.db.apollo.

    this.rootRef.child(this.dbPathUserHosties)
                .on('value', snapshot => {
                  if (snapshot) {
                    log.silly('HostieStore', 'init() on(value, snapshot => %s)', snapshot.val())
                    if (snapshot.val()) {
                      this.$data.next(snapshot.val())
                    } else {
                      log.warn('HostieStore', 'init() snapshot.val() is null')
                      this.$data.next({})
                    }
                  } else {
                    log.error('HostieStore', 'init() snapshot is null')
                  }
                })
  }

  /**
   * @todo confirm the return type of Observable
   * @param newHostie
   */
  public async create(newHostie: Hostie): Promise<void> {
    log.verbose('HostieStore', 'add({name:%s})', newHostie.name)
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
   * delete
   * @param id uuid
   */
  public async delete(id: string): Promise<void> {
    log.verbose('HostieStore', 'del(%s)', id)

    const updates = {}
    updates[this.dbPathHosties      + '/' + id] = null
    updates[this.dbPathUserHosties  + '/' + id] = null

    await this.rootRef.update(updates)
  }

  /**
   * read
   * @param id
   */
  // public find(condition: object): Observable<any>
  // public find(value: string | object): Observable<any> {

  public async read(id: string): Promise<Hostie | null> {
    log.verbose('HostieStore', 'find(%s)', id)
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
    log.verbose('HostieStore', 'update({id:%s})', condition['id'])

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
