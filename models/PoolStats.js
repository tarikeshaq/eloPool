const mongoose = require('mongoose');

const PoolStatsSchema = new mongoose.Schema({
  person: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Person"
  },
  firstName: String,
  lastName: String,
  wins: Number,
  loses: Number,
  elo: Number
});

module.exports = mongoose.model("PoolStats", PoolStatsSchema);
