const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    email:{type:String,},
    password: { type: String, },
});

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    // const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = mongoose.model('User', UserSchema);
