import {
  BehaviorSubject,
}                   from 'rxjs/BehaviorSubject'
import {
  Observable,
}                   from 'rxjs/Observable'

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

export type Apollo = ApolloClient<NormalizedCacheObject>

export class Db {
  private $apollo: BehaviorSubject<Apollo | null>
  public get apollo(): Observable<Apollo | null> {
    return this.$apollo.asObservable()
  }

  constructor(
    public token     = '',
    public endpoints = ENDPOINTS,
  ) {
    log.verbose('Db', 'constructor(token=%s, endpoints=%s)',
                      token,
                      JSON.stringify(ENDPOINTS),
                )
    this.$apollo = new BehaviorSubject<Apollo | null>(null)
  }

  private async nextApollo(available = true): Promise<void> {
    log.verbose('Db', 'nextApollo(available=%s)', available)

    /**
     * 1. close the old one(if any)
     */
    const apollo = await this.apollo.first().toPromise()
    if (apollo) {
      await apollo['wsClose']()
      await apollo.resetStore()
    }

    /**
     * 2. born a null(if should not available any more)
     */
    if (!available) {
      this.$apollo.next(null)
      return
    }

    /**
     * 3. born a new apollo client with the token & endpoints
     */
    this.$apollo.next(await getApolloClient(
      this.token,
      this.endpoints,
    ))
  }

  public setToken(token: string) {
    log.verbose('Db', 'setToken(token=%s)', token)

    if (this.token === token) {
      log.info('Db', 'setToken() got the same token as before')
      return
    }

    log.silly('Db', 'setToken() token changed from %s to %s', this.token, token)
    this.token = token
  }

  public setEndpoints(endpoints: Endpoints) {
    log.verbose('Db', 'setEndpoints(endpoints=%s)', JSON.stringify(endpoints))

    const oldJson = JSON.stringify(this.endpoints)
    const newJson = JSON.stringify(endpoints)

    if (oldJson === newJson) {
      log.info('Db', 'setEndpoints() got the same endpoints as before')
      return
    }

    log.silly('Db', 'setEndpoints() endpoints changed from %s to %s', oldJson, newJson)
    this.endpoints = endpoints
  }

  public async open(): Promise<void> {
    log.verbose('Db', 'open()')

    await this.nextApollo()
  }

  public async close(): Promise<void> {
    log.verbose('Db', 'close()')
    await this.nextApollo(false)
  }
}

export {
  BehaviorSubject,
  Endpoints,
}
