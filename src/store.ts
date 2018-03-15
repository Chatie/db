import {
  Observable,
}                     from 'rxjs/Observable'

export interface Store<T> {
  itemList:   Observable<[T]>,
  // CRUD
  create: (item: Partial<T>) => Promise<T>,
  read:   (id: string) => Promise<T>,
  update: (
    id:     string,
    props:  Partial<T>,
  ) => Promise<T>,
  delete: (id: string) => Promise<T>,

  // search: (cond: any) => Promise<[T]>,
}
