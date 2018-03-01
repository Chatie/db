import {
  Brolog,
}                   from 'brolog'

export class Db {
  private constructor(
    public log: Brolog,
  ) {
    this.log.verbose('Db', 'constructor()')
  }
}
