// import * as Firebase  from 'firebase'

import {
  Observable,
}                     from 'rxjs'

export interface Store {
  data:   Observable<any>,
  // CRUD
  add:     (data: any) => Promise<any>,
  del:     (data: any) => Promise<any>,
  update:  (cond: any) => Promise<any>,
  find:    (cond: any) => Promise<any>,
}
