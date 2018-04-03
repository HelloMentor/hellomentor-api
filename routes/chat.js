var express = require('express');
var router = express.Router();
var auth = require('./auth');
var User = require('../database/models/user');
var Channel = require('../database/models/channel');
var Message = require('../database/models/message');
var sgMail = require('@sendgrid/mail');

router.get('/channels', auth.required, function(req, res) {
  var liuId = req.query.user_id;

  // Get all channels the user is a member of
  Channel.find({ members: liuId })
    .populate(['creator', 'members', 'admins'])
    .then(function(channels) {
      return res.json({ channels: channels });
    })
});

router.get('/channels/:id', function(req, res) {
  var channelId = req.params.id;

  Channel.findOne({ _id: channelId }).then(function(channel) {
    return res.json({ channel: channel });
  });
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
      // Set up sendgrid mail
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      sgMail.setSubstitutionWrappers('<%', '%>');
      let creator = members.find(m => m._id.toString() === channel.creator.toString());
      let subject = creator.f_name + ' started a conversation with you'

      // Save the channel to each member
      for (let i = 0; i < members.length; i++) {
        let member = members[i];
        member.channels.push(channel);
        member.save();

        // Send an email notification to the invitee if a direct msg
        if (channel.type === 'direct' && (member._id !== creator._id)) {
          sgMail.send({
            to: member.email,
            from: 'donotreply@polylink.co',
            subject: subject,
            templateId: 'b84bc07a-26bc-42f7-82ac-5ea82f2b0125',
            substitutions: {
              recipient_f_name: member.f_name,
              sender_f_name: creator.f_name,
              sender_l_name: creator.l_name,
              subject: subject
            }
          });
        }
      }

      return res.json({ channel: channel });
    });
  });
});

router.post('/channels/:id/messages', auth.required, function(req, res) {
  var channelId = req.params.id;
  var requestMessage = req.body.message;
  var liuId = req.payload.id;
  var message = new Message();

  // Build the message
  message.user_id = requestMessage.user_id;
  message.user_fullname = requestMessage.user_fullname;
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
