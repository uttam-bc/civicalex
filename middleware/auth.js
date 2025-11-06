const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const token = req.session.token;
  
  if (!token) {
    return res.redirect('/login');
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'civicalex_jwt_secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.redirect('/login');
  }
};

module.exports = { authenticateToken };