'use strict';

const mongoose = require('mongoose');
const { BlogPost } = require('./models');
mongoose.Promise = global.Promise;

const patternSchema = mongoose.Schema({
  author: {type: String},
  title: {type: String, required: true},
  public: {type: Boolean},
  pattern: {type: Object},
  bpm: {type: Number},
  created: {type: Date, default: Date.now}
});

blogPostSchema.methods.serialize = function() {
  return {
    id: this._id,
    author: this.author,
    title: this.title,
    pattern: this.pattern,
    bpm: this.bpm,
    created: this.created
  };
};

const Patterns = mongoose.model('Patterns', patternSchema);


module.exports = {Patterns};
