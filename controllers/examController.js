var Exam = require('../models/exam');
//var Book = require('../models/book');
var async = require('async');

const { body,validationResult } = require("express-validator");

// Display list of all Exam.
exports.exam_list = function(req, res, next) {

  Exam.find()
    .sort([['name', 'ascending']])
    .exec(function (err, list_exams) {
      if (err) { return next(err); }
      // Successful, so render.
      res.render('u_exam_list', { title: 'Exam List', list_exams:  list_exams});
    });

};

// Display detail page for a specific Exam.
exports.exam_detail = function(req, res, next) {

    async.parallel({
        exam: function(callback) {

            Exam.findById(req.params.id)
              .exec(callback);
        },
        /*
        exam_books: function(callback) {
          Book.find({ 'exam': req.params.id })
          .exec(callback);
        },
        */

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.exam==null) { // No results.
            var err = new Error('Exam not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('u_exam_detail', { title: 'Exam Detail', exam: results.exam } );
    });

};

// Display Exam create form on GET.
exports.exam_create_get = function(req, res, next) {
    res.render('u_exam_form', { title: 'Create Exam'});
};

// Handle Exam create on POST.
exports.exam_create_post = [

    // Validate and santise the name field.
    body('name', 'Exam name must contain at least 3 characters').trim().isLength({ min: 3 }).escape(),
    body('about', 'Exam name must contain at least 3 characters').trim().isLength({ min: 3 }).escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a exam object with escaped and trimmed data.
        var exam = new Exam(
          { name: req.body.name,
            about: req.body.about }
        );


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('u_exam_form', { title: 'Create Exam', exam: exam, errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid.
            // Check if Exam with same name already exists.
            Exam.findOne({ 'name': req.body.name })
                .exec( function(err, found_exam) {
                     if (err) { return next(err); }

                     if (found_exam) {
                         // Exam exists, redirect to its detail page.
                         res.redirect(found_exam.url);
                     }
                     else {

                         exam.save(function (err) {
                           if (err) { return next(err); }
                           // Exam saved. Redirect to exam detail page.
                           res.redirect(exam.url);
                         });

                     }

                 });
        }
    }
];

// Display Exam delete form on GET.
exports.exam_delete_get = function(req, res, next) {

    async.parallel({
        exam: function(callback) {
            Exam.findById(req.params.id).exec(callback);
        },
        /*exam_books: function(callback) {
            Book.find({ 'exam': req.params.id }).exec(callback);
        },
        */
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.exam==null) { // No results.
            res.redirect('/catalog/exams');
        }
        // Successful, so render.
        res.render('u_exam_delete', { title: 'Delete Exam', exam: results.exam } );
    });

};

// Handle Exam delete on POST.
exports.exam_delete_post = function(req, res, next) {

    async.parallel({
        exam: function(callback) {
            Exam.findById(req.params.id).exec(callback);
        },
        /*exam_books: function(callback) {
            Book.find({ 'exam': req.params.id }).exec(callback);
        },
        */
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        /*if (results.exam_books.length > 0) {
            // Exam has books. Render in same way as for GET route.
            res.render('exam_delete', { title: 'Delete Exam', exam: results.exam, exam_books: results.exam_books } );
            return;
        }
        */
        
            // Exam has no books. Delete object and redirect to the list of exams.
            Exam.findByIdAndRemove(req.body.id, function deleteExam(err) {
                if (err) { return next(err); }
                // Success - go to exams list.
                res.redirect('/catalog/exams');
            });

        
    });

};

// Display Exam update form on GET.
exports.exam_update_get = function(req, res, next) {

    Exam.findById(req.params.id, function(err, exam) {
        if (err) { return next(err); }
        if (exam==null) { // No results.
            var err = new Error('Exam not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('u_exam_form', { title: 'Update Exam', exam: exam });
    });

};

// Handle Exam update on POST.
exports.exam_update_post = [
   
    // Validate and sanitze the name field.
    body('name', 'Exam name must contain at least 3 characters').trim().isLength({ min: 3 }).escape(),
    

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request .
        const errors = validationResult(req);

    // Create a exam object with escaped and trimmed data (and the old id!)
        var exam = new Exam(
          {
          name: req.body.name,
          about: req.body.about,
          _id: req.params.id
          }
        );


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('exam_form', { title: 'Update Exam', exam: exam, errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid. Update the record.
            Exam.findByIdAndUpdate(req.params.id, exam, {}, function (err,theexam) {
                if (err) { return next(err); }
                   // Successful - redirect to exam detail page.
                   res.redirect(theexam.url);
                });
        }
    }
];
