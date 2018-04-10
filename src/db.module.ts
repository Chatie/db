import {
  ModuleWithProviders,
  NgModule,
}                       from '@angular/core'
import { Auth }         from 'auth-angular'
import { Brolog }       from 'brolog'
import jwt_decode       from 'jwt-decode'

import { Db }           from './db'
import { BotieStore }   from './botie/'
import {
  GraphCoolIdToken,
}                       from './config'
import { GiftieStore }  from './giftie'
import { HostieStore }  from './hostie'

export function dbFactory(
  auth: Auth,
  log:  Brolog,
) {
  const db = new Db({
    log,
  })

  auth.idToken.subscribe(token => {
    log.verbose('DbModule', 'auth.idToken.subscript(token=%s)', token)

    if (!token) {
      db.close()
      return
    }

    const obj             = jwt_decode(token) as GraphCoolIdToken
    const graphCoolToken  = obj['https://graph.cool/token']
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
