var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  user_fullname: { type: String, required: true },
  body: { type: String, required: true },
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
