import {
  Observable,
}                   from 'rxjs/Observable'

import {
  _ModelMutationType,
  AllHostiesQuery,
  HostieFragment,
  SubscribeHostieSubscription,
}                               from '../../generated-schemas/hostie-schema'
export type Hostie = HostieFragment

import { log }      from '../config'
import {
  Db,
  ObservableQuery,
}                   from '../db'
import {
  Store,
  InitOptions,
}                   from '../store'

import {
  GQL_QUERY_ALL_HOSTIES,
  GQL_SUBSCRIBE_HOSTIE,
}                         from './hostie-store.graphql'

export class HostieStore extends Store<
    Hostie,
    AllHostiesQuery,
    SubscribeHostieSubscription
> {
  private options: InitOptions

  constructor(
    protected db: Db,
  ) {
    super(db)
    log.verbose('HostieStore', 'constructor()')

    this.options = {
      gqlQueryAll:   GQL_QUERY_ALL_HOSTIES,
      gqlSubscribe:  GQL_SUBSCRIBE_HOSTIE,
      dataKey:    'allHosties',
    }
  }

  public async open(): Promise<void> {
    log.verbose('HostieStore', 'open()')

    await this.init(this.options)
  }

  public async close(): Promise<void> {
    log.verbose('HostieStore', 'close()')

    await this.itemListSubscription.unsubscribe()
  }

  private initSubscribeToMore(hostieQuery: ObservableQuery<AllHostiesQuery>): void {
    hostieQuery.subscribeToMore({
      document: GQL_SUBSCRIBE_HOSTIE,
      updateQuery: (prev, { subscriptionData }) => {
        const data: SubscribeHostieSubscription = subscriptionData.data
        if (!data || !data.Hostie) {
          return prev
        }

        log.silly('HostieStore', 'init() subscribeToMore() updateQuery() prev=%s', JSON.stringify(prev))
        log.silly('HostieStore', 'init() subscribeToMore() updateQuery() data=%s', JSON.stringify(data))

        let result
        const node = data.Hostie.node
        const previousValues = data.Hostie.previousValues

        switch (data.Hostie.mutation) {
          case _ModelMutationType.CREATED:
            result = {
              ...prev,
              allHosties: [...prev['allHosties'], node],
            }
            break
          case _ModelMutationType.UPDATED:
            result = {
              ...prev,
              allHosties: [...prev['allHosties']],
            }
            if (node) {
              for (let i = result.allHosties.length; i--;) {
                if (result.allHosties[i].id === node.id) {
                  result.allHosties[i] = node
                  break
                }
              }
            }
            break
          case _ModelMutationType.DELETED:
            result = {
              ...prev,
              allHosties: [...prev['allHosties']],
            }
            if (previousValues) {
              for (let i = result.allHosties.length; i--;) {
                if (result.allHosties[i].id === previousValues.id) {
                  result.allHosties.splice(i, 1)
                  break
                }
              }
            }
            break
          default:
            throw new Error('unknown mutation type:' + data.Hostie.mutation)
        }

        return result
      },
    })
  }

  private initSubscription(hostieQuery: ObservableQuery<AllHostiesQuery>): void {
    this.itemListSubscription = hostieQuery.subscribe(
      ({ data }) => {
        const subscriptionItemMap: HostieMap = {}
        for (const hostie of data.allHosties) {
          subscriptionItemMap[hostie.id] = hostie
        }
        log.silly('HostieStore', 'init() subscribe() itemList updated #%d items', data.allHosties.length)

        this.$itemDict.next(subscriptionItemMap)
      },
    )
  }

  // private async initQuery(): Promise<void> {
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
   * @todo confirm the return type of Observable
   * @param newHostie
   */
  public async create(newHostie: Hostie): Promise<Hostie> {
    log.verbose('HostieStore', 'add({name:%s})', newHostie.name)
    return {} as any
  }

  /**
   * delete
   * @param id uuid
   */
  public async delete(id: string): Promise<Hostie> {
    log.verbose('HostieStore', 'del(%s)', id)

    return {} as any
  }

  /**
   * read
   * @param id
   */
  // public find(condition: object): Observable<any>
  // public find(value: string | object): Observable<any> {

  public async read(id: string): Promise<Hostie | null> {
    log.verbose('HostieStore', 'find(%s)', id)
    return {} as any
  }

  /**
   * update will only change the specified fields in documents it affects;
   * unspecified fields will be left untouched.
   * @param updateHostie
   */
  public async update(id: string, condition: object): Promise<Hostie> {
    log.verbose('HostieStore', 'update(id=%s)', id)

    const updatedHostie = await this.read(id)
    if (!updatedHostie) {
      throw new Error('update() id not found')
    }

    Object.assign(updatedHostie, condition)

    return {} as any
  }

}
