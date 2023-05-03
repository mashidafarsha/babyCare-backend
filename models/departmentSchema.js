const mongoose = require('mongoose')


const CategorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'ACTIVE'
  },
  created: {
    type: Date,
    required: true,
    default: Date.now
  }
});

module.exports = mongoose.model("Category", CategorySchema);