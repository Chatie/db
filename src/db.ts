import { getApolloClient } from '@chatie/graphql'

import {
  log,
}           from './config'

export class Db {
  constructor(
    public log:       Brolog,
    public jwtToken:  string,
  ) {
    this.log.verbose('Db', 'constructor(%s, %s)',
                            log,
                            jwtToken,
                    )
  }
}
