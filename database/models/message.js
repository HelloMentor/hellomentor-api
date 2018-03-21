var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var validate = require('mongoose-validator');

var bodyValidator = [
  validate({
    validator: 'isLength',
    arguments: [1, 1000],
    message: 'Please limit your messages to {ARGS[1]} characters long.',
  })
];

var MessageSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  user_fullname: { type: String, required: true },
  body: { type: String, required: true, validate: bodyValidator },
  channel: { type: Schema.Types.ObjectId, ref: 'Channel', required: true }
}, { timestamps: true });

MessageSchema.methods.toJSON = function() {
  return {
    id: this._id,
    user_id: this.user_id,
    user_fullname: this.user_fullname,
    body: this.body,
    channel: this.channel,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
}

module.exports = mongoose.model('Message', MessageSchema);
