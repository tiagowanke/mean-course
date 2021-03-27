const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // extract the string after the first space 'Bearer <token>'
    jwt.verify(token, 'secret_this_should_be_longer');
    next();
  } catch(err) {
    res.status(401).json({ message: 'Auth failed!' });
  }
};
