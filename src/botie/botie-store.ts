import { first }      from 'rxjs/operators'

import { Injectable } from '@angular/core'

import {
  _ModelMutationType,
  AllBotiesQuery,
  DeleteBotieMutation,
  DeleteBotieMutationVariables,
  CreateBotieMutation,
  CreateBotieMutationVariables,
  BotieFragment,
  SubscribeBotieSubscription,
  UpdateBotieMutation,
  UpdateBotieMutationVariables,
}                                 from '../../generated-schemas/botie-schema'
export type Botie = Partial<BotieFragment>

import { log }      from '../config'
import {
  Db,
}                   from '../db'
import {
  Store,
}                   from '../store'

import {
  GQL_CREATE_BOTIE,
  GQL_DELETE_BOTIE,
  GQL_QUERY_ALL_BOTIES,
  GQL_SUBSCRIBE_BOTIE,
  GQL_UPDATE_BOTIE,
}                         from './botie.graphql'

@Injectable()
export class BotieStore extends Store<
    Botie,
    AllBotiesQuery,
    SubscribeBotieSubscription
> {
  constructor(
    protected db: Db,
  ) {
    super(db, {
      gqlQueryAll:  GQL_QUERY_ALL_BOTIES,
      gqlSubscribe: GQL_SUBSCRIBE_BOTIE,
      dataKey:      'allBoties',
    })
    log.verbose('BotieStore', 'constructor()')
  }

  /**
   * @todo confirm the return type of Observable
   * @param newBotie
   */
  public async create(newBotie: {
      name:     string,
      token:    string,
      ownerId?: string,
  }): Promise<Botie> {
    log.verbose('BotieStore', 'create(newBotie{name:%s})', newBotie.name)

    await this.state.ready()

    let ownerId = newBotie.ownerId
    if (!ownerId) {
      const currentUser = await this.db.currentUser.pipe(first()).toPromise()
      if (!currentUser) {
        throw new Error('no currentUser')
      }
      ownerId = currentUser.id
    }
    if (!ownerId) {
      throw new Error('no ownerId')
    }

    // FIXME: key! & name! should be checked gracefully
    const variables: CreateBotieMutationVariables = {
      token:    newBotie.token,
      name:     newBotie.name,
      ownerId,
    }

    const createBotie: CreateBotieMutation['createBotie'] = await this.apollo!.mutate({
      mutation: GQL_CREATE_BOTIE,
      variables,
      update: this.mutationUpdateFnFactory(_ModelMutationType.CREATED, 'createBotie'),
    }).then(m => m.data && m.data.createBotie)

    if (!createBotie) {
      throw new Error('BotieStore.create() fail!')
    }
    return createBotie
  }

  /**
   * delete
   * @param id
   */
  public async delete(id: string): Promise<Botie> {
    log.verbose('BotieStore', 'delete(id=%s)', id)

    await this.state.ready()

    const variables: DeleteBotieMutationVariables = {
      id,
    }
    const deleteBotie: DeleteBotieMutation['deleteBotie'] = await this.apollo!.mutate({
      mutation: GQL_DELETE_BOTIE,
      variables,
      update: this.mutationUpdateFnFactory(_ModelMutationType.DELETED, 'deleteBotie'),
    }).then(m => m.data && m.data['deleteBotie'])

    if (!deleteBotie) {
      throw new Error(`BotieStore.delete(id=${id}) failed!`)
    }
    return deleteBotie
  }

  /**
   * update will only change the specified fields in documents it affects;
   * unspecified fields will be left untouched.
   * @param updateBotie
   */
  public async update(id: string, props: Partial<Botie>): Promise<Botie> {
    log.verbose('BotieStore', 'update(id=%s)', id)

    await this.state.ready()

    const botie = await this.read(id)

    const variables: UpdateBotieMutationVariables = {
      id,
      name:   props.name || botie.name,
      note:   props.note || botie.note,
    }

    const updateBotie: UpdateBotieMutation['updateBotie'] = await this.apollo!.mutate({
      mutation: GQL_UPDATE_BOTIE,
      variables,
      update: this.mutationUpdateFnFactory(_ModelMutationType.UPDATED, 'updateBotie'),
    }).then(m => m.data && m.data['updateBotie'])

    if (!updateBotie) {
      throw new Error('BotieStore.update() failed!')
    }
    return updateBotie
  }

}
