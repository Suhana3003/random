// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = '123456'; // Use env vars in production

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    console.log('No token found');
    return res.sendStatus(401);
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded token:', decoded);  // ADD THIS
    req.user = decoded;
    next();
  } catch (err) {
    console.log('Token verification failed', err);
    res.sendStatus(403);
  }
}


module.exports = authMiddleware;
