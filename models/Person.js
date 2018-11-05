const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  TTStats: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TTStats"
  },
  PoolStats: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PoolStats"
  },
});

module.exports = mongoose.model("Person", personSchema);
