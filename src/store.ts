import {
  BehaviorSubject,
  Observable,
  Subscription,
}                       from 'rxjs/Rx'

import { StateSwitch }  from 'state-switch'

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
  protected state: StateSwitch

  private itemListSubscription: Subscription

  protected apollo?:  Apollo
  protected log:      typeof log
  protected settings: StoreSettings

  protected itemList$:    BehaviorSubject< T[] >
  public    itemList:     Observable< T[] >

  constructor(
    protected db: Db,
  ) {
    this.log = db.log

    this.log.verbose('Store', 'constructor(db=%s)', db.constructor.name)

    this.itemList$  = new BehaviorSubject< T[] >([])
    this.itemList   = this.itemList$.asObservable().distinctUntilChanged()

    this.state = new StateSwitch('Store', this.log)

    /**
     * This subscription is for all the life cycle of Store,
     * we will never need to unsubscribe it.
     */
    this.db.apollo.subscribe(apollo => this.refresh(apollo))

  }

  private async open(): Promise<void> {
    this.log.verbose('Store', 'open()')
    if (!this.settings) {
      throw new Error('Store.open() need `this.settings` to be set first!')
    }

    if (!this.apollo) {
      throw new Error('Store.open() apollo not available!')
    }

    this.state.on('pending')

    const hostieQuery = this.apollo.watchQuery<AllItemsQuery>({
      query: this.settings.gqlQueryAll,
    })

    this.initSubscribeToMore(hostieQuery)
    this.itemListSubscription = this.initSubscription(hostieQuery)

    // await this.initQuery()
    // await future
  }

  private async refresh(apollo: Apollo | undefined): Promise<void> {
    this.log.verbose('Store', 'refresh(%s)', apollo && apollo.constructor.name)

    /**
     * 1. close the existing apollo if it is availble
     */
    if (this.apollo) {
      await this.close()
    }

    this.apollo = apollo

    /**
     * 2. reopen only if the new apollo is available
     */
    if (apollo) {
      await this.open()
    }

  }

  private async close():   Promise<void> {
    this.log.verbose('Store', 'close()')

    this.state.off('pending')

    if (this.itemListSubscription) {
      this.itemListSubscription.unsubscribe()
    }

    this.state.off(true)

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
        this.log.error('Store', 'initSubscribeToMore() onError() %s', JSON.stringify(error))
      },
    })
  }

  private initSubscription(itemQuery: ObservableQuery<AllItemsQuery>): Subscription {
    this.log.verbose('Store', 'initSubscription(itemQuery)')

    const sub = itemQuery.subscribe(
      ({ data }) => {
        this.log.silly('HostieStore', 'init() subscribe() itemList length change to %d',
                                      data[this.settings.dataKey].length,
                      )
        this.itemList$.next([...data[this.settings.dataKey]])

        /**
         * issue #12
         *
         * wait subscription to be ready before open() returns
         */
        this.state.on(true)
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

    await this.state.ready()

    const itemList = await this.itemList.first().toPromise()

    const result = itemList.filter(i => i['id'] === id)
    if (result.length !== 1) {
      throw new Error(`Store.read(id=${id}) not found!`)
    }
    return result[0]
  }

  /**
   * TO BE IMPLEMENT in the sub class
   */
  public abstract async delete(id: string):           Promise<T>
  public abstract async create(newItem: Partial<T>):  Promise<T>
  public abstract async update (
    id:     string,
    props:  T,
  ):                                                  Promise<T>

  // search: (cond: any) => Promise<[T]>,
}
