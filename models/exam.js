var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ExamSchema = new Schema({
    name: {type: String, required: true, minLength: 3, maxLength: 100},
    about: {type: String}
});

// Virtual for this exam instance URL.
ExamSchema
.virtual('url')
.get(function () {
  return '/catalog/exam/'+this._id;
});

// Export model.
module.exports = mongoose.model('Exam', ExamSchema);
