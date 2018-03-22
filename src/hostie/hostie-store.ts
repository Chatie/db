import {
  _ModelMutationType,
  AllHostiesQuery,
  DeleteHostieMutation,
  DeleteHostieMutationVariables,
  CreateHostieMutation,
  CreateHostieMutationVariables,
  HostieFragment,
  SubscribeHostieSubscription,
  UpdateHostieMutation,
  UpdateHostieMutationVariables,
}                                 from '../../generated-schemas/hostie-schema'

import { log }      from '../config'
import {
  Db,
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

export type Hostie = Partial<HostieFragment>

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

    this.settings = {
      gqlQueryAll:  GQL_QUERY_ALL_HOSTIES,
      gqlSubscribe: GQL_SUBSCRIBE_HOSTIE,
      dataKey:      'allHosties',
    }
  }

  /**
   * @param newHostie
   */
  public async create(newHostie: {
      name:     string,
      key:      string,
      ownerId:  string,
  }): Promise<Hostie> {
    log.verbose('HostieStore', 'create(newHostie=%s)', JSON.stringify(newHostie))

    // FIXME: key! & name! should be checked gracefully
    const variables: CreateHostieMutationVariables = {
      key:      newHostie.key,
      name:     newHostie.name,
      ownerId:  newHostie.ownerId,
    }

    const mutation  = GQL_CREATE_HOSTIE
    const update    = this.mutationUpdateFnFactory(_ModelMutationType.CREATED, 'createHostie')

    log.silly('HostieStore', 'create() apollo.mutate()')
    const result: CreateHostieMutation = await this.db.apollo.mutate<CreateHostieMutation>({
      mutation,
      variables,
      update,
    }).then(m => m.data)
    log.silly('HostieStore', 'create() apollo.mutate() done')

    if (!result.createHostie) {
      throw new Error('HostieStore.create() fail!')
    }

    log.silly('HostieStore', 'create()=%s', JSON.stringify(result.createHostie))
    return result.createHostie
  }

  /**
   * delete
   * @param id
   */
  public async delete(id: string): Promise<Hostie> {
    log.verbose('HostieStore', 'delete(id=%s)', id)

    const variables: DeleteHostieMutationVariables = {
      id,
    }

    const mutation  = GQL_DELETE_HOSTIE
    const update    = this.mutationUpdateFnFactory(_ModelMutationType.DELETED, 'deleteHostie')

    const result: DeleteHostieMutation = await this.db.apollo.mutate<DeleteHostieMutation>({
      mutation,
      variables,
      update,
    }).then(m => m.data)

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
  public async update(id: string, props: Hostie): Promise<Hostie> {
    log.verbose('HostieStore', 'update(id=%s)', id)

    const hostie = await this.read(id)

    const variables: UpdateHostieMutationVariables = {
      id,
      name:   props.name || hostie.name,
      note:   props.note || hostie.note,
    }

    const mutation  = GQL_UPDATE_HOSTIE
    const update    = this.mutationUpdateFnFactory(_ModelMutationType.UPDATED, 'updateHostie')

    const result: UpdateHostieMutation = await this.db.apollo.mutate<UpdateHostieMutation>({
      mutation,
      variables,
      update,
    }).then(m => m.data)

    if (!result.updateHostie) {
      throw new Error('HostieStore.update() failed!')
    }
    return result.updateHostie
  }

}

export {
  Status,
  System,
}           from '../../generated-schemas/hostie-schema'
