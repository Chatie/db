import {
  // ModuleWithProviders,
  NgModule,
}                       from '@angular/core'
import { Auth }         from 'auth-angular'
import { Brolog }       from 'brolog'

import { Db }           from './db'
import { BotieStore }   from './botie/'
import { GiftieStore }  from './giftie'
import { HostieStore }  from './hostie'

export function dbFactory(
  auth: Auth,
  log:  Brolog,
) {
  const db = new Db({
    auth,
    log,
  })

  return db
}

@NgModule({
  id: '@chatie/db',
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
})
export class DbModule {}
