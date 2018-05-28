import {
  ModuleWithProviders,
  NgModule,
}                       from '@angular/core'
import { Auth }         from 'auth-angular'
import { Brolog }       from 'brolog'
const jwtDecode = require('jwt-decode')

import { BotieStore }   from './botie/botie-store'
import { GiftieStore }  from './giftie/giftie-store'
import { HostieStore }  from './hostie/hostie-store'

import {
  GraphCoolIdToken,
}                       from './config'
import { Db }           from './db'

export function dbFactory(
  auth     : Auth,
  log      : Brolog,
): Db {
  log.verbose('DbModule', 'dbFactory()')

  const db = new Db({
    log,
  })

  auth.idToken.subscribe(token => {
    log.verbose('DbModule', 'dbFactory() auth.idToken.subscript(token=%s)', token)

    if (!token) {
      db.close()
      return
    }

    const obj             = jwtDecode(token) as GraphCoolIdToken
    const graphCoolToken = obj['https://graph.cool/token']
    log.silly('DbModule', 'auth.idToken.subscript() graphCoolToken=%s)', graphCoolToken)

    if (!graphCoolToken) {
      db.close()
      return
    }

    db.setToken(graphCoolToken)
    db.open()
  })

  return db
}

@NgModule({
  id: '@chatie/db',
})
export class DbModule {
  public static forRoot(): ModuleWithProviders {
    return {
      ngModule: DbModule,
      providers: [
        {
          provide: Db,
          useFactory: dbFactory,
          deps: [
            Auth,
            Brolog,
          ],
        },
        BotieStore,
        GiftieStore,
        HostieStore,
      ],
    }
  }
}
