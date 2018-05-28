import {
  BehaviorSubject,
  Observable,
  // Subscription,
}                         from 'rxjs'
import {
  distinctUntilChanged,
  first,
}                         from 'rxjs/operators'
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
  CurrentUserQuery,
}                           from '../generated-schemas/db-schema'

import { GQL_CURRENT_USER } from './db.graphql'
import { log }              from './config'

export type Apollo = ApolloClient<NormalizedCacheObject> & { wsClose?: Function }

export interface DbOptions {
  token?:     string,
  endpoints?: Endpoints,
  log?:       typeof log,
}

export type CurrentUser = CurrentUserQuery['user']

export class Db {

  private apollo$:  BehaviorSubject <Apollo | undefined>
  public  apollo:   Observable      <Apollo | undefined>

  private currentUser$: BehaviorSubject <CurrentUser | undefined>
  public  currentUser:  Observable      <CurrentUser | undefined>

  private endpoints:  Endpoints
  private token:      string

  public log:         typeof log

  constructor(options: DbOptions = {}) {
    this.log        = options.log       || log
    this.log.verbose('Db', 'constructor({token=%s, endpoints=%s})',
                      options.token                     || '',
                      JSON.stringify(options.endpoints) || '',
                    )

    this.endpoints  = options.endpoints || ENDPOINTS
    this.token      = options.token     || ''

    this.currentUser$ = new BehaviorSubject<CurrentUser | undefined>(undefined)
    this.currentUser  = this.currentUser$.asObservable().pipe(distinctUntilChanged())

    this.apollo$  = new BehaviorSubject<Apollo | undefined>(undefined)
    this.apollo   = this.apollo$.asObservable().pipe(distinctUntilChanged())

  }

  private async nextApollo(available = true): Promise<void> {
    this.log.verbose('Db', 'nextApollo(available=%s)', available)

    const oldApollo = await this.apollo.pipe(first()).toPromise()
    this.log.silly('Db', 'nextApollo() oldApollo=%s', typeof oldApollo)

    if (available) {
      /**
       * 1. born a new apollo client with the token & endpoints
       */
      const newApollo = await makeApolloClient(
        this.token,
        this.endpoints,
      )

      this.apollo$.next(newApollo)

      const currentUser = await this.getCurrentUser(newApollo)
      this.currentUser$.next(currentUser)

    } else {
      /**
       * 2. born undefined(if should not available any more)
       */
      this.currentUser$.next(undefined)
      this.apollo$.next(undefined)
    }

    /**
     * 3. close the old one(if any)
     */
    if (oldApollo) {
      if (!oldApollo.wsClose) {
        throw new Error('no wsClose!')
      }
      await oldApollo.wsClose()
      // await oldApollo.resetStore()
    }

  }

  public setToken(token: string) {
    this.log.verbose('Db', 'setToken(token=%s)', token)

    if (this.token === token) {
      this.log.info('Db', 'setToken() got the same token as before')
      return
    }

    this.log.silly('Db', 'setToken() old token=%s', this.token  || '""')
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

  private async getCurrentUser(apollo: Apollo) {
    this.log.verbose('Db', 'currentUser()')

    if (!apollo) {
      this.log.error('Db', 'currentUser() no apollo defined!')
      throw new Error('no current user in Db')
    }

    const user = await apollo.query<CurrentUserQuery>({
      query: GQL_CURRENT_USER,
    }).then(x => x.data.user)

    if (!user) {
      throw new Error('cant get current user!')
    }

    log.silly('Db', 'currentUser(id=%s, email=%s, name=%s)', user.id, user.email, user.name)
    return user
  }
}

export {
  BehaviorSubject,
  Endpoints,
}
