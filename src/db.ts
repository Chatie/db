import {
  ENDPOINTS,
  ApolloClient,
  Endpoints,
  NormalizedCacheObject,
  ObservableQuery,
  getApolloClient,
}                         from '@chatie/graphql'

import {
  log,
}           from './config'

export class Db {
  public apollo: ApolloClient<NormalizedCacheObject>

  constructor(
    private token:      string,
    private endpoints = ENDPOINTS,
  ) {
    log.verbose('Db', 'constructor(token=%s)',
                      token,
                )
  }

  public async init(): Promise<void> {
    log.verbose('Db', 'init()')
    if (!this.apollo) {
      log.silly('Db', 'init() initializing apollo client...')
      this.apollo = await getApolloClient(
        this.token,
        this.endpoints,
      )
    }
  }
}

export {
  Endpoints,
  ObservableQuery,
}
