import * as deepFreeze  from 'deep-freeze'

import {
  BehaviorSubject,
}                       from 'rxjs/BehaviorSubject'
import {
  Observable,
}                       from 'rxjs/Observable'
import                       'rxjs/add/operator/first'

import {
  _ModelMutationType,
}                       from '../generated-schemas/'

import {
  Db,
  MutationUpdaterFn,
  ObservableQuery,
}                     from './db'
import {
  log,
}                     from './config'

export interface ItemDict<T> {
  [id: string]: T,
}

export interface StoreSettings {
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
  protected settings:              StoreSettings

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
    if (!this.settings) {
      throw new Error('Store.open() need `this.options` be set first!')
    }
    await this.init(this.settings)
  }

  public async close():   Promise<void> {
    log.verbose('Store', 'close()')
    await this.itemListSubscription.unsubscribe()
  }

  protected async init(options: StoreSettings) {
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
      document: this.settings.gqlSubscribe,
      updateQuery: (prev, { subscriptionData }) => {
        const data: SubscribeItemSubscription = subscriptionData.data
        if (!data || !data[this.settings.dataKey]) {
          return prev
        }

        const dataKey = this.settings.dataKey
        const item    = data[dataKey]

        log.silly('Store', 'init() subscribeToMore() updateQuery() prev=%s', JSON.stringify(prev))
        log.silly('Store', 'init() subscribeToMore() updateQuery() data=%s', JSON.stringify(data))

        const node            = item.node
        const previousValues  = item.previousValues

        const newData = this.getNewData(
          item.mutation,
          prev,
          dataKey,
          node || previousValues, // when DELETE, node will be null and we use previousValues
        )

        return newData
      },
    })
  }

  private getNewData(
      mutationType: _ModelMutationType,
      data:         Object,
      dataKey:      string,
      changedNode:  any,
  ): Object {
    deepFreeze(data)

    const updatedData = {
      ...data,
    }
    updatedData[dataKey] = [...data[dataKey]]

    switch (mutationType) {
      case _ModelMutationType.CREATED:
        updatedData[dataKey].push(changedNode)
        break

      case _ModelMutationType.UPDATED:
        for (let i = updatedData[dataKey].length; i--;) {
          if (updatedData[dataKey][i].id === changedNode.id) {
            updatedData[dataKey][i] = changedNode
            break
          }
        }
        break

      case _ModelMutationType.DELETED:
        for (let i = updatedData[dataKey].length; i--;) {
          if (updatedData[dataKey][i].id === changedNode.id) {
            updatedData[dataKey].splice(i, 1)
            break
          }
        }
        break

      default:
        throw new Error('unknown mutation type:' + mutationType)
    }

    return deepFreeze(updatedData) as Object

  }

  private initSubscription(itemQuery: ObservableQuery<AllItemsQuery>): void {
    log.verbose('Store', 'initSubscription(itemQuery=...)')

    this.itemListSubscription = itemQuery.subscribe(
      ({ data }) => {
        const subscriptionItemMap: ItemDict<T> = {}
        for (const hostie of data[this.settings.dataKey]) {
          subscriptionItemMap[hostie.id] = hostie
        }
        log.silly('HostieStore', 'init() subscribe() itemList updated #%d items', data[this.settings.dataKey].length)

        this.$itemDict.next(subscriptionItemMap)
      },
    )
  }

  protected mutateUpdateFn(
      mutationType:             _ModelMutationType,
      mutationDataKey:  string,
  ): MutationUpdaterFn<T> {
    log.verbose('Store', 'mutateUpdateFn(mutationType=%s, mutationKey=%s)', mutationType, mutationDataKey)

    return (proxy, { data }) => {
      log.verbose('Store', 'mutateUpdateFn(type=%s, mutationKey=%s), (proxy, {data})', mutationType, mutationDataKey)

      let cachedData: AllItemsQuery | null = null
      try {
        cachedData = proxy.readQuery<AllItemsQuery>({ query: this.settings.gqlQueryAll })
      } catch (e) {
        log.verbose('Store', 'mutateUpdateFn() call proxy.readQuery() before any query had been executed.')
      }

      if (cachedData) {
        const node = data[mutationDataKey]

        /**
         * Combinate all the data to produce a new data
         */
        const newData = this.getNewData(mutationType, cachedData, this.settings.dataKey, node)

        proxy.writeQuery({ query: this.settings.gqlQueryAll, data: newData })

      }
    }
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
  public async read(id: string): Promise<T> {
    log.verbose('Store', 'read(id=%s)', id)
    const itemDict = await this.itemDict.first().toPromise()
    if (itemDict[id]) {
      return itemDict[id]
    }
    throw new Error(`Store.read(id=${id} failed!`)
  }

  /**
   * TO BE IMPLEMENT in the sub class
   */
  public abstract async delete(id: string):           Promise< Partial<T> >
  public abstract async create(newItem: Partial<T>):  Promise<T>
  public abstract async update (
    id:     string,
    props:  Partial<T>,
  ):                                                  Promise<T>

  // search: (cond: any) => Promise<[T]>,
}
