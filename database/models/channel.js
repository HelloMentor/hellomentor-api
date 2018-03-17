var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var autopopulate = require('mongoose-autopopulate');
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
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message', autopopulate: true }]
}, { timestamps: true });

ChannelSchema.plugin(uniqueValidator, { message: 'is already taken' });
ChannelSchema.plugin(autopopulate);

ChannelSchema.methods.toJSON = function() {
  return {
    id: this._id,
    name: this.name,
    friendlyName: this.friendlyName,
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
