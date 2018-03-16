var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var ChannelSchema = new Schema({
  name: { type: String, required: true, unique: true, index: true },
  friendlyName: { type: String, required: true },
  type: { type: String, required: true, enum: ['community', 'direct'], index: true },
  isPrivate: { type: Boolean, required: true },
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  admins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  description: String,
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }]
}, { timestamps: true });

ChannelSchema.plugin(uniqueValidator, { message: 'is already taken' });

ChannelSchema.methods.toJSON = function() {
  return {
    id: this._id,
    name: this.name,
    type: this.type,
    creator: this.creator,
    members: this.members,
    admins: this.admins,
    description: this.description,
    messages: this.messages,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
}

ChannelSchema
.virtual('url')
.get(function() {
  return '/channels/' + this._id;
});

module.exports = mongoose.model('Channel', ChannelSchema);
