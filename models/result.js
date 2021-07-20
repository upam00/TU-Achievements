var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ResultSchema = new Schema({
    student: {type: Schema.ObjectId, ref: 'Student', required: true},
    exam: { type: Schema.ObjectId, ref: 'Exam', required: true },
    rank: {type: String },
    marks: {type: String },
    percentile: {type: String },
    session: {type: String }
});

// Virtual for this result instance URL.
ResultSchema
.virtual('url')
.get(function () {
  return '/catalog/result/'+this._id;
});

// Export model.
module.exports = mongoose.model('Result', ResultSchema);
