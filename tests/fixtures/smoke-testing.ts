#!/usr/bin/env ts-node

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
    const db = new Db(serverFixtures.USER.token, serverFixtures.ENDPOINTS)
    await db.open()

    const hostieStore = new HostieStore(db)
    await hostieStore.open()

    console.log(`Pack Testing v${VERSION} PASSED.`)
  }
  return 0
}

main()
.then(process.exit)
.catch(e => {
  console.error(e)
  process.exit(1)
})