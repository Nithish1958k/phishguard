const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const actualToken = token.startsWith('Bearer ')
      ? token.slice(7)
      : token;

    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);

    req.user = decoded.user || decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};