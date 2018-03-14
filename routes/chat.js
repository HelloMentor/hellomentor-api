var express = require('express');
var router = express.Router();
var Twilio = require('twilio');
var Chance = require('chance');

var AccessToken = Twilio.jwt.AccessToken;
var ChatGrant = AccessToken.ChatGrant;
var chance = new Chance();

router.get('/token', function(req, res) {
  const token = new AccessToken(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_API_KEY, process.env.TWILIO_API_SECRET);

  token.identity = chance.name();
  token.addGrant(new ChatGrant({
    serviceSid: process.env.TWILIO_CHAT_SERVICE_SID
  }));

  res.send({
    identity: token.identity,
    jwt: token.toJwt()
  });
});

module.exports = router;
