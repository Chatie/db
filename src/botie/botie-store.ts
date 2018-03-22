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
}                               from '../../generated-schemas/botie-schema'
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
}                         from './botie-store.graphql'

export class BotieStore extends Store<
    Botie,
    AllBotiesQuery,
    SubscribeBotieSubscription
> {
  constructor(
    protected db: Db,
  ) {
    super(db)
    log.verbose('BotieStore', 'constructor()')

    this.settings = {
      gqlQueryAll:  GQL_QUERY_ALL_BOTIES,
      gqlSubscribe: GQL_SUBSCRIBE_BOTIE,
      dataKey:      'allBoties',
    }
  }

  /**
   * @todo confirm the return type of Observable
   * @param newBotie
   */
  public async create(newBotie: {
      name:     string,
      key:      string,
      ownerId:  string,
  }): Promise<Botie> {
    log.verbose('BotieStore', 'create(newBotie{name:%s})', newBotie.name)

    // FIXME: key! & name! should be checked gracefully
    const variables: CreateBotieMutationVariables = {
      key:      newBotie.key,
      name:     newBotie.name,
      ownerId:  newBotie.ownerId,
    }

    const mutationResult: CreateBotieMutation = await this.apollo!.mutate<CreateBotieMutation>({
      mutation: GQL_CREATE_BOTIE,
      variables,
      update: this.mutationUpdateFnFactory(_ModelMutationType.CREATED, 'createBotie'),
    }).then(m => m.data)

    if (!mutationResult.createBotie) {
      throw new Error('BotieStore.create() fail!')
    }
    return mutationResult.createBotie
  }

  /**
   * delete
   * @param id
   */
  public async delete(id: string): Promise<Botie> {
    log.verbose('BotieStore', 'delete(id=%s)', id)

    const variables: DeleteBotieMutationVariables = {
      id,
    }
    const result: DeleteBotieMutation = await this.apollo!.mutate<DeleteBotieMutation>({
      mutation: GQL_DELETE_BOTIE,
      variables,
      update: this.mutationUpdateFnFactory(_ModelMutationType.DELETED, 'deleteBotie'),
    }).then(m => m.data)

    if (!result.deleteBotie) {
      throw new Error(`BotieStore.delete(id=${id}) failed!`)
    }
    return result.deleteBotie
  }

  /**
   * update will only change the specified fields in documents it affects;
   * unspecified fields will be left untouched.
   * @param updateBotie
   */
  public async update(id: string, props: Partial<Botie>): Promise<Botie> {
    log.verbose('BotieStore', 'update(id=%s)', id)

    const botie = await this.read(id)

    const variables: UpdateBotieMutationVariables = {
      id,
      name:   props.name || botie.name,
      note:   props.note || botie.note,
    }

    const result: UpdateBotieMutation = await this.apollo!.mutate<UpdateBotieMutation>({
      mutation: GQL_UPDATE_BOTIE,
      variables,
      update: this.mutationUpdateFnFactory(_ModelMutationType.UPDATED, 'updateBotie'),
    }).then(m => m.data)

    if (!result.updateBotie) {
      throw new Error('BotieStore.update() failed!')
    }
    return result.updateBotie
  }

}
