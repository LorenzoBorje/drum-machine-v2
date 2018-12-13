'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const patternSchema = mongoose.Schema({
  user: {type: String},
  title: {type: String, required: true},
  public: {type: Boolean},
  pattern: {type: Object},
  bpm: {type: Number},
  created: {type: Date, default: Date.now}
});

patternSchema.methods.serialize = function() {
  return {
    id: this._id,
    user: this.user,
    title: this.title,
    pattern: this.pattern,
    bpm: this.bpm,
    created: this.created
  };
};

const Patterns = mongoose.model('Patterns', patternSchema);


module.exports = {Patterns};