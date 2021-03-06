import {
  first,
}                         from 'rxjs/operators'

import { Injectable } from '@angular/core'

import {
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

import {
  _ModelMutationType,
}                               from '../../generated-schemas/'

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
}                         from './hostie.graphql'

export type Hostie = Partial<HostieFragment>

@Injectable()
export class HostieStore extends Store<
    Hostie,
    AllHostiesQuery,
    SubscribeHostieSubscription
> {

  constructor(
    protected db: Db,
  ) {
    super(db, {
      gqlQueryAll:  GQL_QUERY_ALL_HOSTIES,
      gqlSubscribe: GQL_SUBSCRIBE_HOSTIE,
      dataKey:      'allHosties',
    })
    this.log.verbose('HostieStore', 'constructor()')
  }

  /**
   * @param newHostie
   */
  public async create(newHostie: {
      name:     string,
      token:      string,
      ownerId?: string,
  }): Promise<Hostie> {
    this.log.verbose('HostieStore', 'create(newHostie=%s)', JSON.stringify(newHostie))

    await this.state.ready()

    if (!newHostie.ownerId) {
      const currentUser = await this.db.currentUser.pipe(first()).toPromise()
      if (!currentUser) {
        throw new Error('no currentUser')
      }
      newHostie.ownerId = currentUser.id
    }
    // FIXME: token! & name! should be checked gracefully
    const variables: CreateHostieMutationVariables = {
      token:    newHostie.token,
      name:     newHostie.name,
      ownerId:  newHostie.ownerId,
    }

    const mutation  = GQL_CREATE_HOSTIE
    const update    = this.mutationUpdateFnFactory(_ModelMutationType.CREATED, 'createHostie')

    this.log.silly('HostieStore', 'create() apollo.mutate()')
    const createHostie: CreateHostieMutation['createHostie'] = await this.apollo!.mutate({
      mutation,
      variables,
      update,
    }).then(m => m.data && m.data['createHostie'])
    this.log.silly('HostieStore', 'create() apollo.mutate() done')

    if (!createHostie) {
      throw new Error('HostieStore.create() fail!')
    }

    this.log.silly('HostieStore', 'create()=%s', JSON.stringify(createHostie))
    return createHostie
  }

  /**
   * delete
   * @param id
   */
  public async delete(id: string): Promise<Hostie> {
    this.log.verbose('HostieStore', 'delete(id=%s)', id)

    await this.state.ready()

    const variables: DeleteHostieMutationVariables = {
      id,
    }

    const mutation  = GQL_DELETE_HOSTIE
    const update    = this.mutationUpdateFnFactory(_ModelMutationType.DELETED, 'deleteHostie')

    const deleteHostie: DeleteHostieMutation['deleteHostie'] = await this.apollo!.mutate({
      mutation,
      variables,
      update,
    }).then(m => m.data && m.data['deleteHostie'])

    if (!deleteHostie) {
      throw new Error(`HostieStore.delete(id=${id}) failed!`)
    }
    return deleteHostie
  }

  /**
   * update will only change the specified fields in documents it affects;
   * unspecified fields will be left untouched.
   * @param updateHostie
   */
  public async update(id: string, props: Hostie): Promise<Hostie> {
    this.log.verbose('HostieStore', 'update(id=%s)', id)

    await this.state.ready()

    const hostie = await this.read(id)

    const variables: UpdateHostieMutationVariables = {
      id,
      name:   props.name || hostie.name,
      note:   props.note || hostie.note,
    }

    const mutation  = GQL_UPDATE_HOSTIE
    const update    = this.mutationUpdateFnFactory(_ModelMutationType.UPDATED, 'updateHostie')

    const updateHostie: UpdateHostieMutation['updateHostie'] = await this.apollo!.mutate({
      mutation,
      variables,
      update,
    }).then(m => m.data && m.data['updateHostie'])

    if (!updateHostie) {
      throw new Error('HostieStore.update() failed!')
    }
    return updateHostie
  }

}
