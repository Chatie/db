#!/usr/bin/env ts-node

/**
 * @auth0/angular-jwt bug workaround
 *  ReferenceError: window is not defined #51
 *  see: https://github.com/Chatie/db/issues/51
 */
;
(global as any).window = (global as any).window || {}
/**
 * workaround END
 */

import {
  LocalServer,
}               from '@chatie/graphql'
import {
  VERSION,
  Db,
  HostieStore,
}               from '@chatie/db'
// }                  = require('../../')

async function main () {
  const localServer = new LocalServer()
  for await (const serverFixtures of localServer.fixtures()) {
    const db = new Db({
      token    : serverFixtures.USER.token,
      endpoints: serverFixtures.ENDPOINTS,
    })
    await db.open()

    const hostieStore = new HostieStore(db)
    await (hostieStore as any).open()

    console.log(`Smoke Testing v${VERSION} PASSED.`)
  }
  return 0
}

main()
.then(process.exit)
.catch(e => {
  console.error(e)
  process.exit(1)
})
