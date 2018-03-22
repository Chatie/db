import {
  BehaviorSubject,
}                       from 'rxjs/BehaviorSubject'
import {
  Observable,
}                       from 'rxjs/Observable'
import {
  Subscription,
}                       from 'rxjs/Subscription'
import                       'rxjs/add/operator/first'

import {
  _ModelMutationType,
}                       from '../generated-schemas/'

import {
  Apollo,
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

export interface StoreAction {
  type: _ModelMutationType,
  node: any,
}

export abstract class Store<
    T,
    AllItemsQuery,
    SubscribeItemSubscription
> {
  private itemDictSubscription: Subscription
  private itemResolverList:     Function[]

  protected apollo?:            Apollo
  private   apolloSubscription: Subscription

  private   log:      typeof log
  protected settings: StoreSettings

  protected $itemDict:    BehaviorSubject< ItemDict<T> >
  public get itemDict():  Observable< ItemDict<T> > {
    this.log.silly('Store', 'get itemDict()')
    return this.$itemDict.asObservable()
  }

  constructor(
    protected db: Db,
  ) {
    this.log = db.log

    this.log.verbose('Store', 'constructor()')
    this.$itemDict        = new BehaviorSubject< ItemDict<T> >({})
    this.itemResolverList = []

  }

  public async open(): Promise<void> {
    this.log.verbose('Store', 'open()')
    if (!this.settings) {
      throw new Error('Store.open() need `this.settings` to be set first!')
    }

    if (!this.apolloSubscription) {
      this.apolloSubscription = this.db.apollo.subscribe(this.refreshApollo.bind(this))
    }

    const future = new Promise(r => this.itemResolverList.push(r))

    const hostieQuery = this.apollo!.watchQuery<AllItemsQuery>({
      query: this.settings.gqlQueryAll,
    })

    this.initSubscribeToMore(hostieQuery)
    this.itemDictSubscription = this.initSubscription(hostieQuery)

    // await this.initQuery()
    await future
  }

  private async refreshApollo(apollo: Apollo | null): Promise<void> {
    this.log.verbose('Store', 'refreshApollo()')

    if (this.apollo) {
      await this.close()
      this.apollo = undefined
    }

    if (!apollo) {
      return
    }

    this.apollo = apollo

    await this.open()
  }

  public async close():   Promise<void> {
    this.log.verbose('Store', 'close()')
    if (this.itemDictSubscription) {
      this.itemDictSubscription.unsubscribe()
    }
  }

  private initSubscribeToMore(itemQuery: ObservableQuery<AllItemsQuery>): void {
    this.log.verbose('Store', 'initSubscribeToMore(itemQuery)')
    itemQuery.subscribeToMore({
      document: this.settings.gqlSubscribe,
      updateQuery: (prev, { subscriptionData }) => {
        const data: SubscribeItemSubscription = subscriptionData.data
        if (!data || !data[this.settings.dataKey]) {
          return prev
        }

        const dataKey = this.settings.dataKey
        const item    = data[dataKey]

        this.log.silly('Store', 'init() subscribeToMore() updateQuery() prev=%s', JSON.stringify(prev))
        this.log.silly('Store', 'init() subscribeToMore() updateQuery() data=%s', JSON.stringify(data))

        const node            = item.node
        const previousValues  = item.previousValues

        const newData = {
          ...prev,
        }

        newData[dataKey] = this.mutationReducer(
          newData[dataKey],
          {
            type: item.mutation,
            node: node || previousValues, // when DELETE, node will be null and we use previousValues
          },
        )

        return newData
      },
      onError: error => {
        this.log.error('Store', 'initSubscribeToMore() onError() %s', error)
      },
    })
  }

  private initSubscription(itemQuery: ObservableQuery<AllItemsQuery>): Subscription {
    this.log.verbose('Store', 'initSubscription(itemQuery)')

    const sub = itemQuery.subscribe(
      ({ data }) => {
        const newItemDict: ItemDict<T> = {}
        for (const item of data[this.settings.dataKey]) {
          newItemDict[item.id] = item
        }
        this.log.silly('HostieStore', 'init() subscribe() itemDict updated #%d items', data[this.settings.dataKey].length)

        this.$itemDict.next(newItemDict)

        /**
         * issue #12
         *
         * wait subscription to be ready before open() returns
         */
        this.itemResolverList.forEach(fn => fn())
        this.itemResolverList = []
      },
    ) as Subscription

    return sub
  }

  private mutationReducer(
      state:  any[] = [],
      action: StoreAction,
  ): any[] {
    this.log.verbose('Store', 'mutationReducer(state.length=%d, action.type=%s)',
                          state.length,
                          action.type,
                )
    switch (action.type) {
      case _ModelMutationType.CREATED:
        state.push(action.node)
        break

      case _ModelMutationType.UPDATED:
        for (let i = state.length; i--;) {
          if (state[i].id === action.node.id) {
            state[i] = action.node
            break
          }
        }
        break

      case _ModelMutationType.DELETED:
        for (let i = state.length; i--;) {
          if (state[i].id === action.node.id) {
            state.splice(i, 1)
            break
          }
        }
        break

      default:
        throw new Error('unknown action.type:' + action.type)
    }

    return state

  }

  protected mutationUpdateFnFactory(
      mutationType:     _ModelMutationType,
      mutationDataKey:  string,
  ): MutationUpdaterFn<T> {
    this.log.verbose('Store', 'mutationUpdateFn(mutationType=%s, mutationDataKey=%s)', mutationType, mutationDataKey)

    return (proxy, { data }) => {
      this.log.verbose('Store', 'mutationUpdateFn(mutationType=%s, mutationDataKey=%s), (proxy, {data})', mutationType, mutationDataKey)

      let cachedData: AllItemsQuery | null = null
      try {
        cachedData = proxy.readQuery<AllItemsQuery>({ query: this.settings.gqlQueryAll })
      } catch (e) {
        this.log.verbose('Store', 'mutationUpdateFn() call proxy.readQuery() before any query had been executed.')
      }

      if (!cachedData) {
        this.log.verbose('Store', 'mutationUpdateFn() proxy.readQuery() return empty???')
        return
      }

      const mutationNode = data[mutationDataKey]

      /**
       * Combinate all the data to produce a new data
       */
      const newData = {
        ...cachedData as Object,
      }
      newData[this.settings.dataKey] = this.mutationReducer(
        newData[this.settings.dataKey],
        {
          type: mutationType,
          node: mutationNode,
        },
      )

      proxy.writeQuery({ query: this.settings.gqlQueryAll, data: newData })

    }
  }

  // private async initQuery(): Promise<void> {
  //   this.log.verbose('Store', 'initQuery()')
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
    this.log.verbose('Store', 'read(id=%s)', id)
    const itemDict = await this.itemDict.first().toPromise()
    if (!itemDict[id]) {
      throw new Error(`Store.read(id=${id}) not found!`)
    }
    return itemDict[id]
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
