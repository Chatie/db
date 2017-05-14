import * as Firebase from 'firebase'

export const databaseURL = 'https://wechaty-bo.firebaseio.com'

export interface IDb {
  currentUserEmail: () => string,
  rootRef:          () => Firebase.database.Reference,
}
