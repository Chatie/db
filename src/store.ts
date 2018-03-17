import {
  BehaviorSubject,
}                   from  'rxjs/BehaviorSubject'
import {
  Observable,
}                     from 'rxjs/Observable'

import {
  Db,
  ObservableQuery,
}                   from './db'
import {
  log,
}                   from './config'

export interface ItemDict<T> {
  [id: string]: T,
}

export interface InitOptions {
  gqlQueryAll:  string,
  gqlSubscribe: string,
  dataKey:      string,
}

export abstract class Store<
    T,
    AllItemQuery,
    SubscribeItemSubscription
> {
  protected itemListSubscription

  protected $itemDict: BehaviorSubject< ItemDict<T> >
  public get itemDict(): Observable< ItemDict<T> > {
    log.silly('Store', 'get itemDict()')
    return this.$itemDict.asObservable()
  }

  constructor(
      protected db: Db,
  ) {
    log.verbose('Store', 'constructor()')
    this.$itemDict = new BehaviorSubject< ItemDict<T> >({})
  }

  public async init(options: InitOptions) {
    const hostieQuery = this.db.apollo.watchQuery<AllItemQuery>({
      query: options.gqlQueryAll,
    })
    this.initSubscribeToMore(hostieQuery)
    this.initSubscription(hostieQuery)

    // await this.initQuery()

  }
  // CRUD
  public abstract create: (item: Partial<T>) => Promise<T>
  public abstract read:   (id: string) => Promise<T | null>
  public abstract update: (
    id:     string,
    props:  Partial<T>,
  ) => Promise<T>
  public abstract delete: (id: string) => Promise<T>

  // search: (cond: any) => Promise<[T]>,
}
