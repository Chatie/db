import {
  Collection,
}           from '@ionic/db'

import {
  BehaviorSubject,
  Observable,
  Subscription,
}                     from  'rxjs'
import                      'rxjs/add/operator/map'

import { Brolog }     from 'brolog'

export enum DockieStatus {
  OFFLINE = 0,
  ONLINE  = 1,
}

export enum DockieRuntime {
  UNKNOWN   = 0,
  LINUX     = 1,
  WINDOWS   = 2,
  APPLE     = 3,
  DOCKER    = 4,
  ELECTRON  = 5,
}

export type Dockie = {
  email:    string,
  create_at:  number,
  id?:        string,
  name:       string,
  note?:      string,
  runtime?:   DockieRuntime,
  status:     DockieStatus,
  token:      string,
  update_at:  number,
  version?:   string,
}

export type DockieStoreInstanceOptions = {
  log:      Brolog,
  database: any,
}

export class DockieStore {
  private log: Brolog

  private user:   any
  private email:  string | null

  private static _instance: DockieStore

  private collection:   Collection
  private subscription: Subscription|null = null

  private _dockies:  BehaviorSubject<Dockie[]> = new BehaviorSubject([])
  public get dockies() {
    return this._dockies.asObservable()
  }

  public static instance(options?: DockieStoreInstanceOptions) {
    if (DockieStore._instance) {
      if (options) {
        Brolog.warn('DockieStore', 'instance() should only init instance once')
      }
      return DockieStore._instance
    }

    if (!options) {
      throw new Error('no options found for init instance')
    }

    DockieStore._instance = new DockieStore({
      database: options.database,
      log:      options.log,
    })
    return DockieStore._instance
  }

  constructor(options: any) {
    this.log = options.log || Brolog

    this.log.verbose('DockieStore', 'constructor()')

    if (DockieStore._instance) {
      throw new Error('DockieStore should be singleton')
    }

    this.log.verbose('DockieStore', 'constructor({db, log})')

    this.collection = options.database.collection('dockies')
  }

  /**
   * @todo confirm the return type of Observable
   * @param newDockie
   */
  public insert(newDockie: Dockie): Observable<Dockie> {
    this.log.verbose('DockieStore', 'insert()')
    newDockie.email = this.email || 'unknown@unknown.org'
    return this.collection.insert(newDockie)
  }

  /**
   * remove
   * @param id uuid
   */
  public remove(id: string) {
    this.log.verbose('DockieStore', 'remove()')
    return this.collection.remove(id)
  }

  /**
   * find
   * @param condition
   */
  public find(condition: object): Observable<any>
  public find(id: string):        Observable<any>

  public find(value: string | object): Observable<any> {
    this.log.verbose('DockieStore', 'find()')
    return this.collection
                .find(value)
                .fetch()
                .defaultIfEmpty()
  }

  /**
   * update will only change the specified fields in documents it affects;
   * unspecified fields will be left untouched.
   * @param updateDockie
   */
  public update(condition: object) {
    this.log.verbose('DockieStore', 'update(%s)', JSON.stringify(condition))
    return this.collection.update(condition)
  }

  public auth(user: any) {
    this.log.verbose('DockieStore', 'auth(%s)', user && user.email)

    if (user) {
      this.user = user
      this.email = user.email

      this.subscription = this.collection
          .findAll({ email: this.email })
          .limit(10)
          .watch() // TODO: watch for the specific user instead of all
          // .fetch()
          .defaultIfEmpty() // XXX: confirm the behaviour of this
          .subscribe((list: Dockie[]) => {
            this.log.silly('DockieStore', 'constructor() subscript() %s', list)
            this._dockies.next(list)
          })

      this.log.silly('DockieStore', 'auth() subscribe() collection')

    } else {
      this.log.silly('DockieStore', 'auth() unsubscribe() collection')
      if (this.subscription) {
        this.subscription.unsubscribe()
        this.subscription = null
      }

      this.user = null
      this.email = null
    }
  }
}
