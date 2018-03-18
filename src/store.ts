import {
  BehaviorSubject,
}                   from 'rxjs/BehaviorSubject'
import {
  Observable,
}                   from 'rxjs/Observable'
import 'rxjs/add/operator/first'

import {
  _ModelMutationType,
}                       from '../generated-schemas/'

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
    AllItemsQuery,
    SubscribeItemSubscription
> {
  protected itemListSubscription
  protected options:              InitOptions

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

  public async open(): Promise<void> {
    log.verbose('Store', 'open()')
    if (!this.options) {
      throw new Error('Store.open() need `this.options` be set first!')
    }
    await this.init(this.options)
  }

  public async close():   Promise<void> {
    log.verbose('Store', 'close()')
    await this.itemListSubscription.unsubscribe()
  }

  protected async init(options: InitOptions) {
    log.verbose('Store', 'init(options)')

    const hostieQuery = this.db.apollo.watchQuery<AllItemsQuery>({
      query: options.gqlQueryAll,
    })
    this.initSubscribeToMore(hostieQuery)
    this.initSubscription(hostieQuery)

    // await this.initQuery()

  }

  private initSubscribeToMore(itemQuery: ObservableQuery<AllItemsQuery>): void {
    log.verbose('Store', 'initSubscribeToMore(itemQuery)')
    itemQuery.subscribeToMore({
      document: this.options.gqlSubscribe,
      updateQuery: (prev, { subscriptionData }) => {
        const data: SubscribeItemSubscription = subscriptionData.data
        if (!data || !data[this.options.dataKey]) {
          return prev
        }

        const dataKey = this.options.dataKey
        const item    = data[dataKey]

        log.silly('Store', 'init() subscribeToMore() updateQuery() prev=%s', JSON.stringify(prev))
        log.silly('Store', 'init() subscribeToMore() updateQuery() data=%s', JSON.stringify(data))

        let result
        const node            = item.node
        const previousValues  = item.previousValues

        switch (item.mutation) {
          case _ModelMutationType.CREATED:
            result = {
              ...prev,
            }
            result[dataKey] = [...prev[dataKey], node]
            break

          case _ModelMutationType.UPDATED:
            result = {
              ...prev,
            }

            if (node) {
              for (let i = result[dataKey].length; i--;) {
                if (result[dataKey][i].id === node.id) {
                  result[dataKey][i] = node
                  break
                }
              }
            }
            break
          case _ModelMutationType.DELETED:
            result = {
              ...prev,
            }
            if (previousValues) {
              for (let i = result[dataKey].length; i--;) {
                if (result[dataKey][i].id === previousValues.id) {
                  result[dataKey].splice(i, 1)
                  break
                }
              }
            }
            break
          default:
            throw new Error('unknown mutation type:' + item.mutation)
        }

        return result
      },
    })
  }

  private initSubscription(itemQuery: ObservableQuery<AllItemsQuery>): void {
    log.verbose('Store', 'initSubscription(itemQuery=...)')

    this.itemListSubscription = itemQuery.subscribe(
      ({ data }) => {
        const subscriptionItemMap: ItemDict<T> = {}
        for (const hostie of data[this.options.dataKey]) {
          subscriptionItemMap[hostie.id] = hostie
        }
        log.silly('HostieStore', 'init() subscribe() itemList updated #%d items', data[this.options.dataKey].length)

        this.$itemDict.next(subscriptionItemMap)
      },
    )
  }

  // private async initQuery(): Promise<void> {
  //   log.verbose('Store', 'initQuery()')
  //   await this.db.apollo.query<AllHostiesQuery>({
  //     query: GQL_QUERY_ALL_HOSTIES,
  //   })
  //   .then(x => x.data.allHosties)
  //   .then(hostieList => {
  //     const queryItemMap: HostieMap = {}
  //     for (const hostie of hostieList) {
  //       queryItemMap[hostie.id] = hostie
  //     }
  //     this.$itemMap.next(queryItemMap)
  //   })
  // }

  /**
   * CRUD:
   * 1. create()
   * 2. read()
   * 3. update()
   * 4. delete()
   */
  public async read(id: string):                  Promise<T> {
    log.verbose('Store', 'read(id=%s)', id)
    const itemDict = await this.itemDict.first().toPromise()
    if (itemDict[id]) {
      return itemDict[id]
    }
    throw new Error(`Store.read(id=${id} failed!`)
  }
  public abstract async create(item: Partial<T>): Promise<T>
  public abstract async update (
    id:     string,
    props:  Partial<T>,
  ):                                              Promise<T>
  public abstract async delete(id: string):       Promise<T>

  // search: (cond: any) => Promise<[T]>,
}
