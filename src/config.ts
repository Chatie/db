export const databaseURL = 'https://wechaty-bo.firebaseio.com'

/**
 * for Firebase.initializeApp()
 */
export const firebaseConfig = {
  apiKey:             'AIzaSyB0oeZdda1zmCa1KusRDhVsN5sQROYrSEg',
  authDomain:         'wechaty-bo.firebaseapp.com',
  databaseURL,
  messagingSenderId:  '673602949542',
  projectId:          'wechaty-bo',
  storageBucket:      'wechaty-bo.appspot.com',
}

/**
 * for FirebaseAdmin.initializeApp()
 */
let serviceAccount = null
if (process.env['FIREBASE_SERVICE_ACCOUNT_KEY']) {
  // https://firebase.google.com/docs/admin/setup
  serviceAccount = JSON.parse(process.env['FIREBASE_SERVICE_ACCOUNT_KEY'])
}

export { serviceAccount }
