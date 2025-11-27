const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email:{ type: String, required: true, unique: true },
  password:{ type: String, required: true },
  dp:{ type: String }, // display picture path (uploads/...)
  followers:[{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following:[{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);