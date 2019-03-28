const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
//const db = require('../../db/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const verifyToken = require('../_middleware/verifyToken');

// include models
const userModel = require('../user/user.model');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.post('/', (req, res) => {
  let authResponse = {auth: false, user: null, message: ''};

  userModel.findOne({ username: req.body.username.toLowerCase() }, {updatedAt: 0}, function (err, user) {
    if (err) {authResponse.message = 'There was an unkown error'; return res.status(500).send(authResponse)};
    if (!user) {authResponse.message = 'Could not find the user'; return res.status(401).send(authResponse)};
    
    // first, check if we have converted password to encrypted value from initial seed, if not, do so then continue;
    if (user.password === 'password') {
      user.password = bcrypt.hashSync(user.password, 8);
      // update old and new password hash
      userModel.findByIdAndUpdate(user._id, {password: user.password}, function () {});
    }

    // check if password is valid
    let passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordIsValid) {authResponse.message = 'Could not validate username/password'; return res.status(401).send(authResponse)};

    // if user is found and password is valid, create a token
    let userData = JSON.parse(JSON.stringify(user));
    delete userData['username'];
    delete userData['password'];
    let tokenPayload = {
        user: userData,
        project: 'GMT - Bueller'
    }

    // generate token
    let token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: 86400 // expires in 24 hours
    });
    // return the information including token as JSON
    authResponse.auth = true; 
    authResponse.user = userData;
    authResponse.user.token = token;
    res.status(200).send(authResponse);
  });
});

router.get('/me', verifyToken, (req, res) => {
  // return info on user calling api
  res.status(200).send(req.tokenData);
});

module.exports = router;