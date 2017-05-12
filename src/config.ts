export const firebaseConfig = {
    apiKey: 'AIzaSyB0oeZdda1zmCa1KusRDhVsN5sQROYrSEg',
    authDomain: 'wechaty-bo.firebaseapp.com',
    databaseURL: 'https://wechaty-bo.firebaseio.com',
    projectId: 'wechaty-bo',
    storageBucket: 'wechaty-bo.appspot.com',
    messagingSenderId: '673602949542',
}

// https://firebase.google.com/docs/admin/setup
export const serviceAccount: object | null = process.env['FIREBASE_SERVICE_ACCOUNT_KEY']
                              ? JSON.parse(process.env['FIREBASE_SERVICE_ACCOUNT_KEY'])
                              : null
