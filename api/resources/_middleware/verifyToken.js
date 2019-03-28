const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

function verifyToken(req, res, next) {
  // temporarily return next while testing
  return next();

  // check header or url parameters or post parameters for token
  var token = req.headers['x-access-token'];
  if (!token) return res.status(403).send({ auth: false, message: 'No token provided.' });

  // validate product assignment
  checkToken(token).then((response) => { 
    res.set('x-access-token', response.token);
    
    // if everything is good, save to request for use in other routes
    req.tokenData = response.payload;
    
    // continue
    next();
  }).catch((message) => {
    return res.status(500).send({ auth: false, message: message });
  });
}

function checkToken(token) {
  return new Promise((resolve, reject) => {
    var response = {success: false};

    jwt.verify(token, process.env.JWT_SECRET, function(err, payload) {
      // if no error and token decoded, resolve payload
      if (err === null) {
        response.success = true;
        response.token = token;
        response.payload = payload;
        resolve(response);
      }
      // if err or no payload, determin problem and handle accordingly
      else {
        // if err or expired, reject not authorized
        if (err.name === 'TokenExpiredError') return reject('Token expired');
        // if some other error, return not authorized
        else return reject('Failed to authenticate token');
      }
    });
  });
}

module.exports = verifyToken;