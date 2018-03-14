var express = require('express');
var router = express.Router();
var Twilio = require('twilio');
var Chance = require('chance');
var auth = require('./auth');
var User = require('../database/models/user');

var AccessToken = Twilio.jwt.AccessToken;
var ChatGrant = AccessToken.ChatGrant;
var chance = new Chance();

router.get('/token', auth.required, function(req, res) {
  const token = new AccessToken(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_API_KEY, process.env.TWILIO_API_SECRET);

  User.findById(req.payload.id).then(function(user) {
    token.identity = user.email;

    token.addGrant(new ChatGrant({
      serviceSid: process.env.TWILIO_CHAT_SERVICE_SID
    }));

    res.send({
      identity: token.identity,
      jwt: token.toJwt()
    });
  });
});

module.exports = router;
