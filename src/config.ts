export const databaseURL = 'https://wechaty-bo.firebaseio.com'

/**
 * for initializeApp()
 */
export const wilddogConfig = {
  authDomain: 'chatie.wilddog.com',
  syncURL: 'https://chatie.wilddogio.com',
  websocketOnly: true,
}

export const wilddogKey = process.env['WILDDOG_KEY']
                        ? process.env['WILDDOG_KEY']
                        : null
