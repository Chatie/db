import * as firebase from "firebase-admin"

const serviceAccount = JSON.parse(process.env['FIREBASE_SERVICE_ACCOUNT_KEY'])

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://wechaty-bo.firebaseio.com"
});

// admin.
const testdata = firebase.database().ref().child('test')
testdata.on('value', snap => {
  if (snap) {
    console.log(snap.val())
  } else { 
    console.error('no snap')
  }
})

var uid = "some-uid";
var additionalClaims = {
  premiumAccount: true,
  email: 'zixia@zixia.net',
  emailVerified: true,
};

async function test() {
  const customToken = await firebase.auth().createCustomToken(uid, additionalClaims)
  // Send token back to client
  console.log('customToken: ' + customToken.length)

  try {
    await firebase.auth().updateUser(uid, additionalClaims)
  } catch (e) {
    console.error('updateUser error: %s', e.message)
  }
  
  let userRecord
  // userRecord = await auth().getUser(uid)
  // // See the UserRecord reference doc for the contents of userRecord.
  // console.log("Successfully fetched user data by id:", userRecord.toJSON());

  try {
    const email = 'zixia@zixia.net'
    userRecord = await firebase.auth().getUserByEmail(email)
    // See the UserRecord reference doc for the contents of userRecord.
    console.log("Successfully fetched user data by email:", userRecord.toJSON());
  } catch (e) {
    console.error('no such user: ', e.message)
  }
}

test()
