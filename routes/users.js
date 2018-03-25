var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../database/models/user');
var db = require('../database/db');
var passport = require('passport');
var auth = require('./auth');
let multer = require('multer');
let sharp = require('sharp');
let Channel = require('../database/models/channel');

var AWS = require('aws-sdk');
var upload = multer();

/**
 * GET fully authed user
 */
router.get('/auth/:id', auth.required, function(req, res, next) {
  User.findById(req.params.id).then(function(user) {
    if (!user) {
      return res.status(401).send({ error: 'Authorization failure' });
    }

    return res.json({ user: user.toAuthJSON() });
  }).catch(next);
});

/**
 * GET users
 */
router.get('/users-list', function(req, res) {
  User.find({}, function(err, users) {
    return res.json(users.map(user => { return user.toPublicJSON() }));
  });
});

/**
 * POST a user
 */
router.post('/', upload.single('profile_image'), function(req, res, next) {
  var requestUser = JSON.parse(req.body.user);
	var user = new User();

  if (!requestUser.password || requestUser.password.length < 7) {
    res.status(422);
    res.json({ message: 'Please enter a password at least 7 characters long.' });
    return;
  }

	user.email = requestUser.email;
	user.setPassword(requestUser.password);
	user.role = requestUser.role;
	user.f_name = requestUser.f_name;
	user.l_name = requestUser.l_name;
	user.headline = requestUser.headline;
  user.gender = requestUser.gender;
  user.city = requestUser.city;
  user.country = requestUser.country;
  user.summary = requestUser.summary;
  user.linkedin_u_name  = requestUser.linkedin_u_name;
  user.skills = requestUser.skills;
  user.wanted_skills = requestUser.wanted_skills;
  user.gender = requestUser.gender;
  user.dob = requestUser.dob;

  if (req.file && req.file.buffer) {
    AWS.config.update({ region: process.env.S3_IMAGE_REGION });

    var s3 = new AWS.S3();
    var s3Bucket = new AWS.S3({ params: { Bucket: process.env.S3_IMAGE_BUCKET } });
    var imageName = requestUser.f_name + '_' + requestUser.l_name + '_' + Date.now();
    var imageFile = req.file;
    var url = 'https://s3-' + process.env.S3_IMAGE_REGION + '.amazonaws.com/' + process.env.S3_IMAGE_BUCKET + '/user-profile-images/' + imageName;

    // resize image then upload to s3
    sharp(imageFile.buffer)
      .resize(400, 400)
      .toBuffer()
      .then((buffer) => {
        var data = { Key: 'user-profile-images/' + imageName, Body: buffer, ACL: 'public-read' };

        s3Bucket.putObject(data, function(err, data) {
          user.profile_image = url;

          // Add the user to the general channel and ref in channel itself
          Channel.findOne({ name: 'general' }).then(function(channel) {
            user.channels.push(channel.id);
            channel.members.push(user.id);
            channel.save();

            user.save().then(function(){
              return res.json({ user: user.toAuthJSON() });
            });
          });
        });
      });
  } else {
    // Add the user to the general channel and ref in channel itself
    Channel.findOne({ name: 'general' }).then(function(channel) {
      user.channels.push(channel.id);
      channel.members.push(user.id);

      user.save().then(function() {
        // Only save the channel if the user was created successfully
        channel.save();
        return res.json({ user: user.toAuthJSON() });
      });
    });
  }
});

/**
 * PUT a user
 */
router.put('/', [auth.required, upload.single('profile_image')], function(req, res, next) {
  var reqUser = JSON.parse(req.body.user);

  User.findById(req.payload.id).then(function(user) {
    if (!user) { return res.sendStatus(401); }

    // only update fields that were actually passed...
    if (typeof reqUser.email !== 'undefined') {
      user.email = reqUser.email;
    }
    if (typeof reqUser.password !== 'undefined') {
      user.setPassword(reqUser.password);
    }
    if (typeof reqUser.role !== 'undefined') {
      user.role = reqUser.role;
    }
    if (typeof reqUser.f_name !== 'undefined') {
      user.f_name = reqUser.f_name;
    }
    if (typeof reqUser.l_name !== 'undefined') {
      user.l_name = reqUser.l_name;
    }
    if (typeof reqUser.headline !== 'undefined') {
      user.headline = reqUser.headline;
    }
    if (typeof reqUser.gender !== 'undefined') {
      user.gender = reqUser.gender;
    }
    if (typeof reqUser.city !== 'undefined') {
      user.city = reqUser.city;
    }
    if (typeof reqUser.country !== 'undefined') {
      user.country = reqUser.country;
    }
    if (typeof reqUser.summary !== 'undefined') {
      user.summary = reqUser.summary;
    }
    if (typeof reqUser.linkedin_u_name !== 'undefined') {
      user.linkedin_u_name = reqUser.linkedin_u_name;
    }
    if (typeof reqUser.skills !== 'undefined') {
      user.skills = reqUser.skills;
    }
    if (typeof reqUser.wanted_skills !== 'undefined') {
      user.wanted_skills = reqUser.wanted_skills;
    }
    if (typeof reqUser.gender !== 'undefined') {
      user.gender = reqUser.gender;
    }
    if (typeof reqUser.dob !== 'undefined') {
      user.dob = reqUser.dob;
    }

    if (req.file && req.file.buffer) {
      AWS.config.update({ region: process.env.S3_IMAGE_REGION });

      var s3 = new AWS.S3();
      var s3Bucket = new AWS.S3({ params: { Bucket: process.env.S3_IMAGE_BUCKET } });
      var imageName = reqUser.f_name + '_' + reqUser.l_name + '_' + Date.now();
      var imageFile = req.file;
      var url = 'https://s3-' + process.env.S3_IMAGE_REGION + '.amazonaws.com/' + process.env.S3_IMAGE_BUCKET + '/user-profile-images/' + imageName;

      // resize image then upload to s3
      sharp(imageFile.buffer)
        .resize(400, 400)
        .toBuffer()
        .then((buffer) => {
          var data = { Key: 'user-profile-images/' + imageName, Body: buffer, ACL: 'public-read' };

          s3Bucket.putObject(data, function(err, data) {
            user.profile_image = url;

          	user.save().then(function() {
              return res.json({ user: user.toAuthJSON() });
          	}).catch(next);
          });
        });
    } else {
      user.save().then(function(){
        return res.json({ user: user.toAuthJSON() });
      });
    }
  }).catch(next);
});

/**
 * POST login a user
 */
router.post('/login', function(req, res, next) {
  if (!req.body.user.email) {
    return res.status(422).json({ errors: { email: 'cannot be blank' } });
  }

  if (!req.body.user.password) {
    return res.status(422).json({errors: { password: 'cannot be blank' } });
  }

  passport.authenticate('local', { session: false }, function(err, user, info) {
    if (err) { return next(err); }

    if (user) {
      user.token = user.generateJWT();
      return res.json({ user: user.toAuthJSON() });
    } else {
      return res.status(422).json({ message: 'Email or password incorrect. Please try again.' });
    }
  })(req, res, next);
});

module.exports = router;
