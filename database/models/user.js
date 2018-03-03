var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  role: { type: String, required: true, enum: ['Mentor', 'Mentee', 'Admin'] },
  f_name: { type: String, required: true },
  l_name: { type: String, required: true },
  email: { type: String, lowercase: true, required: true, match: [/\S+@\S+\.\S+/, 'is invalid'], unique: true, index: true },
  headline: { type: String, required: true },
  hash: String,
  salt: String,
  summary: String,
  city: String,
  country: String,
  linkedin_u_name: String,
  skills: [String],
  gender: String,
  dob: Date,
  wanted_skills: [String]
}, { timestamps: true });

UserSchema.plugin(uniqueValidator, { message: 'is already taken' });

UserSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

UserSchema.methods.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.hash === hash;
};

UserSchema.methods.generateJWT = function() {
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign({
    id: this._id,
    email: this.email,
    exp: parseInt(exp.getTime() / 1000),
  }, process.env.JWT_SECRET);
};

UserSchema.methods.toAuthJSON = function(){
  return {
    email: this.email,
    token: this.generateJWT()
  };
};

UserSchema.methods.toPublicJSON = function(){
  return {
    id: this._id,
    email: this.email,
    role: this.role,
    f_name: this.f_name,
    l_name: this.l_name,
    headline: this.headline,
    summary: this.summary,
    city: this.city,
    country: this.country,
    linkedin_u_name: this.linkedin_u_name,
    skills: this.skills,
    gender: this.gender,
    dob: this.dob,
    wanted_skills: this.wanted_skills,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

UserSchema
.virtual('name')
.get(function () {
  return this.f_name + ' ' + this.l_name;
});

UserSchema
.virtual('url')
.get(function () {
  return '/user/' + this._id;
});

module.exports = mongoose.model('User', UserSchema);
