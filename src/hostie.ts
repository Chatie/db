import {
  Collection,
}                     from '@ionic/db'

import {
  BehaviorSubject,
  Observable,
  Subscription,
}                     from  'rxjs'
import                      'rxjs/add/operator/map'

export enum HostieStatus {
  OFFLINE = 0,
  ONLINE  = 1,
}

export enum HostieRuntime {
  UNKNOWN   = 0,
  LINUX     = 1,
  WINDOWS   = 2,
  APPLE     = 3,
  DOCKER    = 4,
  ELECTRON  = 5,
}

export type Hostie = {
  email:      string,
  create_at:  number,
  id?:        string,
  name:       string,
  note?:      string,
  runtime?:   HostieRuntime,
  status:     HostieStatus,
  token:      string,
  update_at:  number,
  version?:   string,
}

export type HostieStoreInstanceOptions = {
  log:      any,
  database: any,
}

export class HostieStore {
  private log: any

  private user:   any
  private email:  string | null

  private static _instance: HostieStore

  private collection:   Collection
  private subscription: Subscription|null = null

  private hosties$:  BehaviorSubject<Hostie[]> = new BehaviorSubject([])
  public get hosties() {
    return this.hosties$.asObservable()
  }

  public static instance(options?: HostieStoreInstanceOptions) {
    if (HostieStore._instance) {
      if (options) {
        // Brolog.warn('HostieStore', 'instance() should only init instance once')
        console.warn('HostieStore', 'instance() should only init instance once')
      }
      return HostieStore._instance
    }

    if (!options) {
      throw new Error('no options found for init instance')
    }

    HostieStore._instance = new HostieStore({
      database: options.database,
      log:      options.log,
    })
    return HostieStore._instance
  }

  constructor(options: any) {
    this.log = options.log || {
      verbose:  () => { /* */ },
      silly:    () => { /* */ },
    }

    this.log.verbose('HostieStore', 'constructor()')

    if (HostieStore._instance) {
      throw new Error('HostieStore should be singleton')
    }

    this.log.verbose('HostieStore', 'constructor({db, log})')

    this.collection = options.database.collection('hosties')
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
