import { getApolloClient } from '@chatie/graphql'

import {
  log,
}           from './config'

export class Db {
  constructor(
    public jwtToken:  string,
  ) {
    log.verbose('Db', 'constructor(%s, %s)',
                            log,
                            jwtToken,
                    )
  }
}
