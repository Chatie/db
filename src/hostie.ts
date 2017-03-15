import {
  Collection,
}           from '@ionic/db'

import {
  BehaviorSubject,
  Observable,
  // Subscription,
}                     from  'rxjs'
import                      'rxjs/add/operator/map'

import { Brolog }     from 'brolog'

export enum HostieStatus {
  OFFLINE = 0,
  ONLINE  = 1,
}

export type Hostie = {
  id?:        string,
  token:      string,
  name:       string,
  createTime: number,
  updateTime: number,
  note?:      string,
  status:     HostieStatus,
  version?:   string,
  runtime?:   string,
}

export class HostieStore {
  private static _instance: HostieStore

  private collection: Collection
  private log: Brolog

  private _hosties:  BehaviorSubject<Hostie[]> = new BehaviorSubject([])
  public get hosties() {
    return this._hosties
  }

  public static instance({
    database,
    log,
  }) {
    if (!HostieStore._instance) {
      HostieStore._instance = new HostieStore({
        database,
        log,
      })
    }
    return HostieStore._instance
  }

  constructor({
    database,
    log,
  }) {
    if (HostieStore._instance) {
      throw new Error('HostieStore should be singleton')
    }

    this.log = log || Brolog
    this.log.verbose('HostieStore', 'constructor({db, log})')

    this.collection = database.collection('hosties')

    this.collection
        .watch() // TODO: watch for the specific user instead of all
        .defaultIfEmpty() // XXX: confirm the behaviour of this
        .subscribe((list: Hostie[]) => {
          this.log.silly('HostieStore', 'constructor() subscript() %s', list)
          this._hosties.next(list)
        })
  }

  /**
   * @todo confirm the return type of Observable
   * @param newHostie
   */
  public insert(newHostie: Hostie): Observable<Hostie> {
    return this.collection.insert(newHostie)
  }

  /**
   * remove
   * @param id uuid
   */
  public remove(id: string) {
    return this.collection.remove(id)
  }

  /**
   * find
   * @param condition
   */
  public find(condition: object)
  public find(id: string)

  public find(value: string | object) {
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
    return this.collection.update(condition)
  }
}
