import {
  Observable,
}                     from 'rxjs/Observable'

export interface Store<T> {
  data:   Observable<T>,
  // CRUD
  create: (data: T) => Promise<any>,
  read:   (data: T) => Promise<any>,
  update: (data: T, props: object) => Promise<any>,
  delete: (cond: any) => Promise<any>,
  search: (cond: any) => Promise<any>,
}
