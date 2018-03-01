import {
  Observable,
}                     from 'rxjs/Observable'

export interface Store {
  data:   Observable<any>,
  // CRUD
  create: (data: any) => Promise<any>,
  read:   (data: any) => Promise<any>,
  update: (cond: any) => Promise<any>,
  delete: (cond: any) => Promise<any>,
  search: (cond: any) => Promise<any>,
}
