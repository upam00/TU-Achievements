var mongoose = require('mongoose');
const { DateTime } = require("luxon");  //for date handling

var Schema = mongoose.Schema;

var StudentSchema = new Schema({
  first_name: { type: String, required: true, maxLength: 100 },
  last_name: { type: String, required: true, maxLength: 100 },
  //year_of_join: { type: Number },
  //year_of_grad: { type: Number },
  department: {type: String},
  course: {type: String },
  enrollment_no: { type: String }
  //exam_id: {type :Shema.ObjectId, ref:'Exam', }

});

// Virtual for author "full" name.
StudentSchema.virtual('name').get(function() {
  return this.first_name + ' ' + this.last_name;
});

// Virtual for this author instance URL.
StudentSchema.virtual('url').get(function() {
  return this._id;
});



/*StudentSchema.virtual('lifespan').get(function() {
  var lifetime_string = '';
  if (this.date_of_birth) {
    lifetime_string = DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED);
  }
  lifetime_string += ' - ';
  if (this.date_of_death) {
    lifetime_string += DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED)
  }
  return lifetime_string;
});
*/

/*StudentSchema.virtual('date_of_birth_yyyy_mm_dd').get(function() {
  return DateTime.fromJSDate(this.date_of_birth).toISODate(); //format 'YYYY-MM-DD'
});

StudentSchema.virtual('date_of_death_yyyy_mm_dd').get(function() {
  return DateTime.fromJSDate(this.date_of_death).toISODate(); //format 'YYYY-MM-DD'
});

*/

// Export model.
module.exports = mongoose.model('Student', StudentSchema);

