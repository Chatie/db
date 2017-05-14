import * as Firebase      from 'firebase'
import * as FirebaseAdmin from 'firebase-admin'

import {
  Brolog,
  Loggable,
  nullLogger,
}                         from 'brolog'

import {
  serviceAccount,
  databaseURL,
}                         from './config'

import { IDb }            from './db'

export class AdminDb implements IDb {
  private static _instance: AdminDb

  public static instance() {
    AdminDb.log.verbose('AdminDb', 'instance()')

    if (!this._instance) {
      this._instance = new AdminDb()
    }
    return this._instance
  }

  public static log: Loggable = nullLogger
  public static enableLogging(log: boolean | Loggable ) {
    this.log = Brolog.enableLogging(log)
  }

  private log: Loggable

  private constructor() {
    this.log = AdminDb.log
    this.log.verbose('AdminDb', 'constructor()')
  }

  public static serviceAuth(): void {
    // Service Account Key must exist!
    if (!serviceAccount) {
      throw new Error('service config not found')
    }
    const serviceConfig: FirebaseAdmin.AppOptions = {
      credential: FirebaseAdmin.credential.cert(serviceAccount),
      databaseURL,
    }

    // https://firebase.google.com/docs/admin/setup
    FirebaseAdmin.initializeApp(serviceConfig)
  }

  public currentUserEmail(): string {
    // FirebaseAdmin.auth().currentUser() is not exist
    // TODO
    return 'zixia@zixia.net'
  }

  public rootRef(): Firebase.database.Reference {
    return FirebaseAdmin.database().ref('/')
  }
}

export {
  Firebase,
  FirebaseAdmin,
}
