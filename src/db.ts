import {
  BehaviorSubject,
  Observable,
}                   from 'rxjs/Rx'

import {
  ENDPOINTS,
  ApolloClient,
  Endpoints,
  NormalizedCacheObject,
  makeApolloClient,
}                         from '@chatie/graphql'

export {
  MutationUpdaterFn,
  ObservableQuery,
}                         from '@chatie/graphql'

import {
  log,
}           from './config'

export type Apollo = ApolloClient<NormalizedCacheObject>

export interface DbOptions {
  token?:     string,
  endpoints?: Endpoints,
  log?:       typeof log,
}

export class Db {

  private apollo$:      BehaviorSubject <Apollo | undefined>
  public get apollo():  Observable      <Apollo | undefined> {
    return this.apollo$.asObservable()
  }

  private endpoints:  Endpoints
  private token:      string

  public log:         typeof log

  constructor(options: DbOptions = {}) {
    this.endpoints  = options.endpoints || ENDPOINTS
    this.log        = options.log       || log
    this.token      = options.token     || ''

    this.log.verbose('Db', 'constructor({token=%s, endpoints=%s)',
                      options.token,
                      JSON.stringify(options.endpoints),
                    )
    this.apollo$ = new BehaviorSubject<Apollo | undefined>(undefined)
  }

  private async nextApollo(available = true): Promise<void> {
    this.log.verbose('Db', 'nextApollo(available=%s)', available)

    const oldApollo = await this.apollo.first().toPromise()

    if (available) {
      /**
       * 1. born a new apollo client with the token & endpoints
       */
      const newApollo = await makeApolloClient(
        this.token,
        this.endpoints,
      )

      this.apollo$.next(newApollo)

    } else {
      /**
       * 2. born undefined(if should not available any more)
       */
      this.apollo$.next(undefined)
    }

    /**
     * 3. close the old one(if any)
     */
    if (oldApollo) {
      await oldApollo['wsClose']()
      // await oldApollo.resetStore()
    }

  }

  public setToken(token: string) {
    this.log.verbose('Db', 'setToken(token=%s)', token)

    if (this.token === token) {
      this.log.info('Db', 'setToken() got the same token as before')
      return
    }

    this.log.silly('Db', 'setToken() token changed from %s to %s', this.token, token)
    this.token = token
  }

  public setEndpoints(endpoints: Endpoints) {
    this.log.verbose('Db', 'setEndpoints(endpoints=%s)', JSON.stringify(endpoints))

    const oldJson = JSON.stringify(this.endpoints)
    const newJson = JSON.stringify(endpoints)

    if (oldJson === newJson) {
      this.log.info('Db', 'setEndpoints() got the same endpoints as before')
      return
    }

    this.log.silly('Db', 'setEndpoints() endpoints changed from %s to %s', oldJson, newJson)
    this.endpoints = endpoints
  }

  public async open(): Promise<void> {
    this.log.verbose('Db', 'open()')

    await this.nextApollo()
  }

  // Does close() necessary?
  public async close(): Promise<void> {
    this.log.verbose('Db', 'close()')
    await this.nextApollo(false)
  }
}

export {
  BehaviorSubject,
  Endpoints,
}
