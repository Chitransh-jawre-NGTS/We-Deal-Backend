// const admin = require("firebase-admin");
// const serviceAccount = require("./serviceAccountKey.json.json"); // adjust path

// // ✅ Only initialize if not already initialized
// const app = admin.apps.length
//   ? admin.app()
//   : admin.initializeApp({
//       credential: admin.credential.cert(serviceAccount),
//     });

// module.exports = app;





const admin = require("firebase-admin");
const serviceAccount = require("/etc/secrets/serviceAccountKey.json.json"); // adjust path

// ✅ Only initialize if not already initialized
const app = admin.apps.length
  ? admin.app()
  : admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

module.exports = app;