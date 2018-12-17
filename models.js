'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

const patternSchema = new Schema({
  user: {type: String, required: true},
  title: {type: String, required: true},
  public: {type: Boolean, default: false},
  pattern: {type: Object, required: true},
  bpm: {type: Number, require: true},
  created: {type: Date, default: Date.now},
  modified: {type: Date, default: Date.now}
});

patternSchema.methods.serialize = function() {
  return {
    id: this._id,
    user: this.user,
    title: this.title,
    pattern: this.pattern,
    bpm: this.bpm,
    created: this.created,
    modified: this.modified
  };
};

const userSchema = new Schema({
  userName : {
    type : String,
    required : true,
    unique : true
  },
  password : {
    type : String,
    required : true 
  }
});

userSchema.pre('save', async function(next){
  const user = this;
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
  next();
});

userSchema.methods.isValidPassword = async function(password){
  const user = this;
  //Hashes the password sent by the user for login and checks if the hashed password stored in the 
  //database matches the one sent. Returns true if it does else false.
  const compare = await bcrypt.compare(password, user.password);
  return compare;
}


const Patterns = mongoose.model('Patterns', patternSchema);
const Users = mongoose.model('Users', userSchema);

module.exports = {Patterns, Users};
