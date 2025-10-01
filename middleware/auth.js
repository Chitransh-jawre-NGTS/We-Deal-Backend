// // middleware/auth.js
// const jwt = require("jsonwebtoken");
// const User = require("../models/user");

// const auth = async (req, res, next) => {
//   console.log("Auth middleware invoked");
//   console.log("Headers received:", req.headers);
//   console.log("Authorization header:", req.headers.authorization);

//   try {
//     const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
//     if (!token) return res.status(401).json({ message: "No token provided" });

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.id);
//     if (!user) return res.status(401).json({ message: "Invalid token" });

//     req.user = user; // attach user to request
//     next();
//   } catch (err) {
//     res.status(401).json({ message: "Unauthorized", error: err.message });
//     console.error("Auth error:", err);
//   }
// };
// // middleware/auth.js
// const admin = require("firebase-admin");
// admin.initializeApp({
//   credential: admin.credential.cert(require("../serviceAccountKey.json"))
// });

// module.exports = async (req, res, next) => {
//   const token = req.headers.authorization?.split(" ")[1];
//   if (!token) return res.status(401).json({ message: "Unauthorized" });

//   try {
//     const decoded = await admin.auth().verifyIdToken(token);
//     req.user = { email: decoded.email, uid: decoded.uid };
//     next();
//   } catch (err) {
//     res.status(401).json({ message: "Invalid token" });
//   }
// };


// module.exports = auth;










// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  console.log("Auth middleware invoked");
  console.log("Headers received:", req.headers);
  console.log("Authorization header:", req.headers.authorization);

  try {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "Invalid token" });

    req.user = user; // attach user to request
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized", error: err.message });
    console.error("Auth error:", err);
  }
};
// middleware/auth.js
const admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.cert(require("/etc/secrets/serviceAccountKey.json"))
});

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = { email: decoded.email, uid: decoded.uid };
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};


module.exports = auth;
