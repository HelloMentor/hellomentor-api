var express = require('express');
var router = express.Router();
var auth = require('./auth');
var User = require('../database/models/user');
var Channel = require('../database/models/channel');
var Message = require('../database/models/message');

router.get('/channels', auth.required, function(req, res) {
  var liuId = req.payload.id;

  // Get all channels the user is a member of
  Channel.find({ members: liuId })
    .populate(['creator', 'members', 'admins'])
    .then(function(channels) {
      return res.json({ channels: channels });
    })
});

router.post('/channels', auth.required, function(req, res) {
  var requestChannel = req.body.channel;
	var channel = new Channel();

  channel.name = requestChannel.name;
  channel.friendlyName = requestChannel.friendlyName;
  channel.type = requestChannel.type;
  channel.isPrivate = requestChannel.isPrivate;
  channel.creator = requestChannel.creator;
  channel.members = requestChannel.members;
  channel.admins = requestChannel.admins;
  channel.description = requestChannel.description;

  // Save the channel and add a reference to it on each member
  channel.save().then(function() {
    var memberIds = [];
    for (var i = 0; i < channel.members.length; i++) {
      memberIds.push(channel.members[i]);
    }

    User.find({
      _id: { $in: memberIds }
    }).then(function(members) {
      for (var i = 0; i < members.length; i++) {
        members[i].channels.push(channel);
        members[i].save();
      }

      return res.json({ channel: channel });
    });
  });
});

router.post('/channels/:id/messages', auth.required, function(req, res) {
  var channelId = req.params.id;
  var requestMessage = JSON.parse(req.body.message);
  var liuId = req.payload.id;
  var message = new Message();

  // Build the message
  message.user_id = requestMessage.user_id;
  message.body = requestMessage.body;
  message.channel = channelId;

  // Save the message and update its channel
  message.save().then(function() {
    Channel.findOne({ _id: channelId })
      .then(function(channel) {
        channel.messages.push(message);
        channel.save();

        return res.json({ message: message });
      });
  })
});

module.exports = router;
