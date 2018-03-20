import {
  ENDPOINTS,
  ApolloClient,
  Endpoints,
  NormalizedCacheObject,
  getApolloClient,
}                         from '@chatie/graphql'

export {
  MutationUpdaterFn,
  ObservableQuery,
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

  public async open(): Promise<void> {
    log.verbose('Db', 'open()')
    if (!this.apollo) {
      log.silly('Db', 'init() initializing apollo client...')
      this.apollo = await getApolloClient(
        this.token,
        this.endpoints,
      )
    }
  }

  public async close(): Promise<void> {
    log.verbose('Db', 'close()')
    await this.apollo['wsClose']()
    await this.apollo.resetStore()
  }
}

export {
  Endpoints,
}
