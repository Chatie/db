import * as Wilddog from 'wilddog'
import * as WilddogTokenGenerator from 'wilddog-token-generator'

import {
  wilddogConfig,
  wilddogKey,
}                   from './config'

Wilddog.initializeApp(wilddogConfig)

// admin.
const testdata = Wilddog.sync().ref().child('test')

testdata.on('value', snap => {
  if (snap) {
    console.log(snap.val())
  } else {
    console.error('no snap')
  }
})

async function main() {
  if (!wilddogKey) {
    throw new Error('no wilddog key')
  }

  const tokenGenerator = new WilddogTokenGenerator(wilddogKey)

  const claims = {
    email: 'zixia@zixia.net',
    email_verified: true,
    uid: 'zixia',
  }

  const customToken = tokenGenerator.createToken(claims, {
    expires: Math.round((Date.now() + 60 * 60 * 1000) / 1000),
    admin: false,
  })

  console.log(customToken)
  process.exit()

  // try {
  //   await Wilddog.auth().currentUser.updateProfileupdateUser(uid, additionalClaims)
  // } catch (e) {
  //   console.error('updateUser error: %s', e.message)
  // }

  // let userRecord
  // userRecord = await auth().getUser(uid)
  // // See the UserRecord reference doc for the contents of userRecord.
  // console.log('Successfully fetched user data by id:', userRecord.toJSON());

  // try {
  //   const email = 'zixia@zixia.net'
  //   userRecord = await Wilddog.auth().. getUserByEmail(email)
  //   // See the UserRecord reference doc for the contents of userRecord.
  //   console.log('Successfully fetched user data by email:', userRecord.toJSON());
  // } catch (e) {
  //   console.error('no such user: ', e.message)
  // }

}

main()
