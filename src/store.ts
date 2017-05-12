import { Db } from './db'

export abstract class store {
  private db: Db
  private email: string

  constructor() {
    this.db = Db.instance()
  }
}
