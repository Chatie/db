import * as Firebase  from 'firebase'

import {
  BehaviorSubject,
  Observable,
}                     from 'rxjs'

import { Db }         from './db'

export abstract class Store<T> {
  private data$: BehaviorSubject<T>
  public get data() { return this.data$.asObservable() }

  private rootRef:  Firebase.database.Reference
  private email:    () => string

  private static instance$: this
  public static instance(
    rootRef?: Firebase.database.Reference,
    email?:   (() => string) | string,
  ): this {
    if (this.instance$) {
      return this.instance$
    }

    if (rootRef) {
      this.rootRef = rootRef
    } else {
      this.rootRef = Db.instance().rootRef()
    }

    if (email) {
      if (typeof email === 'string' && email.length) {
        this.email = () => email
      } else {
        this.email = () => Db.instance().currentUserEmail()
      }
    }

    this.instanc$ = new this()

  }
  // CRUD
  add:      (data: T)       => Observable<T>,
  del:      (data: T)       => Observable<T>,
  update:   (cond: object)  => Observable<T>,
  find:     (cond: object)  => Observable<T>,
}
