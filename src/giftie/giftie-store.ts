import { Injectable } from '@angular/core'

import { Brolog } from 'brolog'

// import {
//   Db,
// }                   from '../db'

// import {
//   Store,
// }                   from '../store'

@Injectable()
export class GiftieStore {

  constructor(
    protected log: Brolog,
  ) {
    // super()
    console.log('GiftieStore', 'constructor()')
    this.log.verbose('GiftieStore', 'constructor()')
  }
}
