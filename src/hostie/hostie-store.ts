import {
  // Observable,
}                   from 'rxjs/Observable'

import {
  AllHostiesQuery,
  DeleteHostieMutation,
  CreateHostieMutation,
  CreateHostieMutationVariables,
  HostieFragment,
  SubscribeHostieSubscription,
  UpdateHostieMutation,
  UpdateHostieMutationVariables,
}                               from '../../generated-schemas/hostie-schema'
export type Hostie = HostieFragment

import { log }      from '../config'
import {
  Db,
  // ObservableQuery,
}                   from '../db'
import {
  Store,
}                   from '../store'

import {
  GQL_CREATE_HOSTIE,
  GQL_DELETE_HOSTIE,
  GQL_QUERY_ALL_HOSTIES,
  GQL_SUBSCRIBE_HOSTIE,
  GQL_UPDATE_HOSTIE,
}                         from './hostie-store.graphql'

export class HostieStore extends Store<
    Hostie,
    AllHostiesQuery,
    SubscribeHostieSubscription
> {
  constructor(
    protected db: Db,
  ) {
    super(db)
    log.verbose('HostieStore', 'constructor()')

    this.options = {
      gqlQueryAll:  GQL_QUERY_ALL_HOSTIES,
      gqlSubscribe: GQL_SUBSCRIBE_HOSTIE,
      dataKey:      'allHosties',
    }
  }

  /**
   * @todo confirm the return type of Observable
   * @param newHostie
   */
  public async create(newHostie: Partial<Hostie>): Promise<Hostie> {
    log.verbose('HostieStore', 'add(newHostie{name=%s})', newHostie.name)

    // FIXME: key! & name! should be checked gracefully
    const variables: CreateHostieMutationVariables = {
      key:      newHostie.key!,
      name:     newHostie.name!,
      ownerId:  newHostie.owner!.id,
    }

    const mutationResult: CreateHostieMutation = await this.db.apollo.mutate<CreateHostieMutation>({
      mutation: GQL_CREATE_HOSTIE,
      variables,
      update: (proxy, { data: { createHostie } }) => {
        try {
          // Read the data from our cache for this query.
          const data = proxy.readQuery<AllHostiesQuery>({ query: GQL_QUERY_ALL_HOSTIES })
          if (data) {
            data.allHosties.push(createHostie)
            proxy.writeQuery({ query: GQL_QUERY_ALL_HOSTIES, data })
          }
        } catch (e) {
          log.verbose('HostieStore', 'create() before any query executed.')
        }
      },
    }).then(x => x.data)

    const hostie = mutationResult.createHostie

    if (!hostie) {
      throw new Error('HostieStore.create() fail!')
    }

    return hostie
  }

  /**
   * delete
   * @param id
   */
  public async delete(id: string): Promise<Hostie> {
    log.verbose('HostieStore', 'del(%s)', id)

    const result: DeleteHostieMutation = await this.db.apollo.mutate<DeleteHostieMutation>({
      mutation: GQL_DELETE_HOSTIE,
      variables: {
        id,
      },
      update: (proxy, { data: { deleteHostie } }) => {
        try {
          // Read the data from our cache for this query.
          const data = proxy.readQuery<AllHostiesQuery>({ query: GQL_QUERY_ALL_HOSTIES })
          if (data) {
            data.allHosties = data.allHosties.filter(hostie => hostie.id !== deleteHostie.id)
            proxy.writeQuery({ query: GQL_QUERY_ALL_HOSTIES, data })
          }
        } catch (e) {
          log.verbose('HostieStore', 'delete() before any query executed.')
        }
      },
    }).then(x => x.data)

    if (!result.deleteHostie) {
      throw new Error(`HostieStore.delete(id=${id}) failed!`)
    }
    return result.deleteHostie
  }

  /**
   * update will only change the specified fields in documents it affects;
   * unspecified fields will be left untouched.
   * @param updateHostie
   */
  public async update(id: string, props: Partial<Hostie>): Promise<Hostie> {
    log.verbose('HostieStore', 'update(id=%s)', id)

    const hostie = await this.read(id)
    if (!hostie) {
      throw new Error('update() id not found')
    }

    const variables: UpdateHostieMutationVariables = {
      id,
      name:   props.name || hostie.name,
      note:   props.note || hostie.note,
    }

    const result: UpdateHostieMutation = await this.db.apollo.mutate<UpdateHostieMutation>({
      mutation: GQL_UPDATE_HOSTIE,
      variables,
      update: (proxy, { data: { updateHostie } }) => {
        try {
          // Read the data from our cache for this query.
          const data = proxy.readQuery<AllHostiesQuery>({ query: GQL_QUERY_ALL_HOSTIES })
          if (data) {
            for (let i = data.allHosties.length; i--;) {
              if (data.allHosties[i].id === updateHostie.id) {
                data.allHosties[i] = updateHostie
                break
              }
            }
            proxy.writeQuery({ query: GQL_QUERY_ALL_HOSTIES, data })
          }
        } catch (e) {
          log.verbose('HostieStore', 'update() before any query executed.')
        }
      },
    })

    const updatedHostie = result.updateHostie
    if (!updatedHostie) {
      throw new Error('HostieStore.update() failed!')
    }
    return updatedHostie
  }

}
