var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../database/models/user');
var db = require('../database/db');
var passport = require('passport');
var auth = require('./auth');

/**
 * GET logged in user
 */
router.get('/', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user) {
    if (!user) { return res.sendStatus(401); }

    return res.json({ user: user.toAuthJSON() });
  }).catch(next);
});

/**
 * POST a user
 */
router.post('/', function(req, res, next) {
  var requestUser = req.body.user;
	var user = new User();

	user.email = requestUser.email;
	user.setPassword(requestUser.password);
	user.role = requestUser.role;
	user.f_name = requestUser.f_name;
	user.l_name = requestUser.l_name;
  user.gender = requestUser.gender;
  user.city = requestUser.city;
  user.country = requestUser.country;
  user.summary = requestUser.summary;
  user.linkedin_url = requestUser.linkedin_url;
  user.skills = requestUser.skills;
  user.wanted_skills = requestUser.wanted_skills;
  user.misc_desires = requestUser.misc_desires;
  user.gender = requestUser.gender;
  user.dob = requestUser.dob;

	user.save().then(function() {
    return res.json({ user: user.toAuthJSON() });
	}).catch(next);
});

/**
 * PUT a user
 */
router.put('/', auth.required, function(req, res, next){
  User.findById(req.payload.id).then(function(user) {
    if (!user) { return res.sendStatus(401); }

    // only update fields that were actually passed...
    if (typeof req.body.user.email !== 'undefined') {
      user.email = req.body.user.email;
    }
    if (typeof req.body.user.password !== 'undefined') {
      user.setPassword(req.body.user.password);
    }
    if (typeof req.body.user.role !== 'undefined') {
      user.role = req.body.user.role;
    }
    if (typeof req.body.user.f_name !== 'undefined') {
      user.f_name = req.body.user.f_name;
    }
    if (typeof req.body.user.l_name !== 'undefined') {
      user.l_name = req.body.user.l_name;
    }
    if (typeof req.body.user.gender !== 'undefined') {
      user.gender = req.body.user.gender;
    }
    if (typeof req.body.user.city !== 'undefined') {
      user.city = req.body.user.city;
    }
    if (typeof req.body.user.country !== 'undefined') {
      user.country = req.body.user.country;
    }
    if (typeof req.body.user.summary !== 'undefined') {
      user.summary = req.body.user.summary;
    }
    if (typeof req.body.user.linkedin_url!== 'undefined') {
      user.linkedin_url= req.body.user.linkedin_url;
    }
    if (typeof req.body.user.skills !== 'undefined') {
      user.skills = req.body.user.skills;
    }
    if (typeof req.body.user.wanted_skills !== 'undefined') {
      user.wanted_skills = req.body.user.wanted_skills;
    }
    if (typeof req.body.user.misc_desires !== 'undefined') {
      user.misc_desires = req.body.user.misc_desires;
    }
    if (typeof req.body.user.gender !== 'undefined') {
      user.gender = req.body.user.gender;
    }
    if (typeof req.body.user.dob !== 'undefined') {
      user.dob = req.body.user.dob;
    }

    return user.save().then(function(){
      return res.json({ user: user.toAuthJSON() });
    });
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
      return res.status(422).json(info);
    }
  })(req, res, next);
});

module.exports = router;
