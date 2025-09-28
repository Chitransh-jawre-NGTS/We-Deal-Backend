// // firebase.js
// const admin = require("firebase-admin");

// const serviceAccount = require("./serviceAccountKey.json"); // 👈 path to your downloaded key

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// module.exports = admin;

// firebaseAdmin.js
const admin = require("firebase-admin");

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// ✅ Only initialize if not already initialized
const app = admin.apps.length
  ? admin.app()
  : admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

module.exports = app;
